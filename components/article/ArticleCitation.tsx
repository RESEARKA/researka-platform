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
          <VStack align="start" spacing={2}>
            {citation.authors.map((author, index) => (
              <Box key={`author-citation-${index}`}>
                <Text>
                  {author.given} {author.family}
                  {author.affiliation && (
                    <Text as="span" fontSize="sm" color="gray.600" ml={1}>
                      ({author.affiliation})
                    </Text>
                  )}
                  {author.orcid && (
                    <Text as="span" fontSize="sm" color="blue.500" ml={1}>
                      (ORCID: {author.orcid})
                    </Text>
                  )}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>
        
        <Box>
          <Text fontWeight="bold" mb={2}>Citation:</Text>
          <Text>
            {citation.authors.map(a => {
              // Handle wallet addresses and ensure proper display names
              const isWalletAddress = (str?: string) => {
                if (!str) return false;
                return /^[a-zA-Z0-9]{30,}$/.test(str) && !str.includes(' ');
              };
              
              // Use the author's name or a fallback
              const displayName = a.displayName || 
                (a.given && a.family ? `${a.given} ${a.family}` : 
                (isWalletAddress(a.id) ? 'Anonymous Author' : a.id));
              
              // If we have a proper name, use it for citation
              if (displayName && !isWalletAddress(displayName)) {
                const nameParts = displayName.split(' ');
                const given = nameParts.length > 1 ? nameParts[0] : '';
                const family = nameParts.length > 1 ? nameParts.slice(1).join(' ') : displayName;
                return `${family}, ${given[0]}.`;
              }
              
              // Fallback to existing format if we have family and given names
              if (a.family && a.given) {
                return `${a.family}, ${a.given[0]}.`;
              }
              
              return 'Anonymous Author';
            }).join(', ')} 
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
