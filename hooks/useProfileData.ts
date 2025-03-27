import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import useClient from './useClient';

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
  const retryCount = useRef<number>(0);
  const maxRetries = 3;
  
  // Logging function
  const logOperation = useCallback((message: string, level: 'log' | 'warn' | 'error' = 'log') => {
    const prefix = '[ProfileData]';
    switch (level) {
      case 'warn':
        console.warn(`${prefix} ${message}`);
        break;
      case 'error':
        console.error(`${prefix} ${message}`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }, []);
  
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
  
  // Function to load profile data
  const loadProfileData = useCallback(async () => {
    // Skip if not initialized, no user, or already loading
    if (!authIsInitialized || !currentUser || isLoadingData.current) {
      return;
    }
    
    // Skip if not on client side
    if (!isClient) {
      logOperation('Not on client side, skipping profile data load', 'warn');
      return;
    }
    
    try {
      // Set loading state
      isLoadingData.current = true;
      setLoadingState(ProfileLoadingState.LOADING);
      setError(null);
      
      logOperation(`Loading profile data for user ${currentUser.uid}`);
      
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
        
        // Update state
        setProfile(userData);
        setIsProfileComplete(isComplete);
        setLoadingState(ProfileLoadingState.SUCCESS);
        
        logOperation(`Profile data loaded successfully, isComplete: ${isComplete}`);
      } else {
        // User document doesn't exist, create a new one
        logOperation('User document does not exist, creating new profile');
        
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
        
        // Update state
        setProfile(newProfile);
        setIsProfileComplete(false);
        setLoadingState(ProfileLoadingState.SUCCESS);
        
        logOperation('New profile created successfully');
      }
    } catch (err) {
      // Handle error
      const errorMessage = err instanceof Error ? err.message : String(err);
      logOperation(`Error loading profile data: ${errorMessage}`, 'error');
      
      setError(errorMessage);
      setLoadingState(ProfileLoadingState.ERROR);
      
      // Retry loading if we haven't exceeded max retries
      if (retryCount.current < maxRetries) {
        retryCount.current += 1;
        logOperation(`Retrying profile load (${retryCount.current}/${maxRetries})`);
        
        // Retry after a delay
        setTimeout(() => {
          if (isClient) {
            loadProfileData();
          }
        }, 1000);
      }
    } finally {
      // Reset loading flag
      isLoadingData.current = false;
    }
  }, [authIsInitialized, checkProfileComplete, currentUser, isClient, logOperation]);
  
  // Function to update profile
  const updateProfile = useCallback(async (updatedProfile: Partial<UserProfile>): Promise<boolean> => {
    // Skip if not initialized, no user, or no profile
    if (!authIsInitialized || !currentUser || !profile) {
      logOperation('Cannot update profile: not initialized, no user, or no profile', 'warn');
      return false;
    }
    
    // Skip if not on client side
    if (!isClient) {
      logOperation('Not on client side, skipping profile update', 'warn');
      return false;
    }
    
    try {
      // Set updating state
      setLoadingState(ProfileLoadingState.UPDATING);
      setError(null);
      
      logOperation(`Updating profile for user ${currentUser.uid}`);
      
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
      
      // Update local state with merged profile
      const updatedProfileData = {
        ...profile,
        ...updates
      };
      
      // Check if profile is complete
      const isComplete = checkProfileComplete(updatedProfileData);
      
      // Update state
      setProfile(updatedProfileData);
      setIsProfileComplete(isComplete);
      setLoadingState(ProfileLoadingState.SUCCESS);
      
      logOperation(`Profile updated successfully, isComplete: ${isComplete}`);
      
      return true;
    } catch (err) {
      // Handle error
      const errorMessage = err instanceof Error ? err.message : String(err);
      logOperation(`Error updating profile: ${errorMessage}`, 'error');
      
      setError(errorMessage);
      setLoadingState(ProfileLoadingState.ERROR);
      
      return false;
    }
  }, [authIsInitialized, checkProfileComplete, currentUser, isClient, logOperation, profile]);
  
  // Function to retry loading after an error
  const retryLoading = useCallback(() => {
    logOperation('Manually retrying profile load');
    retryCount.current = 0;
    setError(null);
    loadProfileData();
  }, [loadProfileData, logOperation]);
  
  // Load profile data when auth is initialized and user changes
  useEffect(() => {
    // Skip if not initialized or no user
    if (!authIsInitialized || !currentUser) {
      return;
    }
    
    // Skip if already loading
    if (isLoadingData.current) {
      logOperation('Already loading data, skipping duplicate load');
      return;
    }
    
    // Load profile data
    loadProfileData();
  }, [authIsInitialized, currentUser, loadProfileData, logOperation]);
  
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
    isLoadingData
  };
}
