import { useState, useEffect, useRef, MutableRefObject } from 'react';
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
  updatedAt?: string;
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
  isLoadingData: MutableRefObject<boolean>;
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
  
  // Get stable references to auth functions to prevent dependency changes
  const { currentUser, getUserProfile, updateUserData, authIsInitialized } = useAuth();
  const isClient = useClient();
  
  // Use refs to prevent duplicate operations
  const isLoadingData = useRef<boolean>(false);
  const isUpdating = useRef<boolean>(false);
  const lastUserIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Set up component mount/unmount tracking
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      
      // Clean up any timeouts on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Batch state updates to minimize renders
  const batchStateUpdate = (updates: () => void) => {
    if (isMountedRef.current) {
      updates();
    }
  };

  // Function to create a default profile
  const createDefaultProfile = async (): Promise<boolean> => {
    if (isUpdating.current) {
      console.log('useProfileData: Profile update already in progress, skipping duplicate call');
      return false;
    }

    isUpdating.current = true;
    
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
        batchStateUpdate(() => {
          setProfile(defaultProfile);
          setIsProfileComplete(false);
        });
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
      // Set a timeout before allowing new operations
      // This prevents immediate re-fetching of profile data
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          isUpdating.current = false;
          timeoutRef.current = null;
        }
      }, 1000);
    }
  };

  /**
   * Updates the user profile in Firestore
   * @param profileData Partial user profile data to update
   * @returns Promise resolving to a boolean indicating success
   */
  const updateProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
    if (!currentUser) {
      console.error('[useProfileData] Cannot update profile: No user is signed in');
      return false;
    }

    // Prevent multiple simultaneous update operations
    if (isUpdating.current) {
      console.log('[useProfileData] Update already in progress, skipping duplicate request');
      return false;
    }

    isUpdating.current = true;
    batchStateUpdate(() => {
      setIsLoading(true);
      setError(null);
    });

    try {
      console.log('[useProfileData] Updating profile for user:', currentUser.uid);
      
      // Mark profile as complete if not already done
      if (!profileData.profileComplete) {
        profileData.profileComplete = true;
      }

      // Add timestamp for profile updates
      profileData.updatedAt = new Date().toISOString();
      
      // Only set createdAt if this is a new profile
      if (!profile) {
        profileData.createdAt = new Date().toISOString();
      }

      const success = await updateUserData(profileData);
      
      if (success) {
        // Update local state with the new data
        batchStateUpdate(() => {
          setProfile(prev => prev ? { ...prev, ...profileData } : profileData as UserProfile);
          setIsProfileComplete(true);
        });
        console.log('[useProfileData] Profile updated successfully');
      } else {
        setError('Failed to update profile. Please try again.');
        console.error('[useProfileData] Failed to update profile');
      }
      
      return success;
    } catch (error) {
      console.error('[useProfileData] Error updating profile:', error);
      setError('An error occurred while updating your profile. Please try again.');
      return false;
    } finally {
      // Set a timeout before allowing new operations
      // This prevents immediate re-fetching of profile data
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          batchStateUpdate(() => {
            setIsLoading(false);
          });
          isUpdating.current = false;
          timeoutRef.current = null;
        }
      }, 1000);
    }
  };

  // Function to retry loading profile
  const retryLoading = () => {
    batchStateUpdate(() => {
      setError(null);
      setRetryCount(prev => prev + 1);
    });
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
      batchStateUpdate(() => {
        setIsLoading(false);
        setProfile(null);
        setError(null);
      });
      return;
    }

    // Skip if we're already loading data or updating profile
    if (isLoadingData.current || isUpdating.current) {
      console.log('useProfileData: Profile fetch or update already in progress, skipping duplicate call');
      return;
    }

    // Skip if we're already loaded this user's profile
    if (lastUserIdRef.current === currentUser.uid && profile !== null) {
      console.log('useProfileData: Profile already loaded for current user, skipping duplicate fetch');
      return;
    }

    const fetchUserProfile = async () => {
      console.log('useProfileData: Starting to fetch user profile...');
      isLoadingData.current = true;
      setIsLoading(true);
      
      try {
        // Store the current user ID to prevent duplicate fetches
        lastUserIdRef.current = currentUser.uid;
        
        // Add a small delay to ensure Firebase is fully initialized
        // This helps prevent race conditions with auth state changes
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const userProfile = await getUserProfile();
        console.log('useProfileData: User profile fetched:', userProfile);
        
        if (userProfile) {
          // Batch state updates to prevent multiple re-renders
          batchStateUpdate(() => {
            setProfile(userProfile);
            setIsProfileComplete(userProfile?.profileComplete || false);
            setError(null);
          });
        } else {
          console.log('useProfileData: No user profile found, attempting to create default profile');
          
          // For new signups, immediately create a default profile
          // This helps prevent blank screens by ensuring a profile always exists
          const profileCreated = await createDefaultProfile();
          
          if (!profileCreated && retryCount < 3) {
            // If profile creation failed, schedule a retry with exponential backoff
            const retryDelay = Math.pow(2, retryCount) * 500;
            console.log(`useProfileData: Profile creation failed, retrying in ${retryDelay}ms (attempt ${retryCount + 1}/3)`);
            
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            
            timeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                setRetryCount(prev => prev + 1);
                timeoutRef.current = null;
              }
            }, retryDelay);
          } else if (!profileCreated) {
            // If we've tried multiple times and still failed, show an error
            console.error('useProfileData: Failed to create profile after multiple attempts');
            setError('Failed to create your profile. Please try refreshing the page.');
          }
        }
      } catch (err: unknown) {
        console.error('useProfileData: Error fetching user profile:', err);
        
        // Improved error handling with proper TypeScript typing
        if (err instanceof Error) {
          setError(`Failed to load profile: ${err.message}`);
        } else {
          setError(`Failed to load profile: ${String(err)}`);
        }
        
        // Schedule a retry for transient errors
        if (retryCount < 3) {
          const retryDelay = Math.pow(2, retryCount) * 1000;
          console.log(`useProfileData: Scheduling retry in ${retryDelay}ms (attempt ${retryCount + 1}/3)`);
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          timeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              setRetryCount(prev => prev + 1);
              timeoutRef.current = null;
            }
          }, retryDelay);
        }
      } finally {
        // Batch state updates in finally block
        batchStateUpdate(() => {
          setIsLoading(false);
        });
        
        // Set a timeout before allowing new operations
        // This prevents immediate re-fetching of profile data
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            isLoadingData.current = false;
            timeoutRef.current = null;
          }
        }, 1000);
      }
    };

    fetchUserProfile();
  }, [currentUser?.uid, authIsInitialized, isClient, retryCount]); // Optimized dependency array

  return {
    profile,
    isLoading,
    error,
    isProfileComplete,
    updateProfile,
    createDefaultProfile,
    retryLoading,
    isLoadingData
  };
}
