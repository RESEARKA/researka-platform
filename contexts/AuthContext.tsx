import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  updateProfile, 
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore } from '../config/firebase';
import { createLogger, LogCategory } from '../utils/logger';
import { handleError } from '../utils/errorHandling';

// Initialize Firebase services
const db = getFirebaseFirestore();
const auth = getFirebaseAuth();

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
  const [isLoading, setIsLoading] = useState(false);

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
    
    // Add retry logic for network errors
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptLogin = async (): Promise<User> => {
      try {
        // Special case for admin account recovery
        if (email === 'dominic@dominic.ac') {
          try {
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
      } catch (error: any) {
        // Handle network errors with retry logic
        if (error.code === 'auth/network-request-failed' && retryCount < maxRetries) {
          retryCount++;
          logger.warn(`Network error during login, retrying (${retryCount}/${maxRetries})`, {
            context: { email, retryCount, maxRetries },
            category: LogCategory.AUTH
          });
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
          return attemptLogin();
        }
        
        // Add more context to the error
        if (error.code === 'auth/network-request-failed') {
          error.category = 'network';
          error.message = 'Network connection error. Please check your internet connection and try again.';
          error.retry = true;
        } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          error.category = 'credentials';
          error.message = 'Invalid email or password. Please try again.';
          error.retry = false;
        } else if (error.code === 'auth/too-many-requests') {
          error.category = 'rate-limit';
          error.message = 'Too many login attempts. Please try again later or reset your password.';
          error.retry = false;
        }
        
        logger.error('Login failed', {
          context: { error, email },
          category: LogCategory.ERROR
        });
        throw error;
      }
    };
    
    return attemptLogin();
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
        const db = getFirebaseFirestore();
        if (db) {
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
        } else {
          logger.error('Failed to create user document - Firestore not initialized', {
            context: { uid: userCredential.user.uid },
            category: LogCategory.ERROR
          });
        }
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
  const signOut = async (): Promise<void> => {
    logger.info('Signout attempt', { 
      context: { uid: currentUser?.uid },
      category: LogCategory.AUTH
    });
    
    if (!auth) {
      const error = new Error('Firebase Auth not initialized');
      logger.error('Signout failed - Firebase Auth not initialized', {
        context: { error },
        category: LogCategory.ERROR
      });
      throw error;
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
      await sendEmailVerification(currentUser);
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
    
    const db = getFirebaseFirestore();
    if (!db) {
      logger.error('Cannot get user profile - Firestore not initialized', {
        category: LogCategory.ERROR
      });
      return null;
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
      throw handleError(error, 'Cannot update user data');
    }
    
    const db = getFirebaseFirestore();
    if (!db) {
      const error = new Error('Cannot update user data - Firestore not initialized');
      logger.error('Cannot update user data - Firestore not initialized', {
        category: LogCategory.ERROR
      });
      throw handleError(error, 'Cannot update user data');
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

  // Effect for auth state changes
  useEffect(() => {
    if (!auth) return;
    
    logger.info('Setting up auth state listener', {
      category: LogCategory.AUTH
    });
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      
      try {
        if (user) {
          logger.info('Auth state changed: user logged in', {
            context: { 
              uid: user.uid, 
              email: user.email,
              emailVerified: user.emailVerified 
            },
            category: LogCategory.AUTH
          });
          
          // Check if the user is deleted or deactivated
          try {
            const idToken = await user.getIdToken();
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
                logger.warn(`User access denied: ${errorData.error}`, {
                  context: { 
                    uid: user.uid,
                    email: user.email,
                    code: errorData.code
                  },
                  category: LogCategory.AUTH
                });
                
                await auth.signOut();
                setCurrentUser(null);
                setAuthIsInitialized(true);
                setIsLoading(false);
                return;
              }
            }
          } catch (statusError) {
            logger.error('Error checking user status on auth state change', {
              context: { statusError, uid: user.uid },
              category: LogCategory.ERROR
            });
            // Continue with the auth flow even if the status check fails
            // The user will be checked again on the next auth state change
          }
          
          // User is valid, update the state
          setCurrentUser(user);
        } else {
          logger.info('Auth state changed: no user', {
            category: LogCategory.AUTH
          });
          setCurrentUser(null);
        }
        
        setIsLoading(false);
        if (!authIsInitialized) {
          logger.info('Auth initialized', {
            category: LogCategory.LIFECYCLE
          });
          setAuthIsInitialized(true);
        }
      } catch (error) {
        logger.error('Error handling auth state change', {
          context: { error },
          category: LogCategory.ERROR
        });
        setIsLoading(false);
      }
    });

    // Cleanup subscription
    return () => {
      logger.info('Cleaning up auth state listener', {
        category: LogCategory.LIFECYCLE
      });
      unsubscribe();
    };
  }, [authIsInitialized]);

  const value = {
    currentUser,
    authIsInitialized,
    isLoading,
    login,
    signup,
    logout: signOut,
    signOut,
    resetPassword,
    verifyEmail,
    updateUserProfile,
    getUserProfile,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
