"use client";

import React, { ReactNode, useState, useEffect } from 'react';
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
 * Using the dedicated useFirebaseInitialized hook for better initialization management
 */
const FirebaseClientOnly: React.FC<FirebaseClientOnlyProps> = ({
  children,
  fallback = null,
  loadingFallback = null,
  errorFallback = null
}) => {
  // Track if we're on the client side to prevent hydration errors
  const [isClient, setIsClient] = useState(false);
  
  // Use our enhanced dedicated hook to ensure Firebase is initialized
  const { initialized, error, isTimedOut } = useFirebaseInitialized();
  
  // Set isClient to true once the component is mounted
  useEffect(() => {
    setIsClient(true);
    
    // Log Firebase initialization status for debugging
    logger.debug('Firebase initialization status', {
      context: {
        initialized,
        hasError: !!error,
        isTimedOut
      },
      category: LogCategory.SYSTEM
    });
  }, [initialized, error, isTimedOut]);

  // If we're not on the client yet, show the fallback
  if (!isClient) {
    return <>{fallback}</>;
  }

  // If Firebase is initializing, show the loading fallback
  if (!initialized && !error) {
    if (loadingFallback) {
      return <>{loadingFallback}</>;
    }
    
    // Default loading UI
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Initializing application...</Text>
        </VStack>
      </Center>
    );
  }

  // If there was an error initializing Firebase, show the error fallback
  if (error) {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }
    
    // Default error UI
    return (
      <Box p={5} maxW="container.md" mx="auto" my={10}>
        <Alert 
          status="error" 
          variant="subtle" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          textAlign="center" 
          borderRadius="md"
          p={5}
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Failed to Initialize Application
          </AlertTitle>
          <AlertDescription maxWidth="sm" mb={4}>
            {isTimedOut 
              ? "Connection timed out. Please check your internet connection and try again."
              : error.message || "There was an error initializing the application."}
          </AlertDescription>
          <Button 
            leftIcon={<FiRefreshCw />} 
            colorScheme="red" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  // Firebase is initialized and we're on the client, render children
  return <>{children}</>;
};

export default FirebaseClientOnly;
