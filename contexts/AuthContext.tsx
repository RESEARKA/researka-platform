import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  updateProfile, 
  onAuthStateChanged,
  Auth
} from 'firebase/auth';
import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore } from '../config/firebase';
import { createLogger, LogCategory } from '../utils/logger';
import { handleError } from '../utils/errorHandling';

// Create a logger instance for authentication
const logger = createLogger('auth');

// Define the shape of our context
interface AuthContextType {
  currentUser: User | null;
  authIsInitialized: boolean;
  isLoading: boolean;
  persistentUsername?: string;
  setPersistentUsername?: (username: string) => void;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, displayName?: string) => Promise<any>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  updateUserProfile: (profile: { displayName?: string, photoURL?: string }) => Promise<void>;
  getUserProfile: (userId?: string) => Promise<any>;
  updateUserData: (data: any, userId?: string) => Promise<void>;
  firebaseInitError?: Error;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  authIsInitialized: false,
  isLoading: false,
  login: async () => { throw new Error('AuthContext not initialized'); },
  signup: async () => { throw new Error('AuthContext not initialized'); },
  logout: async () => { throw new Error('AuthContext not initialized'); },
  signOut: async () => { throw new Error('AuthContext not initialized'); },
  resetPassword: async () => { throw new Error('AuthContext not initialized'); },
  verifyEmail: async () => { throw new Error('AuthContext not initialized'); },
  updateUserProfile: async () => { throw new Error('AuthContext not initialized'); },
  getUserProfile: async () => { throw new Error('AuthContext not initialized'); },
  updateUserData: async () => { throw new Error('AuthContext not initialized'); }
});

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component that wraps app and makes auth object available
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authIsInitialized, setAuthIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Used throughout loading operations
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [firebaseInitError, setFirebaseInitError] = useState<Error | null>(null);

  // Function to log in a user
  const login = async (email: string, password: string): Promise<User> => {
    logger.info('Login attempt', { 
      context: { email },
      category: LogCategory.AUTH
    });
    
    if (!auth) {
      const error = new Error('Firebase Auth not initialized');
      logger.error('Login failed - Firebase Auth not initialized', {
        context: { error },
        category: LogCategory.ERROR
      });
      throw error;
    }
    
    try {
      // Special case for admin account recovery
      if (email === 'dominic@dominic.ac') {
        try {
          if (!auth) {
            throw new Error('Auth not initialized');
          }
          // Attempt to sign in
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          // If login is successful, update the user document to ensure it's not deleted
          if (db) {
            const userDocRef = doc(db, 'users', userCredential.user.uid);
            await setDoc(userDocRef, {
              isDeleted: false,
              isActive: true,
              role: 'Admin',
              updatedAt: new Date()
            }, { merge: true });
            
            logger.info('Admin account recovery successful', {
              context: { uid: userCredential.user.uid, email },
              category: LogCategory.AUTH
            });
          }
          
          return userCredential.user;
        } catch (adminRecoveryError) {
          logger.error('Admin account recovery failed', {
            context: { adminRecoveryError, email },
            category: LogCategory.ERROR
          });
          // Continue with normal login flow
        }
      }
      
      if (!auth) {
        throw new Error('Auth not initialized');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if the user is deleted or deactivated
      try {
        const idToken = await userCredential.user.getIdToken();
        const response = await fetch('/api/auth/check-user-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          
          // If the user is deleted or deactivated, sign them out
          if (errorData.code === 'account-deleted' || errorData.code === 'account-deactivated') {
            await auth.signOut();
            
            logger.warn(`User access denied: ${errorData.error}`, {
              context: { 
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                code: errorData.code
              },
              category: LogCategory.AUTH
            });
            
            throw new Error(errorData.error);
          }
          
          throw new Error('Failed to verify user status');
        }
      } catch (statusError) {
        // If there's an error checking the user status, sign them out and throw the error
        await auth.signOut();
        throw statusError;
      }
      
      logger.info('Login successful', { 
        context: { 
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          emailVerified: userCredential.user.emailVerified
        },
        category: LogCategory.AUTH
      });
      return userCredential.user;
    } catch (error) {
      logger.error('Login failed', {
        context: { error, email },
        category: LogCategory.ERROR
      });
      throw handleError(error, 'Login failed');
    }
  };

  // Function to sign up a user
  const signup = async (email: string, password: string, displayName?: string): Promise<any> => {
    logger.info('Signup attempt', { 
      context: { email, hasDisplayName: !!displayName },
      category: LogCategory.AUTH
    });
    
    if (!auth) {
      const error = new Error('Firebase Auth not initialized');
      logger.error('Signup failed - Firebase Auth not initialized', {
        context: { error },
        category: LogCategory.ERROR
      });
      throw error;
    }
    
    try {
      if (!auth) {
        throw new Error('Auth not initialized');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile if display name is provided
      if (displayName && userCredential.user) {
        try {
          await updateProfile(userCredential.user, { displayName });
          logger.info('User profile updated with display name', {
            context: { uid: userCredential.user.uid, displayName },
            category: LogCategory.AUTH
          });
        } catch (profileError) {
          // Log error but don't fail the signup process
          logger.error('Failed to update profile with display name', {
            context: { error: profileError, uid: userCredential.user.uid },
            category: LogCategory.ERROR
          });
        }
      }
      
      // Create a user document in Firestore
      try {
        if (!db) {
          throw new Error('Firestore not initialized');
        }
        
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userDocRef, {
          email: userCredential.user.email,
          displayName: displayName || userCredential.user.displayName || '',
          createdAt: new Date(),
          lastLogin: new Date(),
          role: 'User',
          isActive: true,
          articleCount: 0,
          reviewCount: 0
        });
        
        logger.info('User document created in Firestore', {
          context: { uid: userCredential.user.uid },
          category: LogCategory.DATA
        });
      } catch (firestoreError) {
        // Log error but don't fail the signup process
        logger.error('Failed to create user document in Firestore', {
          context: { error: firestoreError, uid: userCredential.user.uid },
          category: LogCategory.ERROR
        });
      }
      
      logger.info('Signup successful', { 
        context: { 
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        },
        category: LogCategory.AUTH
      });
      
      return { user: userCredential.user };
    } catch (error) {
      logger.error('Signup failed', {
        context: { error, email },
        category: LogCategory.ERROR
      });
      throw handleError(error, 'Signup failed');
    }
  };

  // Function to sign out
  const logout = async (): Promise<void> => {
    logger.info('Signout attempt', { 
      context: { uid: currentUser?.uid },
      category: LogCategory.AUTH
    });
    
    if (!auth) {
      logger.error('Logout failed - Firebase Auth not initialized', {
        category: LogCategory.ERROR
      });
      return;
    }
    
    try {
      await firebaseSignOut(auth);
      logger.info('Signout successful', { 
        category: LogCategory.AUTH
      });
    } catch (error) {
      logger.error('Signout failed', {
        context: { error },
        category: LogCategory.ERROR
      });
      throw handleError(error, 'Signout failed');
    }
  };

  // Function to reset password
  const resetPassword = async (email: string): Promise<void> => {
    logger.info('Password reset attempt', { 
      context: { email },
      category: LogCategory.AUTH
    });
    
    if (!auth) {
      const error = new Error('Firebase Auth not initialized');
      logger.error('Password reset failed - Firebase Auth not initialized', {
        context: { error },
        category: LogCategory.ERROR
      });
      throw error;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      logger.info('Password reset email sent', { 
        context: { email },
        category: LogCategory.AUTH
      });
    } catch (error) {
      logger.error('Password reset failed', {
        context: { error, email },
        category: LogCategory.ERROR
      });
      throw handleError(error, 'Password reset failed');
    }
  };

  // Function to send verification email
  const verifyEmail = async (): Promise<void> => {
    if (!currentUser) {
      const error = new Error('No user is logged in');
      logger.error('Email verification failed', {
        context: { error },
        category: LogCategory.ERROR
      });
      throw handleError(error, 'Email verification failed');
    }
    
    logger.info('Email verification attempt', { 
      context: { uid: currentUser.uid, email: currentUser.email },
      category: LogCategory.AUTH
    });
    
    try {
      if (!auth || !auth.currentUser) {
        throw new Error('Auth not initialized or no current user');
      }
      
      await sendEmailVerification(auth.currentUser);
      logger.info('Verification email sent', { 
        context: { uid: currentUser.uid, email: currentUser.email },
        category: LogCategory.AUTH
      });
    } catch (error) {
      logger.error('Email verification failed', {
        context: { error, uid: currentUser.uid },
        category: LogCategory.ERROR
      });
      throw handleError(error, 'Email verification failed');
    }
  };

  // Function to update user profile
  const updateUserProfile = async (profile: { displayName?: string, photoURL?: string }): Promise<void> => {
    if (!currentUser) {
      const error = new Error('No user is logged in');
      logger.error('Profile update failed', {
        context: { error },
        category: LogCategory.ERROR
      });
      throw handleError(error, 'Profile update failed');
    }
    
    logger.info('Profile update attempt', { 
      context: { 
        uid: currentUser.uid, 
        updatedFields: Object.keys(profile) 
      },
      category: LogCategory.AUTH
    });
    
    try {
      await updateProfile(currentUser, profile);
      logger.info('Profile update successful', { 
        context: { 
          uid: currentUser.uid, 
          updatedFields: Object.keys(profile) 
        },
        category: LogCategory.AUTH
      });
    } catch (error) {
      logger.error('Profile update failed', {
        context: { error, uid: currentUser.uid },
        category: LogCategory.ERROR
      });
      throw handleError(error, 'Profile update failed');
    }
  };

  // Function to get user profile
  const getUserProfile = async (userId?: string): Promise<any> => {
    const targetUserId = userId || (currentUser?.uid);
    
    logger.info('Getting user profile', {
      context: { hasUserId: !!targetUserId },
      category: LogCategory.DATA
    });
    
    if (!targetUserId) {
      logger.error('Cannot get user profile - No user ID provided', {
        category: LogCategory.ERROR
      });
      return null;
    }
    
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    try {
      const userDocRef = doc(db, 'users', targetUserId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        logger.info('User profile retrieved successfully', {
          context: { uid: targetUserId },
          category: LogCategory.DATA
        });
        return { id: targetUserId, ...userData };
      } else {
        logger.info('User profile does not exist', {
          context: { uid: targetUserId },
          category: LogCategory.DATA
        });
        return null;
      }
    } catch (error) {
      logger.error('Error getting user profile', {
        context: { error, uid: targetUserId },
        category: LogCategory.ERROR
      });
      return null;
    }
  };

  // Function to update user data
  const updateUserData = async (data: any, userId?: string): Promise<void> => {
    const targetUserId = userId || (currentUser?.uid);
    
    logger.info('Updating user data', {
      context: { fields: Object.keys(data), hasUserId: !!targetUserId },
      category: LogCategory.DATA
    });
    
    if (!targetUserId) {
      const error = new Error('Cannot update user data - No user ID provided');
      logger.error('Cannot update user data - No user ID provided', {
        category: LogCategory.ERROR
      });
      throw error;
    }
    
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    try {
      const userDocRef = doc(db, 'users', targetUserId);
      await setDoc(userDocRef, data, { merge: true });
      
      logger.info('User data updated successfully', {
        context: { uid: targetUserId, fields: Object.keys(data) },
        category: LogCategory.DATA
      });
    } catch (error) {
      logger.error('Error updating user data', {
        context: { error, uid: targetUserId },
        category: LogCategory.ERROR
      });
      throw handleError(error, 'Error updating user data');
    }
  };

  // Set up the Firebase auth observer and handle auth state changes
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Initialize Firebase Auth and Firestore asynchronously
        const authInstance = await getFirebaseAuth();
        const dbInstance = await getFirebaseFirestore();
        
        setAuth(authInstance);
        setDb(dbInstance);
        
        if (!authInstance) {
          throw new Error('Firebase Auth could not be initialized');
        }
        
        // Set up auth state listener after initialization
        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
          setCurrentUser(user);
          setAuthIsInitialized(true);
        });
        
        // Clean up the observer on unmount
        return () => unsubscribe();
      } catch (error) {
        logger.error('Firebase initialization error', {
          context: { error },
          category: LogCategory.ERROR
        });
        setFirebaseInitError(error as Error);
        setAuthIsInitialized(true); // Still mark as initialized to avoid endless loading
        return undefined; // Explicit return to fix the "not all code paths return a value" error
      }
    };
    
    initializeFirebase();
  }, []);

  // Create the value object that will be passed to consumers
  const value = {
    currentUser,
    authIsInitialized,
    isLoading,
    login,
    signup,
    logout,
    signOut: logout,
    resetPassword,
    verifyEmail,
    updateUserProfile,
    getUserProfile,
    updateUserData,
    ...(firebaseInitError && { firebaseInitError }),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
