/**
 * Citation Demo Component
 * 
 * A demonstration component that shows the ORCID integration and citation export functionality.
 */

import React from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  HStack, 
  Text, 
  Card, 
  CardHeader, 
  CardBody,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { Citation } from './types/citation';
import { CitationExport } from './CitationExport';
import { AuthorsList } from './AuthorsList';

// Sample citation with ORCID IDs
const sampleCitation: Citation = {
  id: 'sample-citation-2025',
  title: 'Integration of ORCID Identifiers in Academic Publishing Platforms',
  authors: [
    { given: 'John', family: 'Doe', orcid: '0000-0002-1825-0097' },
    { given: 'Jane', family: 'Smith', orcid: '0000-0001-5109-3700' },
    { given: 'Alice', family: 'Johnson' }
  ],
  year: 2025,
  journal: 'Journal of Digital Academic Publishing',
  volume: '42',
  issue: '3',
  doi: '10.1234/jdap.2025.42.3.123',
  url: 'https://example.com/jdap/2025/42/3/123',
  publisher: 'DecentraJournal Publishing',
  type: 'article',
  addedAt: Date.now()
};

/**
 * CitationDemo component for demonstrating ORCID integration and citation export
 */
export const CitationDemo: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box maxW="800px" mx="auto" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Citation with ORCID Integration
        </Heading>
        
        <Card bg={bgColor} borderColor={borderColor} shadow="md">
          <CardHeader>
            <Heading size="md">Article Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Heading as="h3" size="md" mb={2}>
                  {sampleCitation.title}
                </Heading>
                <AuthorsList authors={sampleCitation.authors} />
              </Box>
              
              <HStack>
                <Text fontWeight="bold">Journal:</Text>
                <Text>{sampleCitation.journal}</Text>
              </HStack>
              
              <HStack>
                <Text fontWeight="bold">Year:</Text>
                <Text>{sampleCitation.year}</Text>
              </HStack>
              
              <HStack>
                <Text fontWeight="bold">Volume/Issue:</Text>
                <Text>{sampleCitation.volume}({sampleCitation.issue})</Text>
              </HStack>
              
              <HStack>
                <Text fontWeight="bold">DOI:</Text>
                <Text>{sampleCitation.doi}</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
        
        <Card bg={bgColor} borderColor={borderColor} shadow="md">
          <CardHeader>
            <Heading size="md">Citation Export</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={6}>
              <Text>
                Export this citation in various formats. All formats include ORCID identifiers
                when available, ensuring proper author attribution.
              </Text>
              
              <Divider />
              
              <Box>
                <Heading as="h4" size="sm" mb={4}>
                  Export Options (Dropdown Menu)
                </Heading>
                <CitationExport citation={sampleCitation} />
              </Box>
              
              <Divider />
              
              <Box>
                <Heading as="h4" size="sm" mb={4}>
                  Export Options (Inline Buttons)
                </Heading>
                <CitationExport citation={sampleCitation} variant="inline" />
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
