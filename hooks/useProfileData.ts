import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User as FirebaseUser } from 'firebase/auth';
import useClient from './useClient';

// Define user profile interface
export interface UserProfile {
  name: string;
  email?: string;
  role: string;
  institution: string;
  department?: string;
  position?: string;
  researchInterests: string[];
  articles: number;
  reviews: number;
  walletAddress?: string;
  profileComplete?: boolean;
  createdAt?: string;
  hasChangedName?: boolean;
  hasChangedInstitution?: boolean;
}

interface UseProfileDataReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isProfileComplete: boolean;
  updateProfile: (updatedProfile: Partial<UserProfile>) => Promise<boolean>;
  createDefaultProfile: () => Promise<boolean>;
  retryLoading: () => void;
}

/**
 * Custom hook to handle user profile data loading and management
 * This decouples profile data loading from the component lifecycle
 * and ensures proper handling of loading states and errors
 */
export function useProfileData(): UseProfileDataReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  const { currentUser, getUserProfile, updateUserData, authIsInitialized } = useAuth();
  const isClient = useClient();
  
  // Use refs to prevent duplicate operations
  const isLoadingData = useRef<boolean>(false);
  const isUpdatingProfile = useRef<boolean>(false);

  // Function to create a default profile
  const createDefaultProfile = async (): Promise<boolean> => {
    if (isUpdatingProfile.current) {
      console.log('useProfileData: Profile update already in progress, skipping duplicate call');
      return false;
    }

    isUpdatingProfile.current = true;
    
    try {
      console.log('useProfileData: Creating default profile');
      
      if (!currentUser) {
        console.error('useProfileData: No user logged in when trying to create default profile');
        return false;
      }
      
      // Create default profile data
      const defaultProfile: UserProfile = {
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        role: 'Researcher',
        institution: '',
        department: '',
        position: '',
        researchInterests: [],
        articles: 0,
        reviews: 0,
        profileComplete: false,
        hasChangedName: false,
        hasChangedInstitution: false,
        createdAt: new Date().toISOString()
      };
      
      // Save to Firestore
      console.log('useProfileData: Saving default profile to Firestore');
      const updateSuccess = await updateUserData(defaultProfile);
      
      if (updateSuccess) {
        // Update local state
        setProfile(defaultProfile);
        setIsProfileComplete(false);
        console.log('useProfileData: Default profile created successfully');
        return true;
      } else {
        console.error('useProfileData: Failed to save default profile to Firestore');
        return false;
      }
    } catch (error) {
      console.error('useProfileData: Error creating default profile:', error);
      setError('Failed to create profile. Please try again.');
      return false;
    } finally {
      isUpdatingProfile.current = false;
    }
  };

  // Function to update user profile
  const updateProfile = async (updatedProfile: Partial<UserProfile>): Promise<boolean> => {
    if (isUpdatingProfile.current) {
      console.log('useProfileData: Profile update already in progress, skipping duplicate call');
      return false;
    }
    
    isUpdatingProfile.current = true;
    
    try {
      if (!profile) {
        console.error('useProfileData: No profile loaded when trying to update');
        return false;
      }
      
      // Check for one-time name change
      if (updatedProfile.name && profile.name !== updatedProfile.name) {
        if (profile.hasChangedName) {
          console.log('useProfileData: User has already changed their name once');
          // You can handle this case (e.g., show a warning, prevent the change, etc.)
        } else {
          console.log('useProfileData: Setting hasChangedName flag to true');
          updatedProfile.hasChangedName = true;
        }
      }
      
      // Check for one-time institution change
      if (updatedProfile.institution && profile.institution !== updatedProfile.institution) {
        if (profile.hasChangedInstitution) {
          console.log('useProfileData: User has already changed their institution once');
          // You can handle this case
        } else {
          console.log('useProfileData: Setting hasChangedInstitution flag to true');
          updatedProfile.hasChangedInstitution = true;
        }
      }
      
      // Merge with existing profile and mark as complete
      const mergedProfile = {
        ...profile,
        ...updatedProfile,
        profileComplete: true
      };
      
      // Save to Firestore
      console.log('useProfileData: Saving updated profile to Firestore');
      const updateSuccess = await updateUserData(mergedProfile);
      
      if (updateSuccess) {
        // Update local state (batch updates)
        setProfile(mergedProfile);
        setIsProfileComplete(true);
        console.log('useProfileData: Profile updated successfully');
        return true;
      } else {
        console.error('useProfileData: Failed to save profile to Firestore');
        return false;
      }
    } catch (error) {
      console.error('useProfileData: Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
      return false;
    } finally {
      isUpdatingProfile.current = false;
    }
  };

  // Function to retry loading profile
  const retryLoading = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  // Load user profile data
  useEffect(() => {
    // Skip if not on client
    if (!isClient) {
      console.log('useProfileData: Not on client, skipping profile fetch');
      return;
    }

    // Skip if auth is not initialized
    if (!authIsInitialized) {
      console.log('useProfileData: Auth not initialized yet, waiting...');
      setIsLoading(true);
      return;
    }

    // Skip if no user is logged in
    if (!currentUser) {
      console.log('useProfileData: No user logged in, skipping profile fetch');
      setIsLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      // Prevent duplicate fetch operations
      if (isLoadingData.current) {
        console.log('useProfileData: Profile fetch already in progress, skipping duplicate call');
        return;
      }
      
      console.log('useProfileData: Starting to fetch user profile...');
      isLoadingData.current = true;
      setIsLoading(true);
      
      try {
        // Add a small delay to ensure Firebase is fully initialized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const userProfile = await getUserProfile();
        console.log('useProfileData: User profile fetched:', userProfile);
        
        if (userProfile) {
          // Set the user data and profile completion status
          setProfile(userProfile);
          setIsProfileComplete(userProfile?.profileComplete || false);
          setError(null);
        } else {
          console.log('useProfileData: No user profile found');
          
          // If we've tried a few times and still no profile, create a default one
          if (retryCount >= 3) {
            console.log('useProfileData: Max retries reached, creating default profile');
            await createDefaultProfile();
          } else {
            // Otherwise, schedule another retry
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 1000);
          }
        }
      } catch (err: any) {
        console.error('useProfileData: Error fetching user profile:', err);
        setError(`Failed to load profile: ${err.message}`);
      } finally {
        setIsLoading(false);
        isLoadingData.current = false;
      }
    };

    fetchUserProfile();
  }, [isClient, authIsInitialized, currentUser, getUserProfile, retryCount]);

  return {
    profile,
    isLoading,
    error,
    isProfileComplete,
    updateProfile,
    createDefaultProfile,
    retryLoading
  };
}
