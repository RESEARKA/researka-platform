import React, { ReactNode, useState, useEffect } from 'react';
import { useFirebaseInitialization, FirebaseStatus } from '../hooks/useFirebaseInitialization';
import { Box, Spinner, Text, VStack, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Button } from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';
import useFirebaseInitialized from '../hooks/useFirebaseInitialized';
import { createLogger, LogCategory } from '../utils/logger';

// Create a logger instance for this component
const logger = createLogger('FirebaseClientOnly');

interface FirebaseClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
}

/**
 * Component that ensures children are only rendered on the client side after Firebase has been initialized
 * This prevents hydration errors and Firebase-related errors
 * 
 * Now using the dedicated useFirebaseInitialized hook for better initialization management
 */
const FirebaseClientOnly: React.FC<FirebaseClientOnlyProps> = ({
  children,
  fallback = null,
  loadingFallback = null,
  errorFallback = null
}) => {
  // Track if we're on the client side to prevent hydration errors
  const [isClient, setIsClient] = useState(false);
  
  // Use the Firebase initialization hook only on the client side
  const { status, error: legacyError, retry } = useFirebaseInitialization();
  
  // Also use our enhanced dedicated hook to ensure Firebase is initialized
  const { initialized, error, isTimedOut } = useFirebaseInitialized();
  
  // Set isClient to true once the component is mounted
  useEffect(() => {
    setIsClient(true);
    
    // Log Firebase initialization status for debugging
    logger.debug('Firebase initialization status', {
      context: {
        status,
        initialized,
        hasError: !!error,
        isTimedOut
      },
      category: LogCategory.SYSTEM
    });
  }, [status, initialized, error, isTimedOut]);
  
  // Default loading fallback if none provided
  const defaultLoadingFallback = (
    <Center py={6}>
      <VStack spacing={4}>
        <Spinner size="xl" />
        <Text>Initializing Firebase...</Text>
        {isTimedOut && (
          <Alert status="warning" variant="subtle">
            <AlertIcon />
            <AlertTitle>Initialization is taking longer than expected</AlertTitle>
            <AlertDescription>Please wait a moment...</AlertDescription>
          </Alert>
        )}
      </VStack>
    </Center>
  );
  
  // Default error fallback if none provided
  const defaultErrorFallback = (
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      py={6}
    >
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        Firebase Initialization Error
      </AlertTitle>
      <AlertDescription maxWidth="sm" mb={4}>
        {error?.message || "Failed to initialize Firebase. Please try again."}
      </AlertDescription>
      <Button
        leftIcon={<FiRefreshCw />}
        onClick={retry}
        colorScheme="red"
        variant="outline"
      >
        Retry
      </Button>
    </Alert>
  );
  
  // If we're not on the client yet, render the fallback to avoid hydration errors
  if (!isClient) {
    return <>{fallback}</>;
  }
  
  // Handle loading state
  if (!initialized && !error) {
    logger.debug('Rendering loading fallback', {
      category: LogCategory.UI
    });
    return <>{loadingFallback || defaultLoadingFallback}</>;
  }
  
  // Handle error state
  if (error) {
    logger.error('Firebase initialization error', {
      context: { error: error.message },
      category: LogCategory.ERROR
    });
    return <>{errorFallback || defaultErrorFallback}</>;
  }
  
  // Firebase is initialized, render children
  logger.debug('Firebase initialized, rendering children', {
    category: LogCategory.UI
  });
  return <>{children}</>;
};

export default FirebaseClientOnly;
