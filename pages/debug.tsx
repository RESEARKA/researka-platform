import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Code,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const DebugPage: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const { currentUser } = useAuth();

  const fetchAllArticles = async () => {
    setLoading(true);
    try {
      console.log('Debug: Fetching all articles from Firestore');
      
      if (!db) {
        throw new Error('Firestore not initialized');
      }
      
      // Get all articles without filtering
      const articlesRef = collection(db, 'articles');
      const q = query(articlesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      console.log(`Debug: Found ${querySnapshot.size} articles`);
      
      const fetchedArticles: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedArticles.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
        });
      });
      
      setArticles(fetchedArticles);
      setError(null);
    } catch (err) {
      console.error('Debug: Error fetching articles:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast({
        title: 'Error',
        description: 'Failed to fetch articles',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllArticles();
  }, []);

  return (
    <Layout title="Debug | Researka" description="Debug page for Researka" activePage="home">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl">Debug Page</Heading>
          
          <Box>
            <Heading as="h2" size="md" mb={4}>Current User</Heading>
            {currentUser ? (
              <Code p={4} borderRadius="md" whiteSpace="pre-wrap">
                {JSON.stringify({
                  uid: currentUser.uid,
                  email: currentUser.email,
                  displayName: currentUser.displayName,
                  isAnonymous: currentUser.isAnonymous,
                }, null, 2)}
              </Code>
            ) : (
              <Text>No user logged in</Text>
            )}
          </Box>
          
          <Box>
            <Heading as="h2" size="md" mb={4}>
              All Articles ({articles.length})
              <Button ml={4} size="sm" colorScheme="blue" onClick={fetchAllArticles} isLoading={loading}>
                Refresh
              </Button>
            </Heading>
            
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" />
                <Text mt={4}>Loading articles...</Text>
              </Box>
            ) : error ? (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : articles.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                <AlertTitle>No articles found</AlertTitle>
                <AlertDescription>There are no articles in the database.</AlertDescription>
              </Alert>
            ) : (
              <VStack spacing={4} align="stretch">
                {articles.map((article) => (
                  <Box key={article.id} p={4} borderWidth={1} borderRadius="md">
                    <Heading as="h3" size="sm">{article.title}</Heading>
                    <Text>Author: {article.author} (ID: {article.authorId})</Text>
                    <Text>Status: {article.status}</Text>
                    <Text>Created: {article.createdAt}</Text>
                    <Code p={2} mt={2} borderRadius="md" fontSize="sm" whiteSpace="pre-wrap">
                      {JSON.stringify(article, null, 2)}
                    </Code>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
};

export default DebugPage;
