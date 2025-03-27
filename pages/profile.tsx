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
  Heading,
} from '@chakra-ui/react';
import { FiEdit, FiFileText, FiStar, FiSettings, FiBookmark, FiChevronLeft, FiChevronRight, FiRefreshCw, FiUser, FiX } from 'react-icons/fi';
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

// Dynamically import Firebase-dependent components with SSR disabled
const ClientOnlyProfile = dynamic(
  () => import('../components/ClientOnlyProfile'),
  { ssr: false, loading: () => <Center py={10}><Spinner size="xl" /></Center> }
);

// Dynamically import ProfileCompletionForm with SSR disabled
const ProfileCompletionForm = dynamic(
  () => import('../components/ProfileCompletionForm'),
  { ssr: false, loading: () => <Center py={10}><Spinner size="xl" /></Center> }
);

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

// Dynamically import Firebase-dependent components with SSR disabled
const FirebaseClientOnly = dynamic(
  () => import('../components/FirebaseClientOnly'),
  { ssr: false, loading: () => <Center py={10}><Spinner size="xl" /></Center> }
);

const ArticlesPanel = dynamic(
  () => import('../components/profile/ArticlesPanel'),
  { ssr: false, loading: () => <Center py={10}><Spinner size="xl" /></Center> }
);

const ReviewsPanel = dynamic(
  () => import('../components/profile/ReviewsPanel'),
  { ssr: false, loading: () => <Center py={10}><Spinner size="xl" /></Center> }
);

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
  const { currentUser, authIsInitialized } = useAuth();
  const router = useRouter();
  const isClient = useClient();
  const showToast = useAppToast();
  
  // Create refs to prevent duplicate operations
  const isUpdatingProfile = useRef(false);
  const isInitialMount = useRef(true);
  const profileUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Use the useProfileData hook
  const { 
    profile, 
    isLoading, 
    error, 
    isProfileComplete, 
    updateProfile, 
    retryLoading,
    isLoadingData
  } = useProfileData();
  
  // State to track if a profile update toast has been shown in this session
  const [profileToastShown, setProfileToastShown] = useState<{
    complete: boolean;
    update: boolean;
  }>({
    complete: false,
    update: false
  });
  
  // Function to save profile edits - using the hook's updateProfile function
  const handleSaveProfile = async (updatedProfile: Partial<UserProfile>): Promise<boolean> => {
    // Prevent duplicate updates
    if (isUpdatingProfile.current) {
      console.log('Profile: Update already in progress, skipping duplicate request');
      return false;
    }
    
    try {
      // Set the updating flag to prevent duplicate data loading
      isUpdatingProfile.current = true;
      
      // If the hook also has a loading flag, set it
      if (isLoadingData) {
        isLoadingData.current = true;
      }
      
      // Check if name or institution changed and handle special cases
      const nameChanged = profile?.name !== updatedProfile.name;
      const institutionChanged = profile?.institution !== updatedProfile.institution;
      
      // Apply business rules for name/institution changes
      if (nameChanged && profile?.hasChangedName !== true) {
        updatedProfile.hasChangedName = true;
      }
      
      if (institutionChanged && profile?.hasChangedInstitution !== true) {
        updatedProfile.hasChangedInstitution = true;
      }
      
      // Check if we've already shown a toast in this session
      if (profileToastShown.update) {
        console.log('Profile: Skipping duplicate update toast');
      }
      
      // Update profile using the hook's function
      const success = await updateProfile(updatedProfile);
      
      if (success) {
        // Batch state updates to prevent multiple re-renders
        setProfileToastShown(prev => ({...prev, update: true}));
        
        // Clear any existing timeout
        if (profileUpdateTimeout.current) {
          clearTimeout(profileUpdateTimeout.current);
        }
        
        // Set a timeout to reset the updating flag after a delay
        // This prevents immediate re-fetching of profile data
        profileUpdateTimeout.current = setTimeout(() => {
          isUpdatingProfile.current = false;
          if (isLoadingData) {
            isLoadingData.current = false;
          }
          profileUpdateTimeout.current = null;
        }, 1000);
        
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
    } finally {
      // If there's no timeout active, reset the flags immediately
      if (!profileUpdateTimeout.current) {
        isUpdatingProfile.current = false;
        if (isLoadingData) {
          isLoadingData.current = false;
        }
      }
    }
  };
  
  // Add an effect to prevent duplicate data loading during profile updates
  useEffect(() => {
    // Skip if not initialized or no user
    if (!authIsInitialized || !currentUser) {
      return;
    }
    
    // Skip on initial mount since useProfileData will load data
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Skip if we're currently updating the profile
    if (isUpdatingProfile.current) {
      console.log('Profile: Skipping loadData during update');
      return;
    }
    
    // The actual data loading is handled by the useProfileData hook
  }, [authIsInitialized, currentUser]);
  
  // Clean up any timeouts on unmount
  useEffect(() => {
    return () => {
      if (profileUpdateTimeout.current) {
        clearTimeout(profileUpdateTimeout.current);
      }
    };
  }, []);

  return (
    <Layout>
      <Head>
        <title>Profile | Researka</title>
      </Head>
      
      <Container maxW="container.xl" py={8}>
        {/* Use the ClientOnlyProfile component for Firebase-dependent content */}
        <ClientOnlyProfile />
        
        {/* Remove the duplicate rendering of profile content */}
        {/* The ClientOnlyProfile component will handle all Firebase-dependent rendering */}
      </Container>
    </Layout>
  );
};

export default ProfilePage;
