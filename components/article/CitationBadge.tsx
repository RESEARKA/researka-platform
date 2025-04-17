import React from 'react';
import { Badge, HStack, Icon, Text, Tooltip } from '@chakra-ui/react';
import { FiBookmark } from 'react-icons/fi';

interface CitationBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * A simple badge component that displays citation count
 * Can be used in article cards and article detail pages
 */
export const CitationBadge: React.FC<CitationBadgeProps> = ({ 
  count, 
  size = 'md' 
}) => {
  const fontSize = size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md';
  
  return (
    <Tooltip label="Number of citations">
      <Badge 
        colorScheme="purple" 
        variant="subtle" 
        px={2}
        py={0.5}
        borderRadius="full"
      >
        <HStack spacing={1}>
          <Icon as={FiBookmark} fontSize={fontSize} />
          <Text fontSize={fontSize}>{count}</Text>
        </HStack>
      </Badge>
    </Tooltip>
  );
};

export default CitationBadge;
