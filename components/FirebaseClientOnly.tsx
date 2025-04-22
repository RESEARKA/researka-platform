import React, { ReactNode, useState, useEffect } from 'react';
import { Box, Spinner, Text, VStack, Center } from '@chakra-ui/react';
import useFirebaseInitialized from '../hooks/useFirebaseInitialized';

interface FirebaseClientOnlyProps {
  children: ReactNode;
}

/**
 * A simplified component that ensures identical DOM structure between
 * server and client rendering for proper hydration.
 * This component is designed to be used with next/dynamic with ssr: false.
 */
const FirebaseClientOnly: React.FC<FirebaseClientOnlyProps> = ({
  children
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  const { initialized, error } = useFirebaseInitialized();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // The outer wrapper ensures consistent DOM structure
  return (
    <Box className="firebase-wrapper" width="100%">
      {hasMounted && initialized && !error ? (
        // When mounted and Firebase is ready, show children
        children
      ) : (
        // Before mount or during initialization, show appropriate content with same structure
        <Center py={10}>
          <VStack spacing={4}>
            <Spinner size="xl" color="green.500" />
            <Text>
              {error ? 'There was an error initializing the application' : 'Initializing application...'}
            </Text>
          </VStack>
        </Center>
      )}
    </Box>
  );
};

export default FirebaseClientOnly;
