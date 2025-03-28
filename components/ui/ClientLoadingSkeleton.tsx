import React from 'react';
import { Box, Skeleton, Stack } from '@chakra-ui/react';

interface ClientLoadingSkeletonProps {
  height?: string | number;
  width?: string | number;
  count?: number;
  spacing?: number;
}

/**
 * A skeleton loading component to use as a fallback during client-side initialization
 * Provides a consistent loading state across the application
 */
const ClientLoadingSkeleton: React.FC<ClientLoadingSkeletonProps> = ({
  height = '20px',
  width = '100%',
  count = 3,
  spacing = 3
}) => {
  return (
    <Box width={width} data-testid="client-loading-skeleton">
      <Stack spacing={spacing}>
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton 
            key={`skeleton-${index}`}
            height={height}
            width="100%"
            startColor="gray.100"
            endColor="gray.300"
            borderRadius="md"
          />
        ))}
      </Stack>
    </Box>
  );
};

export default ClientLoadingSkeleton;
