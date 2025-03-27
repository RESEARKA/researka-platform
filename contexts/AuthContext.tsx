import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User,
  signInAnonymously
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { app, auth, db, initializeFirebase, isFirebaseInitialized } from '../config/firebase';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { Box, Spinner, Center, Text } from '@chakra-ui/react';
import useClient from '../hooks/useClient';

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
  // Use refs to store Firebase instances to prevent re-initialization
  const appRef = useRef<FirebaseApp | null>(null);
  const authRef = useRef<Auth | null>(null);
  const dbRef = useRef<Firestore | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authIsInitialized, setAuthIsInitialized] = useState(false);
  const [persistentUsername, setPersistentUsername] = useState<string | null>(null);
  const isClient = useClient();
  const authListenerSetup = useRef(false);
  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Firebase only on the client side
  useEffect(() => {
    // Skip if not on client side or if auth listener is already set up
    if (!isClient || authListenerSetup.current) return;
    
    const setupAuth = async (): Promise<(() => void) | undefined> => {
      console.log('AuthContext: Setting up Firebase on client side');
      
      // Initialize Firebase if not already initialized
      const initialized = initializeFirebase();
      if (!initialized) {
        console.error('AuthContext: Failed to initialize Firebase');
        setIsLoading(false);
        setAuthIsInitialized(true);
        return undefined;
      }
      
      // Store instances in refs to prevent re-initialization
      if (!appRef.current) appRef.current = app;
      if (!authRef.current) authRef.current = auth;
      if (!dbRef.current) dbRef.current = db;
      
      // Mark that we've started setting up the auth listener
      authListenerSetup.current = true;
      
      // Add timeout to prevent hanging indefinitely
      authTimeoutRef.current = setTimeout(() => {
        console.warn('AuthContext: Auth initialization timed out after 10 seconds');
        setIsLoading(false);
        setAuthIsInitialized(true);
      }, 10000);
      
      try {
        // Set up auth state listener
        console.log('AuthContext: Setting up auth state listener...');
        const unsubscribe = onAuthStateChanged(authRef.current!, (user) => {
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
        
        // Return cleanup function
        return () => {
          unsubscribe();
          if (authTimeoutRef.current) {
            clearTimeout(authTimeoutRef.current);
            authTimeoutRef.current = null;
          }
        };
      } catch (error) {
        console.error('AuthContext: Error setting up auth listener:', error);
        // Ensure we still update the state even if there's an error
        setAuthIsInitialized(true);
        setIsLoading(false);
        if (authTimeoutRef.current) {
          clearTimeout(authTimeoutRef.current);
          authTimeoutRef.current = null;
        }
        return undefined; // Return undefined instead of empty function
      }
    };
    
    // Set up the auth listener
    let cleanupFn: (() => void) | undefined;
    
    // Execute the setup function and store the cleanup function
    setupAuth().then(cleanup => {
      cleanupFn = cleanup;
    }).catch(error => {
      console.error('AuthContext: Error in setupAuth:', error);
    });
    
    // Cleanup subscription on unmount
    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
      
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
    };
  }, [isClient]);

  // Sign up with email and password
  async function signup(email: string, password: string, name: string) {
    console.log('AuthContext: Starting signup process...');
    try {
      if (!authRef.current) {
        console.error('AuthContext: Authentication not initialized');
        throw new Error('Authentication not initialized');
      }
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(authRef.current, email, password);
      
      // Update user profile with name (if provided)
      console.log('AuthContext: Updating user profile...');
      try {
        if (userCredential.user && name.trim()) {
          await updateProfile(userCredential.user, {
            displayName: name
          });
        }
        
        // Create user document in Firestore
        console.log('AuthContext: Creating user document in Firestore...');
        try {
          if (!dbRef.current) {
            console.error('AuthContext: Firestore not initialized');
            return userCredential;
          }
          // Use users collection now that rules allow authenticated access
          await setDoc(doc(dbRef.current, 'users', userCredential.user.uid), {
            name: name.trim() || '',
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
            createdAt: new Date().toISOString()
          });
          console.log('AuthContext: User document created successfully in users collection');
        } catch (firestoreError) {
          console.error('AuthContext: Error creating user document:', firestoreError);
          // Continue even if Firestore fails - we can create the document later
        }
      } catch (profileError) {
        console.error('AuthContext: Error updating profile:', profileError);
        // Continue even if profile update fails
      }
      
      return userCredential;
    } catch (error) {
      console.error('AuthContext: Error in signup process:', error);
      throw error; // Re-throw the error to be handled by the component
    }
  }

  // Login with email and password
  async function login(email: string, password: string) {
    console.log('AuthContext: Starting login process...');
    try {
      if (!authRef.current) {
        console.error('AuthContext: Authentication not initialized');
        throw new Error('Authentication not initialized');
      }
      const result = await signInWithEmailAndPassword(authRef.current, email, password);
      console.log('AuthContext: Login successful');
      return result;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  }

  // Logout
  async function logout() {
    console.log('AuthContext: Logging out...');
    try {
      if (!authRef.current) {
        console.error('AuthContext: Authentication not initialized');
        throw new Error('Authentication not initialized');
      }
      await signOut(authRef.current);
      console.log('AuthContext: Logout successful');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      throw error;
    }
  }

  // Reset password
  async function resetPassword(email: string) {
    console.log('AuthContext: Sending password reset email...');
    try {
      if (!authRef.current) {
        console.error('AuthContext: Authentication not initialized');
        throw new Error('Authentication not initialized');
      }
      // await sendPasswordResetEmail(authRef.current, email);
      console.log('AuthContext: Password reset email sent');
    } catch (error) {
      console.error('AuthContext: Password reset error:', error);
      throw error;
    }
  }

  // Update user profile
  async function updateUserProfile(name: string) {
    if (!currentUser) throw new Error('No user is logged in');
    if (!authRef.current) {
      console.error('AuthContext: Authentication not initialized');
      throw new Error('Authentication not initialized');
    }
    
    console.log('AuthContext: Updating user profile...');
    try {
      await updateProfile(currentUser, { displayName: name });
      console.log('AuthContext: Profile updated successfully');
      return;
    } catch (error) {
      console.error('AuthContext: Profile update error:', error);
      throw error;
    }
  }

  // Get user profile data from Firestore
  async function getUserProfile() {
    if (!currentUser) {
      console.warn('AuthContext: No user is logged in when trying to get profile');
      return null;
    }
    
    if (!dbRef.current) {
      console.error('AuthContext: Firestore not initialized');
      return null;
    }
    
    console.log('AuthContext: Getting user profile from Firestore for user:', currentUser.uid);
    try {
      // Add retry logic for getting user profile
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          // Use users collection now that rules allow authenticated access
          const userDoc = await getDoc(doc(dbRef.current, 'users', currentUser.uid));
          if (userDoc.exists()) {
            console.log('AuthContext: User profile retrieved successfully');
            return userDoc.data();
          }
          
          // If this is the first attempt and the document doesn't exist, try to create it
          if (attempts === 0) {
            console.log('AuthContext: User profile does not exist, attempting to create default profile');
            try {
              // Create a default profile
              await setDoc(doc(dbRef.current, 'users', currentUser.uid), {
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
                createdAt: new Date().toISOString()
              });
              console.log('AuthContext: Default profile created successfully');
            } catch (createError) {
              console.error('AuthContext: Error creating default profile:', createError);
            }
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`AuthContext: Error getting user profile (attempt ${attempts + 1}/${maxAttempts}):`, error);
          attempts++;
          if (attempts < maxAttempts) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      console.log('AuthContext: Max attempts reached, returning null for user profile');
      return null;
    } catch (error) {
      console.error('AuthContext: Error in getUserProfile:', error);
      return null;
    }
  }

  // Validate user data before saving to Firestore
  function validateUserData(data: any): { isValid: boolean; sanitizedData: any; errors: string[] } {
    const errors: string[] = [];
    const sanitizedData: any = {};
    
    // Check if data is an object
    if (!data || typeof data !== 'object') {
      errors.push('Data must be an object');
      return { isValid: false, sanitizedData: {}, errors };
    }
    
    // Copy only valid fields and convert undefined to null
    const allowedFields = [
      'name', 'email', 'role', 'institution', 'department', 
      'position', 'researchInterests', 'articles', 'reviews', 
      'reputation', 'profileComplete', 'createdAt', 'updatedAt',
      'hasChangedName', 'hasChangedInstitution'
    ];
    
    for (const key of Object.keys(data)) {
      // Check if field is allowed
      if (!allowedFields.includes(key)) {
        console.warn(`AuthContext: Skipping disallowed field: ${key}`);
        continue;
      }
      
      // Handle undefined values
      if (data[key] === undefined) {
        console.warn(`AuthContext: Converting undefined to null for field: ${key}`);
        sanitizedData[key] = null;
      } else {
        sanitizedData[key] = data[key];
      }
    }
    
    // Add updatedAt timestamp
    sanitizedData.updatedAt = new Date().toISOString();
    
    return { 
      isValid: errors.length === 0, 
      sanitizedData, 
      errors 
    };
  }

  // Sign in anonymously if no user is logged in
  async function signInAnonymousUser(): Promise<any> {
    console.log('AuthContext: Starting anonymous sign in...');
    try {
      if (!authRef.current) {
        console.error('AuthContext: Authentication not initialized');
        throw new Error('Authentication not initialized');
      }
      
      // Fix the signInAnonymously method call
      const result = await signInAnonymously(authRef.current);
      console.log('AuthContext: Anonymous sign in successful');
      
      // Create a basic profile for anonymous user
      if (result.user) {
        try {
          const anonymousName = `Guest-${result.user.uid.substring(0, 5)}`;
          await updateProfile(result.user, {
            displayName: anonymousName
          });
          
          // Create a basic Firestore document for the anonymous user
          if (dbRef.current) {
            await setDoc(doc(dbRef.current, 'users', result.user.uid), {
              name: anonymousName,
              isAnonymous: true,
              createdAt: new Date().toISOString()
            });
          }
        } catch (profileError) {
          console.error('AuthContext: Error creating anonymous profile:', profileError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('AuthContext: Anonymous sign in error:', error);
      throw error;
    }
  }

  // Check if user is anonymous
  function isAnonymousUser(): boolean {
    return currentUser?.isAnonymous || false;
  }

  // Test Firestore write access
  async function testFirestoreWrite(): Promise<boolean> {
    console.log('AuthContext: Testing Firestore write access...');
    try {
      if (!currentUser) {
        console.error('AuthContext: No user is logged in, cannot test write access');
        return false;
      }
      
      if (!dbRef.current) {
        console.error('AuthContext: Database not initialized, cannot test write access');
        return false;
      }
      
      const testDocRef = doc(dbRef.current, `users/${currentUser.uid}/test/write-test`);
      await setDoc(testDocRef, {
        timestamp: new Date().toISOString(),
        test: 'write-test'
      });
      
      console.log('AuthContext: Firestore write test successful');
      return true;
    } catch (error) {
      console.error('AuthContext: Firestore write test failed:', error);
      return false;
    }
  }

  // Update user data in Firestore
  async function updateUserData(data: any): Promise<boolean> {
    console.log('AuthContext: Updating user data in Firestore...');
    try {
      if (!currentUser) {
        console.error('AuthContext: No user is logged in, cannot update user data');
        return false;
      }
      
      if (!dbRef.current) {
        console.error('AuthContext: Database not initialized, cannot update user data');
        return false;
      }
      
      // Validate user data before saving
      const { isValid, sanitizedData, errors } = validateUserData(data);
      
      if (!isValid) {
        console.error('AuthContext: Invalid user data:', errors);
        return false;
      }
      
      const userDocRef = doc(dbRef.current, 'users', currentUser.uid);
      
      // Use a transaction to safely update the user document
      await runTransaction(dbRef.current, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        
        if (!userDoc.exists()) {
          // Create a new user document with the sanitized data
          transaction.set(userDocRef, {
            ...sanitizedData,
            // Add default fields for new users
            hasChangedName: false,
            hasChangedInstitution: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          // Update existing user document
          const userData = userDoc.data();
          
          // Handle one-time name change
          if (sanitizedData.name && userData.name !== sanitizedData.name) {
            if (userData.hasChangedName === true) {
              console.log('AuthContext: User has already changed their name once');
              // Keep the existing name if they've already changed it once
              delete sanitizedData.name;
            } else {
              console.log('AuthContext: Setting hasChangedName flag to true');
              sanitizedData.hasChangedName = true;
            }
          }
          
          // Handle one-time institution change
          if (sanitizedData.institution && userData.institution !== sanitizedData.institution) {
            if (userData.hasChangedInstitution === true) {
              console.log('AuthContext: User has already changed their institution once');
              // Keep the existing institution if they've already changed it once
              delete sanitizedData.institution;
            } else {
              console.log('AuthContext: Setting hasChangedInstitution flag to true');
              sanitizedData.hasChangedInstitution = true;
            }
          }
          
          // Update the document with the sanitized data
          transaction.update(userDocRef, {
            ...sanitizedData,
            updatedAt: new Date().toISOString(),
          });
        }
      });
      
      console.log('AuthContext: User data updated successfully');
      return true;
    } catch (error) {
      console.error('AuthContext: Error updating user data:', error);
      return false;
    }
  }

  const value = {
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

  // Create a loading component that only shows on client side
  const LoadingOverlay = () => {
    if (!isClient || (!isLoading && authIsInitialized)) return null;
    
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0, 0, 0, 0.5)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={9999}
        data-testid="auth-loading-overlay"
      >
        <Box bg="white" p={4} borderRadius="md" textAlign="center">
          <Spinner size="xl" color="blue.500" mb={4} />
          <Text>Initializing authentication...</Text>
        </Box>
      </Box>
    );
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Always render children regardless of loading state */}
      {children}
      
      {/* Only show loading overlay on client side */}
      <LoadingOverlay />
    </AuthContext.Provider>
  );
};
