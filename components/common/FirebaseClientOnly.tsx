import React, { useState, useEffect } from 'react';
import { Spinner, Center, VStack, Text } from '@chakra-ui/react';
import useClient from '../../hooks/useClient';
import useFirebaseInitialized from '../../hooks/useFirebaseInitialized';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger instance for this component
const logger = createLogger('FirebaseClientOnly');

interface FirebaseClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A wrapper component that ensures Firebase-dependent code only runs on the client side
 * Provides a loading state while Firebase is initializing
 */
const FirebaseClientOnly: React.FC<FirebaseClientOnlyProps> = ({ 
  children, 
  fallback = (
    <Center py={10}>
      <VStack spacing={4}>
        <Spinner size="xl" />
        <Text>Loading...</Text>
      </VStack>
    </Center>
  ) 
}) => {
  // Check if we're on the client side
  const isClient = useClient();
  
  // Use our dedicated hook to ensure Firebase is initialized
  const { initialized: isFirebaseReady, error: firebaseError } = useFirebaseInitialized();
  
  // Track if the component is mounted
  const [isMounted, setIsMounted] = useState(false);
  
  // Set mounted state on client side
  useEffect(() => {
    setIsMounted(true);
    
    logger.debug('FirebaseClientOnly component mounted', {
      context: { 
        isClient,
        isFirebaseReady,
        hasError: !!firebaseError
      },
      category: LogCategory.LIFECYCLE
    });
    
    return () => {
      logger.debug('FirebaseClientOnly component unmounted', {
        category: LogCategory.LIFECYCLE
      });
    };
  }, [firebaseError, isClient, isFirebaseReady]);
  
  // If not on client or not mounted, show fallback
  if (!isClient || !isMounted) {
    logger.debug('Rendering fallback: not on client or not mounted', {
      context: { isClient, isMounted },
      category: LogCategory.UI
    });
    return <>{fallback}</>;
  }
  
  // If Firebase is not ready, show loading state
  if (!isFirebaseReady) {
    logger.debug('Rendering fallback: Firebase not ready', {
      category: LogCategory.UI
    });
    return <>{fallback}</>;
  }
  
  // If Firebase had an error, log it but still try to render children
  if (firebaseError) {
    logger.error('Firebase initialization error', {
      context: { error: firebaseError },
      category: LogCategory.ERROR
    });
  }
  
  // Firebase is ready, render children
  logger.debug('Rendering children: Firebase is ready', {
    category: LogCategory.UI
  });
  return <>{children}</>;
};

export default FirebaseClientOnly;
