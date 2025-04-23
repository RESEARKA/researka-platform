/**
 * ArticleAuthors Component
 * 
 * Displays author information with ORCID integration.
 */

import React from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Flex,
  Icon,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiMail, FiExternalLink } from 'react-icons/fi';
import { Author } from '../editor/types/citation';
import { OrcidIcon } from '../common/OrcidIcon';

interface ArticleAuthorsProps {
  authors: Author[];
  affiliations?: Record<string, string>;
  correspondingAuthor?: string;
}

/**
 * ArticleAuthors component for displaying author information with ORCID integration
 */
export const ArticleAuthors: React.FC<ArticleAuthorsProps> = ({ 
  authors, 
  affiliations = {},
  correspondingAuthor
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Check if name looks like a wallet address or Firebase UID
  const isInvalidName = React.useCallback((str?: string) => {
    if (!str) return true;
    // Check for wallet addresses (0x...) or long alphanumeric strings without spaces
    return /^(0x)?[a-fA-F0-9]{40,64}$/.test(str) || 
           (/^[a-zA-Z0-9]{20,}$/.test(str) && !str.includes(' '));
  }, []);
  
  // If there are no authors or empty array, show a default author
  if (!authors || authors.length === 0) {
    return (
      <Box 
        bg={bgColor} 
        p={6} 
        borderRadius="md" 
        borderWidth="1px" 
        borderColor={borderColor}
        mb={6}
        width="100%"
      >
        <Heading as="h2" size="md" mb={4}>
          Authors
        </Heading>
        
        <VStack spacing={4} align="stretch">
          {authors.map((author, index) => (
            <Box key={`author-${index}`} pb={3} borderColor="gray.200" borderBottomWidth={index < authors.length - 1 ? "1px" : 0} mb={3}>
              <Flex direction="column" justify="flex-start" align="flex-start">
                <Text fontSize="md" fontWeight="medium" mb={1}>
                  {author.given} {author.family}
                </Text>
                {author.affiliation && (
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    {author.affiliation}
                  </Text>
                )}
                {!author.orcid ? (
                  <Text fontSize="sm" color="gray.500">
                    (ORCID ID: Pending)
                  </Text>
                ) : (
                  <HStack spacing={1}>
                    <Link 
                      href={`https://orcid.org/${author.orcid}`} 
                      isExternal
                      fontSize="sm" 
                      color="blue.500"
                      display="inline-flex"
                      alignItems="center"
                    >
                      ORCID Profile
                      <OrcidIcon boxSize={4} ml={1} color="#A6CE39" />
                    </Link>
                  </HStack>
                )}
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    );
  }
  
  // Check if all authors have invalid names (likely wallet addresses or Firebase UIDs)
  const allAuthorsInvalid = authors.every(author => 
    isInvalidName(author.given) || isInvalidName(author.family)
  );
  
  // If all authors have invalid names, show default author
  if (allAuthorsInvalid) {
    return (
      <Box 
        bg={bgColor} 
        p={6} 
        borderRadius="md" 
        borderWidth="1px" 
        borderColor={borderColor}
        mb={6}
        width="100%"
      >
        <Heading as="h2" size="md" mb={4}>
          Authors
        </Heading>
        
        <VStack spacing={4} align="stretch">
          {authors.map((author, index) => (
            <Box key={`author-${index}`} pb={3} borderColor="gray.200" borderBottomWidth={index < authors.length - 1 ? "1px" : 0} mb={3}>
              <Flex direction="column" justify="flex-start" align="flex-start">
                <Text fontSize="md" fontWeight="medium" mb={1}>
                  {author.given} {author.family}
                </Text>
                {author.affiliation && (
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    {author.affiliation}
                  </Text>
                )}
                {!author.orcid ? (
                  <Text fontSize="sm" color="gray.500">
                    (ORCID ID: Pending)
                  </Text>
                ) : (
                  <HStack spacing={1}>
                    <Link 
                      href={`https://orcid.org/${author.orcid}`} 
                      isExternal
                      fontSize="sm" 
                      color="blue.500"
                      display="inline-flex"
                      alignItems="center"
                    >
                      ORCID Profile
                      <OrcidIcon boxSize={4} ml={1} color="#A6CE39" />
                    </Link>
                  </HStack>
                )}
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    );
  }
  
  return (
    <Box 
      bg={bgColor} 
      p={6} 
      borderRadius="md" 
      borderWidth="1px" 
      borderColor={borderColor}
      mb={6}
      width="100%"
    >
      <Heading as="h2" size="md" mb={4}>
        Authors
      </Heading>
      
      <VStack spacing={4} align="stretch">
        {authors.map((author, index) => {
          const authorId = author.id || `${author.family || ''}-${author.given || ''}`.toLowerCase().replace(/\s+/g, '-');
          const isCorresponding = correspondingAuthor === authorId;
          
          // Get affiliation from multiple possible sources
          const affiliation = author.affiliation || 
                             affiliations[authorId] || 
                             affiliations[`${author.given} ${author.family}`] || 
                             (author.id ? affiliations[author.id] : undefined);
          
          // Ensure we have a valid display name
          const displayName = 
            (author.given && author.family && !isInvalidName(author.given) && !isInvalidName(author.family)) 
              ? `${author.given} ${author.family}`
              : (author.displayName || 'Anonymous Author');
          
          return (
            <Box key={`${authorId}-${index}`} pb={3} borderBottomWidth={index < authors.length - 1 ? '1px' : 0} borderColor="gray.200">
              <Flex direction="column" justify="flex-start" align="flex-start">
                {/* Author Name */}
                <Text fontSize="md" fontWeight="medium" mb={1}>
                  {displayName}
                </Text>
                
                {/* Affiliation/University */}
                {affiliation && (
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    {affiliation}
                  </Text>
                )}
                
                {/* ORCID */}
                {author.orcid ? (
                  <HStack mt={1} spacing={1}>
                    <Link 
                      href={`https://orcid.org/${author.orcid}`}
                      isExternal
                      fontSize="sm"
                      color="gray.600"
                      display="flex"
                      alignItems="center"
                      aria-label={`ORCID profile for ${author.given} ${author.family}`}
                    >
                      {author.orcid}
                      <Icon as={FiExternalLink} ml={1} boxSize={3} />
                    </Link>
                  </HStack>
                ) : (
                  <Text fontSize="sm" color="gray.500">
                    (ORCID ID: Pending)
                  </Text>
                )}
                
                {/* Corresponding Author */}
                {isCorresponding && (
                  <HStack mb={1}>
                    <Icon as={FiMail} color="blue.500" aria-label="Corresponding author" />
                    <Text fontSize="sm" color="blue.500">(Corresponding Author)</Text>
                  </HStack>
                )}
              </Flex>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};
