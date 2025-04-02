import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Heading,
  Stack,
  Text,
  Textarea,
  RadioGroup,
  Radio,
  useToast,
  VStack,
  HStack,
  Spinner,
  Divider,
  Image,
  Tag,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Checkbox,
  UnorderedList,
  ListItem,
  Center,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FiArrowLeft } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { useWallet } from '../../frontend/src/contexts/WalletContext';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Review } from '../../services/reviewService';

// Article interface
interface Article {
  id: string;
  title: string;
  abstract: string;
  content: string;
  author: string;
  date: string;
  compensation: string;
  keywords: string[];
}

// Form errors interface
interface FormErrors {
  overallRecommendation?: string;
  originalityRating?: string;
  significanceRating?: string;
  technicalQualityRating?: string;
  clarityRating?: string;
  relevanceRating?: string;
  commentsToAuthor?: string;
  openIdentity?: string;
  noConflictOfInterest?: string;
  agreedToGuidelines?: string;
}

const ReviewArticlePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { account } = useWallet();
  const toast = useToast();
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
  }, [auth]);

  // Form state
  const [overallRecommendation, setOverallRecommendation] = useState('');
  const [originalityRating, setOriginalityRating] = useState('3');
  const [significanceRating, setSignificanceRating] = useState('3');
  const [technicalQualityRating, setTechnicalQualityRating] = useState('3');
  const [clarityRating, setClarityRating] = useState('3');
  const [relevanceRating, setRelevanceRating] = useState('3');
  const [commentsToAuthor, setCommentsToAuthor] = useState('');
  const [confidentialComments, setConfidentialComments] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Validation and submission functions remain the same...

  // Render the page
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

        {isLoading ? (
          <Center py={10}>
            <VStack spacing={4}>
              <Spinner size="xl" />
              <Text>Loading article...</Text>
            </VStack>
          </Center>
        ) : error ? (
          <Box p={6} bg="red.50" borderRadius="md">
            <Heading as="h3" size="md" color="red.500" mb={2}>
              Error
            </Heading>
            <Text>{error}</Text>
          </Box>
        ) : article ? (
          <Box>
            {/* Article header */}
            <Box 
              position="relative" 
              height="250px" 
              mb={6} 
              borderRadius="lg" 
              overflow="hidden"
            >
              <Image 
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80" 
                alt={article?.title} 
                objectFit="cover" 
                width="100%" 
                height="100%" 
              />
              <Box 
                position="absolute" 
                bottom={0} 
                left={0} 
                right={0} 
                bg="rgba(0,0,0,0.7)" 
                p={6}
              >
                <Heading as="h1" size="xl" color="white">
                  {article?.title}
                </Heading>
                <HStack mt={2} spacing={4}>
                  <Text color="white">{article?.author}</Text>
                  <Text color="white">{article?.date}</Text>
                </HStack>
              </Box>
            </Box>

            {/* Main tabbed interface */}
            <Tabs 
              isFitted 
              variant="enclosed" 
              colorScheme="blue" 
              index={activeTab} 
              onChange={setActiveTab}
              mb={8}
            >
              <TabList mb="1em">
                <Tab fontWeight="semibold">Article Content</Tab>
                <Tab fontWeight="semibold">Review Form</Tab>
              </TabList>
              
              <TabPanels>
                {/* Tab 1: Article Content */}
                <TabPanel>
                  <Box 
                    bg="white" 
                    p={6} 
                    borderRadius="lg" 
                    boxShadow="sm" 
                    borderWidth="1px" 
                    borderColor="gray.200"
                  >
                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                      Abstract
                    </Text>
                    <Text mb={6}>{article?.abstract}</Text>
                    
                    <Divider my={6} />
                    
                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                      Full Paper
                    </Text>
                    <Box 
                      sx={{
                        'h1': { fontSize: '2xl', fontWeight: 'bold', my: 4 },
                        'h2': { fontSize: 'xl', fontWeight: 'bold', my: 3 },
                        'p': { my: 2 },
                        'ul, ol': { pl: 6, my: 2 },
                        'li': { my: 1 },
                      }}
                    >
                      {article?.content ? (
                        article.content.split('\n').map((line: string, index: number) => (
                          <Text key={index} whiteSpace="pre-wrap">
                            {line}
                          </Text>
                        ))
                      ) : (
                        <Text>No content available for this article.</Text>
                      )}
                    </Box>
                    
                    <Flex mt={6} gap={2} flexWrap="wrap">
                      {article?.keywords.map((keyword: string, index: number) => (
                        <Tag key={index} size="md" colorScheme="green" variant="subtle">
                          {keyword}
                        </Tag>
                      ))}
                    </Flex>
                    
                    <Box mt={8}>
                      <Button 
                        colorScheme="blue" 
                        size="lg" 
                        onClick={() => setActiveTab(1)}
                        width="100%"
                      >
                        Proceed to Review Form
                      </Button>
                    </Box>
                  </Box>
                </TabPanel>
                
                {/* Tab 2: Review Form */}
                <TabPanel>
                  <Box 
                    bg="white" 
                    p={6} 
                    borderRadius="lg" 
                    boxShadow="sm" 
                    borderWidth="1px" 
                    borderColor="gray.200"
                  >
                    <Heading as="h2" size="lg" mb={6}>
                      Submit Your Review
                    </Heading>
                    
                    <VStack spacing={6} align="stretch">
                      {/* Review form content - copied from original */}
                      {/* ... */}
                      
                      <Box mt={8}>
                        <Button 
                          colorScheme="green" 
                          size="lg" 
                          onClick={() => setActiveTab(0)}
                          width="100%"
                          mb={4}
                        >
                          Return to Article
                        </Button>
                      </Box>
                    </VStack>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        ) : null}
      </Container>
    </Layout>
  );
};

export default ReviewArticlePage;
