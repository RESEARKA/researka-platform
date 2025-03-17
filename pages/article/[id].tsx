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
  Link
} from '@chakra-ui/react';
import { FiArrowLeft, FiCalendar, FiEye } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { 
  ALL_ARTICLES, 
  BIOLOGY_ARTICLES, 
  PHYSICS_ARTICLES, 
  COMPUTER_SCIENCE_ARTICLES, 
  MATHEMATICS_ARTICLES 
} from '../../data/articles';

const ArticlePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<any>(null);
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
    if (id) {
      setLoading(true);
      // Find the article with the matching ID
      const articleId = parseInt(id as string, 10);
      const foundArticle = ALL_ARTICLES.find(article => article.id === articleId);
      
      if (foundArticle) {
        setArticle(foundArticle);
        setError(null);
      } else {
        setError('Article not found');
      }
      
      setLoading(false);
    }
  }, [id]);

  // Get the appropriate image URL based on the article's first category
  const getImageUrl = (article: any) => {
    if (!article || !article.categories || article.categories.length === 0) {
      return imageUrls.DEFAULT;
    }
    
    const category = article.categories[0];
    
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
            as="a"
            href="/"
          >
            Back
          </Button>
          
          <Image
            src={article.imageUrl || getImageUrl(article)}
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
              <Text fontSize="sm">{article.views} views</Text>
            </Flex>
          </HStack>
          
          <Text fontWeight="bold">Authors:</Text>
          <Text>{article.authors}</Text>
          
          <HStack spacing={2} wrap="wrap">
            {article.categories.map((category: string, index: number) => (
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
            <Heading as="h2" size="md" mb={4}>Full Paper</Heading>
            <Text color="gray.600">
              This is a placeholder for the full paper content. In a real application, this would contain the complete research paper with sections like Introduction, Methodology, Results, Discussion, and References.
            </Text>
            
            <VStack spacing={4} mt={6} align="stretch">
              <Heading as="h3" size="sm">Introduction</Heading>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.
              </Text>
              
              <Heading as="h3" size="sm">Methodology</Heading>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.
              </Text>
              
              <Heading as="h3" size="sm">Results</Heading>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.
              </Text>
              
              <Heading as="h3" size="sm">Discussion</Heading>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.
              </Text>
              
              <Heading as="h3" size="sm">References</Heading>
              <Text>
                1. Author, A. (2025). Title of paper. Journal Name, Volume(Issue), Pages.
                <br />
                2. Author, B. & Author, C. (2024). Title of another paper. Journal Name, Volume(Issue), Pages.
                <br />
                3. Author, D., Author, E., & Author, F. (2023). Title of third paper. Journal Name, Volume(Issue), Pages.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
};

export default ArticlePage;
