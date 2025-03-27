import React, { ReactNode } from 'react';
import { useFirebaseInitialization, FirebaseStatus } from '../hooks/useFirebaseInitialization';
import { Box, Spinner, Text, VStack, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Button } from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';
import useFirebaseInitialized from '../hooks/useFirebaseInitialized';

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
  // Use the Firebase initialization hook
  const { status, error, retry } = useFirebaseInitialization();
  
  // Also use our new dedicated hook to ensure Firebase is initialized
  const isFirebaseReady = useFirebaseInitialized();
  
  // Log Firebase initialization status for debugging
  React.useEffect(() => {
    console.log(`FirebaseClientOnly: Firebase initialization status - ${status}, ready: ${isFirebaseReady}`);
  }, [status, isFirebaseReady]);
  
  // Default loading fallback if none provided
  const defaultLoadingFallback = (
    <Center py={6}>
      <VStack spacing={4}>
        <Spinner size="xl" />
        <Text>Initializing Firebase...</Text>
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
      height="200px"
      borderRadius="lg"
      my={6}
    >
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        Firebase Initialization Error
      </AlertTitle>
      <AlertDescription maxWidth="sm">
        {error?.message || 'Failed to initialize Firebase'}
      </AlertDescription>
      <Button
        mt={4}
        leftIcon={<FiRefreshCw />}
        colorScheme="red"
        onClick={retry}
      >
        Retry
      </Button>
    </Alert>
  );
  
  // Handle different Firebase initialization states
  // Now we also check isFirebaseReady from our dedicated hook for extra safety
  if (!isFirebaseReady && status !== FirebaseStatus.INITIALIZED) {
    switch (status) {
      case FirebaseStatus.INITIALIZING:
        // During initialization, show loading fallback
        return <>{loadingFallback || defaultLoadingFallback}</>;
        
      case FirebaseStatus.ERROR:
      case FirebaseStatus.TIMEOUT:
        // On error or timeout, show error fallback
        return <>{errorFallback || defaultErrorFallback}</>;
        
      case FirebaseStatus.UNAVAILABLE:
        // When Firebase is unavailable (e.g., during SSR), show the fallback
        return <>{fallback}</>;
        
      default:
        // Default case, show fallback
        return <>{fallback}</>;
    }
  }
  
  // When Firebase is successfully initialized, render children
  return <>{children}</>;
};

export default FirebaseClientOnly;
