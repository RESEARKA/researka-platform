import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Flex,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Avatar,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  VStack,
  HStack,
  Divider,
  Link as ChakraLink,
  useColorModeValue,
  ButtonGroup,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  useToast,
} from '@chakra-ui/react';
import { FiEdit, FiFileText, FiStar, FiSettings, FiBookmark, FiChevronDown, FiChevronLeft, FiChevronRight, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '../components/NavBar';

// Define types for our data
interface Article {
  id: number;
  title: string;
  abstract: string;
  status: string;
  date: string;
}

interface Review {
  id: number;
  title: string;
  content: string;
  date: string;
}

interface SavedItem {
  id: number;
  title: string;
  abstract: string;
  date: string;
}

interface User {
  name: string;
  role: string;
  institution: string;
  articles: number;
  reviews: number;
  reputation: number;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Mock data for articles, reviews, and saved items
const mockArticles: Article[] = [
  {
    id: 1,
    title: "Blockchain Applications in Academic Publishing",
    abstract: "A comprehensive analysis of how blockchain technology can transform the academic publishing industry by improving transparency, reducing costs, and enabling new incentive models.",
    status: "Published",
    date: "March 10, 2025"
  },
  {
    id: 2,
    title: "Decentralized Identity in Academic Credentials",
    abstract: "Exploring how blockchain-based identity solutions can revolutionize academic credentials, making them more secure, portable, and verifiable.",
    status: "Published",
    date: "March 10, 2025"
  },
  {
    id: 3,
    title: "Smart Contracts for Peer Review Incentivization",
    abstract: "A framework for using smart contracts to create transparent and fair incentives for academic peer reviewers.",
    status: "Published",
    date: "March 10, 2025"
  },
  {
    id: 4,
    title: "Token Economics in Research Funding",
    abstract: "Analysis of how token-based economic models can create new paradigms for research funding and collaboration.",
    status: "Published",
    date: "March 8, 2025"
  },
  {
    id: 5,
    title: "Zero-Knowledge Proofs in Anonymous Peer Review",
    abstract: "How zero-knowledge cryptography can enable truly anonymous yet verifiable peer review processes.",
    status: "Published",
    date: "March 5, 2025"
  }
];

const mockReviews: Review[] = [
  {
    id: 1,
    title: "Review: Decentralized Identity in Academic Credentials",
    content: "This paper presents a novel approach to using blockchain for academic credentials. The methodology is sound, but more empirical evidence would strengthen the conclusions.",
    date: "March 8, 2025"
  },
  {
    id: 2,
    title: "Review: Smart Contracts for Peer Review Incentivization",
    content: "The proposed framework is innovative but lacks consideration of potential gaming of the system. More work is needed on anti-collusion mechanisms.",
    date: "March 5, 2025"
  },
  {
    id: 3,
    title: "Review: Token Economics in Research Funding",
    content: "Excellent analysis of token-based funding models. The comparative study of different approaches is particularly valuable.",
    date: "February 28, 2025"
  },
  {
    id: 4,
    title: "Review: Zero-Knowledge Proofs in Anonymous Peer Review",
    content: "The technical implementation is well-described, but more discussion of practical deployment challenges would improve the paper.",
    date: "February 25, 2025"
  }
];

const mockSaved: SavedItem[] = [
  {
    id: 1,
    title: "Decentralized Science: The Future of Research",
    abstract: "An exploration of how decentralized technologies are reshaping scientific research, funding, and collaboration.",
    date: "March 12, 2025"
  },
  {
    id: 2,
    title: "Web3 Publishing Platforms: A Comparative Analysis",
    abstract: "Comparing various Web3 publishing platforms and their impact on academic dissemination.",
    date: "March 10, 2025"
  },
  {
    id: 3,
    title: "Tokenized Citation Impact: Beyond Traditional Metrics",
    abstract: "Exploring how token-based citation systems can provide more nuanced measures of research impact.",
    date: "March 8, 2025"
  }
];

const ProfilePage: React.FC = () => {
  // State for pagination
  const [articlesPage, setArticlesPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [savedPage, setSavedPage] = useState(1);
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  
  const itemsPerPage = 3;
  
  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // If we had a real API, we would fetch data here
        // const response = await fetch('/api/profile');
        // const data = await response.json();
        
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setError('Failed to load profile data. Please try again later.');
        toast({
          title: 'Error loading data',
          description: 'There was a problem loading your profile data.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Calculate pagination
  const articlesPages = Math.ceil(mockArticles.length / itemsPerPage);
  const reviewsPages = Math.ceil(mockReviews.length / itemsPerPage);
  const savedPages = Math.ceil(mockSaved.length / itemsPerPage);
  
  // Get current items
  const getCurrentItems = <T,>(items: T[], page: number): T[] => {
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };
  
  const currentArticles = getCurrentItems(mockArticles, articlesPage);
  const currentReviews = getCurrentItems(mockReviews, reviewsPage);
  const currentSaved = getCurrentItems(mockSaved, savedPage);
  
  // Handle retry
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Data refreshed',
        description: 'Your profile data has been successfully loaded.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 1000);
  };
  
  // Empty state component
  const EmptyState: React.FC<{ type: string }> = ({ type }) => (
    <Card p={6} textAlign="center">
      <VStack spacing={4}>
        <FiBookmark size={40} color="gray" />
        <Heading size="md">No {type} Found</Heading>
        <Text color="gray.500">You don't have any {type.toLowerCase()} yet.</Text>
        {type === "Articles" && (
          <Button 
            colorScheme="blue" 
            leftIcon={<FiFileText />}
            as={Link}
            href="/submit"
          >
            Submit an Article
          </Button>
        )}
      </VStack>
    </Card>
  );
  
  // Error state component
  const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="200px"
      borderRadius="lg"
    >
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        Something went wrong
      </AlertTitle>
      <AlertDescription maxWidth="sm">
        {message}
      </AlertDescription>
      <Button 
        mt={4} 
        leftIcon={<FiRefreshCw />} 
        colorScheme="red" 
        onClick={onRetry}
      >
        Try Again
      </Button>
    </Alert>
  );
  
  // Pagination component
  const PaginationControl: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    
    return (
      <Flex justify="center" mt={4} alignItems="center">
        <ButtonGroup isAttached variant="outline" size="sm">
          <IconButton 
            aria-label="Previous page" 
            icon={<FiChevronLeft />} 
            isDisabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          />
          {pages.map(page => (
            <Button 
              key={page}
              colorScheme={currentPage === page ? "blue" : "gray"}
              variant={currentPage === page ? "solid" : "outline"}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
          <IconButton 
            aria-label="Next page" 
            icon={<FiChevronRight />} 
            isDisabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          />
        </ButtonGroup>
      </Flex>
    );
  };
  
  // In a real app, you would fetch this data from your API
  const user: User = {
    name: "Alex Johnson",
    role: "Researcher",
    institution: "University of Science & Technology",
    articles: 5,
    reviews: 12,
    reputation: 87
  };
  
  // Colors for light/dark mode
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // If there's an error, show error state
  if (error) {
    return (
      <>
        <Head>
          <title>Profile | RESEARKA</title>
          <meta name="description" content="Your Researka profile" />
        </Head>
        
        <NavBar 
          activePage="profile"
          isLoggedIn={true}
        />
        
        <Box py={8} bg="gray.50" minH="calc(100vh - 64px)">
          <Container maxW="container.lg">
            <ErrorState message={error} onRetry={handleRetry} />
          </Container>
        </Box>
      </>
    );
  }
  
  return (
    <>
      <Head>
        <title>Profile | RESEARKA</title>
        <meta name="description" content="Your Researka profile" />
      </Head>
      
      {/* Header/Navigation */}
      <NavBar 
        activePage="profile"
        isLoggedIn={true}
      />
      
      <Box py={8} bg="gray.50" minH="calc(100vh - 64px)">
        <Container maxW="container.lg">
          {isLoading ? (
            <Center h="50vh">
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" thickness="4px" />
                <Text>Loading your profile...</Text>
              </VStack>
            </Center>
          ) : (
            <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
              {/* Sidebar - User Info */}
              <Box 
                w={{ base: '100%', md: '30%' }}
                bg={bgColor}
                p={6}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <VStack spacing={6} align="center">
                  <Avatar 
                    size="2xl" 
                    name={user.name} 
                    bg="purple.500"
                    color="white"
                    src=""
                  >
                    AJ
                  </Avatar>
                  
                  <VStack spacing={1}>
                    <Heading as="h2" size="md">{user.name}</Heading>
                    <Text color="gray.600">{user.role}</Text>
                    <Badge colorScheme="green" mt={1}>{user.institution}</Badge>
                  </VStack>
                  
                  <SimpleGrid columns={3} width="100%" textAlign="center" gap={4}>
                    <Stat>
                      <StatNumber>{user.articles}</StatNumber>
                      <StatLabel fontSize="xs">Articles</StatLabel>
                    </Stat>
                    <Stat>
                      <StatNumber>{user.reviews}</StatNumber>
                      <StatLabel fontSize="xs">Reviews</StatLabel>
                    </Stat>
                    <Stat>
                      <StatNumber>{user.reputation}</StatNumber>
                      <StatLabel fontSize="xs">Rep</StatLabel>
                    </Stat>
                  </SimpleGrid>
                  
                  <Divider />
                  
                  <VStack width="100%" align="stretch" spacing={3}>
                    <Button leftIcon={<FiEdit />} size="sm" variant="outline">
                      Edit Profile
                    </Button>
                    <Button leftIcon={<FiSettings />} size="sm" variant="outline">
                      Account Settings
                    </Button>
                    <Button leftIcon={<FiStar />} size="sm" variant="outline" as={Link} href="/review">
                      Review
                    </Button>
                    <Button leftIcon={<FiFileText />} size="sm" variant="outline" as={Link} href="/submit">
                      Submit
                    </Button>
                  </VStack>
                </VStack>
              </Box>
              
              {/* Main Content */}
              <Box 
                w={{ base: '100%', md: '70%' }}
                bg={bgColor}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Tabs isFitted variant="enclosed">
                  <TabList>
                    <Tab><Flex alignItems="center"><FiFileText /><Text ml={2}>My Articles</Text></Flex></Tab>
                    <Tab><Flex alignItems="center"><FiStar /><Text ml={2}>My Reviews</Text></Flex></Tab>
                    <Tab><Flex alignItems="center"><FiBookmark /><Text ml={2}>Saved</Text></Flex></Tab>
                  </TabList>
                  
                  <TabPanels>
                    {/* My Articles Tab */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        {currentArticles.length > 0 ? (
                          currentArticles.map((article: Article) => (
                            <Card key={article.id}>
                              <CardHeader>
                                <Heading size="md">{article.title}</Heading>
                              </CardHeader>
                              <CardBody>
                                <Text>{article.abstract}</Text>
                              </CardBody>
                              <CardFooter>
                                <Flex justify="space-between" width="100%">
                                  <Badge colorScheme="green">{article.status}</Badge>
                                  <Text fontSize="sm" color="gray.500">{article.date}</Text>
                                </Flex>
                              </CardFooter>
                            </Card>
                          ))
                        ) : (
                          <EmptyState type="Articles" />
                        )}
                        
                        {articlesPages > 1 && (
                          <PaginationControl 
                            currentPage={articlesPage} 
                            totalPages={articlesPages} 
                            onPageChange={setArticlesPage} 
                          />
                        )}
                      </VStack>
                    </TabPanel>
                    
                    {/* My Reviews Tab */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        {currentReviews.length > 0 ? (
                          currentReviews.map((review: Review) => (
                            <Card key={review.id}>
                              <CardHeader>
                                <Heading size="md">{review.title}</Heading>
                              </CardHeader>
                              <CardBody>
                                <Text>{review.content}</Text>
                              </CardBody>
                              <CardFooter>
                                <Flex justify="space-between" width="100%">
                                  <Badge colorScheme="blue">Completed</Badge>
                                  <Text fontSize="sm" color="gray.500">{review.date}</Text>
                                </Flex>
                              </CardFooter>
                            </Card>
                          ))
                        ) : (
                          <EmptyState type="Reviews" />
                        )}
                        
                        {reviewsPages > 1 && (
                          <PaginationControl 
                            currentPage={reviewsPage} 
                            totalPages={reviewsPages} 
                            onPageChange={setReviewsPage} 
                          />
                        )}
                      </VStack>
                    </TabPanel>
                    
                    {/* Saved Articles Tab */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        {currentSaved.length > 0 ? (
                          currentSaved.map((item: SavedItem) => (
                            <Card key={item.id}>
                              <CardHeader>
                                <Heading size="md">{item.title}</Heading>
                              </CardHeader>
                              <CardBody>
                                <Text>{item.abstract}</Text>
                              </CardBody>
                              <CardFooter>
                                <Flex justify="space-between" width="100%">
                                  <Badge>Saved</Badge>
                                  <Text fontSize="sm" color="gray.500">Saved on {item.date}</Text>
                                </Flex>
                              </CardFooter>
                            </Card>
                          ))
                        ) : (
                          <EmptyState type="Saved Items" />
                        )}
                        
                        {savedPages > 1 && (
                          <PaginationControl 
                            currentPage={savedPage} 
                            totalPages={savedPages} 
                            onPageChange={setSavedPage} 
                          />
                        )}
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </Flex>
          )}
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
    </>
  );
};

export default ProfilePage;
