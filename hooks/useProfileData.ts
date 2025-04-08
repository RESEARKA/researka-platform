import { useCallback, useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseFirestore, initializeFirebase } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { createLogger, LogCategory } from '../utils/logger';

// Create a logger instance for this hook
const logger = createLogger('useProfileData');

// Module-level flag to prevent concurrent Firebase initialization
let firebaseInitializationInProgress = false;

// Profile loading states for more granular tracking
export enum ProfileLoadingState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  LOADING = 'loading',
  UPDATING = 'updating',
  ERROR = 'error',
  SUCCESS = 'success'
}

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: string;
  institution?: string;
  department?: string;
  position?: string;
  bio?: string;
  researchInterests?: string | string[];
  articles?: number;
  reviews?: number;
  walletAddress?: string;
  hasChangedName?: boolean;
  hasChangedInstitution?: boolean;
  createdAt?: string;
  updatedAt?: string;
  isComplete?: boolean;
  profileComplete?: boolean;
  avatarUrl?: string;
  articleCount?: number;
  reviewCount?: number;
  reputation?: number;
  twitter?: string;
  linkedin?: string;
  orcidId?: string;
  personalWebsite?: string;
  wantsToBeEditor?: boolean;
}

// Helper function to check if profile is in one of the specified loading states
export function isInLoadingState(states: ProfileLoadingState[], currentState?: ProfileLoadingState): boolean {
  if (!currentState) return false;
  return states.includes(currentState);
}

/**
 * Hook to manage user profile data with improved state management
 * Ensures consistent state between server and client rendering
 */
