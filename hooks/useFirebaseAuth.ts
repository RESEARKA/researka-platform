/**
 * useFirebaseAuth Hook
 * 
 * Custom hook to handle Firebase authentication logic.
 * This hook encapsulates all Firebase auth-related side effects and state management,
 * keeping the AuthContext provider thin and focused on context distribution.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore } from '../config/firebase';
import { createLogger, LogCategory } from '../utils/logger';
import { User as ExtendedUser, AuthError, UserRole } from '../types/auth';

// Create a logger instance for this hook
const logger = createLogger('useFirebaseAuth');

/**
 * Interface for the useFirebaseAuth hook return value
 */
interface UseFirebaseAuthReturn {
  currentUser: ExtendedUser | null;
  authIsInitialized: boolean;
  isLoading: boolean;
  error: AuthError | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, displayName?: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  getUserProfile: (uid: string) => Promise<any>;
  persistentUsername?: string;
}

/**
 * Custom hook for Firebase authentication
 * Encapsulates all Firebase auth-related side effects and state management
 */
export function useFirebaseAuth(): UseFirebaseAuthReturn {
  // State for authentication
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [authIsInitialized, setAuthIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [persistentUsername, setPersistentUsername] = useState<string | undefined>(undefined);
  const [authInstance, setAuthInstance] = useState<any>(null);
  const [dbInstance, setDbInstance] = useState<any>(null);
  
  // Initialize Firebase instances
  useEffect(() => {
    const initializeFirebaseInstances = async () => {
      try {
        const auth = await getFirebaseAuth();
        const db = await getFirebaseFirestore();
        
        setAuthInstance(auth);
        setDbInstance(db);
        
        if (!auth) {
          logger.error('Firebase Auth not initialized', {
            category: LogCategory.ERROR
          });
          setAuthIsInitialized(true);
          setIsLoading(false);
        }
      } catch (error) {
        logger.error('Error initializing Firebase instances', {
          context: { error },
          category: LogCategory.ERROR
        });
        setAuthIsInitialized(true);
        setIsLoading(false);
      }
    };
    
    initializeFirebaseInstances();
  }, []);
  
  // Handle authentication state changes
  useEffect(() => {
    if (!authInstance) {
      return;
    }
    
    logger.debug('Setting up auth state listener', {
      category: LogCategory.AUTH
    });
    
    const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
      logger.debug('Auth state changed', {
        context: { 
          userExists: !!user,
          uid: user?.uid,
          emailVerified: user?.emailVerified
        },
        category: LogCategory.AUTH
      });
      
      if (user) {
        // Store user in state as ExtendedUser
        setCurrentUser(user as ExtendedUser);
        
        // Get user profile from Firestore to get role and other custom fields
        try {
          if (dbInstance) {
            const userDoc = await getDoc(doc(dbInstance, 'users', user.uid));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              
              // Update persistent username if available
              if (userData.name) {
                setPersistentUsername(userData.name);
              }
              
              // Merge Firestore user data with auth user
              setCurrentUser(prevUser => {
                if (!prevUser) return null;
                
                return {
                  ...prevUser,
                  role: userData.role || UserRole.USER,
                  createdAt: userData.createdAt,
                  lastLogin: userData.lastLogin,
                  displayName: prevUser.displayName || userData.name,
                  // Add any other custom fields here
                };
              });
              
              // Update last login time
              try {
                await setDoc(doc(dbInstance, 'users', user.uid), {
                  lastLogin: Timestamp.now()
                }, { merge: true });
                
                logger.debug('Updated last login time', {
                  context: { uid: user.uid },
                  category: LogCategory.AUTH
                });
              } catch (err) {
                logger.error('Error updating last login time', {
                  context: { error: err, uid: user.uid },
                  category: LogCategory.ERROR
                });
              }
            } else {
              // Create user document if it doesn't exist
              try {
                await setDoc(doc(dbInstance, 'users', user.uid), {
                  email: user.email,
                  name: user.displayName,
                  role: UserRole.USER,
                  createdAt: Timestamp.now(),
                  lastLogin: Timestamp.now()
                });
                
                logger.debug('Created new user document', {
                  context: { uid: user.uid },
                  category: LogCategory.AUTH
                });
              } catch (err) {
                logger.error('Error creating user document', {
                  context: { error: err, uid: user.uid },
                  category: LogCategory.ERROR
                });
              }
            }
          }
        } catch (err) {
          logger.error('Error fetching user profile', {
            context: { error: err, uid: user.uid },
            category: LogCategory.ERROR
          });
        }
      } else {
        // No user is signed in
        setCurrentUser(null);
        setPersistentUsername(undefined);
      }
      
      // Authentication has been initialized
      setAuthIsInitialized(true);
      setIsLoading(false);
    }, (err: any) => {
      logger.error('Auth state change error', {
        context: { error: err },
        category: LogCategory.ERROR
      });
      setAuthIsInitialized(true);
      setIsLoading(false);
      setError({
        name: 'AuthError',
        code: err.code || 'auth/unknown',
        message: err.message || 'Unknown authentication error',
        retry: false
      });
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [authInstance, dbInstance]);
  
  /**
   * Login with email and password
   * @param email User email
   * @param password User password
   * @returns Promise resolving to the authenticated user
   */
  const login = useCallback(async (email: string, password: string): Promise<User> => {
    if (!authInstance) {
      const error = new Error('Firebase Auth not initialized') as AuthError;
      error.name = 'AuthError';
      error.code = 'auth/not-initialized';
      error.retry = true;
      throw error;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Set persistence to local to improve offline capabilities
      await setPersistence(authInstance, browserLocalPersistence);
      
      // Sign in with email and password
      const result = await signInWithEmailAndPassword(authInstance, email, password);
      
      logger.debug('User logged in successfully', {
        context: { uid: result.user.uid, email },
        category: LogCategory.AUTH
      });
      
      return result.user;
    } catch (err: any) {
      logger.error('Login failed', {
        context: { 
          error: err, 
          email,
          category: err.code?.includes('network') ? 'network' : 'auth',
          retry: err.code?.includes('network') ? true : false
        },
        category: LogCategory.ERROR
      });
      
      // Format error for consistent handling
      const authError: AuthError = {
        name: 'AuthError',
        code: err.code || 'auth/unknown',
        message: err.message || 'Unknown authentication error',
        retry: err.code?.includes('network') ? true : false,
        category: err.code?.includes('network') ? 'network' : 'auth'
      };
      
      setError(authError);
      setIsLoading(false);
      throw authError;
    }
  }, [authInstance]);
  
  /**
   * Sign up with email and password
   * @param email User email
   * @param password User password
   * @param displayName Optional display name
   * @returns Promise resolving to the authenticated user
   */
  const signup = useCallback(async (
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<User> => {
    if (!authInstance || !dbInstance) {
      const error = new Error('Firebase not initialized') as AuthError;
      error.name = 'AuthError';
      error.code = 'auth/not-initialized';
      error.retry = true;
      throw error;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create user with email and password
      const result = await createUserWithEmailAndPassword(authInstance, email, password);
      const user = result.user;
      
      // Update profile with display name if provided
      if (displayName) {
        await firebaseUpdateProfile(user, { displayName });
      }
      
      // Create user document in Firestore
      await setDoc(doc(dbInstance, 'users', user.uid), {
        email: user.email,
        name: displayName || '',
        role: UserRole.USER,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      });
      
      logger.debug('User signed up successfully', {
        context: { uid: user.uid, email },
        category: LogCategory.AUTH
      });
      
      return user;
    } catch (err: any) {
      logger.error('Signup failed', {
        context: { 
          error: err, 
          email,
          category: err.code?.includes('network') ? 'network' : 'auth',
          retry: err.code?.includes('network') ? true : false
        },
        category: LogCategory.ERROR
      });
      
      // Format error for consistent handling
      const authError: AuthError = {
        name: 'AuthError',
        code: err.code || 'auth/unknown',
        message: err.message || 'Unknown authentication error',
        retry: err.code?.includes('network') ? true : false,
        category: err.code?.includes('network') ? 'network' : 'auth'
      };
      
      setError(authError);
      setIsLoading(false);
      throw authError;
    }
  }, [authInstance, dbInstance]);
  
  /**
   * Logout the current user
   * @returns Promise resolving when logout is complete
   */
  const logout = useCallback(async (): Promise<void> => {
    if (!authInstance) {
      logger.warn('Logout called but Firebase Auth not initialized', {
        category: LogCategory.AUTH
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await signOut(authInstance);
      
      logger.debug('User logged out successfully', {
        category: LogCategory.AUTH
      });
    } catch (err: any) {
      logger.error('Logout failed', {
        context: { error: err },
        category: LogCategory.ERROR
      });
      
      // Format error for consistent handling
      const authError: AuthError = {
        name: 'AuthError',
        code: err.code || 'auth/unknown',
        message: err.message || 'Unknown authentication error',
        retry: false
      };
      
      setError(authError);
    } finally {
      setIsLoading(false);
    }
  }, [authInstance]);
  
  /**
   * Send password reset email
   * @param email User email
   * @returns Promise resolving when the email is sent
   */
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    if (!authInstance) {
      const error = new Error('Firebase Auth not initialized') as AuthError;
      error.name = 'AuthError';
      error.code = 'auth/not-initialized';
      error.retry = true;
      throw error;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await sendPasswordResetEmail(authInstance, email);
      
      logger.debug('Password reset email sent', {
        context: { email },
        category: LogCategory.AUTH
      });
    } catch (err: any) {
      logger.error('Password reset failed', {
        context: { 
          error: err, 
          email,
          category: err.code?.includes('network') ? 'network' : 'auth',
          retry: err.code?.includes('network') ? true : false
        },
        category: LogCategory.ERROR
      });
      
      // Format error for consistent handling
      const authError: AuthError = {
        name: 'AuthError',
        code: err.code || 'auth/unknown',
        message: err.message || 'Unknown authentication error',
        retry: err.code?.includes('network') ? true : false,
        category: err.code?.includes('network') ? 'network' : 'auth'
      };
      
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [authInstance]);
  
  /**
   * Update user password
   * @param password New password
   * @returns Promise resolving when the password is updated
   */
  const updatePassword = useCallback(async (password: string): Promise<void> => {
    if (!authInstance || !currentUser) {
      const error = new Error('User not authenticated or Firebase not initialized') as AuthError;
      error.name = 'AuthError';
      error.code = 'auth/not-authenticated';
      error.retry = false;
      throw error;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await firebaseUpdatePassword(currentUser, password);
      
      logger.debug('Password updated successfully', {
        context: { uid: currentUser.uid },
        category: LogCategory.AUTH
      });
    } catch (err: any) {
      logger.error('Password update failed', {
        context: { 
          error: err, 
          uid: currentUser.uid,
          category: err.code?.includes('network') ? 'network' : 'auth',
          retry: err.code?.includes('network') ? true : false
        },
        category: LogCategory.ERROR
      });
      
      // Format error for consistent handling
      const authError: AuthError = {
        name: 'AuthError',
        code: err.code || 'auth/unknown',
        message: err.message || 'Unknown authentication error',
        retry: err.code?.includes('network') ? true : false,
        category: err.code?.includes('network') ? 'network' : 'auth'
      };
      
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [authInstance, currentUser]);
  
  /**
   * Update user profile
   * @param profile Profile data to update
   * @returns Promise resolving when the profile is updated
   */
  const updateProfile = useCallback(async (profile: Partial<User>): Promise<void> => {
    if (!authInstance || !dbInstance || !currentUser) {
      const error = new Error('User not authenticated or Firebase not initialized') as AuthError;
      error.name = 'AuthError';
      error.code = 'auth/not-authenticated';
      error.retry = false;
      throw error;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update Firebase Auth profile
      await firebaseUpdateProfile(currentUser, profile);
      
      // Update Firestore user document
      const userDocRef = doc(dbInstance, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        name: profile.displayName || currentUser.displayName,
        // Add any other profile fields to update
      }, { merge: true });
      
      logger.debug('Profile updated successfully', {
        context: { uid: currentUser.uid },
        category: LogCategory.AUTH
      });
      
      // Update local state
      setCurrentUser(prevUser => {
        if (!prevUser) return null;
        return { ...prevUser, ...profile };
      });
    } catch (err: any) {
      logger.error('Profile update failed', {
        context: { 
          error: err, 
          uid: currentUser.uid,
          category: err.code?.includes('network') ? 'network' : 'auth',
          retry: err.code?.includes('network') ? true : false
        },
        category: LogCategory.ERROR
      });
      
      // Format error for consistent handling
      const authError: AuthError = {
        name: 'AuthError',
        code: err.code || 'auth/unknown',
        message: err.message || 'Unknown authentication error',
        retry: err.code?.includes('network') ? true : false,
        category: err.code?.includes('network') ? 'network' : 'auth'
      };
      
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [authInstance, dbInstance, currentUser]);
  
  /**
   * Delete user account
   * @returns Promise resolving when the account is deleted
   */
  const deleteAccount = useCallback(async (): Promise<void> => {
    if (!authInstance || !dbInstance || !currentUser) {
      const error = new Error('User not authenticated or Firebase not initialized') as AuthError;
      error.name = 'AuthError';
      error.code = 'auth/not-authenticated';
      error.retry = false;
      throw error;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Delete user document from Firestore
      await setDoc(doc(dbInstance, 'users', currentUser.uid), {
        deleted: true,
        deletedAt: Timestamp.now()
      }, { merge: true });
      
      // Delete user from Firebase Auth
      await currentUser.delete();
      
      logger.debug('Account deleted successfully', {
        context: { uid: currentUser.uid },
        category: LogCategory.AUTH
      });
    } catch (err: any) {
      logger.error('Account deletion failed', {
        context: { 
          error: err, 
          uid: currentUser.uid,
          category: err.code?.includes('network') ? 'network' : 'auth',
          retry: err.code?.includes('network') ? true : false
        },
        category: LogCategory.ERROR
      });
      
      // Format error for consistent handling
      const authError: AuthError = {
        name: 'AuthError',
        code: err.code || 'auth/unknown',
        message: err.message || 'Unknown authentication error',
        retry: err.code?.includes('network') ? true : false,
        category: err.code?.includes('network') ? 'network' : 'auth'
      };
      
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [authInstance, dbInstance, currentUser]);
  
  /**
   * Get user profile from Firestore
   * @param uid User ID
   * @returns Promise resolving to the user profile
   */
  const getUserProfile = useCallback(async (uid: string): Promise<any> => {
    if (!dbInstance) {
      throw new Error('Firebase Firestore not initialized');
    }
    
    try {
      const userDoc = await getDoc(doc(dbInstance, 'users', uid));
      
      if (userDoc.exists()) {
        return userDoc.data();
      }
      
      return null;
    } catch (err) {
      logger.error('Error fetching user profile', {
        context: { error: err, uid },
        category: LogCategory.ERROR
      });
      throw err;
    }
  }, [dbInstance]);
  
  // Return the hook API
  return {
    currentUser,
    authIsInitialized,
    isLoading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    deleteAccount,
    getUserProfile,
    persistentUsername
  };
}
