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
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { logUserReviews } from '../services/reviewService';

const DebugPage: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
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

  const fetchAllReviews = async () => {
    setReviewsLoading(true);
    try {
      console.log('Debug: Fetching all reviews from Firestore');
      
      if (!db) {
        throw new Error('Firestore not initialized');
      }
      
      // Get all reviews
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      console.log(`Debug: Found ${querySnapshot.size} reviews`);
      
      const fetchedReviews: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedReviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
        });
      });
      
      setReviews(fetchedReviews);
      setReviewsError(null);
    } catch (err) {
      console.error('Debug: Error fetching reviews:', err);
      setReviewsError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast({
        title: 'Error',
        description: 'Failed to fetch reviews',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    if (!currentUser) {
      toast({
        title: 'Not logged in',
        description: 'You must be logged in to fetch your reviews',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setReviewsLoading(true);
    try {
      console.log('Debug: Fetching user reviews from Firestore');
      
      if (!db) {
        throw new Error('Firestore not initialized');
      }
      
      // Get reviews for current user
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef, 
        where('reviewerId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      console.log(`Debug: Found ${querySnapshot.size} reviews for user ${currentUser.uid}`);
      
      const fetchedReviews: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedReviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
        });
      });
      
      setReviews(fetchedReviews);
      setReviewsError(null);

      // Also run the debug function from reviewService
      await logUserReviews();
      
    } catch (err) {
      console.error('Debug: Error fetching user reviews:', err);
      setReviewsError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast({
        title: 'Error',
        description: 'Failed to fetch user reviews',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllArticles();
    fetchAllReviews();
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
          
          <Divider my={4} />
          
          <Tabs variant="enclosed">
            <TabList>
              <Tab>Articles</Tab>
              <Tab>Reviews</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={0} pt={4}>
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
              </TabPanel>
              
              <TabPanel p={0} pt={4}>
                <Box>
                  <Heading as="h2" size="md" mb={4}>
                    Reviews ({reviews.length})
                    <Button ml={4} size="sm" colorScheme="blue" onClick={fetchAllReviews} isLoading={reviewsLoading}>
                      All Reviews
                    </Button>
                    <Button ml={4} size="sm" colorScheme="purple" onClick={fetchUserReviews} isLoading={reviewsLoading}>
                      My Reviews
                    </Button>
                  </Heading>
                  
                  {reviewsLoading ? (
                    <Box textAlign="center" py={10}>
                      <Spinner size="xl" />
                      <Text mt={4}>Loading reviews...</Text>
                    </Box>
                  ) : reviewsError ? (
                    <Alert status="error">
                      <AlertIcon />
                      <AlertTitle>Error!</AlertTitle>
                      <AlertDescription>{reviewsError}</AlertDescription>
                    </Alert>
                  ) : reviews.length === 0 ? (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertTitle>No reviews found</AlertTitle>
                      <AlertDescription>There are no reviews in the database.</AlertDescription>
                    </Alert>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {reviews.map((review) => (
                        <Box key={review.id} p={4} borderWidth={1} borderRadius="md">
                          <Heading as="h3" size="sm">
                            {review.articleTitle || 'Review'} (Score: {review.score})
                          </Heading>
                          <Text>Reviewer: {review.reviewerName} (ID: {review.reviewerId})</Text>
                          <Text>Article ID: {review.articleId}</Text>
                          <Text>Created: {review.createdAt}</Text>
                          <Text mt={2} fontWeight="bold">Content:</Text>
                          <Text>{review.content}</Text>
                          <Code p={2} mt={2} borderRadius="md" fontSize="sm" whiteSpace="pre-wrap">
                            {JSON.stringify(review, null, 2)}
                          </Code>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </Layout>
  );
};

export default DebugPage;
