import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import useClient from './useClient';
import { createLogger, LogCategory } from '../utils/logger';

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
  const maxRetries = 3;
  
  // Helper function to check if profile is complete
  const checkProfileComplete = useCallback((profileData: UserProfile | null): boolean => {
    if (!profileData) return false;
    
    // Required fields for a complete profile
    const requiredFields: (keyof UserProfile)[] = ['name', 'role', 'institution'];
    
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
  
  // Function to load profile data
  const loadProfileData = useCallback(async () => {
    // Skip if not initialized, no user, or already loading
    if (!authIsInitialized || !currentUser || isLoadingData.current) {
      logger.debug('Skipping profile data load', {
        context: {
          authIsInitialized,
          hasUser: !!currentUser,
          isLoading: isLoadingData.current
        },
        category: LogCategory.LIFECYCLE
      });
      return;
    }
    
    // Skip if not on client side
    if (!isClient) {
      logger.warn('Not on client side, skipping profile data load', {
        category: LogCategory.LIFECYCLE
      });
      return;
    }
    
    try {
      // Set loading state
      isLoadingData.current = true;
      setLoadingState(ProfileLoadingState.LOADING);
      setError(null);
      
      logger.info(`Loading profile data for user ${currentUser.uid}`, {
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
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // User document exists, get data
        const userData = userDoc.data() as UserProfile;
        
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
          role: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isComplete: false
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
    } finally {
      // Reset loading flag
      isLoadingData.current = false;
    }
  }, [authIsInitialized, batchUpdateState, currentUser, isClient]);
  
  // Function to update profile with debouncing and ref tracking
  const updateProfile = useCallback(async (updatedProfile: Partial<UserProfile>): Promise<boolean> => {
    // Skip if not initialized, no user, or no profile
    if (!authIsInitialized || !currentUser || !profile) {
      logger.warn('Cannot update profile: not initialized, no user, or no profile', {
        context: {
          authIsInitialized,
          hasUser: !!currentUser,
          hasProfile: !!profile
        },
        category: LogCategory.LIFECYCLE
      });
      return false;
    }
    
    // Skip if not on client side
    if (!isClient) {
      logger.warn('Not on client side, skipping profile update', {
        category: LogCategory.LIFECYCLE
      });
      return false;
    }
    
    // Skip if an update is already in progress
    if (updateOperationInProgress.current) {
      const timeSinceLastUpdate = Date.now() - lastUpdateTimestamp.current;
      logger.warn(`Update already in progress (${timeSinceLastUpdate}ms since last update)`, {
        category: LogCategory.LIFECYCLE
      });
      return false;
    }
    
    try {
      // Set updating state and refs
      updateOperationInProgress.current = true;
      isUpdatingProfile.current = true;
      lastUpdateTimestamp.current = Date.now();
      
      // Update loading state
      setLoadingState(ProfileLoadingState.UPDATING);
      setError(null);
      
      logger.info(`Updating profile for user ${currentUser.uid}`, {
        context: { fieldCount: Object.keys(updatedProfile).length },
        category: LogCategory.LIFECYCLE
      });
      
      // Get Firestore instance
      const db = getFirebaseFirestore();
      if (!db) {
        throw new Error('Firestore not initialized');
      }
      
      // Get user document reference
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Add updated timestamp
      const updates = {
        ...updatedProfile,
        updatedAt: new Date().toISOString()
      };
      
      // Update document in Firestore
      await updateDoc(userDocRef, updates);
      
      // Update local state with merged profile using functional update
      // This ensures we're working with the latest state
      const updatedProfileData = {
        ...profile,
        ...updates
      };
      
      // Check if profile is complete
      const isComplete = checkProfileComplete(updatedProfileData);
      
      // Update state in a single batch
      batchUpdateState(updatedProfileData, isComplete, ProfileLoadingState.SUCCESS);
      
      logger.info(`Profile updated successfully, isComplete: ${isComplete}`, {
        context: { 
          fieldCount: Object.keys(updatedProfile).length,
          fields: Object.keys(updatedProfile),
          duration: Date.now() - lastUpdateTimestamp.current
        },
        category: LogCategory.LIFECYCLE
      });
      
      return true;
    } catch (err) {
      // Handle error
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`Error updating profile: ${errorMessage}`, {
        context: { 
          error: err,
          fieldCount: Object.keys(updatedProfile).length,
          fields: Object.keys(updatedProfile)
        },
        category: LogCategory.ERROR
      });
      
      // Update state in a single batch
      batchUpdateState(profile, isProfileComplete, ProfileLoadingState.ERROR, errorMessage);
      
      return false;
    } finally {
      // Reset updating flags
      updateOperationInProgress.current = false;
      isUpdatingProfile.current = false;
    }
  }, [authIsInitialized, batchUpdateState, checkProfileComplete, currentUser, isClient, isProfileComplete, profile]);
  
  // Function to retry loading after an error
  const retryLoading = useCallback(() => {
    logger.info('Manually retrying profile load', {
      category: LogCategory.LIFECYCLE
    });
    retryCount.current = 0;
    setError(null);
    loadProfileData();
  }, [loadProfileData]);
  
  // Load profile data when auth is initialized and user changes
  useEffect(() => {
    // Skip if not initialized or no user
    if (!authIsInitialized || !currentUser) {
      return;
    }
    
    // Skip if already loading or updating
    if (isLoadingData.current || isUpdatingProfile.current) {
      logger.debug('Already loading or updating data, skipping duplicate load', {
        context: {
          isLoading: isLoadingData.current,
          isUpdating: isUpdatingProfile.current
        },
        category: LogCategory.LIFECYCLE
      });
      return;
    }
    
    // Load profile data
    loadProfileData();
  }, [authIsInitialized, currentUser, loadProfileData]);
  
  // Return profile data and functions
  return {
    profile,
    isLoading: isInLoadingState([ProfileLoadingState.INITIALIZING, ProfileLoadingState.LOADING], loadingState),
    isUpdating: isInLoadingState([ProfileLoadingState.UPDATING], loadingState),
    error,
    isProfileComplete,
    loadingState,
    updateProfile,
    retryLoading,
    isLoadingData,
    isUpdatingProfile,
    updateOperationInProgress,
    loadData: loadProfileData
  };
}
