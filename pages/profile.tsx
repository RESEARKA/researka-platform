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
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const showToast = useAppToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.700');
  const { currentUser, getUserProfile, updateUserData, authIsInitialized, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const isClient = useClient();
  
  // Use ref to track ongoing operations and prevent duplicate calls
  const isUpdatingProfile = useRef(false);
  const isLoadingData = useRef(false);
  
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
  
  // Function to save profile edits - using ref to prevent duplicate calls
  const handleSaveProfile = async (updatedProfile: any) => {
    // Prevent duplicate save operations
    if (isUpdatingProfile.current) {
      console.log('Profile: Save operation already in progress, skipping duplicate call');
      return;
    }
    
    isUpdatingProfile.current = true;
    
    try {
      // Check if we've already shown a toast in this session
      if (profileToastShown.update) {
        console.log('Profile: Skipping duplicate update toast');
      }
      
      // Update user state
      const updatedUser = {...user, ...updatedProfile, profileComplete: true};
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
    } finally {
      // Reset the ref to allow future save operations
      isUpdatingProfile.current = false;
    }
  };

  // Load user profile data
  useEffect(() => {
    // Skip if not on client
    if (!isClient) {
      console.log('Profile: Not on client, skipping profile fetch');
      return;
    }

    // Show loading state while auth is initializing
    if (!authIsInitialized) {
      console.log('Profile: Auth not initialized yet, showing loading state');
      setIsLoading(true);
      return;
    }

    // If no user logged in after auth initialization, redirect to login page
    if (authIsInitialized && !currentUser) {
      console.log('Profile: Auth initialized but no user logged in, redirecting to login page');
      router.replace('/login');
      return;
    }

    const fetchUserProfile = async () => {
      // Prevent duplicate fetch operations
      if (isLoadingData.current) {
        console.log('Profile: Profile fetch already in progress, skipping duplicate call');
        return;
      }
      
      console.log('Profile: Starting to fetch user profile...');
      isLoadingData.current = true;
      setLoadingProfile(true);
      
      try {
        // Add a small delay to ensure Firebase is fully initialized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const userProfile = await getUserProfile();
        console.log('Profile: User profile fetched successfully:', userProfile);
        
        // Set the user data and profile completion status
        setUser(userProfile);
        setIsProfileComplete(userProfile?.profileComplete || false);
        
        // Check if this is a new signup from the URL query parameter
        const isNewSignup = router.query.new === 'true';
        
        // If the user profile doesn't exist yet, give it some time to be created
        if (!userProfile) {
          console.log('Profile: No user profile found, will retry...');
          if (retryCount < 5) { // Increased from 3 to 5 retries
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 1000);
          } else {
            // After max retries, assume it's a new user and initialize a blank profile
            console.log('Profile: Max retries reached, initializing blank profile');
            setIsEditMode(true);
          }
        } else if (isNewSignup && !profileToastShown.complete) {
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
          if (!userProfile.profileComplete) {
            setIsEditMode(true);
          }
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Profile: Error fetching user profile:', err);
        setError(`Failed to load profile: ${err.message}`);
        
        // After max retries with errors, attempt to initialize a blank profile
        if (retryCount >= 5) { // Increased from 3 to 5 retries
          setIsEditMode(true);
        }
      } finally {
        setIsLoading(false);
        setLoadingProfile(false);
        isLoadingData.current = false;
      }
    };

    fetchUserProfile();
  }, [isClient, authIsInitialized, currentUser, getUserProfile, router, retryCount, showToast, profileToastShown.complete]);
  
  // Check if user is logged in
  React.useEffect(() => {
    console.log('Profile: Effect running with:', {
      authIsInitialized,
      authLoading,
      currentUser: currentUser?.uid
    });

    // Always show loading state initially
    setIsLoading(true);
    setError(null);

    // Wait for auth to be ready
    if (!authIsInitialized) {
      console.log('Profile: Auth not initialized yet, waiting...');
      return;
    }

    // If no user, redirect to home
    if (!currentUser && authIsInitialized) {
      console.log('Profile: No user found, redirecting to home');
      router.replace('/');
      return;
    }

    // Load profile data with retry mechanism
    const loadData = async () => {
      // Prevent duplicate load operations
      if (isLoadingData.current) {
        console.log('Profile: Data loading already in progress, skipping duplicate call');
        return;
      }
      
      let retryCount = 0;
      const maxRetries = 2; // Reduced from 3 to 2
      
      const attemptLoad = async (): Promise<boolean> => {
        setIsLoading(true);
        isLoadingData.current = true;
        
        try {
          // Check if currentUser exists before accessing its properties
          if (!currentUser) {
            console.error('Profile: No user found during loading attempt');
            setError('User authentication error. Please try logging in again.');
            setIsLoading(false);
            isLoadingData.current = false;
            return false;
          }
          
          console.log(`Profile: Loading profile data for user (attempt ${retryCount + 1}):`, currentUser.uid);
          const success = await loadProfileData();
          
          if (!success) {
            console.error(`Profile: Failed to load profile data (attempt ${retryCount + 1})`);
            
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`Profile: Retrying (${retryCount}/${maxRetries})...`);
              // Wait before retrying - reduced from 1000ms to 300ms
              await new Promise(resolve => setTimeout(resolve, 300));
              return attemptLoad();
            } else {
              setError('Failed to load profile data after multiple attempts. Please try again.');
              setIsLoading(false); // Ensure loading state is turned off
              isLoadingData.current = false;
              return false;
            }
          }
          
          // Set loading to false on successful load
          setIsLoading(false);
          isLoadingData.current = false;
          return true;
        } catch (err) {
          console.error(`Profile: Error loading profile (attempt ${retryCount + 1}):`, err);
          
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Profile: Retrying (${retryCount}/${maxRetries})...`);
            // Wait before retrying - reduced from 1000ms to 300ms
            await new Promise(resolve => setTimeout(resolve, 300));
            return attemptLoad();
          } else {
            setError('An error occurred while loading your profile. Please try again.');
            setIsLoading(false); // Ensure loading state is turned off
            isLoadingData.current = false;
            return false;
          }
        } finally {
          // No longer needed as we're explicitly setting isLoading in each path
          // This ensures isLoading is always set correctly regardless of the path taken
          console.log(`Profile: Loading attempt ${retryCount + 1} completed`);
        }
      };
      
      await attemptLoad();
    };
    
    loadData();
  }, [authIsInitialized, currentUser, router]);
  
  // Load user profile data
  const loadProfileData = async () => {
    // Prevent duplicate load operations
    if (isLoadingData.current) {
      console.log('Profile: Profile data loading already in progress, skipping duplicate call');
      return true; // Return true to prevent retry loops
    }
    
    isLoadingData.current = true;
    
    try {
      if (!currentUser) {
        console.error('Profile: No user is logged in when trying to load profile data');
        isLoadingData.current = false;
        return false;
      }
      
      console.log('Profile: Loading user profile data for user:', currentUser.uid);
      const userProfile = await getUserProfile();
      
      if (userProfile) {
        console.log('Profile: User profile found:', userProfile);
        setUser(userProfile);
        setIsProfileComplete(!!userProfile.profileComplete);
        
        // If profile is not complete, show edit mode
        if (!userProfile.profileComplete) {
          console.log('Profile: Profile not complete, showing edit form');
          setIsEditMode(true);
        }
        isLoadingData.current = false;
        return true;
      } else {
        const result = await createDefaultProfile();
        isLoadingData.current = false;
        return result;
      }
    } catch (error) {
      console.error('Profile: Error loading profile data:', error);
      setError('Failed to load profile data. Please try again.');
      isLoadingData.current = false;
      return false;
    }
  };
  
  // Create a default profile if none exists
  const createDefaultProfile = async () => {
    try {
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
        profileComplete: false,
        hasChangedName: false,
        hasChangedInstitution: false,
        createdAt: new Date().toISOString()
      };
      
      try {
        // Save the default profile to Firestore
        console.log('Profile: Saving default profile to Firestore');
        const updateSuccess = await updateUserData(defaultProfile);
        setUser(defaultProfile);
        setIsProfileComplete(false);
        setIsEditMode(true);
        
        if (!updateSuccess) {
          console.warn('Profile: Failed to save default profile to Firestore');
          // Show a toast notification only once
          if (!showToast.isActive('profile-update-error')) {
            showToast({
              id: 'profile-update-error',
              title: 'Warning',
              description: 'Could not save profile to database. Changes may not persist.',
              status: 'warning',
              duration: 5000,
            });
          }
        }
        return true;
      } catch (updateError) {
        console.error('Profile: Error creating default profile:', updateError);
        
        // If we can't save to Firestore, at least set the local state
        setUser(defaultProfile);
        setIsProfileComplete(false);
        setIsEditMode(true);
        
        // Show a toast notification only once
        if (!showToast.isActive('profile-update-error')) {
          showToast({
            id: 'profile-update-error',
            title: 'Warning',
            description: 'Could not save profile to database. Changes may not persist.',
            status: 'warning',
            duration: 5000,
          });
        }
        return false;
      }
    } catch (error) {
      console.error('Profile: Error in createDefaultProfile:', error);
      setError('Failed to create profile. Please try again.');
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
      
      // Navigate to the home page after profile completion
      console.log('[ProfilePage] Navigating to home page after profile completion');
      router.push('/');
    } catch (error) {
      console.error('[ERROR] Error completing profile:', error);
      showToast({
        id: 'profile-completion-error',
        title: 'Error',
        description: 'Failed to complete profile. Please try again.',
        status: 'error',
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
  
  // For saved items, we're still using mock data
  // In a real app, this would be another React Query hook
  
  // Refs for intersection observer
  const articlesRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  
  // Use intersection observer to lazy load content
  const articlesVisible = useIntersectionObserver(articlesRef, { threshold: 0.1 });
  const reviewsVisible = useIntersectionObserver(reviewsRef, { threshold: 0.1 });
  
  // In a real app, you would fetch this data from your API
  const defaultUser: User = {
    name: "Alex Johnson",
    role: "Researcher",
    institution: "University of Science & Technology",
    articles: 5,
    reviews: 12,
    walletAddress: "",
    researchInterests: []
  };
  
  // If there's an error, show error state
  if (error) {
    return (
      <Layout title="Profile | RESEARKA" description="Your Researka profile" activePage="profile">
        <Box py={8} bg="gray.50" minH="calc(100vh - 64px)">
          <Container maxW="container.lg">
            <ErrorState 
              message={error} 
              onRetry={handleRetry} 
            />
          </Container>
        </Box>
      </Layout>
    );
  }

  // Show loading state while auth is initializing or data is loading
  if ((!authIsInitialized || isLoading || loadingProfile) && !isClient) {
    return (
      <Layout title="Profile | RESEARKA" description="Your Researka profile" activePage="profile">
        <Box py={8} bg="gray.50" minH="calc(100vh - 64px)">
          <Container maxW="container.lg">
            <Center h="50vh">
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" thickness="4px" />
                <Text fontSize="lg" fontWeight="medium">
                  Loading your profile...
                </Text>
              </VStack>
            </Center>
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
          {articlesLoading || reviewsLoading ? (
            <Center h="50vh">
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" thickness="4px" />
                <Text>Loading your content...</Text>
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
                  
                  <SimpleGrid columns={2} width="100%" textAlign="center" gap={4}>
                    <Stat>
                      <StatNumber>{user?.articles || 0}</StatNumber>
                      <StatLabel fontSize="xs">Articles</StatLabel>
                    </Stat>
                    <Stat>
                      <StatNumber>{user?.reviews || 0}</StatNumber>
                      <StatLabel fontSize="xs">Reviews</StatLabel>
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
                  </TabList>
                  
                  <TabPanels>
                    {/* My Articles Tab */}
                    <TabPanel>
                      <div ref={articlesRef}>
                        {activeTab === 0 && (
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
                        {activeTab === 1 && (
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
                        )}
                      </div>
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
