import React, { ReactNode } from 'react';
import { useFirebaseInitialization, FirebaseStatus } from '../hooks/useFirebaseInitialization';
import { Box, Spinner, Text, VStack, Center, Alert, AlertIcon, AlertTitle, AlertDescription, Button } from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';

interface FirebaseClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
}

/**
 * Component that ensures children are only rendered on the client side after Firebase has been initialized
 * This prevents hydration errors and Firebase-related errors
 */
const FirebaseClientOnly: React.FC<FirebaseClientOnlyProps> = ({
  children,
  fallback = null,
  loadingFallback = null,
  errorFallback = null
}) => {
  // Use the Firebase initialization hook
  const { status, error, retry } = useFirebaseInitialization();
  
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
      
    case FirebaseStatus.INITIALIZED:
      // When Firebase is successfully initialized, render children
      return <>{children}</>;
      
    default:
      // Default case (should never happen), show fallback
      return <>{fallback}</>;
  }
};

export default FirebaseClientOnly;
