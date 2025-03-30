import React, { useEffect, useRef, useCallback } from 'react';
import { useToast, Spinner, Center, VStack, Text, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useProfileOperations } from '../../hooks/useProfileOperations';
import useFirebaseInitialized from '../../hooks/useFirebaseInitialized';
import ProfileManager from './ProfileManager';
import ClientOnlyProfileContent from './ClientOnlyProfileContent';
import { createLogger, LogCategory } from '../../utils/logger';
import { UserProfile } from '../../hooks/useProfileData';

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
  const { initialized: isFirebaseReady, error: firebaseError } = useFirebaseInitialized();
  
  // Track component mount state to prevent state updates after unmount
  const isMounted = useRef(true);
  const initialLoadCompleted = useRef(false);
  
  // Get profile operations from hook with improved state management
  const {
    profile,
    isLoading,
    error: profileError,
    isInComponentLoadingState,
    updateProfile: originalUpdateProfile,
    handleError,
    logOperation,
    refreshProfileData,
    updateInProgressRef,
    clearPendingUpdates
  } = useProfileOperations();
  
  // Wrapper for updateProfile to ensure it returns a boolean as expected by ProfileManager
  const updateProfile = useCallback(async (profileData: Partial<UserProfile>): Promise<boolean> => {
    try {
      const result = await originalUpdateProfile(profileData);
      // Convert the result to a boolean
      return result ? true : false;
    } catch (error) {
      logger.error('Error in updateProfile wrapper', {
        context: { error },
        category: LogCategory.ERROR
      });
      return false;
    }
  }, [originalUpdateProfile]);
  
  // Set up component lifecycle with proper cleanup
  useEffect(() => {
    isMounted.current = true;
    
    // Log component mount
    logOperation('ClientOnlyProfile component mounted');
    
    // Log Firebase initialization status
    logger.info('Firebase initialization status', {
      context: { 
        isReady: isFirebaseReady,
        hasError: !!firebaseError
      },
      category: LogCategory.SYSTEM
    });
    
    // Clean up on unmount
    return () => {
      isMounted.current = false;
      
      // Clear any pending updates
      clearPendingUpdates();
      
      // Log component unmount
      logOperation('ClientOnlyProfile component unmounted');
    };
  }, [clearPendingUpdates, firebaseError, isFirebaseReady, logOperation]);
  
  // Load profile data when Firebase is ready
  useEffect(() => {
    // Skip if component is unmounted or Firebase is not ready
    if (!isMounted.current || !isFirebaseReady) {
      return;
    }
    
    // Skip if we've already loaded the profile or an update is in progress
    if (initialLoadCompleted.current || updateInProgressRef.current) {
      logger.debug('Skipping initial profile load', {
        context: {
          initialLoadCompleted: initialLoadCompleted.current,
          updateInProgress: updateInProgressRef.current
        },
        category: LogCategory.LIFECYCLE
      });
      return;
    }
    
    // Load profile data
    logger.info('Initiating profile data load', {
      category: LogCategory.LIFECYCLE
    });
    refreshProfileData();
    initialLoadCompleted.current = true;
  }, [isFirebaseReady, refreshProfileData, updateInProgressRef]);
  
  // Handle Firebase initialization error
  useEffect(() => {
    if (firebaseError && isMounted.current) {
      logger.error('Firebase initialization error in profile component', {
        context: { 
          errorMessage: firebaseError.message 
        },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Firebase Error',
        description: 'There was an error initializing Firebase. Some features may not work properly.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [firebaseError, toast]);
  
  // Handle retry loading
  const handleRetryLoading = useCallback(() => {
    // Skip if component is unmounted
    if (!isMounted.current) {
      return;
    }
    
    logOperation('Manually retrying profile data load');
    refreshProfileData();
  }, [logOperation, refreshProfileData]);
  
  // Handle profile errors
  useEffect(() => {
    if (profileError && isMounted.current) {
      toast({
        title: 'Error Loading Profile',
        description: profileError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [profileError, toast]);
  
  // If Firebase is not initialized, show loading state
  if (!isFirebaseReady) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Initializing Firebase...</Text>
        </VStack>
      </Center>
    );
  }
  
  // If Firebase had an error, show error state but still try to render
  if (firebaseError) {
    return (
      <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" py={6}>
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Firebase Initialization Error
        </AlertTitle>
        <AlertDescription maxWidth="sm" mb={4}>
          {firebaseError.message || "Failed to initialize Firebase. Some features may not work properly."}
        </AlertDescription>
        <Text mt={2}>Attempting to load profile anyway...</Text>
      </Alert>
    );
  }
  
  // Render the profile content with proper loading states
  return (
    <ProfileManager
      profile={profile}
      isLoading={isLoading}
      isInLoadingState={isInComponentLoadingState}
      updateProfile={updateProfile}
      handleError={handleError}
      logOperation={logOperation}
    >
      <ClientOnlyProfileContent
        profile={profile}
        isLoading={isLoading}
        error={profileError}
        isInLoadingState={isInComponentLoadingState}
        onRetryLoading={handleRetryLoading}
        onSaveProfile={updateProfile}
      />
    </ProfileManager>
  );
}

export default ClientOnlyProfile;
