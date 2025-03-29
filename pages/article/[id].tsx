import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Tag,
  Divider,
  Image,
  Flex,
  Button,
  useColorModeValue,
  Skeleton,
  Link,
  Center,
  Spinner
} from '@chakra-ui/react';
import { FiArrowLeft, FiCalendar, FiEye } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { getArticleById, Article } from '../../services/articleService';
import FirebaseClientOnly from '../../components/FirebaseClientOnly';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger instance for this component
const logger = createLogger('ArticlePage');

const ArticlePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Image URLs for different article categories
  const imageUrls = {
    BIOLOGY: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    PHYSICS: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    'COMPUTER SCIENCE': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    MATHEMATICS: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    DEFAULT: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80'
  };

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        logger.info('Fetching article', {
          context: { articleId: id },
          category: LogCategory.DATA
        });
        
        const fetchedArticle = await getArticleById(id as string);
        
        if (fetchedArticle) {
          logger.info('Article fetched successfully', {
            context: { 
              articleId: id,
              title: fetchedArticle.title
            },
            category: LogCategory.DATA
          });
          setArticle(fetchedArticle);
        } else {
          logger.warn('Article not found', {
            context: { articleId: id },
            category: LogCategory.DATA
          });
          setError('Article not found');
        }
      } catch (err) {
        logger.error('Error fetching article', {
          context: { 
            articleId: id,
            error: err instanceof Error ? err.message : String(err)
          },
          category: LogCategory.ERROR
        });
        setError('Failed to load article. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  // Get the appropriate image URL based on the article's category
  const getImageUrl = (article: Article) => {
    if (!article || !article.category) {
      return imageUrls.DEFAULT;
    }
    
    const category = article.category.toUpperCase();
    
    if (category.includes('BIOLOGY')) return imageUrls.BIOLOGY;
    if (category.includes('PHYSICS')) return imageUrls.PHYSICS;
    if (category.includes('COMPUTER')) return imageUrls['COMPUTER SCIENCE'];
    if (category.includes('MATH')) return imageUrls.MATHEMATICS;
    
    return imageUrls.DEFAULT;
  };

  if (loading) {
    return (
      <Layout title="Loading Article | Researka" description="Loading article details" activePage="">
        <Container maxW="container.lg" py={8}>
          <VStack spacing={6} align="stretch">
            <Skeleton height="300px" width="100%" borderRadius="md" />
            <Skeleton height="40px" width="70%" />
            <Skeleton height="20px" width="40%" />
            <Skeleton height="200px" width="100%" />
          </VStack>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Article Not Found | Researka" description="The requested article could not be found" activePage="">
        <Container maxW="container.lg" py={8}>
          <VStack spacing={6} align="center">
            <Heading size="xl">Article Not Found</Heading>
            <Text>The article you are looking for does not exist or has been removed.</Text>
            <Button 
              leftIcon={<FiArrowLeft />} 
              colorScheme="blue" 
              onClick={() => router.push('/')}
            >
              Return to Home
            </Button>
          </VStack>
        </Container>
      </Layout>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <Layout 
      title={`${article.title} | Researka`} 
      description={article.abstract} 
      activePage=""
    >
      <Container maxW="container.lg" py={8}>
        <VStack spacing={6} align="stretch">
          <Button 
            leftIcon={<FiArrowLeft />} 
            variant="ghost" 
            alignSelf="flex-start"
            onClick={() => router.push('/')}
          >
            Back
          </Button>
          
          <Image
            src={getImageUrl(article)}
            alt={article.title}
            borderRadius="md"
            width="100%"
            height="300px"
            objectFit="cover"
            fallbackSrc={imageUrls.DEFAULT}
          />
          
          <Heading as="h1" size="xl">{article.title}</Heading>
          
          <HStack spacing={4} wrap="wrap">
            <Flex align="center" color="gray.500">
              <FiCalendar style={{ marginRight: '4px' }} />
              <Text fontSize="sm">{article.date}</Text>
            </Flex>
            <Flex align="center" color="gray.500">
              <FiEye style={{ marginRight: '4px' }} />
              <Text fontSize="sm">{article.views || 0} views</Text>
            </Flex>
          </HStack>
          
          <Text fontWeight="bold">Author:</Text>
          <Text>{article.author}</Text>
          
          <HStack spacing={2} wrap="wrap">
            <Tag colorScheme="blue" size="md">
              {article.category}
            </Tag>
            {article.keywords && article.keywords.map((keyword: string, index: number) => (
              <Tag key={index} colorScheme="green" size="md">
                {keyword}
              </Tag>
            ))}
          </HStack>
          
          <Divider />
          
          <Box>
            <Heading as="h2" size="md" mb={4}>Abstract</Heading>
            <Text>{article.abstract}</Text>
          </Box>
          
          <Divider />
          
          <Box>
            <Heading as="h2" size="md" mb={4}>Full Paper</Heading>
            {article.content ? (
              <Text>{article.content}</Text>
            ) : (
              <VStack spacing={4} mt={6} align="stretch">
                {article.introduction && (
                  <>
                    <Heading as="h3" size="sm">Introduction</Heading>
                    <Text>{article.introduction}</Text>
                  </>
                )}
                
                {article.methods && (
                  <>
                    <Heading as="h3" size="sm">Methodology</Heading>
                    <Text>{article.methods}</Text>
                  </>
                )}
                
                {article.results && (
                  <>
                    <Heading as="h3" size="sm">Results</Heading>
                    <Text>{article.results}</Text>
                  </>
                )}
                
                {article.discussion && (
                  <>
                    <Heading as="h3" size="sm">Discussion</Heading>
                    <Text>{article.discussion}</Text>
                  </>
                )}
                
                {article.references && (
                  <>
                    <Heading as="h3" size="sm">References</Heading>
                    <Text>{article.references}</Text>
                  </>
                )}
                
                {!article.introduction && !article.methods && !article.results && !article.discussion && !article.references && (
                  <Text color="gray.600">
                    Full paper content is not available for this article.
                  </Text>
                )}
              </VStack>
            )}
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
};

// Wrap the ArticlePage component with FirebaseClientOnly to ensure Firebase is initialized
const ArticlePageWithFirebase = () => {
  return (
    <FirebaseClientOnly fallback={
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    }>
      <ArticlePage />
    </FirebaseClientOnly>
  );
};

export default ArticlePageWithFirebase;
