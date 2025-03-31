import React, { useState } from 'react';
import {
  Box,
  Container,
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
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiStar, FiCalendar, FiBookmark } from 'react-icons/fi';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { getUserAccessLevel, UserAccessLevel } from '../utils/accessLevels';

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
  
  // State for user submissions
  const [userSubmissions, setUserSubmissions] = useState<ReviewArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  // Get authentication context
  const { currentUser, getUserProfile } = useAuth();

  // Track if articles have been loaded
  const [articlesLoaded, setArticlesLoaded] = React.useState(false);

  // Track if profile has been checked
  const [profileChecked, setProfileChecked] = React.useState(false);
  const [accessLevel, setAccessLevel] = React.useState<UserAccessLevel>(UserAccessLevel.BASIC);

  // Function to load articles from Firebase
  const loadArticlesFromFirebase = async () => {
    if (loading || articlesLoaded) return; // Prevent duplicate loading
    
    setLoading(true);
    try {
      console.log('Review: Loading articles from Firebase');
      
      // Import the article service
      const { getArticlesForReview } = await import('../services/articleService');
      
      // Only proceed if currentUser is available
      if (!currentUser) {
        console.log('Review: User not logged in, unable to load articles');
        setUserSubmissions([]);
        setLoading(false);
        return;
      }
      
      // Get articles from Firebase, passing currentUser.uid to filter out own submissions
      const articles = await getArticlesForReview(currentUser.uid);
      console.log('Review: Loaded articles from Firebase:', articles);
      
      setUserSubmissions(articles);
      setArticlesLoaded(true); // Mark as loaded
      setError(null);
      
      if (articles.length === 0) {
        console.log('Review: No articles found');
        if (!toast.isActive('no-articles-info')) {
          toast({
            id: 'no-articles-info',
            title: 'No Articles',
            description: 'No articles are currently available for review',
            status: 'info',
            duration: 3000,
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

  // Check if user is logged in and has sufficient access level
  React.useEffect(() => {
    // Track retry attempts
    const maxRetries = 3;
    let retryCount = 0;
    let retryTimeout: NodeJS.Timeout | null = null;
    
    const checkUserProfile = async () => {
      if (currentUser) {
        try {
          console.log(`Review: Checking user profile... (Attempt ${retryCount + 1}/${maxRetries + 1})`);
          const profile = await getUserProfile();
          
          // Use the improved access level logic
          const userAccessLevel = getUserAccessLevel(profile);
          
          // Set the access level
          setAccessLevel(userAccessLevel);
          setProfileChecked(true);
          
          if (userAccessLevel === UserAccessLevel.BASIC) {
            console.log('Review: User has only BASIC access level');
            
            // If we haven't reached max retries, try again after a delay
            // This helps with potential database update delays
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`Review: Scheduling retry ${retryCount}/${maxRetries} in 1 second...`);
              
              retryTimeout = setTimeout(() => {
                checkUserProfile();
              }, 1000); // 1 second delay between retries
              
              return;
            }
            
            console.log('Review: User still has only BASIC access after retries, showing toast and redirecting');
            if (!toast.isActive('profile-completion-warning')) {
              toast({
                id: 'profile-completion-warning',
                title: 'Complete your profile',
                description: 'Please complete your name and role in your profile to access the review page',
                status: 'warning',
                duration: 5000,
                isClosable: true,
              });
            }
            
            // Redirect to profile page
            router.push('/profile');
          } else {
            console.log(`Review: User has ${userAccessLevel} access, proceeding to review page`);
            // Only load articles if user has sufficient access
            loadArticlesFromFirebase();
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
          setProfileChecked(true); // Mark as checked even on error
          
          // Handle specific error types
          const isFirebaseError = error && typeof error === 'object' && 'code' in error;
          
          if (isFirebaseError) {
            const firebaseError = error as { code: string };
            
            // Handle permission denied errors
            if (firebaseError.code === 'permission-denied') {
              if (!toast.isActive('profile-permission-error')) {
                toast({
                  id: 'profile-permission-error',
                  title: 'Access Error',
                  description: 'You do not have permission to access this resource. Please log in again.',
                  status: 'error',
                  duration: 7000,
                  isClosable: true,
                });
              }
              
              // Don't retry on permission errors - redirect to login
              router.push('/login');
              return;
            }
          }
          
          // Generic error handling for other error types
          if (!toast.isActive('profile-error')) {
            toast({
              id: 'profile-error',
              title: 'Error',
              description: 'Failed to load your profile. Please try again later.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
        }
      } else {
        setProfileChecked(true); // Mark as checked if no user
      }
    };
    
    if (router.isReady && currentUser && !profileChecked) {
      checkUserProfile();
    } else if (router.isReady && !currentUser) {
      setProfileChecked(true); // Mark as checked if no user
    }
    
    // Clean up any pending timeouts when component unmounts
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [router.isReady, toast, currentUser, getUserProfile, router, profileChecked]);

  // Load articles when the page loads and user has sufficient access
  React.useEffect(() => {
    // Only load articles if the user is logged in, router is ready, profile is checked, and user has sufficient access
    if (router.isReady && currentUser && profileChecked && accessLevel !== UserAccessLevel.BASIC && !articlesLoaded) {
      loadArticlesFromFirebase();
    }
  }, [router.isReady, currentUser, profileChecked, accessLevel, articlesLoaded]);

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
            <Box mb={6}>
              <Heading as="h1" size="xl" mb={2}>Review Articles</Heading>
              <Text color="gray.600" mt={2}>
                Contribute to academic quality by reviewing articles in your area of expertise.
                Earn tokens and reputation for each completed review.
              </Text>
            </Box>
            
            {/* Show loading or profile completion message if needed */}
            {!profileChecked ? (
              <VStack spacing={4} py={10}>
                <Text>Checking your profile...</Text>
                <Spinner />
              </VStack>
            ) : accessLevel === UserAccessLevel.BASIC ? (
              <VStack spacing={4} py={10}>
                <Text>Please complete your profile to access the review page.</Text>
                <Button 
                  colorScheme="blue" 
                  onClick={() => router.push('/profile')}
                >
                  Go to Profile
                </Button>
              </VStack>
            ) : (
              <>
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
              </>
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
