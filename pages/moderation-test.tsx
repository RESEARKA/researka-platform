"use client";

import { useEffect, useState } from 'react';
import { Box, Heading, Text, Container, Button, Flex, Spinner } from '@chakra-ui/react';
import { getFirebaseFirestore } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { FlagArticleButton } from '../components/moderation/FlagArticleButton';

export default function ModerationTest() {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testArticle, setTestArticle] = useState<any>(null);

  useEffect(() => {
    async function testFirebaseConnection() {
      try {
        setIsLoading(true);
        const db = getFirebaseFirestore();
        
        if (!db) {
          throw new Error('Firestore is not initialized');
        }
        
        // Try to fetch a single article to test the connection
        const articlesRef = collection(db, 'articles');
        const articlesSnapshot = await getDocs(articlesRef);
        
        if (articlesSnapshot.empty) {
          setTestArticle(null);
        } else {
          // Get the first article
          const firstArticle = articlesSnapshot.docs[0];
          setTestArticle({
            id: firstArticle.id,
            ...firstArticle.data()
          });
        }
        
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Firebase connection test failed:', error);
        setConnectionStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    
    testFirebaseConnection();
  }, []);

  return (
    <Container maxW="container.lg" py={10}>
      <Heading as="h1" mb={6}>Moderation System Test</Heading>
      
      <Box p={6} borderWidth="1px" borderRadius="lg" mb={6}>
        <Heading as="h2" size="md" mb={4}>Firebase Connection Status</Heading>
        
        {isLoading ? (
          <Flex align="center" gap={2}>
            <Spinner size="sm" />
            <Text>Testing connection...</Text>
          </Flex>
        ) : connectionStatus === 'connected' ? (
          <Text color="green.500">✓ Connected to Firebase successfully</Text>
        ) : (
          <Box>
            <Text color="red.500">✗ Failed to connect to Firebase</Text>
            {errorMessage && <Text mt={2} fontSize="sm">{errorMessage}</Text>}
          </Box>
        )}
      </Box>
      
      {connectionStatus === 'connected' && (
        <>
          <Box p={6} borderWidth="1px" borderRadius="lg" mb={6}>
            <Heading as="h2" size="md" mb={4}>Test Article</Heading>
            
            {testArticle ? (
              <Box>
                <Text><strong>ID:</strong> {testArticle.id}</Text>
                <Text><strong>Title:</strong> {testArticle.title}</Text>
                <Text><strong>Author:</strong> {testArticle.author || testArticle.authorId}</Text>
                
                <Flex mt={4}>
                  <FlagArticleButton articleId={testArticle.id} />
                </Flex>
              </Box>
            ) : (
              <Text>No articles found in the database.</Text>
            )}
          </Box>
          
          <Box p={6} borderWidth="1px" borderRadius="lg">
            <Heading as="h2" size="md" mb={4}>Moderation Components</Heading>
            
            <Text mb={4}>
              The following components are part of the moderation system:
            </Text>
            
            <ul style={{ paddingLeft: '20px' }}>
              <li><Text>FlagArticleButton - For users to report inappropriate content</Text></li>
              <li><Text>ModerationActionModal - For admins to take action on flagged articles</Text></li>
              <li><Text>Admin Moderation Queue - Page to list all flagged articles</Text></li>
              <li><Text>Article Moderation Detail - Page to review flagged article details</Text></li>
            </ul>
          </Box>
        </>
      )}
    </Container>
  );
}
