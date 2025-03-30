import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import useClient from './useClient';
import { createLogger, LogCategory } from '../utils/logger';
import { useState, useEffect, useCallback, useRef } from 'react';

// Create a logger instance for this hook
const logger = createLogger('useProfileData');

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
  
  // Check if we're on the client side
  const isClient = useClient();
  
  // State for profile data and loading status
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<ProfileLoadingState>(
    isClient ? ProfileLoadingState.INITIALIZING : ProfileLoadingState.IDLE
  );
  const [error, setError] = useState<string | null>(null);
  
  // Refs to prevent duplicate operations and track loading state
  const isLoadingData = useRef<boolean>(false);
  const isUpdatingProfile = useRef<boolean>(false);
  const retryCount = useRef<number>(0);
  const updateOperationInProgress = useRef<boolean>(false);
  const lastUpdateTimestamp = useRef<number>(0);
  
  // Helper function to check if profile is complete
  const checkProfileComplete = useCallback((profileData: UserProfile | null): boolean => {
    if (!profileData) return false;
    
    // If the profile already has profileComplete or isComplete flags set to true, respect them
    if (profileData.profileComplete === true || profileData.isComplete === true) {
      return true;
    }
    
    // Required fields for a complete profile - making institution optional
    const requiredFields: (keyof UserProfile)[] = ['name', 'role'];
    
    // Check required fields
    return requiredFields.every(field => {
      const value = profileData[field];
      return value !== undefined && value !== null && value !== '';
    });
  }, []);
  
  // Batch update state to prevent multiple renders
  const batchUpdateState = useCallback((
    newProfile: UserProfile | null, 
    newIsComplete: boolean, 
    newLoadingState: ProfileLoadingState,
    newError: string | null = null
  ) => {
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
      category: LogCategory.DATA
    });
  }, []);
  
  // Load profile data from Firestore
  const loadProfileData = useCallback(async () => {
    // If already loading, prevent duplicate calls
    if (isLoadingData.current) {
      logger.debug('Profile data already loading, skipping duplicate call', {
        category: LogCategory.LIFECYCLE
      });
      return;
    }
    
    // If no user, clear profile data
    if (!currentUser) {
      logger.info('No current user, clearing profile data', {
        category: LogCategory.LIFECYCLE
      });
      
      batchUpdateState(null, false, ProfileLoadingState.IDLE);
      return;
    }
    
    // Set loading flag
    isLoadingData.current = true;
    
    // Update loading state
    setLoadingState(ProfileLoadingState.LOADING);
    
    try {
      logger.info('Loading profile data from Firestore', {
        context: { uid: currentUser.uid },
        category: LogCategory.LIFECYCLE
      });
      
      // Get Firestore instance
      const db = getFirebaseFirestore();
      
      if (!db) {
        throw new Error('Firestore not initialized');
      }
      
      // Get user document reference
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Get user document
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        // User document exists, get data
        const userData = userDocSnap.data() as UserProfile;
        
        // Check if profile is complete
        const isComplete = checkProfileComplete(userData);
        
        // Update state in a single batch
        batchUpdateState(userData, isComplete, ProfileLoadingState.SUCCESS);
        
        logger.info(`Profile data loaded successfully, isComplete: ${isComplete}`, {
          category: LogCategory.LIFECYCLE
        });
      } else {
        // User document doesn't exist, create a new one
        logger.info('User document does not exist, creating new profile', {
          category: LogCategory.LIFECYCLE
        });
        
        // Create basic profile from auth data
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          name: currentUser.displayName || '',
          role: 'Author',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          articleCount: 0,
          reviewCount: 0,
          reputation: 0,
          isComplete: false,
          profileComplete: false
        };
        
        // Save new profile to Firestore
        await setDoc(userDocRef, newProfile);
        
        // Update state in a single batch
        batchUpdateState(newProfile, false, ProfileLoadingState.SUCCESS);
        
        logger.info('New profile created successfully', {
          category: LogCategory.LIFECYCLE
        });
      }
    } catch (error) {
      // Handle error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error loading profile';
      
      logger.error('Error loading profile data', {
        context: { error },
        category: LogCategory.ERROR
      });
      
      // Update state with error
      batchUpdateState(null, false, ProfileLoadingState.ERROR, errorMessage);
      
      // Retry loading if appropriate
      if (retryCount.current < 3) {
        retryCount.current++;
        
        logger.info(`Retrying profile load (attempt ${retryCount.current}/3)`, {
          category: LogCategory.LIFECYCLE
        });
        
        // Wait before retrying
        setTimeout(() => {
          isLoadingData.current = false;
          loadProfileData();
        }, 1000);
      }
    } finally {
      // Reset loading flag if not retrying
      if (retryCount.current >= 3 || !error) {
        isLoadingData.current = false;
        retryCount.current = 0;
      }
    }
  }, [batchUpdateState, checkProfileComplete, currentUser]);
  
  // Update profile data in Firestore
  const updateProfileData = useCallback(async (updatedData: Partial<UserProfile>) => {
    // If already updating, prevent duplicate calls
    if (updateOperationInProgress.current) {
      logger.warn('Update already in progress, skipping duplicate call', {
        category: LogCategory.LIFECYCLE
      });
      return;
    }
    
    // Set updating flag
    updateOperationInProgress.current = true;
    lastUpdateTimestamp.current = Date.now();
    
    // Update loading state
    setLoadingState(ProfileLoadingState.UPDATING);
    
    try {
      logger.info('Updating profile data in Firestore', {
        context: { 
          fields: Object.keys(updatedData),
          uid: currentUser?.uid 
        },
        category: LogCategory.LIFECYCLE
      });
      
      // Get Firestore instance
      const db = getFirebaseFirestore();
      
      if (!db) {
        throw new Error('Firestore not initialized');
      }
      
      // If no current user, throw error
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      
      // Get user document reference
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Merge updated data with current profile
      const updatedProfileData = {
        ...profile,
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      
      // Check if profile is complete after update
      const isComplete = checkProfileComplete({
        ...profile,
        ...updatedData
      } as UserProfile);
      
      // Add profile completion flags
      updatedProfileData.isComplete = isComplete;
      updatedProfileData.profileComplete = isComplete;
      
      // Update document in Firestore
      await updateDoc(userDocRef, updatedProfileData);
      
      // Update state in a single batch
      batchUpdateState(updatedProfileData, isComplete, ProfileLoadingState.SUCCESS);
      
      logger.info(`Profile updated successfully, isComplete: ${isComplete}`, {
        context: { 
          fields: Object.keys(updatedData),
          isComplete
        },
        category: LogCategory.LIFECYCLE
      });
      
      return updatedProfileData;
    } catch (error) {
      // Handle error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error updating profile';
      
      logger.error('Error updating profile data', {
        context: { error },
        category: LogCategory.ERROR
      });
      
      // Update state with error
      batchUpdateState(profile, isProfileComplete, ProfileLoadingState.ERROR, errorMessage);
      
      throw error;
    } finally {
      // Reset updating flag after a short delay
      // This prevents rapid successive updates
      setTimeout(() => {
        updateOperationInProgress.current = false;
      }, 500);
    }
  }, [batchUpdateState, checkProfileComplete, currentUser, isProfileComplete, profile]);
  
  // Load profile data when auth is initialized and user changes
  useEffect(() => {
    if (isClient && authIsInitialized && !isLoadingData.current) {
      loadProfileData();
    }
  }, [authIsInitialized, isClient, loadProfileData]);
  
  return {
    profile,
    isProfileComplete,
    loadingState,
    error,
    isLoading: isInLoadingState([
      ProfileLoadingState.INITIALIZING,
      ProfileLoadingState.LOADING,
      ProfileLoadingState.UPDATING
    ], loadingState),
    updateProfile: updateProfileData,
    reloadProfile: loadProfileData
  };
}
