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
  Select,
  HStack,
  Card,
  CardBody
} from '@chakra-ui/react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { submitReview, logUserReviews } from '../services/reviewService';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';
import ArticleReviewers from '../components/ArticleReviewers';

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
      
      // Get Firestore instance
      const firestore = await getFirebaseFirestore();
      if (!firestore) {
        throw new Error('Firestore not initialized');
      }
      
      // Get reviews for current user
      const reviewsRef = collection(firestore, 'reviews');
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
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl">Test Review Submission</Heading>
          
          {!currentUser && (
            <Alert status="warning">
              <AlertIcon />
              You need to be logged in to submit reviews
            </Alert>
          )}
          
          <Box p={5} borderWidth="1px" borderRadius="lg">
            <VStack spacing={4} align="stretch">
              <Heading as="h2" size="md">Submit a Test Review</Heading>
              
              <FormControl>
                <FormLabel>Article ID</FormLabel>
                <Input 
                  value={articleId}
                  onChange={(e) => setArticleId(e.target.value)}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Article Title</FormLabel>
                <Input 
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Score (1-5)</FormLabel>
                <Select 
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                >
                  <option value={1}>1 - Poor</option>
                  <option value={2}>2 - Fair</option>
                  <option value={3}>3 - Good</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={5}>5 - Excellent</option>
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
                  rows={5}
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
          
          {result && (
            <Box p={5} borderWidth="1px" borderRadius="lg">
              <Heading as="h2" size="md" mb={4}>Result</Heading>
              <Code p={4} borderRadius="md" width="100%" display="block" whiteSpace="pre-wrap">
                {JSON.stringify(result, null, 2)}
              </Code>
            </Box>
          )}
          
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          <Divider />
          
          <Box>
            <Heading as="h2" size="md" mb={4}>Test Reviewer Component</Heading>
            <Card p={4} borderWidth="1px" borderRadius="lg">
              <CardBody>
                <ArticleReviewers articleId={articleId} />
              </CardBody>
            </Card>
          </Box>
          
          <Divider />
          
          <Box>
            <Heading as="h2" size="md" mb={4}>Your Reviews</Heading>
            <HStack spacing={4} mb={4}>
              <Button 
                colorScheme="teal" 
                onClick={fetchUserReviews}
                isLoading={isLoading}
                size="sm"
              >
                Fetch Your Reviews
              </Button>
              <Button 
                colorScheme="gray" 
                onClick={logUserReviews}
                size="sm"
              >
                Log Reviews to Console
              </Button>
            </HStack>
            
            {reviews.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {reviews.map((review) => (
                  <Box key={review.id} p={4} borderWidth="1px" borderRadius="md">
                    <Text fontWeight="bold">{review.articleTitle}</Text>
                    <Text fontSize="sm" color="gray.500">ID: {review.id}</Text>
                    <Text mt={2}>{review.content}</Text>
                    <Text mt={2} fontWeight="medium">
                      Score: {review.score} | Recommendation: {review.recommendation}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Submitted: {review.createdAt}
                    </Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text>No reviews found. Try submitting one!</Text>
            )}
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
};

export default TestReviewPage;
