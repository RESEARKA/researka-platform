/**
 * Gemini AI Demo Page
 * 
 * A demonstration page for the Gemini 2.5 Pro AI integration
 * showing both code review and academic content analysis.
 */

import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import FirebaseClientOnly from '../components/FirebaseClientOnly';

// Dynamically import the Gemini components with client-side only rendering
const GeminiCodeReview = dynamic(
  () => import('../components/review/GeminiCodeReview'),
  { ssr: false }
);

const GeminiAcademicReview = dynamic(
  () => import('../components/review/GeminiAcademicReview'),
  { ssr: false }
);

/**
 * Gemini AI Demo Page
 */
export default function GeminiDemoPage() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center" mb={4}>
          <Heading as="h1" size="xl">Gemini AI Integration Demo</Heading>
          <Text mt={2} fontSize="lg" color="gray.600">
            Powered by Gemini 2.5 Pro Experimental
          </Text>
        </Box>
        
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>About this demo</AlertTitle>
            <AlertDescription>
              This page demonstrates the integration of Google's Gemini 2.5 Pro AI model 
              with DecentraJournal. The AI can analyze both code snippets and academic content, 
              providing helpful suggestions and insights.
            </AlertDescription>
          </Box>
        </Alert>
        
        <FirebaseClientOnly>
          <Tabs variant="enclosed" colorScheme="blue" isLazy>
            <TabList>
              <Tab>Code Review</Tab>
              <Tab>Academic Content Review</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Code Analysis with Gemini 2.5 Pro</Heading>
                  <Text>
                    Paste your code below to receive AI-powered suggestions for improvements, 
                    bug detection, and best practices.
                  </Text>
                  
                  <GeminiCodeReview 
                    initialCode={`// Sample TypeScript function
function calculateAverageScore(scores: number[]): number {
  let sum = 0;
  for (let i = 0; i < scores.length; i++) {
    sum += scores[i];
  }
  return sum / scores.length;
}`}
                    language="typescript"
                  />
                </VStack>
              </TabPanel>
              
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Academic Content Analysis</Heading>
                  <Text>
                    Enter your academic content below to receive AI-powered feedback on 
                    structure, logic, and clarity.
                  </Text>
                  
                  <GeminiAcademicReview 
                    title="Blockchain Technology in Academic Publishing"
                    abstract="This paper explores the potential applications of blockchain technology in academic publishing, focusing on transparency, peer review processes, and citation tracking. We propose a decentralized framework that addresses common issues in traditional publishing models while enhancing trust and verification capabilities."
                    field="blockchain"
                  />
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </FirebaseClientOnly>
        
        <Divider my={4} />
        
        <Box>
          <Heading size="sm" mb={2}>How It Works</Heading>
          <Text>
            This demo uses the Gemini 2.5 Pro Experimental model (model ID: gemini-2.5-pro-exp-03-25) 
            to analyze content. The integration is built with TypeScript and React, following best 
            practices for error handling, fallbacks, and user experience.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}
