import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Flex,
  Grid,
  GridItem,
  Icon,
  Skeleton,
  SkeletonText,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiArrowLeft, FiCalendar, FiDownload, FiEye, FiFileText, FiUser, FiShare2 } from 'react-icons/fi';
import { Article } from '../../utils/recommendationEngine';
import { getAllResearchFields } from '../../utils/researchTaxonomy';
import ArticleReviewStatus from '../../components/ArticleReviewStatus';
import ArticleReviewers from '../../components/ArticleReviewers';
import { downloadArticlePdf } from '../../utils/pdfGenerator';
import FlagArticleButton from '../../components/moderation/FlagArticleButton';
import { useArticleViewTracking } from '../../hooks/useActivityTracking';
import { createLogger, LogCategory } from '../../utils/logger';

const logger = createLogger('article-detail');

const ArticleDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<Article | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allFields, setAllFields] = useState<Record<string, string>>({});
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Track article view when the page loads
  const trackingStatus = useArticleViewTracking(
    typeof id === 'string' ? id : undefined,
    article ? {
      category: article.categories?.[0] || 'unknown',
      keywords: article.keywords?.join(',') || '',
      title: article.title || 'unknown'
    } : {}
  );
  
  // Log any tracking errors
  useEffect(() => {
    if (!trackingStatus.success && trackingStatus.error) {
      logger.warn('Failed to track article view', {
        context: { articleId: id, error: trackingStatus.error },
        category: LogCategory.ERROR
      });
    }
  }, [trackingStatus, id]);

  useEffect(() => {
    if (!id) return;
    
    // Create a map of field IDs to their names for display
    const fields = getAllResearchFields();
    const fieldMap = fields.reduce((acc, field) => {
      acc[field.id] = field.name;
      return acc;
    }, {} as Record<string, string>);
    setAllFields(fieldMap);
    
    // Fetch the real article data from Firebase
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        // Use the updated articleServiceV2 instead of the old service
        const { getArticleById } = await import('../../services/articleServiceV2');
        const fetchedArticle = await getArticleById(id as string);
        
        if (fetchedArticle) {
          console.log('Fetched article:', fetchedArticle);
          
          // Fetch reviews for this article
          let articleReviews: any[] = [];
          try {
            const { getReviewsForArticle } = await import('../../services/reviewService');
            articleReviews = await getReviewsForArticle(id as string);
            console.log('Fetched reviews:', articleReviews);
          } catch (reviewError) {
            console.error('Error fetching reviews:', reviewError);
            // Continue without reviews if there's an error
            toast({
              title: 'Warning',
              description: 'Unable to load reviews for this article',
              status: 'warning',
              duration: 3000,
              isClosable: true,
            });
          }
          
          // Convert to the format expected by the component
          const formattedArticle: Article = {
            id: fetchedArticle.id || '',
            title: fetchedArticle.title || 'Untitled Article',
            abstract: fetchedArticle.abstract || 'No abstract available',
            keywords: fetchedArticle.keywords || [],
            categories: [fetchedArticle.category || 'Uncategorized'],
            authorId: fetchedArticle.authorId || 'unknown',
            publishedDate: fetchedArticle.date || new Date().toISOString().split('T')[0],
            views: fetchedArticle.views || 0,
            citations: 0,
            reviewCount: articleReviews?.length || 0,
            // Handle all possible article status values to prevent TypeScript errors
            status: (() => {
              // Convert backend status to UI status
              switch(fetchedArticle.status) {
                case 'pending_review': return 'under_review';
                case 'published': return 'accepted';
                case 'draft': 
                case 'archived':
                default: return 'pending';
              }
            })() as 'pending' | 'under_review' | 'accepted' | 'rejected',
          };
          setArticle(formattedArticle);
          setReviews(articleReviews);
        } else {
          console.error('Article not found with ID:', id);
          toast({
            title: 'Article not found',
            description: 'The requested article could not be found',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        toast({
          title: 'Error',
          description: 'Failed to load article details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticle();
  }, [id, toast]);
  
  // Get readable name for a field ID
  const getFieldName = (fieldId: string) => {
    return allFields[fieldId] || fieldId;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Note: Reviewer invitation feature is disabled for now
  // Will be implemented when the real reviewer system is fully integrated
  
  return (
    <Container maxW="container.xl" py={8}>
      {/* Add navigation back button */}
      <Box mb={4}>
        <Button
          leftIcon={<Icon as={FiArrowLeft} />}
          variant="ghost"
          size="md"
          onClick={() => router.push('/articles')}
        >
          Back to Articles
        </Button>
      </Box>
      
      {isLoading ? (
        <Box>
          <Skeleton height="50px" width="80%" mb={4} />
          <SkeletonText mt={2} noOfLines={4} spacing={4} />
          <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={8} mt={8}>
            <GridItem>
              <Skeleton height="200px" mb={8} />
              <SkeletonText mt={4} noOfLines={10} spacing={4} />
            </GridItem>
            <GridItem>
              <Skeleton height="300px" mb={6} />
              <Skeleton height="400px" />
            </GridItem>
          </Grid>
        </Box>
      ) : article ? (
        <Box>
          <Heading as="h1" size="xl" mb={4}>
            {article.title}
          </Heading>
          
          <Flex wrap="wrap" gap={4} mb={6} align="center">
            <HStack>
              <Icon as={FiUser} color="gray.500" />
              <Text color="gray.600">Author ID: {article.authorId}</Text>
            </HStack>
            
            <HStack>
              <Icon as={FiCalendar} color="gray.500" />
              <Text color="gray.600">
                {article.publishedDate ? formatDate(article.publishedDate) : 'No date'}
              </Text>
            </HStack>
            
            <HStack>
              <Icon as={FiEye} color="gray.500" />
              <Text color="gray.600">{article.views} views</Text>
            </HStack>
            
            <HStack>
              <Icon as={FiFileText} color="gray.500" />
              <Text color="gray.600">{article.citations} citations</Text>
            </HStack>
          </Flex>
          
          <Flex gap={2} flexWrap="wrap" mb={6}>
            {article.keywords.map((keyword) => (
              <Badge key={keyword} colorScheme="blue" variant="subtle">
                {getFieldName(keyword)}
              </Badge>
            ))}
            {article.categories.map((category) => (
              <Badge key={category} colorScheme="purple" variant="subtle">
                {getFieldName(category)}
              </Badge>
            ))}
          </Flex>
          
          <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={8}>
            <GridItem>
              <Box 
                bg={bgColor} 
                p={6} 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor={borderColor}
                mb={8}
              >
                <Heading as="h2" size="md" mb={4}>
                  Abstract
                </Heading>
                <Text>{article.abstract}</Text>
              </Box>
              
              <Box 
                bg={bgColor} 
                p={6} 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor={borderColor}
                mb={8}
              >
                <Heading as="h2" size="md" mb={4}>
                  Full Text
                </Heading>
                <Text color="gray.600" mb={4}>
                  This is a placeholder for the full text of the article. In a real application, this would contain the complete content of the research paper, potentially with sections, figures, tables, and references.
                </Text>
                <Button 
                  leftIcon={<FiDownload />} 
                  colorScheme="blue"
                  onClick={() => {
                    try {
                      // Log that we're generating the PDF
                      console.log('Generating PDF for article:', article.title);
                      
                      // Generate and download the PDF using the available properties in the Article interface
                      downloadArticlePdf({
                        title: article.title || 'Untitled Article',
                        author: article.authorId || 'Unknown Author',
                        abstract: article.abstract || '',
                        content: 'This is a placeholder for the full text of the article. In a real application, this would contain the complete content of the research paper, potentially with sections, figures, tables, and references.',
                        date: article.publishedDate || new Date().toLocaleDateString(),
                        categories: article.categories || []
                      });
                      
                      toast({
                        title: 'PDF Downloaded',
                        description: 'Your PDF has been successfully generated and downloaded.',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                    } catch (error) {
                      console.error('Error downloading PDF:', error);
                      toast({
                        title: 'Download Failed',
                        description: 'There was an error generating the PDF. Please try again.',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  }}
                >
                  Download PDF
                </Button>
              </Box>
              
              <Flex justify="space-between" mb={4}>
                <Button leftIcon={<FiShare2 />} variant="outline">
                  Share
                </Button>
                <FlagArticleButton articleId={article.id || id as string} />
              </Flex>
            </GridItem>
            
            <GridItem>
              <VStack spacing={6} align="stretch">
                <ArticleReviewStatus 
                  article={article}
                  reviews={reviews}
                />
                
                {article.status !== 'accepted' && article.status !== 'rejected' && (
                  <ArticleReviewers 
                    articleId={article.id || id as string}
                    limit={3}
                    reviews={reviews}
                  />
                )}
              </VStack>
            </GridItem>
          </Grid>
        </Box>
      ) : (
        <Box textAlign="center" py={10}>
          <Heading as="h2" size="lg" mb={4}>
            Article Not Found
          </Heading>
          <Text mb={6}>
            The article you are looking for does not exist or has been removed.
          </Text>
          <Button 
            colorScheme="blue" 
            onClick={() => router.push('/articles')}
          >
            Back to Articles
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ArticleDetailPage;
