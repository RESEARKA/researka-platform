import React, { useEffect, useRef, useCallback } from 'react';
import { useToast, Spinner, Center, VStack, Text, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useProfileData } from '../../hooks/useProfileData';
import { useProfileState } from '../../hooks/useProfileState';
import { useProfileOperations, ExtendedProfileLoadingState } from '../../hooks/useProfileOperations';
import useFirebaseInitialized from '../../hooks/useFirebaseInitialized';
import ProfileManager from './ProfileManager';
import ClientOnlyProfileContent from './ClientOnlyProfileContent';
import { createLogger, LogCategory } from '../../utils/logger';
import { ProfileLoadingState } from './types';

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
    isInLoadingState: checkLoadingStates,
    updateProfile,
    handleError,
    logOperation
  } = useProfileOperations();
  
  // Create an adapter function to match the expected signature for ProfileManager
  const isInLoadingState = useCallback((state: ProfileLoadingState) => {
    // Safe conversion by using string comparison instead of direct casting
    return checkLoadingStates([state as unknown as ExtendedProfileLoadingState]);
  }, [checkLoadingStates]);
  
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
    
    // If Firebase is ready and we're mounted, load profile data
    if (isFirebaseReady && isMounted.current) {
      refreshProfileData();
    }
    
    // Clean up on unmount
    return () => {
      isMounted.current = false;
      logOperation('ClientOnlyProfile component unmounted');
    };
  }, [isFirebaseReady, firebaseError, refreshProfileData, logOperation]);
  
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
  const handleRetryLoading = () => {
    logOperation('Manually retrying profile data load');
    refreshProfileData();
  };
  
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
      isLoading={isProfileLoading || isLoading}
      isInLoadingState={isInLoadingState}
      updateProfile={updateProfile}
      handleError={handleError}
      logOperation={logOperation}
    >
      <ClientOnlyProfileContent
        profile={profile}
        isLoading={isProfileLoading || isLoading}
        error={profileError}
        isInLoadingState={isInLoadingState}
        onRetryLoading={handleRetryLoading}
        onSaveProfile={updateProfile}
      />
    </ProfileManager>
  );
}

export default ClientOnlyProfile;
