import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User,
  signInAnonymously
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { Box, Spinner, Center, Text } from '@chakra-ui/react';
import useAuthInitialization, { AuthStatus } from '../hooks/useAuthInitialization';
import { useFirebaseInitialization, FirebaseStatus } from '../hooks/useFirebaseInitialization';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  authIsInitialized: boolean;
  persistentUsername: string | null;
  signup: (email: string, password: string, name: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (name: string) => Promise<void>;
  getUserProfile: () => Promise<any>;
  updateUserData: (data: any) => Promise<boolean>;
  signInAnonymousUser: () => Promise<any>;
  isAnonymousUser: () => boolean;
  testFirestoreWrite: () => Promise<boolean>;
  setPersistentUsername: (username: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [persistentUsername, setPersistentUsername] = useState<string | null>(null);
  
  // Use the centralized auth initialization hook
  const { 
    status: authStatus, 
    error: authError, 
    user: currentUser,
    isAnonymous
  } = useAuthInitialization({
    timeoutMs: 10000,
    enableLogging: true
  });
  
  // Get Firebase services from the Firebase initialization hook
  const { 
    status: firebaseStatus, 
    auth, 
    db 
  } = useFirebaseInitialization({
    enableLogging: true
  });
  
  // Derive loading and initialization state from auth status
  const isLoading = authStatus === AuthStatus.INITIALIZING;
  const authIsInitialized = authStatus === AuthStatus.READY || 
                           authStatus === AuthStatus.ERROR || 
                           authStatus === AuthStatus.TIMEOUT;
  
  // Log auth errors
  const authErrorRef = useRef<Error | null>(null);
  if (authError && authError !== authErrorRef.current) {
    console.error('AuthContext: Auth initialization error:', authError);
    authErrorRef.current = authError;
  }
  
  // Signup function
  const signup = async (email: string, password: string, name: string) => {
    if (!auth || !db) {
      throw new Error('Firebase not initialized');
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        
        // Create user document in Firestore
        const userRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userRef, {
          name,
          email,
          role: 'Researcher',
          institution: '',
          department: '',
          position: '',
          researchInterests: [],
          articles: 0,
          reviews: 0,
          reputation: 0,
          profileComplete: false,
          hasChangedName: false,
          hasChangedInstitution: false,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isAnonymous: false
        });
      }
      
      return userCredential;
    } catch (error) {
      console.error('AuthContext: Signup error:', error);
      throw error;
    }
  };
  
  // Login function
  const login = async (email: string, password: string) => {
    if (!auth || !db) {
      throw new Error('Firebase not initialized');
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login timestamp
      if (userCredential.user) {
        const userRef = doc(db, 'users', userCredential.user.uid);
        await updateDoc(userRef, {
          lastLogin: new Date().toISOString()
        });
      }
      
      return userCredential;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };
  
  // Logout function
  const logout = async () => {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    
    try {
      await signOut(auth);
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      throw error;
    }
  };
  
  // Reset password function
  const resetPassword = async (email: string) => {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    
    try {
      // Firebase doesn't export sendPasswordResetEmail in the imports above
      // So we need to dynamically import it
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('AuthContext: Reset password error:', error);
      throw error;
    }
  };
  
  // Update user profile function
  const updateUserProfile = async (name: string) => {
    if (!auth || !currentUser) {
      throw new Error('User not authenticated or Firebase not initialized');
    }
    
    try {
      await updateProfile(currentUser, { displayName: name });
    } catch (error) {
      console.error('AuthContext: Update profile error:', error);
      throw error;
    }
  };
  
  // Get user profile function
  const getUserProfile = async () => {
    if (!db || !currentUser) {
      throw new Error('User not authenticated or Firebase not initialized');
    }
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        console.warn('AuthContext: User document does not exist');
        
        // Create a default profile if it doesn't exist
        const defaultProfile = {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          role: 'Researcher',
          institution: '',
          department: '',
          position: '',
          researchInterests: [],
          articles: 0,
          reviews: 0,
          reputation: 0,
          profileComplete: false,
          hasChangedName: false,
          hasChangedInstitution: false,
          createdAt: new Date().toISOString(),
          isAnonymous: currentUser.isAnonymous || false
        };
        
        try {
          await setDoc(userRef, defaultProfile);
          console.log('AuthContext: Created default user profile');
          return defaultProfile;
        } catch (createError) {
          console.error('AuthContext: Error creating default profile:', createError);
          return null;
        }
      }
    } catch (error) {
      console.error('AuthContext: Get user profile error:', error);
      throw error;
    }
  };
  
  // Update user data function
  const updateUserData = async (data: any) => {
    if (!db || !currentUser) {
      throw new Error('User not authenticated or Firebase not initialized');
    }
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Use transaction to ensure atomic update
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('User document does not exist');
        }
        
        // Get current user data
        const userData = userDoc.data();
        
        // Handle one-time name change
        if (data.name && userData.name !== data.name) {
          if (userData.hasChangedName === true) {
            console.log('AuthContext: User has already changed their name once');
            // Keep the existing name if they've already changed it once
            delete data.name;
          } else {
            console.log('AuthContext: Setting hasChangedName flag to true');
            data.hasChangedName = true;
          }
        }
        
        // Handle one-time institution change
        if (data.institution && userData.institution !== data.institution) {
          if (userData.hasChangedInstitution === true) {
            console.log('AuthContext: User has already changed their institution once');
            // Keep the existing institution if they've already changed it once
            delete data.institution;
          } else {
            console.log('AuthContext: Setting hasChangedInstitution flag to true');
            data.hasChangedInstitution = true;
          }
        }
        
        // Update with new data
        transaction.update(userRef, {
          ...data,
          updatedAt: new Date().toISOString()
        });
      });
      
      return true;
    } catch (error) {
      console.error('AuthContext: Update user data error:', error);
      return false;
    }
  };
  
  // Sign in anonymously function
  const signInAnonymousUser = async () => {
    if (!auth || !db) {
      throw new Error('Firebase not initialized');
    }
    
    try {
      const userCredential = await signInAnonymously(auth);
      
      // Create anonymous user document in Firestore
      if (userCredential.user) {
        const anonymousName = `Guest-${userCredential.user.uid.substring(0, 5)}`;
        
        // Update profile with anonymous name
        await updateProfile(userCredential.user, {
          displayName: anonymousName
        });
        
        const userRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userRef, {
          name: anonymousName,
          isAnonymous: true,
          role: 'Guest',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      }
      
      return userCredential;
    } catch (error) {
      console.error('AuthContext: Anonymous sign in error:', error);
      throw error;
    }
  };
  
  // Check if current user is anonymous
  const isAnonymousUser = () => {
    return !!currentUser?.isAnonymous;
  };
  
  // Test Firestore write function (for debugging)
  const testFirestoreWrite = async () => {
    if (!db) {
      console.error('AuthContext: Firestore not initialized');
      return false;
    }
    
    try {
      const testRef = doc(db, 'test', 'test-document');
      await setDoc(testRef, {
        timestamp: new Date().toISOString(),
        test: 'This is a test write'
      });
      console.log('AuthContext: Test write successful');
      return true;
    } catch (error) {
      console.error('AuthContext: Test write error:', error);
      return false;
    }
  };
  
  // Provide the auth context value
  const value: AuthContextType = {
    currentUser,
    isLoading,
    authIsInitialized,
    persistentUsername,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    getUserProfile,
    updateUserData,
    signInAnonymousUser,
    isAnonymousUser,
    testFirestoreWrite,
    setPersistentUsername
  };
  
  // Always render children, even during loading
  // This prevents hydration issues by ensuring consistent rendering
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
