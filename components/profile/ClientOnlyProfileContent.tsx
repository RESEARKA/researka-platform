import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Container, useToast } from '@chakra-ui/react';
import { UserProfile } from '../../hooks/useProfileData';
import { ProfileLoadingState } from './types';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileContent from './ProfileContent';
import { createLogger, LogCategory } from '../../utils/logger';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '../../config/firebase';

// Create a logger instance for this component
const logger = createLogger('ClientOnlyProfileContent');

/**
 * Props for the ClientOnlyProfileContent component
 */
interface ClientOnlyProfileContentProps {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isInLoadingState: (state: ProfileLoadingState) => boolean;
  onSaveProfile: (updatedProfile: Partial<UserProfile>) => Promise<boolean>;
  onRetryLoading: () => void;
}

/**
 * ClientOnlyProfileContent component
 * Renders the profile UI with proper state management
 */
function ClientOnlyProfileContent({
  profile,
  isLoading,
  error,
  isInLoadingState,
  onSaveProfile,
  onRetryLoading
}: ClientOnlyProfileContentProps) {
  // Local UI state
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Refs to track component state
  const isMounted = useRef(true);
  const saveInProgressRef = useRef(false);
  
  // Toast for notifications
  const toast = useToast();
  
  // Set up component lifecycle with proper cleanup
  useEffect(() => {
    isMounted.current = true;
    
    logger.debug('ClientOnlyProfileContent mounted', {
      category: LogCategory.LIFECYCLE
    });
    
    return () => {
      isMounted.current = false;
      logger.debug('ClientOnlyProfileContent unmounted', {
        category: LogCategory.LIFECYCLE
      });
    };
  }, []);
  
  // Reset edit mode when profile changes or error occurs
  useEffect(() => {
    if (error && isEditMode) {
      logger.debug('Resetting edit mode due to error', {
        category: LogCategory.UI
      });
      setIsEditMode(false);
    }
  }, [error, isEditMode]);
  
  // Handle tab change
  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
    setCurrentPage(1); // Reset to first page when changing tabs
    
    logger.debug('Tab changed', {
      context: { newTab: index },
      category: LogCategory.UI
    });
  }, []);
  
  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    
    logger.debug('Page changed', {
      context: { newPage: page },
      category: LogCategory.UI
    });
  }, []);
  
  // Handle edit profile
  const handleEditProfile = useCallback(() => {
    // Skip if loading
    if (isLoading) {
      logger.debug('Edit profile clicked while loading, ignoring', {
        category: LogCategory.UI
      });
      return;
    }
    
    setIsEditMode(true);
    
    logger.debug('Entered edit mode', {
      category: LogCategory.UI
    });
  }, [isLoading]);
  
  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    // Skip if save is in progress
    if (saveInProgressRef.current) {
      logger.debug('Cancel edit clicked while save in progress, ignoring', {
        category: LogCategory.UI
      });
      return;
    }
    
    setIsEditMode(false);
    
    logger.debug('Cancelled edit mode', {
      category: LogCategory.UI
    });
  }, []);
  
  // Handle save profile with edit mode state update
  const handleSaveProfile = useCallback(async (updatedProfile: Partial<UserProfile>) => {
    // Skip if component is unmounted or save is already in progress
    if (!isMounted.current || saveInProgressRef.current) {
      logger.debug('Save profile skipped', {
        context: {
          isMounted: isMounted.current,
          saveInProgress: saveInProgressRef.current
        },
        category: LogCategory.UI
      });
      return false;
    }
    
    try {
      // Set save in progress
      saveInProgressRef.current = true;
      
      logger.debug('Saving profile', {
        context: { 
          fieldCount: Object.keys(updatedProfile).length,
          fields: Object.keys(updatedProfile)
        },
        category: LogCategory.UI
      });
      
      // Call the save function
      const success = await onSaveProfile(updatedProfile);
      
      // Only update UI state if still mounted
      if (isMounted.current) {
        if (success) {
          setIsEditMode(false);
          
          logger.debug('Profile saved successfully, exiting edit mode', {
            category: LogCategory.UI
          });
        } else {
          logger.debug('Profile save failed, staying in edit mode', {
            category: LogCategory.UI
          });
          
          toast({
            title: 'Save Failed',
            description: 'Failed to save profile changes. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
      
      return success;
    } catch (error) {
      logger.error('Error saving profile', {
        context: { error },
        category: LogCategory.ERROR
      });
      
      // Only update UI if still mounted
      if (isMounted.current) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'An error occurred while saving your profile',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
      
      return false;
    } finally {
      // Reset save in progress flag
      saveInProgressRef.current = false;
    }
  }, [onSaveProfile, toast]);
  
  // Handle retry loading with debounce
  const handleRetry = useCallback(() => {
    logger.debug('Retrying profile load', {
      category: LogCategory.UI
    });
    onRetryLoading();
  }, [onRetryLoading]);

  // Function to migrate old reviews to use consistent reviewerId format
  const migrateReviews = async () => {
    try {
      if (!profile?.uid) {
        logger.warn('Cannot migrate reviews without a user ID', {
          category: LogCategory.AUTH
        });
        return;
      }

      logger.debug('Starting review migration', {
        context: { userId: profile.uid },
        category: LogCategory.DATA
      });

      // Import the migration function
      const { migrateUserReviews } = await import('../../services/reviewService');
      
      // Get potential old reviewer IDs (shortened wallet address format)
      let oldReviewerIds: string[] = [];
      
      // If user has a wallet address, add shortened versions as potential old IDs
      if (profile?.walletAddress) {
        const walletAddress = profile.walletAddress;
        // Add shortened wallet address format that was previously used
        oldReviewerIds.push(`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`);
        // Also add the full wallet address as a potential old ID
        oldReviewerIds.push(walletAddress);
      }
      
      // Add any other potential formats that might have been used
      if (profile?.name) {
        oldReviewerIds.push(profile.name);
      }
      
      // Log the potential old IDs
      logger.debug('Potential old reviewer IDs', {
        context: { oldReviewerIds },
        category: LogCategory.DATA
      });
      
      // Migrate reviews
      const migratedCount = await migrateUserReviews(profile.uid, oldReviewerIds);
      
      if (migratedCount > 0) {
        logger.info(`Successfully migrated ${migratedCount} reviews`, {
          context: { migratedCount },
          category: LogCategory.DATA
        });
        
        toast({
          title: 'Reviews Updated',
          description: `Successfully updated ${migratedCount} reviews to use your current user ID.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        logger.debug('No reviews needed migration', {
          category: LogCategory.DATA
        });
      }
    } catch (error) {
      logger.error('Error migrating reviews', {
        context: { error },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: 'Failed to update reviews. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Function to refresh profile data
  const refreshProfileData = useCallback(async () => {
    try {
      if (!profile?.uid) {
        logger.warn('Cannot refresh profile data without a user ID', {
          category: LogCategory.AUTH
        });
        return;
      }

      logger.debug('Refreshing profile data', {
        context: { userId: profile.uid },
        category: LogCategory.DATA
      });

      const db = getFirebaseFirestore();
      if (!db) {
        logger.error('Firestore not initialized', {
          category: LogCategory.ERROR
        });
        return;
      }

      // Get user document reference
      const userDocRef = doc(db, 'users', profile.uid);
      
      // Get user document
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // User document exists, get data
        const userData = userDoc.data() as UserProfile;
        
        logger.debug('Refreshed profile data', {
          context: { 
            reviewCount: userData.reviewCount || 0,
            articleCount: userData.articleCount || 0
          },
          category: LogCategory.DATA
        });

        // Call onRetryLoading to refresh the profile data in the parent component
        onRetryLoading();
      }
    } catch (error) {
      logger.error('Error refreshing profile data', {
        context: { error },
        category: LogCategory.ERROR
      });
    }
  }, [profile?.uid, onRetryLoading]);

  // Run migration on component mount
  useEffect(() => {
    if (profile?.uid) {
      migrateReviews();
    }
  }, [profile?.uid]);

  // Refresh profile data when component mounts
  useEffect(() => {
    if (profile?.uid) {
      refreshProfileData();
    }
  }, [profile?.uid, refreshProfileData]);

  // Listen for review count updates
  useEffect(() => {
    if (typeof window === 'undefined' || !profile?.uid) return;

    // Function to handle the custom event
    const handleReviewCountUpdated = (event: CustomEvent) => {
      logger.debug('Received profile-review-count-updated event', {
        context: { reviewCount: event.detail.reviewCount },
        category: LogCategory.DATA
      });

      // Update the profile with the new review count
      if (profile) {
        // Create a new profile object with the updated review count
        const updatedProfile = {
          ...profile,
          reviewCount: event.detail.reviewCount,
          reviews: event.detail.reviewCount // Update both fields for backward compatibility
        };

        // Update the profile in the state
        onSaveProfile(updatedProfile);
      }
    };

    // Add event listener
    window.addEventListener('profile-review-count-updated', handleReviewCountUpdated as EventListener);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('profile-review-count-updated', handleReviewCountUpdated as EventListener);
    };
  }, [profile, onSaveProfile]);

  return (
    <Container maxW="container.lg" py={8}>
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        isEditMode={isEditMode}
        isLoading={isLoading}
        onEditClick={handleEditProfile}
        onCancelEdit={handleCancelEdit}
      />
      
      {/* Profile Stats */}
      {!isEditMode && profile && (
        <ProfileStats
          articlesCount={profile.articleCount || 0}
          reviewsCount={profile.reviewCount || 0}
          isLoading={isLoading}
        />
      )}
      
      {/* Profile Content */}
      <Box mt={6}>
        <ProfileContent
          profile={profile}
          activeTab={activeTab}
          isEditMode={isEditMode}
          isLoading={isLoading}
          error={error}
          currentPage={currentPage}
          isInLoadingState={isInLoadingState}
          onTabChange={handleTabChange}
          onPageChange={handlePageChange}
          onSaveProfile={handleSaveProfile}
          onRetryLoading={handleRetry}
        />
      </Box>
    </Container>
  );
}

export default ClientOnlyProfileContent;
