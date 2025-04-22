import React, { useEffect, useState, PropsWithChildren } from 'react';
import { Box, Center, Spinner } from '@chakra-ui/react';

/**
 * A component that ensures client-side only rendering for its children.
 * This prevents hydration mismatches by not rendering children during SSR.
 */
export default function ClientSideOnly({ children }: PropsWithChildren<{}>) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // During SSR and initial client render, return an empty placeholder div with the same structure
  // Once mounted on client, render the actual children
  return (
    <Box className="client-only-wrapper" width="100%">
      {hasMounted ? (
        children
      ) : (
        <Box style={{ visibility: 'hidden', height: '100vh', width: '100%' }}>
          <Center height="100vh">
            <Spinner size="xl" color="green.500" />
          </Center>
        </Box>
      )}
    </Box>
  );
}
