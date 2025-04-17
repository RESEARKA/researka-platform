import React from 'react';
import { HStack, Icon, Text, Tooltip } from '@chakra-ui/react';
import { FiEye } from 'react-icons/fi';

interface ReadCountDisplayProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * A component that displays the number of views/reads for an article
 * Can be used in article cards and article detail pages
 */
export const ReadCountDisplay: React.FC<ReadCountDisplayProps> = ({ 
  count, 
  size = 'md',
  showLabel = false
}) => {
  const fontSize = size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md';
  
  // Format large numbers (e.g., 1.2k instead of 1200)
  const formattedCount = count >= 1000 
    ? `${(count / 1000).toFixed(1)}k` 
    : count.toString();
  
  return (
    <Tooltip label="Number of views">
      <HStack spacing={1}>
        <Icon as={FiEye} fontSize={fontSize} color="gray.500" />
        <Text fontSize={fontSize} color="gray.600">
          {formattedCount}{showLabel ? ' views' : ''}
        </Text>
      </HStack>
    </Tooltip>
  );
};

export default ReadCountDisplay;
