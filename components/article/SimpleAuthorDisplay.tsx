import React from 'react';
import { Box, Text, Heading, VStack } from '@chakra-ui/react';

interface Author {
  userId?: string;
  name?: string;
  displayName?: string;
  affiliation?: string;
  orcid?: string;
  isCorresponding?: boolean;
}

interface SimpleAuthorDisplayProps {
  authors: Author[];
}

/**
 * A simple component to display author information
 * This component uses a minimal approach to display author names and affiliations
 */
export const SimpleAuthorDisplay: React.FC<SimpleAuthorDisplayProps> = ({ authors }) => {
  if (!authors || authors.length === 0) {
    return null;
  }

  // Simple function to check if a string looks like a wallet address
  const isWalletAddress = (str?: string): boolean => {
    if (!str) return false;
    return /^[a-zA-Z0-9]{30,}$/.test(str) && !str.includes(' ');
  };

  // Get display name with fallbacks
  const getDisplayName = (author: Author): string => {
    if (author.displayName && !isWalletAddress(author.displayName)) {
      return author.displayName;
    }
    
    if (author.name && !isWalletAddress(author.name)) {
      return author.name;
    }
    
    return 'Anonymous Author';
  };

  return (
    <Box mb={6}>
      <Heading as="h2" size="md" mb={4}>
        Authors
      </Heading>
      <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
        <VStack align="stretch" spacing={3}>
          {authors.map((author, index) => (
            <Box 
              key={author.userId || `author-${index}`} 
              pb={index < authors.length - 1 ? 3 : 0} 
              borderBottomWidth={index < authors.length - 1 ? '1px' : 0} 
              borderColor="gray.200"
            >
              {/* Author Name */}
              <Text fontWeight="medium">
                {getDisplayName(author)}
              </Text>
              
              {/* Affiliation */}
              {author.affiliation && (
                <Text fontSize="sm" color="gray.600">
                  {author.affiliation}
                </Text>
              )}
              
              {/* ORCID */}
              {author.orcid && (
                <Text fontSize="sm" color="gray.500">
                  ORCID: {author.orcid}
                </Text>
              )}
              
              {/* Corresponding Author */}
              {author.isCorresponding && (
                <Text fontSize="xs" color="blue.600" mt={1}>
                  Corresponding Author
                </Text>
              )}
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};
