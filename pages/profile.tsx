import React, { useState, useRef, lazy, Suspense } from 'react';
import {
  Box,
  Container,
  Flex,
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
  Avatar,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
  Divider,
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
  Button,
} from '@chakra-ui/react';
import { FiEdit, FiFileText, FiStar, FiSettings, FiBookmark, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import ResponsiveText from '../components/ResponsiveText';
import { useArticles, Article, ArticlesResponse } from '../hooks/useArticles';
import { useReviews, Review, ReviewsResponse } from '../hooks/useReviews';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import RecommendedArticles from '../components/RecommendedArticles';

// Import panel components directly instead of using lazy loading
import ArticlesPanel from '../components/profile/ArticlesPanel';
import ReviewsPanel from '../components/profile/ReviewsPanel';
import SavedItemsPanel from '../components/profile/SavedItemsPanel';
import ProfileCompletionForm from '../components/ProfileCompletionForm';

// Dynamically import components that aren't needed for initial render
const MobileNav = dynamic(() => import('../components/MobileNav'), {
  ssr: true,
  loading: () => (
    <Box height="60px" width="100%" bg="white" borderBottom="1px" borderColor="gray.200">
      <Center height="100%">
        <Spinner size="sm" color="blue.500" />
      </Center>
    </Box>
  )
});

// Define types for our data
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
  walletAddress: string;
  researchInterests: string[];
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Mock data for saved items (would be replaced with a React Query hook in a real app)
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

// Empty state component
const EmptyState: React.FC<{ type: string }> = ({ type }) => (
  <Card p={6} textAlign="center">
    <VStack spacing={4}>
      <FiBookmark size={40} color="gray" />
      <ResponsiveText variant="h3">No {type} Found</ResponsiveText>
      <ResponsiveText variant="body-sm" color="gray.500">You don't have any {type.toLowerCase()} yet.</ResponsiveText>
      {type === "Articles" && (
        <Button
          as={Link}
          href="/submit"
          colorScheme="blue" 
          leftIcon={<FiFileText />}
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
          sx={{
            // Increase touch target size on mobile
            '@media (max-width: 768px)': {
              minHeight: '40px',
              minWidth: '40px',
            }
          }}
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
          sx={{
            // Increase touch target size on mobile
            '@media (max-width: 768px)': {
              minHeight: '40px',
              minWidth: '40px',
            }
          }}
        />
      </ButtonGroup>
    </Flex>
  );
};

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // Function to toggle edit mode
  const handleEditProfile = () => {
    setIsEditMode(true);
  };
  
  // Function to cancel edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
  };
  
  // Function to save profile edits
  const handleSaveProfile = (updatedProfile: any) => {
    setUser({...user, ...updatedProfile});
    localStorage.setItem('userProfile', JSON.stringify({...user, ...updatedProfile}));
    localStorage.setItem('profileComplete', 'true');
    setIsEditMode(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Check if user is logged in
  React.useEffect(() => {
    // Client-side only
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      
      if (isLoggedIn !== 'true') {
        // Redirect to homepage if not logged in
        window.location.href = '/';
        return;
      }
      
      // Check if profile is complete
      const profileComplete = localStorage.getItem('profileComplete');
      setIsProfileComplete(profileComplete === 'true');
      
      // Get user profile from localStorage
      const userProfileStr = localStorage.getItem('userProfile');
      if (userProfileStr) {
        try {
          const userProfile = JSON.parse(userProfileStr);
          setUser(userProfile);
          
          // If user profile exists and has required fields, consider profile complete
          if (userProfile && userProfile.name && userProfile.institution) {
            if (profileComplete !== 'true') {
              localStorage.setItem('profileComplete', 'true');
              setIsProfileComplete(true);
            }
          }
        } catch (e) {
          console.error('Error parsing user profile:', e);
          setError('Could not load user profile');
        }
      }
    }
  }, []);
  
  // Handle profile completion
  const handleProfileComplete = (profileData: any) => {
    setUser(profileData);
    setIsProfileComplete(true);
  };
  
  // State for pagination
  const [articlesPage, setArticlesPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [savedPage, setSavedPage] = useState(1);
  
  const itemsPerPage = 3;
  
  // Use React Query hooks for data fetching
  const { 
    data: articlesData, 
    isLoading: articlesLoading, 
    error: articlesError,
    refetch: refetchArticles
  } = useArticles(articlesPage);
  
  const { 
    data: reviewsData, 
    isLoading: reviewsLoading, 
    error: reviewsError,
    refetch: refetchReviews
  } = useReviews(reviewsPage);
  
  // For saved items, we're still using mock data
  // In a real app, this would be another React Query hook
  const isLoadingData = articlesLoading || reviewsLoading;
  const hasErrorData = articlesError || reviewsError;
  
  // Refs for intersection observer
  const articlesRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef<HTMLDivElement>(null);
  
  // Use intersection observer to lazy load content
  const articlesVisible = useIntersectionObserver(articlesRef, { threshold: 0.1 });
  const reviewsVisible = useIntersectionObserver(reviewsRef, { threshold: 0.1 });
  const savedVisible = useIntersectionObserver(savedRef, { threshold: 0.1 });
  
  // Calculate pagination for saved items
  const savedPages = Math.ceil(mockSaved.length / itemsPerPage);
  
  // Get current saved items
  const getCurrentItems = <T,>(items: T[], page: number): T[] => {
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };
  
  const currentSaved = getCurrentItems(mockSaved, savedPage);
  
  // Handle retry
  const handleRetry = () => {
    refetchArticles();
    refetchReviews();
    toast({
      title: 'Retrying...',
      description: 'Attempting to reload your profile data.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // In a real app, you would fetch this data from your API
  const defaultUser: User = {
    name: "Alex Johnson",
    role: "Researcher",
    institution: "University of Science & Technology",
    articles: 5,
    reviews: 12,
    reputation: 87,
    walletAddress: "",
    researchInterests: []
  };
  
  // If there's an error, show error state
  if (hasErrorData) {
    return (
      <Layout title="Profile | RESEARKA" description="Your Researka profile" activePage="profile">
        <Box py={8} bg="gray.50" minH="calc(100vh - 64px)">
          <Container maxW="container.lg">
            <ErrorState 
              message="Failed to load profile data. Please try again later." 
              onRetry={handleRetry} 
            />
          </Container>
        </Box>
      </Layout>
    );
  }
  
  // If profile is not complete or in edit mode, show the profile completion/edit form
  if (!isProfileComplete || isEditMode) {
    return (
      <Layout title={isEditMode ? "Edit Profile | RESEARKA" : "Complete Profile | RESEARKA"} 
              description={isEditMode ? "Edit your Researka profile" : "Complete your Researka profile"} 
              activePage="profile">
        <Box py={8} bg="gray.50" minH="calc(100vh - 64px)">
          <ProfileCompletionForm 
            onComplete={isEditMode ? handleSaveProfile : handleProfileComplete} 
            initialData={isEditMode ? user : undefined}
            isEditMode={isEditMode}
            onCancel={isEditMode ? handleCancelEdit : undefined}
          />
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout title="Profile | RESEARKA" description="Your Researka profile" activePage="profile">
      <Box py={8} bg="gray.50" minH="calc(100vh - 64px)">
        <Container maxW="container.lg">
          {isLoadingData ? (
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
                    name={user?.name || defaultUser.name} 
                    bg="purple.500"
                    color="white"
                    src=""
                  >
                    {user?.name?.charAt(0) || defaultUser.name.charAt(0)}
                  </Avatar>
                  
                  <VStack spacing={1}>
                    <ResponsiveText variant="h2">{user?.name || defaultUser.name}</ResponsiveText>
                    <ResponsiveText variant="body-sm" color="gray.600">{user?.role || defaultUser.role}</ResponsiveText>
                    <Badge colorScheme="green" mt={1}>{user?.institution || defaultUser.institution}</Badge>
                  </VStack>
                  
                  <SimpleGrid columns={3} width="100%" textAlign="center" gap={4}>
                    <Stat>
                      <StatNumber>{user?.articles || defaultUser.articles}</StatNumber>
                      <StatLabel fontSize="xs">Articles</StatLabel>
                    </Stat>
                    <Stat>
                      <StatNumber>{user?.reviews || defaultUser.reviews}</StatNumber>
                      <StatLabel fontSize="xs">Reviews</StatLabel>
                    </Stat>
                    <Stat>
                      <StatNumber>{user?.reputation || defaultUser.reputation}</StatNumber>
                      <StatLabel fontSize="xs">Rep</StatLabel>
                    </Stat>
                  </SimpleGrid>
                  
                  <Divider />
                  
                  <VStack width="100%" align="stretch" spacing={3}>
                    <Button 
                      leftIcon={<FiEdit />} 
                      size="sm" 
                      variant="outline"
                      onClick={handleEditProfile}
                    >
                      Edit Profile
                    </Button>
                    {/* Account Settings button - Commenting out as it's not needed for now */}
                    {/* <Button leftIcon={<FiSettings />} size="sm" variant="outline">
                      Account Settings
                    </Button> */}
                    <Button
                      as={Link}
                      href="/review"
                      leftIcon={<FiStar />} 
                      size="sm" 
                      variant="outline" 
                    >
                      Review
                    </Button>
                    <Button
                      as={Link}
                      href="/submit"
                      leftIcon={<FiFileText />} 
                      size="sm" 
                      variant="outline" 
                    >
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
                <Tabs 
                  isFitted 
                  variant="enclosed" 
                  onChange={(index) => setActiveTab(index)}
                >
                  <TabList>
                    <Tab><Flex alignItems="center"><FiFileText /><Text ml={2}>My Articles</Text></Flex></Tab>
                    <Tab><Flex alignItems="center"><FiStar /><Text ml={2}>My Reviews</Text></Flex></Tab>
                    <Tab><Flex alignItems="center"><FiBookmark /><Text ml={2}>Saved</Text></Flex></Tab>
                  </TabList>
                  
                  <TabPanels>
                    {/* My Articles Tab */}
                    <TabPanel>
                      <div ref={articlesRef}>
                        {articlesVisible && activeTab === 0 && (
                          <Suspense fallback={
                            <Center py={8}>
                              <Spinner size="md" color="blue.500" />
                            </Center>
                          }>
                            <ArticlesPanel 
                              articlesData={articlesData}
                              currentPage={articlesPage}
                              onPageChange={setArticlesPage}
                              EmptyState={EmptyState}
                              PaginationControl={PaginationControl}
                            />
                          </Suspense>
                        )}
                      </div>
                    </TabPanel>
                    
                    {/* My Reviews Tab */}
                    <TabPanel>
                      <div ref={reviewsRef}>
                        {reviewsVisible && activeTab === 1 && (
                          <Suspense fallback={
                            <Center py={8}>
                              <Spinner size="md" color="blue.500" />
                            </Center>
                          }>
                            <ReviewsPanel 
                              reviewsData={reviewsData}
                              currentPage={reviewsPage}
                              onPageChange={setReviewsPage}
                              EmptyState={EmptyState}
                              PaginationControl={PaginationControl}
                            />
                          </Suspense>
                        )}
                      </div>
                    </TabPanel>
                    
                    {/* Saved Articles Tab */}
                    <TabPanel>
                      <div ref={savedRef}>
                        {savedVisible && activeTab === 2 && (
                          <Suspense fallback={
                            <Center py={8}>
                              <Spinner size="md" color="blue.500" />
                            </Center>
                          }>
                            <SavedItemsPanel 
                              savedItems={currentSaved}
                              currentPage={savedPage}
                              totalPages={savedPages}
                              onPageChange={setSavedPage}
                              EmptyState={EmptyState}
                              PaginationControl={PaginationControl}
                            />
                          </Suspense>
                        )}
                      </div>
                    </TabPanel>
                    
                    {/* Recommended Articles Tab */}
                    <TabPanel>
                      <RecommendedArticles 
                        userId={user?.walletAddress || "user1"} 
                        userInterests={user?.researchInterests || []} 
                        limit={4}
                      />
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
            <ResponsiveText variant="caption" color="gray.500">
              &copy; {new Date().getFullYear()} Researka Platform. All rights reserved.
            </ResponsiveText>
            <ResponsiveText variant="caption" color="gray.400" mt={1}>
              A decentralized academic publishing solution built on zkSync
            </ResponsiveText>
          </Flex>
        </Container>
      </Box>
    </Layout>
  );
};

export default ProfilePage;
