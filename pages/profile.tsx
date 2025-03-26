import React, { useState, useRef, lazy, Suspense, useEffect } from 'react';
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
import { useReviews, Review, ReviewsResponse, SortOption, FilterOptions } from '../hooks/useReviews';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import RecommendedArticles from '../components/RecommendedArticles';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import useAppToast from '../hooks/useAppToast';
import useClient from '../hooks/useClient';
import { useProfileData, UserProfile } from '../hooks/useProfileData';
import FirebaseClientOnly from '../components/FirebaseClientOnly';

// Import panel components directly instead of using lazy loading
import ArticlesPanel from '../components/profile/ArticlesPanel';
import ReviewsPanel from '../components/profile/ReviewsPanel';
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

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

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
  const [isEditMode, setIsEditMode] = useState(false);
  const showToast = useAppToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.700');
  const { currentUser, authIsInitialized } = useAuth();
  const router = useRouter();
  const isClient = useClient();
  
  // Use the new useProfileData hook
  const { 
    profile, 
    isLoading, 
    error, 
    isProfileComplete, 
    updateProfile, 
    retryLoading 
  } = useProfileData();
  
  // State to track if a profile update toast has been shown in this session
  const [profileToastShown, setProfileToastShown] = useState<{
    complete: boolean;
    update: boolean;
  }>({
    complete: false,
    update: false
  });
  
  // Function to toggle edit mode
  const handleEditProfile = () => {
    setIsEditMode(true);
  };
  
  // Function to cancel edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
  };
  
  // Function to save profile edits - using the hook's updateProfile function
  const handleSaveProfile = async (updatedProfile: Partial<UserProfile>): Promise<boolean> => {
    try {
      // Check if we've already shown a toast in this session
      if (profileToastShown.update) {
        console.log('Profile: Skipping duplicate update toast');
      }
      
      // Update profile using the hook's function
      const success = await updateProfile(updatedProfile);
      
      if (success) {
        setIsEditMode(false);
        
        // Mark that we've shown the toast
        setProfileToastShown(prev => ({...prev, update: true}));
        
        showToast({
          id: 'profile-updated',
          title: "Profile updated",
          description: "Your profile has been successfully updated",
          status: "success",
          duration: 3000,
        });
        
        return true;
      } else {
        showToast({
          id: 'profile-save-error',
          title: "Error",
          description: "Failed to update profile. Please try again.",
          status: "error",
          duration: 3000,
        });
        
        return false;
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast({
        id: 'profile-save-error',
        title: "Error",
        description: "Failed to update profile. Please try again.",
        status: "error",
        duration: 3000,
      });
      
      return false;
    }
  };

  // Check for new signup from URL query parameter and show welcome toast
  useEffect(() => {
    if (!isClient) return;
    
    const isNewSignup = router.query.new === 'true';
    
    if (isNewSignup && !profileToastShown.complete && profile) {
      // Show welcome toast for new signups
      setProfileToastShown(prev => ({...prev, complete: true}));
      showToast({
        id: 'welcome-new-user',
        title: "Welcome to Researka!",
        description: "Please complete your profile to get started.",
        status: "success",
        duration: 5000,
      });
      
      // Automatically enter edit mode for new users
      if (!isProfileComplete) {
        setIsEditMode(true);
      }
    }
  }, [isClient, router.query, profile, isProfileComplete, profileToastShown.complete, showToast]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isClient) return;
    
    if (authIsInitialized && !currentUser) {
      console.log('Profile: No user logged in, redirecting to login page');
      router.replace('/login');
    }
  }, [isClient, authIsInitialized, currentUser, router]);

  // Handle retry button click
  const handleRetry = () => {
    retryLoading();
  };

  // Render loading state
  if (isLoading) {
    return (
      <Layout>
        <Center h="80vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text>Loading your profile...</Text>
          </VStack>
        </Center>
      </Layout>
    );
  }

  // Render error state
  if (error) {
    return (
      <Layout>
        <Container maxW="container.xl" py={8}>
          <ErrorState message={error} onRetry={handleRetry} />
        </Container>
      </Layout>
    );
  }

  // Render profile completion form if profile is not complete or in edit mode
  if (!isProfileComplete || isEditMode) {
    return (
      <Layout>
        <Container maxW="container.lg" py={8}>
          <Card bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden">
            <CardHeader bg="blue.500" color="white" p={4}>
              <ResponsiveText variant="h2">Complete Your Profile</ResponsiveText>
            </CardHeader>
            <CardBody p={6}>
              <FirebaseClientOnly fallback={<Center p={8}><Spinner size="xl" /></Center>}>
                <ProfileCompletionForm 
                  initialData={profile || undefined} 
                  onSave={handleSaveProfile} 
                  onCancel={handleCancelEdit}
                />
              </FirebaseClientOnly>
            </CardBody>
          </Card>
        </Container>
      </Layout>
    );
  }

  // Create custom versions of the panels with the required props
  const UserArticlesPanel = () => {
    const [articlesPage, setArticlesPage] = useState(1);
    // In a real implementation, you would fetch articles data here
    const articlesData = { 
      articles: [], 
      totalPages: 0,
      lastVisible: null,
      hasMore: false
    };
    
    return (
      <ArticlesPanel 
        articlesData={articlesData}
        currentPage={articlesPage}
        onPageChange={setArticlesPage}
        EmptyState={EmptyState}
        PaginationControl={PaginationControl}
      />
    );
  };
  
  const UserReviewsPanel = () => {
    const [reviewsPage, setReviewsPage] = useState(1);
    // In a real implementation, you would fetch reviews data here
    const reviewsData = { 
      reviews: [], 
      totalPages: 0,
      lastVisible: null,
      hasMore: false
    };
    
    return (
      <ReviewsPanel 
        reviewsData={reviewsData}
        currentPage={reviewsPage}
        onPageChange={setReviewsPage}
        EmptyState={EmptyState}
        PaginationControl={PaginationControl}
      />
    );
  };

  // Render full profile if complete
  return (
    <Layout>
      <Box as="main" bg={bgColor} minH="100vh">
        <Head>
          <title>Your Profile | Researka</title>
          <meta name="description" content="View and manage your research profile" />
        </Head>
        
        <Container maxW="container.xl" py={8}>
          {/* Profile Header */}
          <Card bg={cardBg} shadow="md" mb={8} borderRadius="lg" overflow="hidden">
            <CardHeader bg="blue.500" p={0}>
              <Box h="100px" bg="blue.500" />
            </CardHeader>
            <CardBody pt={0} px={6} pb={6}>
              <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'flex-start' }}>
                <Avatar 
                  size="xl" 
                  name={profile?.name || 'Researcher'} 
                  mt="-40px"
                  border="4px solid white"
                  bg="blue.500"
                  color="white"
                />
                <Box ml={{ base: 0, md: 6 }} mt={{ base: 4, md: 0 }} textAlign={{ base: 'center', md: 'left' }} flex="1">
                  <Flex align="center" justify={{ base: 'center', md: 'flex-start' }} wrap="wrap">
                    <ResponsiveText variant="h2" mr={2}>{profile?.name || 'Researcher'}</ResponsiveText>
                    <Badge colorScheme="green" fontSize="0.8em" p={1}>
                      {profile?.role || 'Researcher'}
                    </Badge>
                  </Flex>
                  <Text color="gray.600" fontSize="md" mt={1}>{profile?.institution || 'No institution'}</Text>
                  <Text color="gray.500" fontSize="sm" mt={1}>{profile?.department || ''} {profile?.position ? `• ${profile.position}` : ''}</Text>
                  
                  {/* Research Interests */}
                  <Flex mt={3} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
                    {profile?.researchInterests && profile.researchInterests.length > 0 ? (
                      profile.researchInterests.map((interest, index) => (
                        <Badge key={index} colorScheme="blue" variant="outline" mr={2} mb={2} px={2} py={1}>
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <Text fontSize="sm" color="gray.500">No research interests specified</Text>
                    )}
                  </Flex>
                </Box>
                
                <Flex mt={{ base: 4, md: 0 }} justify="flex-end">
                  <Button
                    leftIcon={<FiEdit />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={handleEditProfile}
                    size="sm"
                  >
                    Edit Profile
                  </Button>
                </Flex>
              </Flex>
              
              {/* Stats */}
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mt={6}>
                <Stat>
                  <StatLabel>Articles</StatLabel>
                  <StatNumber>{profile?.articles || 0}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Reviews</StatLabel>
                  <StatNumber>{profile?.reviews || 0}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Reputation</StatLabel>
                  <StatNumber>0</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Joined</StatLabel>
                  <StatNumber>
                    {profile?.createdAt 
                      ? new Date(profile.createdAt).toLocaleDateString() 
                      : 'Recently'}
                  </StatNumber>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>
          
          {/* Tabs */}
          <Tabs colorScheme="blue" index={activeTab} onChange={setActiveTab}>
            <TabList overflowX="auto" overflowY="hidden" whiteSpace="nowrap" css={{
              scrollbarWidth: 'none',
              '::-webkit-scrollbar': { display: 'none' },
            }}>
              <Tab><FiFileText style={{ marginRight: '8px' }} /> Articles</Tab>
              <Tab><FiStar style={{ marginRight: '8px' }} /> Reviews</Tab>
              <Tab><FiBookmark style={{ marginRight: '8px' }} /> Saved</Tab>
              <Tab><FiSettings style={{ marginRight: '8px' }} /> Settings</Tab>
            </TabList>
            <TabPanels>
              {/* Articles Tab */}
              <TabPanel p={0} pt={4}>
                <FirebaseClientOnly>
                  <UserArticlesPanel />
                </FirebaseClientOnly>
              </TabPanel>
              
              {/* Reviews Tab */}
              <TabPanel p={0} pt={4}>
                <FirebaseClientOnly>
                  <UserReviewsPanel />
                </FirebaseClientOnly>
              </TabPanel>
              
              {/* Saved Tab */}
              <TabPanel p={0} pt={4}>
                <Card p={6}>
                  <EmptyState type="Saved Articles" />
                </Card>
              </TabPanel>
              
              {/* Settings Tab */}
              <TabPanel p={0} pt={4}>
                <Card p={6}>
                  <VStack spacing={4} align="stretch">
                    <ResponsiveText variant="h3">Account Settings</ResponsiveText>
                    <Divider />
                    <Text>Account settings will be available soon.</Text>
                  </VStack>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    </Layout>
  );
};

export default ProfilePage;
