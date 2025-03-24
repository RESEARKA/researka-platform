import React from 'react';
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
  Link
} from '@chakra-ui/react';
import { FiArrowLeft, FiCalendar, FiEye } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { GetStaticProps, GetStaticPaths } from 'next';
import { getArticleById } from '../../services/articleService';
import { Article } from '../../services/articleService';

// Define the interface for the component props
interface ArticlePageProps {
  article: Article | null;
  error?: string | null;
}

// Define the interface for static paths
interface ArticleStaticPath {
  params: {
    id: string;
  };
}

const ArticlePage: React.FC<ArticlePageProps> = ({ article, error }) => {
  const router = useRouter();

  // Handle the case where the page is being generated or revalidated
  if (router.isFallback) {
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

  // Image URLs for different article categories
  const imageUrls = {
    biology: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    physics: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    'computer-science': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    mathematics: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    default: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80'
  };

  // Get the appropriate image URL based on the article's category
  const getImageUrl = (article: Article | null) => {
    if (!article || !article.category) {
      return imageUrls.default;
    }
    
    // Handle both string and array category types
    let categoryStr = '';
    if (typeof article.category === 'string') {
      categoryStr = article.category.toLowerCase();
    } else if (Array.isArray(article.category) && article.category.length > 0) {
      categoryStr = article.category[0].toLowerCase();
    }
    
    if (categoryStr.includes('biology')) return imageUrls.biology;
    if (categoryStr.includes('physics')) return imageUrls.physics;
    if (categoryStr.includes('computer')) return imageUrls['computer-science'];
    if (categoryStr.includes('math')) return imageUrls.mathematics;
    
    return imageUrls.default;
  };

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

  // Format date for display
  const formattedDate = article.date 
    ? new Date(article.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown date';

  // Prepare categories for display
  const categories = Array.isArray(article.category) 
    ? article.category 
    : typeof article.category === 'string' 
      ? [article.category] 
      : [];

  // Prepare authors for display
  const authors = Array.isArray(article.author) 
    ? article.author.join(', ') 
    : article.author || 'Unknown author';

  return (
    <Layout 
      title={`${article.title} | Researka`} 
      description={article.abstract || ''} 
      activePage=""
    >
      <Container maxW="container.lg" py={8}>
        <VStack spacing={6} align="stretch">
          <Button 
            leftIcon={<FiArrowLeft />} 
            variant="ghost" 
            alignSelf="flex-start"
            onClick={() => router.push('/articles')}
          >
            Back to Articles
          </Button>
          
          <Image
            src={getImageUrl(article)}
            alt={article.title}
            borderRadius="md"
            width="100%"
            height="300px"
            objectFit="cover"
            fallbackSrc={imageUrls.default}
          />
          
          <Heading as="h1" size="xl">{article.title}</Heading>
          
          <HStack spacing={4} wrap="wrap">
            <Flex align="center" color="gray.500">
              <FiCalendar style={{ marginRight: '4px' }} />
              <Text fontSize="sm">{formattedDate}</Text>
            </Flex>
            <Flex align="center" color="gray.500">
              <FiEye style={{ marginRight: '4px' }} />
              <Text fontSize="sm">{article.views || 0} views</Text>
            </Flex>
          </HStack>
          
          <Text fontWeight="bold">Authors:</Text>
          <Text>{authors}</Text>
          
          <HStack spacing={2} wrap="wrap">
            {categories.map((category: string, index: number) => (
              <Tag key={index} colorScheme="blue" size="md">
                {category}
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
            <Heading as="h2" size="md" mb={4}>Content</Heading>
            {article.content ? (
              <Text whiteSpace="pre-wrap">{article.content}</Text>
            ) : (
              <>
                <VStack spacing={4} mt={6} align="stretch">
                  {article.introduction && (
                    <>
                      <Heading as="h3" size="sm">Introduction</Heading>
                      <Text whiteSpace="pre-wrap">{article.introduction}</Text>
                    </>
                  )}
                  
                  {article.methods && (
                    <>
                      <Heading as="h3" size="sm">Methodology</Heading>
                      <Text whiteSpace="pre-wrap">{article.methods}</Text>
                    </>
                  )}
                  
                  {article.results && (
                    <>
                      <Heading as="h3" size="sm">Results</Heading>
                      <Text whiteSpace="pre-wrap">{article.results}</Text>
                    </>
                  )}
                  
                  {article.discussion && (
                    <>
                      <Heading as="h3" size="sm">Discussion</Heading>
                      <Text whiteSpace="pre-wrap">{article.discussion}</Text>
                    </>
                  )}
                  
                  {article.references && (
                    <>
                      <Heading as="h3" size="sm">References</Heading>
                      <Text whiteSpace="pre-wrap">{article.references}</Text>
                    </>
                  )}
                  
                  {!article.introduction && !article.methods && !article.results && !article.discussion && !article.references && (
                    <Text color="gray.600">
                      This is a placeholder for the full paper content. In a real application, this would contain the complete research paper with sections like Introduction, Methodology, Results, Discussion, and References.
                    </Text>
                  )}
                </VStack>
              </>
            )}
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
};

// This function gets called at build time to generate static paths
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // For performance reasons, we'll only pre-generate a limited number of articles at build time
    // Other articles will be generated on-demand
    const { getAllArticles } = await import('../../services/articleService');
    const articles = await getAllArticles();
    
    // Create paths for the most recent 10 articles
    const paths = articles
      .slice(0, 10)
      .map(article => ({
        params: { id: article.id }
      }));
    
    return {
      paths,
      // Enable on-demand generation for paths not pre-rendered at build time
      fallback: true
    };
  } catch (error) {
    console.error('Error generating static paths for articles:', error);
    // Return an empty array of paths in case of error
    return {
      paths: [],
      fallback: true
    };
  }
};

// This function gets called at build time on server-side
// It may also be called at request time for paths not pre-rendered at build
export const getStaticProps: GetStaticProps<ArticlePageProps> = async ({ params }) => {
  try {
    if (!params?.id) {
      return {
        props: {
          article: null,
          error: 'Article ID not provided'
        },
        // Revalidate the page every 1 hour (3600 seconds)
        revalidate: 3600
      };
    }
    
    // Fetch article data using the ID
    const article = await getArticleById(params.id as string);
    
    if (!article) {
      return {
        props: {
          article: null,
          error: 'Article not found'
        },
        // Revalidate not-found pages less frequently
        revalidate: 86400 // 24 hours
      };
    }
    
    return {
      props: {
        article,
        error: null
      },
      // Revalidate the page every 1 hour (3600 seconds)
      revalidate: 3600
    };
  } catch (error) {
    console.error('Error fetching article data:', error);
    return {
      props: {
        article: null,
        error: 'Failed to load article data'
      },
      // Revalidate error pages less frequently
      revalidate: 86400 // 24 hours
    };
  }
};

export default ArticlePage;
