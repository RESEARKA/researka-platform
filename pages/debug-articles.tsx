import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Container, VStack, Divider } from '@chakra-ui/react';
import Layout from '../components/Layout';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';

// Simple debug page to check all articles in Firestore
export default function DebugArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        console.log('Fetching articles for debugging...');
        const db = getFirebaseFirestore();
        
        if (!db) {
          throw new Error('Firebase not initialized');
        }
        
        // Get all articles without filtering by review count
        const q = query(
          collection(db, 'articles'),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        console.log(`Found ${querySnapshot.size} total articles in Firestore`);
        
        const articlesData: any[] = [];
        
        // Process each article
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          articlesData.push({
            id: doc.id,
            ...data,
            reviewCount: data.reviewCount || 0,
            createdAtString: data.createdAt ? data.createdAt.toDate().toISOString() : 'Unknown'
          });
          
          console.log(`Article: ${doc.id} - "${data.title || 'Untitled'}" - Reviews: ${data.reviewCount || 0}`);
        });
        
        setArticles(articlesData);
      } catch (err: any) {
        console.error('Error fetching articles:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchArticles();
  }, []);

  return (
    <Layout>
      <Container maxW="container.lg" py={8}>
        <Heading as="h1" mb={6}>Debug Articles</Heading>
        
        {loading && <Text>Loading articles...</Text>}
        
        {error && (
          <Box p={4} bg="red.100" borderRadius="md" mb={6}>
            <Text color="red.800">Error: {error}</Text>
          </Box>
        )}
        
        {!loading && !error && articles.length === 0 && (
          <Box p={4} bg="yellow.100" borderRadius="md" mb={6}>
            <Text>No articles found in the database.</Text>
          </Box>
        )}
        
        <VStack spacing={4} align="stretch">
          {articles.map((article) => (
            <Box key={article.id} p={4} borderWidth="1px" borderRadius="md" bg="white">
              <Heading as="h3" size="md">{article.title || 'Untitled'}</Heading>
              <Text>ID: {article.id}</Text>
              <Text>Author: {article.author || 'Unknown'}</Text>
              <Text fontWeight="bold">Review Count: {article.reviewCount}</Text>
              <Text>Status: {article.status}</Text>
              <Text>Created: {article.createdAtString}</Text>
            </Box>
          ))}
        </VStack>
      </Container>
    </Layout>
  );
}
