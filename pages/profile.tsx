import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Flex,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  Button,
} from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import useAppToast from '../hooks/useAppToast';
import useClient from '../hooks/useClient';
import { useProfileData, UserProfile } from '../hooks/useProfileData';
import { getUserAccessLevel, UserAccessLevel } from '../utils/accessLevels';

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
    updateProfile, 
    retryLoading,
    isLoadingData
  } = useProfileData();
  
  // Use the improved access level logic
  const accessLevel = getUserAccessLevel(profile);
  const isProfileComplete = accessLevel !== UserAccessLevel.BASIC;
  
  // State to track if a profile update toast has been shown in this session
  const [profileToastShown, setProfileToastShown] = useState({
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
        setProfileToastShown(prevState => ({...prevState, update: true}));
        
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
          id: 'profile-update-success',
          title: "Profile updated",
          description: "Your profile has been successfully updated",
          status: "success",
          duration: 3000,
        });
        
        return true;
      } else {
        // Reset flags on error
        isUpdatingProfile.current = false;
        if (isLoadingData) {
          isLoadingData.current = false;
        }
        
        showToast({
          id: 'profile-update-error',
          title: "Error",
          description: "Failed to update profile. Please try again.",
          status: "error",
          duration: 5000,
        });
        
        return false;
      }
    } catch (error) {
      // Reset flags on error
      isUpdatingProfile.current = false;
      if (isLoadingData) {
        isLoadingData.current = false;
      }
      
      console.error('Error updating profile:', error);
      
      showToast({
        id: 'profile-update-error',
        title: "Error",
        description: "An unexpected error occurred while updating your profile",
        status: "error",
        duration: 5000,
      });
      
      return false;
    }
  };
  
  // Effect to check profile completeness and show a toast if needed
  useEffect(() => {
    // Skip on server-side rendering
    if (!isClient) return;
    
    // Skip if we're still loading or there's no profile
    if (isLoading || !profile) return;
    
    // Skip if we've already shown the toast in this session
    if (profileToastShown.complete) return;
    
    // Skip if the profile is already complete
    if (isProfileComplete) return;
    
    // Show a toast if the profile is incomplete
    showToast({
      id: 'profile-incomplete',
      title: "Complete your profile",
      description: "Please complete your profile to access all features",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
    
    // Mark the toast as shown
    setProfileToastShown(prevState => ({...prevState, complete: true}));
    
    // The actual data loading is handled by the useProfileData hook
  }, [isClient, isLoading, profile, isProfileComplete, profileToastShown.complete, showToast]);
  
  // Clean up any timeouts on unmount
  useEffect(() => {
    return () => {
      if (profileUpdateTimeout.current) {
        clearTimeout(profileUpdateTimeout.current);
      }
    };
  }, []);

  // Show a loading state during SSR or when loading
  if (!isClient || isLoading) {
    return (
      <Layout>
        <Head>
          <title>Profile | DecentraJournal</title>
        </Head>
        <Container maxW="container.xl" py={8}>
          <Center py={10}>
            <VStack spacing={4}>
              <Spinner size="xl" />
              <Text>Loading profile...</Text>
            </VStack>
          </Center>
        </Container>
      </Layout>
    );
  }

  // Show error state if there's an error
  if (error && !isLoading) {
    return (
      <Layout>
        <Head>
          <title>Profile | DecentraJournal</title>
        </Head>
        <Container maxW="container.xl" py={8}>
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
              Error Loading Profile
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              {error}
            </AlertDescription>
            <Button
              mt={4}
              leftIcon={<FiRefreshCw />}
              colorScheme="red"
              onClick={retryLoading}
            >
              Retry
            </Button>
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Profile | DecentraJournal</title>
      </Head>
      
      <Container maxW="container.xl" py={8}>
        {/* Use the ClientOnlyProfile component for Firebase-dependent content */}
        <ClientOnlyProfile />
      </Container>
    </Layout>
  );
};

export default ProfilePage;
