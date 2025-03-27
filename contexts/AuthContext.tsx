import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User,
  signInAnonymously
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { Box, Spinner, Center, Text } from '@chakra-ui/react';
import useClient from '../hooks/useClient';
import useFirebaseInitialization, { FirebaseStatus } from '../hooks/useFirebaseInitialization';

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authIsInitialized, setAuthIsInitialized] = useState(false);
  const [persistentUsername, setPersistentUsername] = useState<string | null>(null);
  const isClient = useClient();
  const authListenerSetup = useRef(false);
  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use the centralized Firebase initialization hook
  const { 
    status: firebaseStatus, 
    error: firebaseError, 
    app, 
    auth, 
    db 
  } = useFirebaseInitialization({
    timeoutMs: 10000,
    maxAttempts: 3,
    enableLogging: true
  });

  // Initialize Firebase auth listener only on the client side and after Firebase is initialized
  useEffect(() => {
    // Skip if not on client side or if auth listener is already set up
    // or if Firebase is not yet initialized
    if (!isClient || authListenerSetup.current || firebaseStatus !== FirebaseStatus.INITIALIZED || !auth) {
      return;
    }
    
    console.log('AuthContext: Setting up auth state listener...');
    
    // Mark that we've started setting up the auth listener
    authListenerSetup.current = true;
    
    // Add timeout to prevent hanging indefinitely
    authTimeoutRef.current = setTimeout(() => {
      console.warn('AuthContext: Auth initialization timed out after 10 seconds');
      setIsLoading(false);
      setAuthIsInitialized(true);
    }, 10000);
    
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('AuthContext: Auth state changed', user ? `User: ${user.uid}` : 'No user');
      
      // Use functional updates to batch state changes
      setCurrentUser(user);
      setAuthIsInitialized(true);
      setIsLoading(false);
      
      // Clear the timeout since auth state has changed
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
    };
  }, [isClient, firebaseStatus, auth]);
  
  // Update initialization state based on Firebase status
  useEffect(() => {
    if (firebaseStatus === FirebaseStatus.ERROR || firebaseStatus === FirebaseStatus.TIMEOUT) {
      console.error('AuthContext: Firebase initialization failed:', firebaseError);
      setAuthIsInitialized(true);
      setIsLoading(false);
    } else if (firebaseStatus === FirebaseStatus.UNAVAILABLE) {
      console.log('AuthContext: Firebase unavailable (server-side)');
      setAuthIsInitialized(true);
      setIsLoading(false);
    }
  }, [firebaseStatus, firebaseError]);
  
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
        return null;
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
        const userRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userRef, {
          isAnonymous: true,
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
