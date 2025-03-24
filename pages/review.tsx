import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Flex,
  Heading,
  Text,
  VStack,
  Button,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  useColorModeValue,
  Tag,
  Avatar,
  Tooltip,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiStar, FiClock, FiCalendar, FiUser, FiBookmark, FiChevronDown } from 'react-icons/fi';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

// Define interface for review articles
interface ReviewArticle {
  id?: string | number;
  title: string;
  abstract: string;
  category: string;
  keywords: string[];
  author: string;
  date: string;
  compensation: string;
  status: string;
  createdAt?: any; // For Firebase Timestamp
}

const ReviewPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [userSubmissions, setUserSubmissions] = useState<ReviewArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const { currentUser, getUserProfile, updateUserData } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load user submissions from Firebase
  useEffect(() => {
    console.log('Review: Loading articles from Firebase');
    
    const loadArticlesFromFirebase = async () => {
      setLoading(true);
      try {
        // Import the article service
        const { getArticlesForReview } = await import('../services/articleService');
        
        // Only proceed if currentUser is available
        if (!currentUser) {
          console.log('Review: User not logged in, unable to load articles');
          setUserSubmissions([]);
          return;
        }
        
        // Get articles from Firebase, passing currentUser.uid to filter out own submissions
        const articles = await getArticlesForReview(currentUser.uid);
        console.log('Review: Articles loaded from Firebase:', articles);
        
        setUserSubmissions(articles);
        setError(null);
        
        if (articles.length === 0) {
          console.log('Review: No articles found for review');
          // Only show toast once for the warning
          if (!toast.isActive('no-articles-warning')) {
            toast({
              id: 'no-articles-warning',
              title: 'No Articles',
              description: 'No articles are currently available for review',
              status: 'info',
              duration: 5000,
              isClosable: true,
            });
          }
        }
      } catch (error) {
        console.error('Review: Error loading articles from Firebase:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load submitted articles';
        setError(errorMessage);
        
        // Only show toast once for the error
        if (!toast.isActive('article-load-error')) {
          toast({
            id: 'article-load-error',
            title: 'Error',
            description: errorMessage,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (router.isReady) {
      loadArticlesFromFirebase();
    }
  }, [router.isReady, toast, currentUser]);

  // Check if user is logged in and profile is complete
  React.useEffect(() => {
    const checkUserProfile = async () => {
      if (currentUser) {
        try {
          console.log('Review: Checking user profile...');
          const profile = await getUserProfile();
          setUserProfile(profile);
          
          // Check if profile is complete using the profileComplete flag
          if (!profile || profile.profileComplete !== true) {
            console.log('Review: Profile is not complete, showing toast and redirecting');
            toast({
              title: 'Complete your profile',
              description: 'Please complete your profile to submit articles for review',
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
            
            // Redirect to profile page
            router.push('/profile');
          } else {
            console.log('Review: Profile is complete, proceeding to review page');
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
        }
      }
    };
    
    if (currentUser) {
      checkUserProfile();
    }
  }, [currentUser, getUserProfile, updateUserData, router, toast]);
  
  // Function to manually refresh user submissions from Firebase
  const refreshUserSubmissions = async () => {
    setLoading(true);
    try {
      console.log('Review: Manually refreshing articles from Firebase');
      
      // Import the article service
      const { getArticlesForReview } = await import('../services/articleService');
      
      // Only proceed if currentUser is available
      if (!currentUser) {
        console.log('Review: User not logged in, unable to refresh articles');
        setUserSubmissions([]);
        setLoading(false);
        return;
      }
      
      // Get articles from Firebase, passing currentUser.uid to filter out own submissions
      const articles = await getArticlesForReview(currentUser.uid);
      console.log('Review: Refreshed articles from Firebase:', articles);
      
      setUserSubmissions(articles);
      setError(null);
      
      if (articles.length === 0) {
        console.log('Review: No articles found after refresh');
        toast({
          title: 'No Articles',
          description: 'No articles are currently available for review',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Refreshed',
          description: `Loaded ${articles.length} articles for review`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Review: Error refreshing articles from Firebase:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load submitted articles';
      setError(errorMessage);
      
      // Only show toast once for the error
      if (!toast.isActive('article-refresh-error')) {
        toast({
          id: 'article-refresh-error',
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Filter and sort articles based on user selections
  const filteredArticles = userSubmissions
    .filter(article => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          article.title.toLowerCase().includes(query) ||
          article.abstract.toLowerCase().includes(query) ||
          article.author.toLowerCase().includes(query) ||
          article.keywords.some(keyword => keyword.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter(article => {
      // Apply category filter
      if (categoryFilter !== 'all') {
        return article.category.toLowerCase() === categoryFilter.toLowerCase();
      }
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'compensation':
          return parseInt(b.compensation) - parseInt(a.compensation);
        default:
          return 0;
      }
    });

  return (
    <Layout title="Review Articles | Researka" description="Review academic articles on Researka" activePage="review">
      <Box py={8} bg="gray.50" minH="calc(100vh - 64px)">
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <Box>
              <Heading as="h1" size="xl" mb={6}>
                Review Articles
              </Heading>
              <Text color="gray.600" mt={2}>
                Contribute to academic quality by reviewing articles in your area of expertise.
                Earn tokens and reputation for each completed review.
              </Text>
            </Box>
            
            {/* Debug button - temporary */}
            <Button 
              size="sm" 
              colorScheme="gray" 
              mb={4} 
              onClick={refreshUserSubmissions}
            >
              Refresh Articles
            </Button>
            
            {/* Search and Filter Section */}
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              gap={4}
              bg={bgColor}
              p={6}
              borderRadius="lg"
              boxShadow="sm"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <InputGroup flex="2">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Search by title, author, or keywords" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              
              <Select 
                placeholder="Filter by category" 
                flex="1"
                icon={<FiFilter />}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="blockchain">Blockchain</option>
                <option value="academic publishing">Academic Publishing</option>
                <option value="research funding">Research Funding</option>
                <option value="bibliometrics">Bibliometrics</option>
              </Select>
              
              <Select 
                placeholder="Sort by" 
                flex="1"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Most Recent</option>
                <option value="compensation">Highest Compensation</option>
              </Select>
            </Flex>
            
            {/* Articles Grid */}
            {loading ? (
              <Box 
                textAlign="center" 
                py={10} 
                bg={bgColor}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Text fontSize="lg">Loading articles...</Text>
              </Box>
            ) : error ? (
              <Box 
                textAlign="center" 
                py={10} 
                bg={bgColor}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Text fontSize="lg">{error}</Text>
              </Box>
            ) : filteredArticles.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {filteredArticles.map(article => (
                  <Card 
                    key={article.id} 
                    bg={bgColor}
                    borderRadius="lg"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor={borderColor}
                    transition="transform 0.2s, box-shadow 0.2s"
                    _hover={{ transform: 'translateY(-4px)', boxShadow: 'md' }}
                  >
                    <CardHeader pb={0}>
                      <Flex justify="space-between" align="start">
                        <Heading size="md" noOfLines={2}>{article.title}</Heading>
                        <Tooltip label="Save for later">
                          <IconButton
                            aria-label="Save article"
                            icon={<FiBookmark />}
                            variant="ghost"
                            size="sm"
                          />
                        </Tooltip>
                      </Flex>
                    </CardHeader>
                    
                    <CardBody>
                      <Text noOfLines={3} fontSize="sm" color="gray.600">
                        {article.abstract}
                      </Text>
                      
                      <Flex mt={4} gap={2} flexWrap="wrap">
                        {article.keywords.map((keyword, index) => (
                          <Tag key={index} size="sm" colorScheme="green" variant="subtle">
                            {keyword}
                          </Tag>
                        ))}
                      </Flex>
                      
                      <Divider my={4} />
                      
                      <Flex align="center" mt={2}>
                        <Avatar size="xs" name={article.author} mr={2} />
                        <Text fontSize="sm">{article.author}</Text>
                      </Flex>
                      
                      <Flex mt={3} gap={4} fontSize="xs" color="gray.500">
                        <Flex align="center">
                          <FiCalendar size={12} style={{ marginRight: '4px' }} />
                          <Text>{article.date}</Text>
                        </Flex>
                      </Flex>
                    </CardBody>
                    
                    <CardFooter pt={0}>
                      <VStack spacing={2} align="stretch" width="100%">
                        <Flex justify="space-between" align="center">
                          <Badge colorScheme="green">{article.compensation}</Badge>
                          <Badge colorScheme="blue">{article.category}</Badge>
                        </Flex>
                        
                        <Button 
                          colorScheme="green" 
                          leftIcon={<FiStar />} 
                          size="sm" 
                          width="100%"
                          onClick={() => {
                            console.log(`Navigating to article review page: /review/${article.id}`);
                            router.push(`/review/${article.id}`);
                          }}
                        >
                          Review This Article
                        </Button>
                      </VStack>
                    </CardFooter>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Box 
                textAlign="center" 
                py={10} 
                bg={bgColor}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Text fontSize="lg">No articles match your search criteria.</Text>
                <Button 
                  mt={4} 
                  colorScheme="green" 
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </Box>
            )}
          </VStack>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box py={6} bg="white" borderTop="1px" borderColor="gray.200">
        <Container maxW="container.xl">
          <Flex justify="center" align="center" direction="column">
            <Text fontSize="sm" color="gray.500">
              &copy; {new Date().getFullYear()} Researka Platform. All rights reserved.
            </Text>
            <Text fontSize="xs" color="gray.400" mt={1}>
              A decentralized academic publishing solution built on zkSync
            </Text>
          </Flex>
        </Container>
      </Box>
    </Layout>
  );
};

export default ReviewPage;
