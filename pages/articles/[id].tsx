import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
  Divider,
  Grid,
  GridItem,
  Icon,
  Skeleton,
  SkeletonText,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiCalendar, FiDownload, FiEye, FiFileText, FiShare2, FiUser } from 'react-icons/fi';
import { Article } from '../../utils/recommendationEngine';
import { getAllResearchFields } from '../../utils/researchTaxonomy';
import ArticleReviewStatus from '../../components/ArticleReviewStatus';
import RecommendedReviewers from '../../components/RecommendedReviewers';

// Mock article data for demonstration
const MOCK_ARTICLE: Article = {
  id: 'article1',
  title: 'Quantum Computing: A New Paradigm for Information Processing',
  abstract: 'This paper explores the potential of quantum computing to revolutionize information processing, focusing on recent advances in quantum algorithms and their applications in cryptography and optimization problems. We present a comprehensive review of the current state of quantum computing research and discuss the challenges and opportunities in this rapidly evolving field. Our analysis includes a detailed examination of quantum supremacy experiments, error correction techniques, and the development of practical quantum algorithms for real-world applications. Additionally, we propose a novel framework for evaluating the potential impact of quantum computing on various industries and scientific disciplines.',
  keywords: ['quantum-computing', 'quantum-algorithms', 'information-theory', 'cryptography'],
  categories: ['computer-science', 'quantum-physics'],
  authorId: 'author1',
  publishedDate: '2023-01-15',
  views: 1245,
  citations: 18,
  reviewCount: 1,
  status: 'under_review',
};

// Mock reviews for demonstration
const MOCK_REVIEWS = [
  {
    id: 'review1',
    reviewerId: 'user1',
    reviewerName: 'Dr. Emma Johnson',
    score: 4.2,
    recommendation: 'accept',
    createdAt: '2023-02-10',
  },
  {
    id: 'review2',
    reviewerId: 'user8',
    reviewerName: 'Prof. James Wilson',
    score: 3.8,
    recommendation: 'minor_revisions',
    createdAt: '2023-02-15',
  },
];

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
  
  useEffect(() => {
    if (!id) return;
    
    // In a real application, you would fetch the article from an API
    // For now, we'll use mock data
    
    // Create a map of field IDs to their names for display
    const fields = getAllResearchFields();
    const fieldMap = fields.reduce((acc, field) => {
      acc[field.id] = field.name;
      return acc;
    }, {} as Record<string, string>);
    setAllFields(fieldMap);
    
    // Simulate API delay
    setTimeout(() => {
      setArticle(MOCK_ARTICLE);
      setReviews(MOCK_REVIEWS);
      setIsLoading(false);
    }, 1000);
  }, [id]);
  
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
  
  // Handle inviting a reviewer
  const handleInviteReviewer = (reviewerId: string) => {
    toast({
      title: 'Reviewer invited',
      description: `Invitation sent to reviewer (ID: ${reviewerId})`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Container maxW="container.xl" py={8}>
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
                <Button leftIcon={<FiDownload />} colorScheme="blue">
                  Download PDF
                </Button>
              </Box>
              
              <Flex justify="space-between" mb={4}>
                <Button leftIcon={<FiShare2 />} variant="outline">
                  Share
                </Button>
                
                <Button 
                  as={Link}
                  href={`/articles/${id}/review`}
                  colorScheme="blue" 
                  variant="solid"
                >
                  Submit Review
                </Button>
              </Flex>
            </GridItem>
            
            <GridItem>
              <VStack spacing={6} align="stretch">
                <ArticleReviewStatus 
                  article={article}
                  reviews={reviews}
                />
                
                {article.status !== 'accepted' && article.status !== 'rejected' && (
                  <RecommendedReviewers 
                    article={article}
                    onInvite={handleInviteReviewer}
                    limit={3}
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
