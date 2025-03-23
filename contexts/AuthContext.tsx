import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  signInAnonymously,
  UserCredential,
  Auth
} from 'firebase/auth';
import { doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { auth, db, app } from '../config/firebase';
import { Box, Spinner } from '@chakra-ui/react';
import { FirebaseApp } from 'firebase/app';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  authIsInitialized: boolean;
  persistentUsername: string | null;
  signup: (email: string, password: string, name?: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (name: string) => Promise<void>;
  getUserProfile: () => Promise<any>;
  updateUserData: (data: any) => Promise<boolean>;
  signInAnonymousUser: () => Promise<UserCredential>;
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

  // Sign up with email and password
  async function signup(email: string, password: string, name: string = '') {
    console.log('AuthContext: Starting signup process...');
    try {
      if (!authRef.current) {
        console.error('AuthContext: Authentication not initialized');
        throw new Error('Authentication not initialized');
      }
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(authRef.current, email, password);
      
      // Update user profile with name if provided
      console.log('AuthContext: Updating user profile with name...');
      try {
        if (userCredential.user && name) {
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
            name: name || '',
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
      await sendPasswordResetEmail(authRef.current, email);
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
      // Use users collection now that rules allow authenticated access
      const userDoc = await getDoc(doc(dbRef.current, 'users', currentUser.uid));
      if (userDoc.exists()) {
        console.log('AuthContext: User profile retrieved successfully');
        return userDoc.data();
      }
      console.log('AuthContext: User profile does not exist, will need to create one');
      return null;
    } catch (error) {
      console.error('AuthContext: Error getting user profile:', error);
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
      'reputation', 'profileComplete', 'createdAt', 'updatedAt'
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
  async function signInAnonymousUser(): Promise<UserCredential> {
    console.log('AuthContext: Starting anonymous sign in...');
    try {
      if (!authRef.current) {
        console.error('AuthContext: Authentication not initialized');
        throw new Error('Authentication not initialized');
      }
      
      const result = await signInAnonymously(authRef.current);
      console.log('AuthContext: Anonymous sign in successful');
      
      // Create a basic profile for anonymous user
      if (dbRef.current) {
        try {
          const anonymousProfile = {
            name: 'Anonymous User',
            email: '',
            role: 'Visitor',
            isAnonymous: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Use users collection now that rules allow authenticated access
          await setDoc(doc(dbRef.current, 'users', result.user.uid), anonymousProfile, { merge: true });
          console.log('AuthContext: Created anonymous user profile in users collection');
        } catch (profileError) {
          console.error('AuthContext: Error creating anonymous profile:', profileError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('AuthContext: Error signing in anonymously:', error);
      throw error;
    }
  }

  // Check if current user is anonymous
  function isAnonymousUser(): boolean {
    return currentUser?.isAnonymous || false;
  }

  // Update user data in Firestore
  async function updateUserData(data: any) {
    console.log('AuthContext: updateUserData called with data:', JSON.stringify(data));
    
    let user = currentUser;
    
    if (!user) {
      console.warn('AuthContext: No user is logged in when trying to update profile');
      
      // Try anonymous sign in if no user is logged in
      try {
        console.log('AuthContext: Attempting anonymous sign in...');
        const result = await signInAnonymousUser();
        user = result.user; // Use the user from the sign-in result
        console.log('AuthContext: Anonymous sign in successful, retrying update with user:', user.uid);
      } catch (anonError) {
        console.error('AuthContext: Anonymous sign in failed:', anonError);
        return false;
      }
    }
    
    // If still no user after anonymous sign in, return false
    if (!user) {
      console.error('AuthContext: Still no user after anonymous sign in');
      return false;
    }
    
    if (!dbRef.current) {
      console.error('AuthContext: Firestore not initialized');
      return false;
    }
    
    // Validate and sanitize data
    const { isValid, sanitizedData, errors } = validateUserData(data);
    if (!isValid) {
      console.error('AuthContext: Invalid user data:', errors);
      return false;
    }
    
    // Add isAnonymous flag if user is anonymous
    if (user.isAnonymous) {
      sanitizedData.isAnonymous = true;
    }
    
    // Handle editor request
    if (sanitizedData.wantsToBeEditor) {
      sanitizedData.editorStatus = 'pending';
      sanitizedData.editorRequestDate = new Date().toISOString();
    }
    
    // Add timestamps
    sanitizedData.updatedAt = new Date().toISOString();
    if (!sanitizedData.createdAt) {
      sanitizedData.createdAt = new Date().toISOString();
    }
    
    // Log the exact path we're trying to write to
    // Use users collection now that rules allow authenticated access
    const docPath = `users/${user.uid}`;
    console.log(`AuthContext: Attempting to write to Firestore path: ${docPath}`);
    console.log('AuthContext: Sanitized data:', JSON.stringify(sanitizedData));
    
    console.log('AuthContext: Updating user data in Firestore for user:', user.uid);
    try {
      await setDoc(doc(dbRef.current, 'users', user.uid), sanitizedData, { merge: true });
      console.log('AuthContext: User data updated successfully');
      return true;
    } catch (error: any) {
      // Log detailed error information
      console.error('AuthContext: Error updating user data:', {
        errorCode: error.code,
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack,
        errorObject: error
      });
      return false;
    }
  }

  // Test function to write to public_test collection
  async function testFirestoreWrite(): Promise<boolean> {
    console.log('AuthContext: Testing Firestore write to public_test collection');
    
    let user = currentUser;
    
    if (!user) {
      console.warn('AuthContext: No user is logged in for Firestore test');
      try {
        const result = await signInAnonymousUser();
        user = result.user; // Use the user from the sign-in result
        console.log('AuthContext: Anonymous sign in successful for test, user:', user.uid);
      } catch (error) {
        console.error('AuthContext: Failed to sign in anonymously for test:', error);
        return false;
      }
    }
    
    if (!dbRef.current) {
      console.error('AuthContext: Firestore not initialized for test');
      return false;
    }
    
    if (!user) {
      console.error('AuthContext: Still no user after sign-in attempt');
      return false;
    }
    
    try {
      const testData = {
        timestamp: new Date().toISOString(),
        message: 'Test data from AuthContext',
        userId: user.uid
      };
      
      const docId = user.uid;
      console.log(`AuthContext: Attempting to write to public_test/${docId}`);
      
      await setDoc(doc(dbRef.current, 'public_test', docId), testData);
      console.log('AuthContext: Test write to public_test successful');
      return true;
    } catch (error) {
      console.error('AuthContext: Test write to public_test failed:', error);
      return false;
    }
  }

  useEffect(() => {
    console.log('AuthContext: Setting up auth state change listener...');
    
    // Initialize Firebase refs if not already initialized
    if (!appRef.current) {
      console.log('AuthContext: Initializing Firebase refs from imported instances');
      try {
        // Use the imported instances from config/firebase.ts
        appRef.current = app;
        authRef.current = auth;
        dbRef.current = db;
        
        console.log('AuthContext: Firebase refs initialized successfully', {
          appInitialized: !!appRef.current,
          authInitialized: !!authRef.current,
          dbInitialized: !!dbRef.current
        });
      } catch (error) {
        console.error('AuthContext: Error initializing Firebase refs:', error);
      }
    }
    
    // Set a timeout to handle cases where Firebase auth initialization takes too long
    const authTimeout = setTimeout(() => {
      console.warn('AuthContext: Auth initialization timed out after 10 seconds');
      setIsLoading(false);
      setAuthIsInitialized(true);
    }, 10000);
    
    // Listen for auth state changes
    if (!authRef.current) {
      console.error('AuthContext: Auth not initialized in useEffect');
      setIsLoading(false);
      setAuthIsInitialized(true);
      return () => clearTimeout(authTimeout);
    }
    
    console.log('AuthContext: Setting up onAuthStateChanged listener...');
    const unsubscribe = onAuthStateChanged(authRef.current, async (user) => {
      console.log('AuthContext: Auth state changed:', user ? `User ${user.uid} (${user.email})` : 'No user');
      
      // Process user authentication
      if (user) {
        console.log('AuthContext: User authenticated, updating currentUser');
        
        // Set the current user
        setCurrentUser(user);
        
        // Update persistentUsername from user displayName with fallbacks
        const defaultUsername = user.email 
          ? user.email.split('@')[0] 
          : `User-${user.uid.substring(0, 5)}`;
        
        const newUsername = user.displayName || defaultUsername;
        
        if (newUsername && (!persistentUsername || newUsername !== persistentUsername)) {
          console.log('AuthContext: Setting persistentUsername to:', newUsername);
          setPersistentUsername(newUsername);
        }
        
        // If user has no display name, try to get it from Firestore
        if (!user.displayName) {
          console.warn('AuthContext: User has no displayName, attempting to retrieve from Firestore');
          try {
            if (dbRef.current) {
              const userDoc = await getDoc(doc(dbRef.current, 'users', user.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log('AuthContext: Retrieved user data from Firestore:', userData);
                
                if (userData.name && !user.displayName) {
                  console.log('AuthContext: Updating user displayName from Firestore name:', userData.name);
                  try {
                    await updateProfile(user, {
                      displayName: userData.name
                    });
                    console.log('AuthContext: Successfully updated displayName');
                  } catch (updateError) {
                    console.error('AuthContext: Failed to update displayName:', updateError);
                  }
                }
              } else {
                console.warn('AuthContext: User document not found in Firestore');
              }
            }
          } catch (firestoreError) {
            console.error('AuthContext: Error retrieving user data from Firestore:', firestoreError);
          }
        }
      }
      
      // Update auth state with detailed logging
      console.log('AuthContext: Updating auth state...', {
        currentUserBefore: currentUser ? currentUser.uid : null,
        isLoadingBefore: isLoading,
        authIsInitializedBefore: authIsInitialized
      });
      
      setIsLoading(false);
      setAuthIsInitialized(true);
      
      console.log('AuthContext: Auth state updated', {
        currentUserAfter: user ? user.uid : null,
        isLoadingAfter: false,
        authIsInitializedAfter: true
      });
    });

    return () => {
      unsubscribe();
      clearTimeout(authTimeout);
    };
  }, []);

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

  return (
    <AuthContext.Provider value={value}>
      {children}
      {(isLoading || !authIsInitialized) && (
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
        >
          <Spinner size="xl" color="white" />
        </Box>
      )}
    </AuthContext.Provider>
  );
};
