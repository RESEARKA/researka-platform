import React, { useState, useEffect, useRef, Suspense } from 'react';
import { 
  Box, 
  Container, 
  VStack, 
  HStack,
  Text, 
  Flex, 
  Avatar, 
  Badge, 
  Button, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  Center, 
  Spinner, 
  useColorModeValue,
  Heading,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Divider,
  ButtonGroup,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { 
  FiEdit, 
  FiFileText, 
  FiStar, 
  FiRefreshCw, 
  FiAlertTriangle,
  FiLock,
  FiLogIn,
  FiBookmark,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
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

// Define types for our data
interface User {
  name: string;
  role: string;
  institution: string;
  articles: number;
  reviews: number;
  reputation: number;
  walletAddress?: string;
  researchInterests: string[];
  email?: string;
  department?: string;
  position?: string;
  profileComplete?: boolean;
  createdAt?: string;
  hasChangedName?: boolean;
  hasChangedInstitution?: boolean;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Empty state component
const EmptyState: React.FC<{ type: string }> = ({ type }) => (
  <Box p={6} textAlign="center">
    <VStack spacing={4}>
      <Icon as={FiBookmark} boxSize={10} />
      <ResponsiveText variant="h3">No {type} Found</ResponsiveText>
      <ResponsiveText variant="body-sm" color="gray.500">You don't have any {type.toLowerCase()} yet.</ResponsiveText>
      {type === "Articles" && (
        <Button 
          colorScheme="blue" 
          size="sm"
          as={Link}
          href="/submit"
        >
          Submit an Article
        </Button>
      )}
    </VStack>
  </Box>
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
      colorScheme="blue"
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
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const showToast = useAppToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.700');
  const { currentUser, getUserProfile, updateUserData, authIsInitialized, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
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
  
  // Function to save profile edits
  const handleSaveProfile = async (updatedProfile: any) => {
    try {
      console.log('Profile: handleSaveProfile called with:', updatedProfile);
      console.log('Profile: Current user data:', user);
      
      // Check if name or institution has changed
      const nameChanged = user?.name !== updatedProfile.name;
      const institutionChanged = user?.institution !== updatedProfile.institution;
      
      console.log('Profile: Name changed:', nameChanged, 'Institution changed:', institutionChanged);
      console.log('Profile: hasChangedName:', user?.hasChangedName, 'hasChangedInstitution:', user?.hasChangedInstitution);
      
      // Set flags if changed for the first time
      if (nameChanged && user?.hasChangedName !== true) {
        updatedProfile.hasChangedName = true;
        console.log('Profile: Setting hasChangedName to true');
      }
      
      if (institutionChanged && user?.hasChangedInstitution !== true) {
        updatedProfile.hasChangedInstitution = true;
        console.log('Profile: Setting hasChangedInstitution to true');
      }
      
      // Check if we've already shown a toast in this session
      if (profileToastShown.update) {
        console.log('Profile: Skipping duplicate update toast');
        return;
      }
      
      // Update user state
      const updatedUser = {...user, ...updatedProfile, profileComplete: true};
      console.log('Profile: Updated user data:', updatedUser);
      setUser(updatedUser);
      
      // Save to Firestore
      await updateUserData(updatedUser);
      
      setIsEditMode(false);
      setIsProfileComplete(true);
      
      // Mark that we've shown the toast
      setProfileToastShown(prev => ({...prev, update: true}));
      
      showToast({
        id: 'profile-updated',
        title: "Profile updated",
        description: "Your profile has been successfully updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast({
        id: 'profile-save-error',
        title: "Error",
        description: "Failed to update profile. Please try again.",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Load user profile data
  const loadProfileData = async (retryCount = 0, maxRetries = 3): Promise<boolean> => {
    console.log(`Profile: loadProfileData called, attempt ${retryCount + 1}/${maxRetries + 1}`);
    
    try {
      // Don't attempt to load if auth isn't initialized yet
      if (!authIsInitialized) {
        console.log('Profile: Auth not initialized yet, waiting...');
        return false;
      }
      
      // If no user is logged in, don't attempt to load
      if (!currentUser) {
        console.log('Profile: No current user, skipping data load');
        setIsLoading(false);
        return false;
      }
      
      setIsLoading(true);
      setError('');
      
      console.log('Profile: Attempting to get user profile data');
      const userData = await getUserProfile();
      
      if (userData) {
        console.log('Profile: User profile data loaded successfully', userData);
        setUser(userData);
        setIsProfileComplete(userData.profileComplete || false);
        setIsLoading(false);
        return true;
      } else {
        console.log('Profile: No user profile data found, creating default profile');
        // If no profile exists, create a default one
        const created = await createDefaultProfile();
        setIsLoading(false);
        return created;
      }
    } catch (error) {
      console.error('Profile: Error loading profile data:', error);
      
      // If we haven't exceeded max retries, try again after a delay
      if (retryCount < maxRetries) {
        console.log(`Profile: Retrying (${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => {
          loadProfileData(retryCount + 1, maxRetries);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return false;
      }
      
      // Max retries exceeded, show error
      console.error('Profile: Max retries exceeded, showing error');
      setError('Failed to load your profile. Please try again.');
      setIsLoading(false);
      return false;
    }
  };
  
  // Create a default profile if none exists
  const createDefaultProfile = async () => {
    try {
      console.log('Profile: createDefaultProfile called');
      
      if (!currentUser) {
        console.error('Profile: No currentUser available for createDefaultProfile');
        return false;
      }
      
      // Check if user profile already exists using getUserProfile
      console.log('Profile: Checking if user profile already exists');
      const existingProfile = await getUserProfile();
      
      if (existingProfile) {
        console.log('Profile: User profile already exists, using existing profile');
        setUser(existingProfile);
        setIsProfileComplete(existingProfile.profileComplete || false);
        return true;
      }
      
      console.log('Profile: No user profile found, creating default profile');
      // Create a default profile if none exists
      const defaultProfile: User = {
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        role: 'Researcher',
        institution: '',
        department: '',
        position: '',
        researchInterests: [],
        articles: 0,
        reviews: 0,
        reputation: 0,
        profileComplete: false,
        createdAt: new Date().toISOString(),
        hasChangedName: false,
        hasChangedInstitution: false
      };
      
      try {
        // Save the default profile to Firestore
        console.log('Profile: Saving default profile to Firestore:', defaultProfile);
        const updateSuccess = await updateUserData(defaultProfile);
        setUser(defaultProfile);
        setIsProfileComplete(false);
        setIsEditMode(true);
        return true;
      } catch (updateError) {
        console.error('Profile: Error saving default profile:', updateError);
        setError('Failed to create your profile. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Profile: Error in createDefaultProfile:', error);
      setError('An error occurred while creating your profile. Please try again.');
      return false;
    }
  };

  // Handle retry
  const handleRetry = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Refetch articles and reviews
      refetchArticles();
      refetchReviews();
      
      // Try to load profile data again
      const loadSuccess = await loadProfileData();
      
      if (loadSuccess) {
        showToast({
          id: 'profile-retry-success',
          title: 'Success',
          description: 'Profile data loaded successfully.',
          status: 'success',
          duration: 3000,
        });
      } else {
        setError('Failed to load profile data. Please try again.');
      }
    } catch (retryError) {
      console.error('Profile: Error in retry:', retryError);
      setError('Failed to reload data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle profile completion
  const handleProfileComplete = async (profileData: any) => {
    try {
      console.log('[ProfilePage] handleProfileComplete started');
      
      // Set a flag to indicate that a toast has been shown by the ProfileCompletionForm
      // This will prevent showing a duplicate toast here
      setProfileToastShown(prev => ({...prev, complete: true}));
      
      // Update user state with profile data and mark as complete
      const updatedProfile = {...profileData, profileComplete: true};
      setUser(updatedProfile);
      setIsProfileComplete(true);
      
      console.log('[ProfilePage] Saving profile data to Firestore');
      
      // Save to Firestore
      await updateUserData(updatedProfile);
      
      console.log('[ProfilePage] Profile data saved successfully');
      
      // No need to show another toast here as the ProfileCompletionForm already showed one
      
      // Navigate to the main dashboard or appropriate page after profile completion
      console.log('[ProfilePage] Navigating to dashboard');
      router.push('/dashboard');
    } catch (error) {
      console.error('[ERROR] Error completing profile:', error);
      showToast({
        id: 'profile-completion-error',
        title: "Error",
        description: "Failed to complete profile. Please try again.",
        status: "error",
        duration: 3000,
      });
    }
  };
  
  // State for pagination
  const [articlesPage, setArticlesPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewSort, setReviewSort] = useState<SortOption>('date_desc');
  const [reviewFilters, setReviewFilters] = useState<FilterOptions>({});
  
  const itemsPerPage = 5;
  
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
  } = useReviews(reviewsPage, 5, reviewSort, reviewFilters);
  
  // Debug logging for reviews data
  useEffect(() => {
    console.log('Profile: Reviews data from useReviews hook:', reviewsData);
    console.log('Profile: Reviews loading state:', reviewsLoading);
    console.log('Profile: Reviews error:', reviewsError);
    console.log('Profile: Current review filters:', reviewFilters);
    console.log('Profile: Current review sort:', reviewSort);
  }, [reviewsData, reviewsLoading, reviewsError, reviewFilters, reviewSort]);
  
  // Handlers for review filtering and sorting
  const handleReviewFilterChange = (filters: FilterOptions) => {
    console.log('Profile: Changing review filters to:', filters);
    setReviewFilters(filters);
    setReviewsPage(1); // Reset to first page when filters change
  };
  
  const handleReviewSortChange = (sortOption: SortOption) => {
    console.log('Profile: Changing review sort to:', sortOption);
    setReviewSort(sortOption);
    setReviewsPage(1); // Reset to first page when sort changes
  };
  
  // Add useEffect to trigger refetching when tab changes
  useEffect(() => {
    console.log('Profile: Active tab changed to:', activeTab);
    if (activeTab === 0) {
      console.log('Profile: Refetching articles data');
      refetchArticles();
    } else if (activeTab === 1) {
      console.log('Profile: Refetching reviews data');
      refetchReviews();
    }
  }, [activeTab, refetchArticles, refetchReviews]);
  
  // useEffect to load data when auth is initialized
  useEffect(() => {
    console.log('Profile: useEffect triggered. Auth initialized:', authIsInitialized, 'Current user:', !!currentUser);
    
    // Only attempt to load data if auth is initialized and we have a user
    if (authIsInitialized) {
      if (currentUser) {
        console.log('Profile: Auth initialized and user exists, loading data');
        loadProfileData();
      } else {
        console.log('Profile: Auth initialized but no user, clearing loading state');
        setIsLoading(false);
      }
    }
  }, [authIsInitialized, currentUser]);
  
  // Handle page navigation based on auth state
  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === 'undefined') {
      console.log('Profile: Running on server, skipping navigation effect');
      return;
    }
    
    console.log('Profile: Navigation effect triggered. Auth initialized:', authIsInitialized);
    
    if (authIsInitialized) {
      if (!currentUser) {
        console.log('Profile: No user logged in, redirecting to login');
        // Use setTimeout to avoid hydration errors by pushing navigation to next tick
        setTimeout(() => {
          router.push('/login');
        }, 0);
      }
    }
  }, [authIsInitialized, currentUser, router]);
  
  return (
    <Box as="main" minH="100vh" py={8} px={4} bg={bgColor}>
      {/* Early return for loading state */}
      {(!authIsInitialized || isLoading) && (
        <Center h="80vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text>Loading your profile...</Text>
          </VStack>
        </Center>
      )}
      
      {/* Early return for error state */}
      {error && !isLoading && (
        <Center h="80vh">
          <VStack spacing={4}>
            <Icon as={FiAlertTriangle} size={40} color="red" />
            <Text fontSize="xl" fontWeight="bold">Error</Text>
            <Text>{error}</Text>
            <Button 
              colorScheme="blue" 
              leftIcon={<FiRefreshCw />}
              onClick={() => {
                setError('');
                loadProfileData();
              }}
            >
              Try Again
            </Button>
          </VStack>
        </Center>
      )}
      
      {/* Early return for unauthenticated state */}
      {authIsInitialized && !currentUser && !isLoading && (
        <Center h="80vh">
          <VStack spacing={4}>
            <Icon as={FiLock} size={40} color="orange" />
            <Text fontSize="xl" fontWeight="bold">Authentication Required</Text>
            <Text>Please sign in to view your profile</Text>
            <Button 
              colorScheme="blue" 
              leftIcon={<FiLogIn />}
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
          </VStack>
        </Center>
      )}
      
      {/* Main content - only render when authenticated, initialized, and not loading */}
      {authIsInitialized && currentUser && !isLoading && !error && (
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Flex 
              justify="space-between" 
              align="center" 
              wrap="wrap"
              gap={4}
            >
              <Text as="h1" fontSize="xl">
                {isProfileComplete ? 'Your Profile' : 'Complete Your Profile'}
              </Text>
              
              {/* Action buttons */}
              <HStack spacing={4}>
                {isProfileComplete && !isEditMode && (
                  <Button 
                    leftIcon={<FiEdit />} 
                    colorScheme="blue" 
                    variant="outline"
                    onClick={() => setIsEditMode(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </HStack>
            </Flex>
            
            {/* Profile completion form or profile display */}
            {(isEditMode || !isProfileComplete) ? (
              <Box 
                p={6} 
                bg={cardBg} 
                borderRadius="lg" 
                boxShadow="md" 
                borderWidth="1px"
                borderColor={borderColor}
              >
                <ProfileCompletionForm 
                  initialData={user} 
                  onComplete={isEditMode ? handleSaveProfile : handleProfileComplete}
                  isEditMode={isEditMode}
                  onCancel={() => setIsEditMode(false)}
                />
              </Box>
            ) : (
              <Box 
                p={6} 
                bg={cardBg} 
                borderRadius="lg" 
                boxShadow="md" 
                borderWidth="1px"
                borderColor={borderColor}
              >
                <VStack spacing={6} align="center">
                  <Avatar 
                    size="2xl" 
                    name={user?.name || ''} 
                    bg="purple.500"
                    color="white"
                    src=""
                  >
                    {user?.name?.charAt(0) || ''}
                  </Avatar>
                  
                  <VStack spacing={1}>
                    <Text variant="h2">{user?.name || ''}</Text>
                    <Text variant="body-sm" color="gray.600">{user?.role || ''}</Text>
                    <Badge colorScheme="green" mt={1}>{user?.institution || ''}</Badge>
                  </VStack>
                  
                  <SimpleGrid columns={3} width="100%" textAlign="center" gap={4}>
                    <Stat>
                      <StatNumber>{user?.articles || 0}</StatNumber>
                      <StatLabel fontSize="xs">Articles</StatLabel>
                    </Stat>
                    <Stat>
                      <StatNumber>{user?.reviews || 0}</StatNumber>
                      <StatLabel fontSize="xs">Reviews</StatLabel>
                    </Stat>
                    <Stat>
                      <StatNumber>{user?.reputation || 0}</StatNumber>
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
            )}
            
            {/* Tabs for additional profile sections */}
            {isProfileComplete && !isEditMode && (
              <Tabs variant="enclosed" colorScheme="blue" isLazy>
                <TabList>
                  <Tab>Articles</Tab>
                  <Tab>Reviews</Tab>
                </TabList>
                
                <TabPanels>
                  <TabPanel>
                    <div ref={useRef<HTMLDivElement>(null)}>
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
                    </div>
                  </TabPanel>
                  <TabPanel>
                    <div ref={useRef<HTMLDivElement>(null)}>
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
                          onFilterChange={handleReviewFilterChange}
                          onSortChange={handleReviewSortChange}
                          currentSort={reviewSort}
                          currentFilters={reviewFilters}
                        />
                      </Suspense>
                    </div>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </VStack>
        </Container>
      )}
    </Box>
  );
};

export default ProfilePage;