export function useProfileData() {
  // Get authentication context
  const { currentUser, authIsInitialized } = useAuth();
  
  // State for profile data and loading status
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<ProfileLoadingState>(ProfileLoadingState.INITIALIZING);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to prevent duplicate operations and track loading state
  const isLoadingData = useRef<boolean>(false);
  const isUpdatingProfile = useRef<boolean>(false);
  const updateOperationInProgress = useRef<boolean>(false);
  const isMounted = useRef<boolean>(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Revised checkProfileComplete function
  const checkProfileComplete = useCallback((profileData: UserProfile | null): boolean => {
    if (!profileData) return false;

    // Only require essential fields for review access
    const requiredFields: (keyof UserProfile)[] = ['name', 'role'];
    return requiredFields.every(field => {
      const value = profileData[field];
      return typeof value === 'string' && value.trim().length > 0;
    });
  }, []);
  
  // Batch update state to prevent multiple renders
  const batchUpdateState = useCallback((
    newProfile: UserProfile | null, 
    newIsComplete: boolean, 
    newLoadingState: ProfileLoadingState,
    newError: string | null = null
  ) => {
    // Don't update state if component is unmounted
    if (!isMounted.current) {
      logger.debug('Skipping state update - component unmounted', {
        category: LogCategory.LIFECYCLE
      });
      return;
    }
    
    // Use a single React batch update for all state changes
    // This prevents multiple re-renders
    setProfile(newProfile);
    setIsProfileComplete(newIsComplete);
    setLoadingState(newLoadingState);
    setError(newError);
    
    logger.debug('Batch updated profile state', {
      context: {
        hasProfile: !!newProfile,
        isComplete: newIsComplete,
        loadingState: newLoadingState,
        hasError: !!newError
      },
      category: LogCategory.LIFECYCLE
    });
  }, []);
  
  // Load profile data
  const loadProfileData = useCallback(async () => {
    if (!authIsInitialized) {
      logger.debug('Auth not initialized yet, skipping profile load', { category: LogCategory.AUTH });
      return;
    }

    if (!currentUser) {
      logger.debug('No user logged in, skipping profile load', { category: LogCategory.AUTH });
      return;
    }

    // Prevent duplicate loading
    if (isLoadingData.current) {
      logger.debug('Profile data already loading, skipping duplicate request', { category: LogCategory.DATA });
      return;
    }

    isLoadingData.current = true;
    
    try {
      logger.debug('Loading profile data', { 
        context: { uid: currentUser.uid }, 
        category: LogCategory.DATA 
      });
      
      // Update loading state
      batchUpdateState(
        null,
        false,
        ProfileLoadingState.LOADING,
        null
      );

      // Get Firestore instance
      let dbInstance = getFirebaseFirestore();
      if (!dbInstance) {
        // Try to initialize Firebase if it's not already initialized
        logger.debug('Firestore not initialized, attempting to initialize', { category: LogCategory.DATA });
        
        if (firebaseInitializationInProgress) {
          logger.debug('Firebase initialization already in progress, waiting...', { category: LogCategory.DATA });
          
          // Wait for a bit to let the other initialization complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try to get Firestore again
          const dbAfterWait = getFirebaseFirestore();
          if (dbAfterWait) {
            logger.debug('Firestore now available after waiting', { category: LogCategory.DATA });
            dbInstance = dbAfterWait;
          } else if (!isMounted.current) {
            logger.debug('Component unmounted during Firebase initialization wait', { category: LogCategory.LIFECYCLE });
            isLoadingData.current = false;
            return;
          } else {
            logger.debug('Firestore still not available after waiting, proceeding with initialization', { category: LogCategory.DATA });
          }
        }
        
        if (!dbInstance) {
          firebaseInitializationInProgress = true;
          
          try {
            // Initialize Firebase
            logger.debug('Initializing Firebase', { category: LogCategory.DATA });
            await initializeFirebase();
            
            // Check mount status after async operation
            if (!isMounted.current) {
              logger.debug('Component unmounted during Firebase initialization', { category: LogCategory.LIFECYCLE });
              isLoadingData.current = false;
              firebaseInitializationInProgress = false;
              return;
            }
            
            logger.debug('Firebase initialized successfully', { category: LogCategory.DATA });
          } catch (error) {
            logger.error('Failed to initialize Firebase', { 
              context: { error }, 
              category: LogCategory.ERROR 
            });
            
            // Check mount status after async operation
            if (!isMounted.current) {
              logger.debug('Component unmounted during Firebase initialization error', { category: LogCategory.LIFECYCLE });
              isLoadingData.current = false;
              firebaseInitializationInProgress = false;
              return;
            }
            
            batchUpdateState(
              null,
              false,
              ProfileLoadingState.ERROR,
              error instanceof Error ? error.message : 'Failed to initialize Firebase'
            );
            isLoadingData.current = false;
            firebaseInitializationInProgress = false;
            return;
          } finally {
            firebaseInitializationInProgress = false;
          }
        }
      }
      
      // Try again to get Firestore after initialization
      dbInstance = getFirebaseFirestore();
      if (!dbInstance) {
        throw new Error('Firestore still not available after initialization');
      }
      
      // Check mount status after async operations
      if (!isMounted.current) {
        logger.debug('Component unmounted after Firebase initialization', { category: LogCategory.LIFECYCLE });
        isLoadingData.current = false;
        return;
      }
      
      // Get user document reference
      if (dbInstance) {
        const userDocRef = doc(dbInstance, 'users', currentUser.uid);
        
        // Get user document
        const userDoc = await getDoc(userDocRef);
        
        // Check mount status after async operation
        if (!isMounted.current) {
          logger.debug('Component unmounted after Firestore getDoc', { category: LogCategory.LIFECYCLE });
          isLoadingData.current = false;
          return;
        }
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          
          logger.debug('Profile data loaded successfully', { 
            context: { 
              hasData: !!userData,
              isComplete: userData?.isComplete || false
            }, 
            category: LogCategory.DATA 
          });
          
          // Check if profile is complete
          const isComplete = checkProfileComplete(userData);
          
          // Update profile data
          batchUpdateState(
            userData,
            isComplete,
            ProfileLoadingState.SUCCESS,
            null
          );
        } else {
          logger.debug('No profile data found for user', { 
            context: { uid: currentUser.uid }, 
            category: LogCategory.DATA 
          });
          
          // Create a new profile with default values
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            name: currentUser.displayName || '',
            role: 'reader',
            institution: '',
            department: '',
            position: '',
            bio: '',
            researchInterests: '',
            articles: 0,
            reviews: 0,
            walletAddress: '',
            hasChangedName: false,
            hasChangedInstitution: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isComplete: false,
            profileComplete: false,
            avatarUrl: '',
            articleCount: 0,
            reviewCount: 0,
            reputation: 0,
            twitter: '',
            linkedin: '',
            orcidId: '',
            personalWebsite: '',
            wantsToBeEditor: false,
          };
          
          // Set the new profile in Firestore
          try {
            await setDoc(doc(dbInstance, 'users', currentUser.uid), newProfile);
            
            // Check mount status after async operation
            if (!isMounted.current) {
              logger.debug('Component unmounted after creating new profile', { category: LogCategory.LIFECYCLE });
              isLoadingData.current = false;
              return;
            }
            
            logger.debug('Created new profile for user', { 
              context: { uid: currentUser.uid }, 
              category: LogCategory.DATA 
            });
            
            // Update profile data
            batchUpdateState(
              newProfile,
              false,
              ProfileLoadingState.SUCCESS,
              null
            );
          } catch (error) {
            // Check mount status after async operation
            if (!isMounted.current) {
              logger.debug('Component unmounted after profile creation error', { category: LogCategory.LIFECYCLE });
              isLoadingData.current = false;
              return;
            }
            
            logger.error('Failed to create new profile', { 
              context: { error }, 
              category: LogCategory.ERROR 
            });
            
            batchUpdateState(
              null,
              false,
              ProfileLoadingState.ERROR,
              error instanceof Error ? error.message : 'Unknown error creating profile'
            );
          }
        }
      }
    } catch (error) {
      // Check mount status after any async error
      if (!isMounted.current) {
        logger.debug('Component unmounted during error handling', { category: LogCategory.LIFECYCLE });
        isLoadingData.current = false;
        return;
      }
      
      logger.error('Error loading profile data', { 
        context: { error }, 
        category: LogCategory.ERROR 
      });
      
      batchUpdateState(
        null,
        false,
        ProfileLoadingState.ERROR,
        error instanceof Error ? error.message : 'Unknown error loading profile'
      );
    } finally {
      isLoadingData.current = false;
    }
  }, [authIsInitialized, currentUser, batchUpdateState, checkProfileComplete]);
  
  // Function to update profile data
  const updateProfile = useCallback(async (updatedProfile: Partial<UserProfile>): Promise<boolean> => {
    if (!currentUser) {
      logger.error('Cannot update profile - no user logged in', { category: LogCategory.AUTH });
      return false;
    }
    
    // Prevent duplicate updates
    if (isUpdatingProfile.current) {
      logger.debug('Profile update already in progress, skipping duplicate request', { category: LogCategory.DATA });
      return false;
    }
    
    // Prevent updates if another operation is in progress
    if (updateOperationInProgress.current) {
      logger.debug('Another update operation is in progress, skipping', { category: LogCategory.DATA });
      return false;
    }
    
    // Set update flags
    isUpdatingProfile.current = true;
    updateOperationInProgress.current = true;
    
    try {
      logger.debug('Updating profile data', { 
        context: { 
          uid: currentUser.uid,
          fields: Object.keys(updatedProfile)
        }, 
        category: LogCategory.DATA 
      });
      
      // Update loading state
      batchUpdateState(
        profile,
        isProfileComplete,
        ProfileLoadingState.UPDATING,
        null
      );
      
      // Make sure Firebase is initialized
      let dbInstance = getFirebaseFirestore();
      if (!dbInstance) {
        try {
          logger.debug('Firestore not initialized, initializing Firebase', { category: LogCategory.DATA });
          await initializeFirebase();
          dbInstance = getFirebaseFirestore();
          
          if (!dbInstance) {
            throw new Error('Failed to initialize Firebase for profile update');
          }
        } catch (error) {
          logger.error('Failed to initialize Firebase for profile update', { 
            context: { error }, 
            category: LogCategory.ERROR 
          });
          throw new Error('Failed to initialize Firebase');
        }
      }
      
      // Ensure we have the complete profile data
      const updatedData: Partial<UserProfile> = {
        ...updatedProfile,
        updatedAt: new Date().toISOString()
      };
      
      if (!profile) {
        // If we don't have a profile yet, create a new one with defaults
        updatedData.uid = currentUser.uid;
        updatedData.email = currentUser.email || '';
        updatedData.createdAt = new Date().toISOString();
      }
      
      // Try direct Firestore update first (simpler approach)
      try {
        // Update the document in Firestore
        const userDocRef = doc(dbInstance, 'users', currentUser.uid);
        
        logger.debug('Updating Firestore document directly', {
          context: { uid: currentUser.uid },
          category: LogCategory.DATA
        });
        
        await setDoc(userDocRef, updatedData, { merge: true });
        
        // Get the updated document to ensure we have the latest data
        const updatedDoc = await getDoc(userDocRef);
        
        if (updatedDoc.exists()) {
          const updatedUserData = updatedDoc.data() as UserProfile;
          
          // Check if profile is complete
          const isComplete = checkProfileComplete(updatedUserData);
          
          // Update profile data
          batchUpdateState(
            updatedUserData,
            isComplete,
            ProfileLoadingState.SUCCESS,
            null
          );
          
          logger.debug('Profile updated successfully via direct Firestore update', { 
            context: { 
              uid: currentUser.uid,
              isComplete
            }, 
            category: LogCategory.DATA 
          });
          
          return true;
        }
      } catch (directUpdateError) {
        logger.warn('Direct Firestore update failed, trying with token refresh', {
          context: { error: directUpdateError },
          category: LogCategory.ERROR
        });
        
        // If direct update fails, try with token refresh
        try {
          // Force token refresh to get the latest permissions
          await currentUser.getIdToken(true);
          
          // Try again with fresh token
          const userDocRef = doc(dbInstance, 'users', currentUser.uid);
          await setDoc(userDocRef, updatedData, { merge: true });
          
          // Get the updated document
          const updatedDoc = await getDoc(userDocRef);
          
          if (updatedDoc.exists()) {
            const updatedUserData = updatedDoc.data() as UserProfile;
            
            // Check if profile is complete
            const isComplete = checkProfileComplete(updatedUserData);
            
            // Update profile data
            batchUpdateState(
              updatedUserData,
              isComplete,
              ProfileLoadingState.SUCCESS,
              null
            );
            
            logger.debug('Profile updated successfully after token refresh', { 
              category: LogCategory.DATA 
            });
            
            return true;
          }
        } catch (tokenRefreshError) {
          logger.warn('Token refresh update failed, falling back to server-side update', {
            context: { error: tokenRefreshError },
            category: LogCategory.ERROR
          });
        }
      }
      
      // If all client-side approaches fail, try server-side update as last resort
      try {
        logger.debug('Attempting server-side profile update as fallback', {
          category: LogCategory.DATA
        });
        
        // Get a fresh token
        const idToken = await currentUser.getIdToken(true);
        
        const response = await fetch('/api/users/update-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify(updatedData)
        });
        
        if (response.ok) {
          const result = await response.json();
          logger.debug('Server-side profile update successful', {
            category: LogCategory.DATA,
            context: { result }
          });
          
          // Get the updated profile from the server response
          const updatedUserData = result.profile as UserProfile;
          
          // Check if profile is complete
          const isComplete = checkProfileComplete(updatedUserData);
          
          // Update profile data
          batchUpdateState(
            updatedUserData,
            isComplete,
            ProfileLoadingState.SUCCESS,
            null
          );
          
          return true;
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Server-side update failed');
        }
      } catch (serverError) {
        logger.error('All profile update methods failed', {
          context: { error: serverError },
          category: LogCategory.ERROR
        });
        throw serverError;
      }
    } catch (error) {
      // Check mount status after any async error
      if (!isMounted.current) {
        logger.debug('Component unmounted during error handling for update', { category: LogCategory.LIFECYCLE });
        return false;
      }
      
      logger.error('Error updating profile', { 
        context: { error }, 
        category: LogCategory.ERROR 
      });
      
      batchUpdateState(
        profile,
        isProfileComplete,
        ProfileLoadingState.ERROR,
        error instanceof Error ? error.message : 'Unknown error updating profile'
      );
      
      return false;
    } finally {
      isUpdatingProfile.current = false;
      
      // Set a timeout to reset the operation in progress flag
      // This prevents rapid successive updates
      setTimeout(() => {
        if (isMounted.current) {
          updateOperationInProgress.current = false;
        }
      }, 500);
    }
  }, [authIsInitialized, currentUser, profile, isProfileComplete, batchUpdateState, checkProfileComplete]);
  
  // Auto-load profile data when auth is initialized and user is logged in
  useEffect(() => {
    if (authIsInitialized && currentUser) {
      logger.debug('Auto-loading profile data', { 
        context: { uid: currentUser.uid, loadingState }, 
        category: LogCategory.LIFECYCLE 
      });
      
      // Only trigger load if we're not already loading
      if (loadingState === ProfileLoadingState.INITIALIZING || loadingState === ProfileLoadingState.IDLE || loadingState === ProfileLoadingState.ERROR) {
        loadProfileData();
      }
    } else if (authIsInitialized && !currentUser) {
      // Reset state when user logs out
      logger.debug('No user logged in, resetting profile state', { category: LogCategory.AUTH });
      batchUpdateState(null, false, ProfileLoadingState.IDLE, null);
    }
  }, [authIsInitialized, currentUser, loadProfileData, loadingState, batchUpdateState]);
  
  // Return the hook's public API
  return {
    profile,
    isProfileComplete,
    loadingState,
    error,
    isLoading: loadingState === ProfileLoadingState.LOADING || loadingState === ProfileLoadingState.INITIALIZING,
    loadProfileData,
    updateProfile,
    retryLoading: loadProfileData, // Alias for loadProfileData to match the expected interface
    profileLoadingState: loadingState, // Alias for loadingState to match the expected interface
    updateOperationInProgress, 
    isUpdatingProfile, 
  };
}
