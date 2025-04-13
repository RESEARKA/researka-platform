/**
 * ArticleCitation Component
 * 
 * Displays citation information for an article with ORCID integration.
 */

import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { Citation } from '../editor/types/citation';
import { CitationExport } from '../editor/CitationExport';
import { AuthorsList } from '../editor/AuthorsList';

interface ArticleCitationProps {
  citation: Citation;
}

/**
 * ArticleCitation component for displaying citation information with ORCID integration
 */
export const ArticleCitation: React.FC<ArticleCitationProps> = ({ citation }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
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
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="center" wrap="wrap">
          <Heading as="h2" size="md">
            How to Cite
          </Heading>
          <CitationExport citation={citation} size="sm" />
        </HStack>
        
        <Divider />
        
        <Box>
          <Text fontWeight="bold" mb={2}>Authors:</Text>
          <AuthorsList authors={citation.authors} showHeading={false} />
        </Box>
        
        <Box>
          <Text fontWeight="bold" mb={2}>Citation:</Text>
          <Text>
            {citation.authors.map(a => `${a.family}, ${a.given[0]}.`).join(', ')} 
            ({citation.year}). {citation.title}. 
            <em>{citation.journal || 'DecentraJournal'}</em>
            {citation.volume && `, ${citation.volume}`}
            {citation.issue && `(${citation.issue})`}.
            {citation.doi && ` https://doi.org/${citation.doi}`}
          </Text>
        </Box>
        
        <Box mt={2}>
          <Text fontSize="sm" color="gray.600">
            Note: ORCID IDs are included in all citation export formats to ensure proper author attribution.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};
