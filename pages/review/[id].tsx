import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Text,
  VStack,
  Spinner,
  Center,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FiArrowLeft } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Article, Review } from '../../types/review';
import TabbedReviewInterface from '../../components/review/TabbedReviewInterface';

const ReviewArticlePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const auth = getAuth();

  // State for article and loading
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    // Cleanup on unmount
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (router.isReady && id) {
      setIsLoading(true);
      console.log(`ReviewArticlePage: Loading article with ID: ${id}`);
      
      const loadArticle = async () => {
        try {
          // Get article from Firebase
          const { getArticleById } = await import('../../services/articleService');
          console.log(`ReviewArticlePage: Calling getArticleById with ID: ${id}`);
          
          const firebaseArticle = await getArticleById(id as string);
          
          if (firebaseArticle) {
            console.log(`ReviewArticlePage: Article loaded successfully: ${firebaseArticle.title}`);
            // Ensure the article has all required properties including keywords
            const articleWithDefaults = {
              ...firebaseArticle,
              keywords: firebaseArticle.keywords || []
            };
            setArticle(articleWithDefaults as Article);
            setError(null);
          } else {
            console.error(`ReviewArticlePage: Article not found with ID: ${id}`);
            setError('Article not found');
            toast({
              title: 'Error',
              description: `Article with ID ${id} not found`,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
        } catch (error) {
          console.error('ReviewArticlePage: Error loading article:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setError(`Error loading article: ${errorMessage}`);
          toast({
            title: 'Error',
            description: `Failed to load article: ${errorMessage}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      loadArticle();
    }
  }, [id, router.isReady, toast]);

  // Handle review submission
  const handleSubmitReview = async (reviewData: Partial<Review>): Promise<void> => {
    try {
      setIsSubmitting(true);
      
      // Create the review data object with proper typing
      const fullReviewData: Review = {
        articleId: id as string,
        reviewerId: currentUser?.uid || 'anonymous', // Use Firebase user ID
        ratings: reviewData.ratings || {
          originality: 3,
          methodology: 3,
          clarity: 3,
          significance: 3,
          references: 3
        },
        comments: reviewData.comments || '',
        privateComments: reviewData.privateComments || '',
        decision: reviewData.decision || 'reject',
        dateSubmitted: new Date().toISOString()
      };
      
      // Validate form data
      const errors: Record<string, string> = {};
      
      if (!fullReviewData.ratings) {
        errors.ratings = 'Ratings are required';
      }
      
      if (!fullReviewData.comments || fullReviewData.comments.trim().length < 50) {
        errors.comments = 'Please provide detailed comments (at least 50 characters)';
      }
      
      if (!fullReviewData.decision) {
        errors.decision = 'Decision is required';
      }
      
      // If there are validation errors, update state and return
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setIsSubmitting(false);
        return;
      }
      
      // Clear any previous errors
      setFormErrors({});
      
      // Submit the review to Firebase
      const submitReviewToFirebase = async () => {
        try {
          // TODO: Implement actual Firebase submission
          console.log('Submitting review to Firebase:', fullReviewData);
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          toast({
            title: 'Review Submitted',
            description: 'Your review has been submitted successfully.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          
          // Redirect to homepage
          router.push('/');
        } catch (error) {
          console.error('Error submitting review to Firebase:', error);
          toast({
            title: 'Submission Error',
            description: 'There was an error submitting your review. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      };
      
      submitReviewToFirebase();
    } catch (error) {
      console.error('ReviewArticlePage: Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Review Article" description="Review an article for DecentraJournal" activePage="review">
      <Container maxW="container.xl" py={8}>
        {/* Back button */}
        <Button 
          leftIcon={<FiArrowLeft />} 
          variant="ghost" 
          mb={6} 
          onClick={() => router.push('/review')}
        >
          Back to Review Page
        </Button>

        {/* Main content area */}
        {isLoading ? (
          <Center h="50vh">
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" />
              <Text>Loading article...</Text>
            </VStack>
          </Center>
        ) : error ? (
          <Center h="50vh">
            <VStack spacing={4}>
              <Text fontSize="xl" color="red.500">{error}</Text>
              <Button leftIcon={<FiArrowLeft />} onClick={() => router.push('/')}>
                Return to Homepage
              </Button>
            </VStack>
          </Center>
        ) : article ? (
          <Box w="full" maxW="1200px" mx="auto" px={4}>
            <TabbedReviewInterface
              article={article}
              isLoading={isSubmitting}
              onSubmit={handleSubmitReview}
              errors={formErrors}
            />
          </Box>
        ) : (
          <Center h="50vh">
            <VStack spacing={4}>
              <Text fontSize="xl">Article not found or you don't have permission to review it.</Text>
              <Button leftIcon={<FiArrowLeft />} onClick={() => router.push('/')}>
                Return to Homepage
              </Button>
            </VStack>
          </Center>
        )}
      </Container>
    </Layout>
  );
};

export default ReviewArticlePage;
