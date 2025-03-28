import React, { useEffect, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { useProfileData } from '../../hooks/useProfileData';
import { useProfileState } from '../../hooks/useProfileState';
import { useProfileOperations } from '../../hooks/useProfileOperations';
import useFirebaseInitialized from '../../hooks/useFirebaseInitialized';
import ProfileManager from './ProfileManager';
import ClientOnlyProfileContent from './ClientOnlyProfileContent';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger instance for this component
const logger = createLogger('ClientOnlyProfile');

/**
 * ClientOnlyProfile component
 * Orchestrates profile data fetching, state management, and UI rendering
 * Uses custom hooks for business logic and modular components for UI
 */
function ClientOnlyProfile() {
  // Get toast for notifications
  const toast = useToast();
  
  // Use our dedicated hook to ensure Firebase is initialized
  const isFirebaseReady = useFirebaseInitialized();
  
  // Track component mount state to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Get profile data from hook with proper error handling
  const { 
    profile, 
    isLoading: isProfileLoading, 
    error: profileError,
    loadData: refreshProfileData
  } = useProfileData();
  
  // Get profile operations from hook with improved state management
  const {
    isLoading,
    isInLoadingState,
    updateProfile,
    handleError,
    logOperation
  } = useProfileOperations();
  
  // Set up component lifecycle with proper cleanup
  useEffect(() => {
    isMounted.current = true;
    
    // Log component mount
    logOperation('ClientOnlyProfile component mounted');
    
    // Load profile data when Firebase is ready
    if (isFirebaseReady) {
      logOperation('Firebase is ready, loading profile data');
      refreshProfileData();
    }
    
    return () => {
      isMounted.current = false;
      logOperation('ClientOnlyProfile component unmounted');
    };
  }, [isFirebaseReady, refreshProfileData, logOperation]);
  
  // Handle retry loading
  const handleRetryLoading = () => {
    logger.info('Retrying profile data loading', {
      category: LogCategory.DATA
    });
    refreshProfileData();
  };
  
  // Show error toast when profile error occurs
  useEffect(() => {
    if (profileError && isMounted.current) {
      logger.error('Profile error detected', {
        error: profileError,
        category: LogCategory.DATA
      });
      
      toast({
        title: 'Error loading profile',
        description: profileError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [profileError, toast]);
  
  return (
    <ProfileManager
      profile={profile}
      isLoading={isLoading}
      isInLoadingState={isInLoadingState}
      updateProfile={updateProfile}
      handleError={handleError}
      logOperation={logOperation}
    >
      <ClientOnlyProfileContent
        profile={profile}
        isLoading={isProfileLoading}
        error={profileError}
        isInLoadingState={isInLoadingState}
        onRetryLoading={handleRetryLoading}
        onSaveProfile={async () => false} // This will be overridden by ProfileManager
      />
    </ProfileManager>
  );
}

export default ClientOnlyProfile;
