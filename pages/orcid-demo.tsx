/**
 * ORCID Integration Demo Page
 * 
 * This page demonstrates the ORCID integration and citation export functionality.
 */

import React from 'react';
import { Box, Container, Heading, Text, VStack, Divider } from '@chakra-ui/react';
import { CitationDemo } from '../components/editor/CitationDemo';

export default function OrcidDemoPage() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={4}>
            ORCID Integration Demo
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Showcasing the integration of ORCID identifiers in DecentraJournal
          </Text>
        </Box>
        
        <Divider />
        
        <CitationDemo />
      </VStack>
    </Container>
  );
}
