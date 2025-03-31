import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import FirebaseClientOnly from '../components/FirebaseClientOnly';
import dynamic from 'next/dynamic';
import { getArticlesForReview } from '../services/articleService';
import { ReviewArticle } from '../components/review/types';

// Use dynamic import for the review content to avoid SSR issues with Firebase
const DynamicReviewContent = dynamic<any>(
  () => import('../components/review'),
  {
    ssr: false,
    loading: () => (
      <Box py={10} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading review articles...</Text>
      </Box>
    ),
  }
);

const ReviewPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<ReviewArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  // Colors for light/dark mode
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Fetch articles when user is authenticated
  useEffect(() => {
    const fetchArticles = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const fetchedArticles = await getArticlesForReview(currentUser.uid);
        setArticles(fetchedArticles);
        setError(null);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to load articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentUser]);

  // Filter and sort articles based on user selections
  const filteredArticles = articles.filter(article => {
    // Apply search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery || 
      article.title.toLowerCase().includes(searchLower) ||
      article.author.toLowerCase().includes(searchLower) ||
      article.keywords.some(keyword => keyword.toLowerCase().includes(searchLower));
    
    // Apply category filter
    const matchesCategory = 
      categoryFilter === 'all' || 
      article.category.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Apply sorting
    if (sortBy === 'date') {
      return new Date(b.createdAt?.toDate?.() || b.date).getTime() - 
             new Date(a.createdAt?.toDate?.() || a.date).getTime();
    } else if (sortBy === 'compensation') {
      // Extract numeric value from compensation string (e.g., "100 RSRK" -> 100)
      const getCompValue = (comp: string) => {
        const match = comp.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getCompValue(b.compensation) - getCompValue(a.compensation);
    }
    return 0;
  });

  return (
    <Layout title="Review Articles | Researka" description="Review academic articles on Researka" activePage="review">
      <Container maxW="container.xl" py={8}>
        <ErrorBoundary
          fallback={
            <Box p={5} borderWidth="1px" borderRadius="lg" textAlign="center">
              <Heading size="md" mb={4} color="red.500">
                Error Loading Review Content
              </Heading>
              <Text mb={4}>
                We encountered an error while loading the review content. Please try again later.
              </Text>
              <Button onClick={() => window.location.reload()} colorScheme="blue">
                Retry
              </Button>
            </Box>
          }
        >
          <FirebaseClientOnly
            loadingFallback={
              <Box py={10} textAlign="center">
                <Spinner size="xl" />
                <Text mt={4}>Initializing review system...</Text>
              </Box>
            }
            errorFallback={
              <Box p={5} borderWidth="1px" borderRadius="lg" textAlign="center">
                <Heading size="md" mb={4} color="red.500">
                  Connection Error
                </Heading>
                <Text mb={4}>
                  We couldn't connect to our review system. Please check your internet connection and try again.
                </Text>
                <Button onClick={() => window.location.reload()} colorScheme="blue">
                  Retry
                </Button>
              </Box>
            }
          >
            <DynamicReviewContent 
              loading={loading} 
              error={error} 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              categoryFilter={categoryFilter} 
              setCategoryFilter={setCategoryFilter} 
              sortBy={sortBy} 
              setSortBy={setSortBy} 
              bgColor={bgColor} 
              borderColor={borderColor} 
              filteredArticles={filteredArticles} 
            />
          </FirebaseClientOnly>
        </ErrorBoundary>
      </Container>
      
      {/* Footer */}
      <Box py={6} bg="white" borderTop="1px" borderColor="gray.200">
        <Container maxW="container.xl">
          <Text textAlign="center" fontSize="sm" color="gray.500">
            &copy; {new Date().getFullYear()} Researka. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Layout>
  );
};

export default ReviewPage;
