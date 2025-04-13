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
  
  if (!authors || authors.length === 0) {
    return null;
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
          const authorId = `${author.family}-${author.given}`;
          const isCorresponding = correspondingAuthor === authorId;
          const affiliation = affiliations[authorId] || affiliations[`${author.given} ${author.family}`] || (author.id ? affiliations[author.id] : undefined);
          
          return (
            <Box key={`${authorId}-${index}`} pb={3} borderBottomWidth={index < authors.length - 1 ? '1px' : 0} borderColor="gray.200">
              <Flex direction="column" justify="flex-start" align="flex-start">
                {/* Author ID */}
                <Text fontWeight="medium" mb={1}>
                  {author.id}
                </Text>
                
                {/* Author Name (if available) */}
                {author.given && author.family && (
                  <Text fontSize="md" mb={1}>
                    Name: {author.given} {author.family}
                  </Text>
                )}
                
                {/* Affiliation/University */}
                {affiliation && (
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Affiliation: {affiliation}
                  </Text>
                )}
                
                {/* ORCID */}
                {author.orcid ? (
                  <HStack mt={1} spacing={1}>
                    <OrcidIcon color="#A6CE39" boxSize={4} />
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
                    <Icon as={FiMail} color="blue.500" />
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
