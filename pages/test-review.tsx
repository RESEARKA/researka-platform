import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Code,
  useToast,
  Alert,
  AlertIcon,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select
} from '@chakra-ui/react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { submitReview, logUserReviews } from '../services/reviewService';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

const TestReviewPage: React.FC = () => {
  const [articleId, setArticleId] = useState('test-article-id');
  const [articleTitle, setArticleTitle] = useState('Test Article Title');
  const [score, setScore] = useState(4);
  const [recommendation, setRecommendation] = useState<'accept' | 'minor_revisions' | 'major_revisions' | 'reject'>('accept');
  const [content, setContent] = useState('This is a test review content.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const toast = useToast();
  const { currentUser, getUserProfile } = useAuth();

  const handleSubmitTestReview = async () => {
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to submit a review',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Get user profile to get the reviewer name
      const userProfile = await getUserProfile();
      
      if (!userProfile) {
        toast({
          title: 'Profile required',
          description: 'You must complete your profile before submitting a review',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Prepare review data
      const reviewData = {
        articleId,
        articleTitle,
        reviewerId: currentUser.uid,
        reviewerName: userProfile.displayName || userProfile.name || 'Test Reviewer',
        score: Number(score),
        recommendation,
        content,
      };
      
      console.log('TestReview: Submitting review', reviewData);
      
      // Submit review
      const result = await submitReview(reviewData);
      
      console.log('TestReview: Review submitted successfully', result);
      setResult(result);
      
      // Debug: Log all reviews for the current user
      console.log('TestReview: Logging all reviews for current user');
      await logUserReviews();
      
      toast({
        title: 'Test review submitted',
        description: 'Your test review has been successfully submitted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Fetch the reviews to verify
      fetchUserReviews();
      
    } catch (error) {
      console.error('TestReview: Error submitting review:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast({
        title: 'Error',
        description: 'Failed to submit test review. Please check console for details.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchUserReviews = async () => {
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to fetch reviews',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('TestReview: Fetching user reviews from Firestore');
      
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
      console.log(`TestReview: Found ${querySnapshot.docs.length} reviews for user ${currentUser.uid}`);
      
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
      setError(null);
    } catch (err) {
      console.error('TestReview: Error fetching user reviews:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Test Review | Researka" description="Test page for review functionality">
      <Container maxW="container.lg" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl">Test Review Submission</Heading>
          <Text>Use this page to test the review submission functionality and debug any issues.</Text>
          
          <Box p={6} borderWidth={1} borderRadius="md">
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Article ID</FormLabel>
                <Input 
                  value={articleId} 
                  onChange={(e) => setArticleId(e.target.value)}
                  placeholder="Enter article ID"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Article Title</FormLabel>
                <Input 
                  value={articleTitle} 
                  onChange={(e) => setArticleTitle(e.target.value)}
                  placeholder="Enter article title"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Score (1-5)</FormLabel>
                <Select 
                  value={score} 
                  onChange={(e) => setScore(Number(e.target.value))}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Recommendation</FormLabel>
                <Select 
                  value={recommendation} 
                  onChange={(e) => setRecommendation(e.target.value as any)}
                >
                  <option value="accept">Accept</option>
                  <option value="minor_revisions">Minor Revisions</option>
                  <option value="major_revisions">Major Revisions</option>
                  <option value="reject">Reject</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Review Content</FormLabel>
                <Textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter review content"
                  rows={4}
                />
              </FormControl>
              
              <Button 
                colorScheme="blue" 
                onClick={handleSubmitTestReview} 
                isLoading={isSubmitting}
                loadingText="Submitting"
              >
                Submit Test Review
              </Button>
            </VStack>
          </Box>
          
          <Divider my={4} />
          
          <Box>
            <Heading as="h2" size="md" mb={4}>
              Test Result
              {result && <Text as="span" color="green.500" ml={2}>✓ Success</Text>}
              {error && <Text as="span" color="red.500" ml={2}>✗ Error</Text>}
            </Heading>
            
            {result && (
              <Code p={4} borderRadius="md" whiteSpace="pre-wrap">
                {JSON.stringify(result, null, 2)}
              </Code>
            )}
            
            {error && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {error}
              </Alert>
            )}
          </Box>
          
          <Divider my={4} />
          
          <Box>
            <Heading as="h2" size="md" mb={4}>
              Your Reviews
              <Button ml={4} size="sm" colorScheme="blue" onClick={fetchUserReviews} isLoading={isLoading}>
                Refresh
              </Button>
            </Heading>
            
            {reviews.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                No reviews found for your account.
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
        </VStack>
      </Container>
    </Layout>
  );
};

export default TestReviewPage;
