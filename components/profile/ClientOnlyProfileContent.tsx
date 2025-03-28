import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Container, useToast } from '@chakra-ui/react';
import { UserProfile } from '../../hooks/useProfileData';
import { ProfileLoadingState } from './types';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileContent from './ProfileContent';
import { createLogger, LogCategory } from '../../utils/logger';

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
          reputation={profile.reputation || 0}
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
