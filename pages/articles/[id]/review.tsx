import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Skeleton,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import Layout from '../../../components/Layout';
import ReviewForm from '../../../components/ReviewForm';
import { useAuth } from '../../../contexts/AuthContext';

const SubmitReviewPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const toast = useToast();
  
  // Fetch article details
  useEffect(() => {
    if (!router.isReady || !id) return;
    
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        console.log('SubmitReviewPage: Fetching article with ID:', id);
        
        // Import the article service
        const { getArticleById } = await import('../../../services/articleService');
        
        // Get article from Firebase
        const articleData = await getArticleById(id as string);
        
        if (!articleData) {
          console.error('SubmitReviewPage: Article not found');
          setError('Article not found');
          return;
        }
        
        console.log('SubmitReviewPage: Article fetched successfully:', articleData);
        setArticle(articleData);
        setError(null);
      } catch (error) {
        console.error('SubmitReviewPage: Error fetching article:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load article';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticle();
  }, [id, router.isReady]);
  
  // Check if user is the author of the article
  useEffect(() => {
    if (article && currentUser && article.authorId === currentUser.uid) {
      toast({
        title: 'Cannot review own article',
        description: 'You cannot review your own article',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      router.push(`/articles/${id}`);
    }
  }, [article, currentUser, id, router, toast]);
  
  // Handle successful review submission
  const handleReviewSuccess = () => {
    toast({
      title: 'Review submitted',
      description: 'Your review has been successfully submitted',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    router.push(`/articles/${id}`);
  };
  
  // Handle cancel
  const handleCancel = () => {
    router.push(`/articles/${id}`);
  };
  
  return (
    <Layout title="Submit Review | Researka" description="Submit a review for an article on Researka">
      <Container maxW="container.lg" py={8}>
        <Breadcrumb mb={6} fontSize="sm">
          <BreadcrumbItem>
            <BreadcrumbLink href="/articles">Articles</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/articles/${id}`}>Article Details</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Submit Review</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          mb={6}
          onClick={handleCancel}
        >
          Back to Article
        </Button>
        
        <Box mb={8}>
          <Heading as="h1" size="xl" mb={2}>
            Submit Review
          </Heading>
          <Text color="gray.600">
            Provide your expert evaluation of this research article
          </Text>
        </Box>
        
        {isLoading ? (
          <Box>
            <Skeleton height="50px" mb={4} />
            <Skeleton height="200px" mb={4} />
            <Skeleton height="300px" />
          </Box>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        ) : article ? (
          <ReviewForm
            articleId={id as string}
            articleTitle={article.title}
            articleAbstract={article.abstract || ''}
            articleContent={article.content || ''}
            articleCategory={article.category || 'general academic'}
            onSuccess={handleReviewSuccess}
            onCancel={handleCancel}
          />
        ) : (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            Article not found or has been removed
          </Alert>
        )}
      </Container>
    </Layout>
  );
};

export default SubmitReviewPage;
