import React, { useEffect, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { UserProfile } from '../../hooks/useProfileData';
import { ProfileManagerProps, ProfileLoadingState } from './types';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger instance for this component
const logger = createLogger('ProfileManager');

/**
 * ProfileManager component
 * Handles profile state management and operations
 * This is a container component that doesn't render any UI
 */
function ProfileManager({
  profile,
  isLoading,
  isInLoadingState,
  updateProfile,
  handleError,
  logOperation,
  children
}: ProfileManagerProps & { children: React.ReactNode }) {
  // Get toast for notifications
  const toast = useToast();
  
  // Track component mount state
  const isMounted = useRef(true);
  
  // Track update operations to prevent duplicates
  const isUpdatingProfile = useRef(false);
  
  // Set up component lifecycle
  useEffect(() => {
    isMounted.current = true;
    
    // Log component mount
    logOperation('ProfileManager component mounted');
    
    return () => {
      isMounted.current = false;
      logOperation('ProfileManager component unmounted');
    };
  }, [logOperation]);
  
  // Handle save profile with improved error handling and state management
  const handleSaveProfile = async (updatedProfile: Partial<UserProfile>): Promise<boolean> => {
    // Prevent duplicate update operations
    if (isUpdatingProfile.current) {
      logger.warn('Update operation already in progress, ignoring duplicate request', {
        category: LogCategory.UI
      });
      return false;
    }
    
    try {
      isUpdatingProfile.current = true;
      
      logger.info('Starting profile update', {
        context: { 
          userId: profile?.id,
          fieldCount: Object.keys(updatedProfile).length
        },
        category: LogCategory.DATA
      });
      
      const success = await updateProfile(updatedProfile);
      
      if (success && isMounted.current) {
        logger.info('Profile update successful', {
          context: { userId: profile?.id },
          category: LogCategory.DATA
        });
        
        toast({
          title: 'Profile updated',
          description: 'Your profile has been successfully updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        return true;
      }
      
      if (isMounted.current) {
        logger.warn('Profile update returned false', {
          context: { userId: profile?.id },
          category: LogCategory.DATA
        });
        
        toast({
          title: 'Update failed',
          description: 'There was a problem updating your profile. Please try again.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
      
      return false;
    } catch (error) {
      logger.error('Error updating profile', {
        error,
        context: { userId: profile?.id },
        category: LogCategory.DATA
      });
      
      handleError(error, 'Error updating profile');
      return false;
    } finally {
      // Reset the update flag
      isUpdatingProfile.current = false;
    }
  };
  
  // Return children with additional props
  return React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        onSaveProfile: handleSaveProfile
      });
    }
    return child;
  });
}

export default ProfileManager;
