import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Spinner,
  Center,
  Flex,
  Text,
  Avatar,
  Badge,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiEdit, FiFileText, FiStar, FiUser, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useProfileData, UserProfile } from '../hooks/useProfileData';
import ProfileCompletionForm from './ProfileCompletionForm';
import useClient from '../hooks/useClient';
import ResponsiveText from './ResponsiveText';
import ArticlesPanel from './profile/ArticlesPanel';
import ReviewsPanel from './profile/ReviewsPanel';
import useAppToast from '../hooks/useAppToast';

// Define components needed for panels
const EmptyState: React.FC<{ type: string }> = ({ type }) => (
  <Box textAlign="center" py={10}>
    <Text fontSize="lg" fontWeight="medium" mb={2}>No {type} Found</Text>
    <Text color="gray.500">You haven't created any {type.toLowerCase()} yet.</Text>
  </Box>
);

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControl: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <Flex justify="center" mt={6}>
      <Button 
        size="sm" 
        onClick={() => onPageChange(currentPage - 1)} 
        isDisabled={currentPage === 1}
        mr={2}
      >
        Previous
      </Button>
      <Text alignSelf="center" mx={2}>
        Page {currentPage} of {totalPages}
      </Text>
      <Button 
        size="sm" 
        onClick={() => onPageChange(currentPage + 1)} 
        isDisabled={currentPage === totalPages}
        ml={2}
      >
        Next
      </Button>
    </Flex>
  );
};

/**
 * Client-only wrapper for profile-related components
 * This ensures Firebase is only initialized on the client side
 */
const ClientOnlyProfile: React.FC = () => {
  // Component state
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [localLoadingState, setLocalLoadingState] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'updating' | 'success' | 'error'>('idle');
  
  // UI helpers
  const showToast = useAppToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // Create refs to prevent duplicate operations
  const isUpdatingProfile = useRef(false);
  const profileUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const lastUpdateTime = useRef<number>(0);
  
  // Auth and profile data
  const { currentUser, authIsInitialized } = useAuth();
  const { 
    profile, 
    isLoading, 
    error, 
    isProfileComplete, 
    updateProfile, 
    retryLoading,
    isLoadingData
  } = useProfileData();
  const isClient = useClient();

  // Set up component mount/unmount tracking
  useEffect(() => {
    console.log('ClientOnlyProfile: Component mounted');
    isMounted.current = true;
    
    return () => {
      console.log('ClientOnlyProfile: Component unmounting');
      isMounted.current = false;
      
      // Clean up any timeouts on unmount
      if (profileUpdateTimeout.current) {
        clearTimeout(profileUpdateTimeout.current);
        profileUpdateTimeout.current = null;
      }
    };
  }, []);

  // Batch state updates to minimize renders
  const batchStateUpdate = useCallback((updates: () => void) => {
    if (isMounted.current) {
      updates();
    }
  }, []);

  // Function to toggle edit mode with debounce protection
  const handleEditProfile = useCallback(() => {
    if (isUpdatingProfile.current) {
      console.log('ClientOnlyProfile: Update in progress, ignoring edit request');
      return;
    }
    
    // Prevent rapid toggling of edit mode
    const now = Date.now();
    if (now - lastUpdateTime.current < 1000) {
      console.log('ClientOnlyProfile: Edit request too soon after last action, ignoring');
      return;
    }
    
    lastUpdateTime.current = now;
    setIsEditMode(true);
  }, []);
  
  // Function to cancel edit mode
  const handleCancelEdit = useCallback(() => {
    // Prevent rapid toggling of edit mode
    const now = Date.now();
    if (now - lastUpdateTime.current < 1000) {
      console.log('ClientOnlyProfile: Cancel request too soon after last action, ignoring');
      return;
    }
    
    lastUpdateTime.current = now;
    setIsEditMode(false);
  }, []);
  
  // Function to save profile edits with enhanced error handling and state management
  const handleSaveProfile = useCallback(async (updatedProfile: Partial<UserProfile>): Promise<boolean> => {
    // Prevent duplicate updates
    if (isUpdatingProfile.current) {
      console.log('ClientOnlyProfile: Update already in progress, skipping duplicate request');
      return false;
    }
    
    // Prevent rapid save operations
    const now = Date.now();
    if (now - lastUpdateTime.current < 1000) {
      console.log('ClientOnlyProfile: Save request too soon after last action, ignoring');
      return false;
    }
    
    lastUpdateTime.current = now;
    
    // Set local loading state for UI feedback
    batchStateUpdate(() => {
      setLocalLoadingState(true);
      setUpdateStatus('updating');
    });
    
    try {
      // Set the updating flag to prevent duplicate data loading
      isUpdatingProfile.current = true;
      
      // If the hook also has a loading flag, set it
      if (isLoadingData) {
        isLoadingData.current = true;
      }
      
      // Create a complete profile update object with all necessary fields
      const completeProfileUpdate = { ...updatedProfile };
      
      // Check if name or institution changed and handle special cases
      const nameChanged = profile?.name !== updatedProfile.name;
      const institutionChanged = profile?.institution !== updatedProfile.institution;
      
      // Apply business rules for name/institution changes
      if (nameChanged && profile?.hasChangedName !== true) {
        completeProfileUpdate.hasChangedName = true;
      }
      
      if (institutionChanged && profile?.hasChangedInstitution !== true) {
        completeProfileUpdate.hasChangedInstitution = true;
      }
      
      // Ensure profileComplete is set
      if (!completeProfileUpdate.profileComplete) {
        completeProfileUpdate.profileComplete = true;
      }
      
      console.log('ClientOnlyProfile: Updating profile with data:', completeProfileUpdate);
      
      // Attempt to update the profile with retry logic
      let success = false;
      let attempts = 0;
      const maxAttempts = 2;
      
      while (attempts < maxAttempts && !success) {
        try {
          success = await updateProfile(completeProfileUpdate);
          if (success) break;
          
          // Wait before retrying
          if (attempts < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`ClientOnlyProfile: Error in profile update attempt ${attempts + 1}:`, error);
        }
        attempts++;
      }
      
      if (success) {
        // Exit edit mode and show success message
        // Use a batch update function to minimize renders
        batchStateUpdate(() => {
          setIsEditMode(false);
          setLocalLoadingState(false);
          setUpdateStatus('success');
        });
        
        // Clear any existing timeout
        if (profileUpdateTimeout.current) {
          clearTimeout(profileUpdateTimeout.current);
        }
        
        // Set a timeout to reset the updating flag after a delay
        // This prevents immediate re-fetching of profile data
        profileUpdateTimeout.current = setTimeout(() => {
          if (!isMounted.current) return;
          
          isUpdatingProfile.current = false;
          if (isLoadingData) {
            isLoadingData.current = false;
          }
          
          batchStateUpdate(() => {
            setUpdateStatus('idle');
          });
          
          profileUpdateTimeout.current = null;
          console.log('ClientOnlyProfile: Update lock released after timeout');
        }, 1500); // Increased timeout to ensure all operations complete
        
        showToast({
          id: 'profile-updated',
          title: "Profile updated",
          description: "Your profile has been successfully updated",
          status: "success",
          duration: 3000,
        });
        
        return true;
      } else {
        // Show error message for failed update
        batchStateUpdate(() => {
          setLocalLoadingState(false);
          setUpdateStatus('error');
        });
        
        showToast({
          id: 'profile-save-error',
          title: "Error",
          description: `Failed to update profile after ${maxAttempts} attempts. Please try again.`,
          status: "error",
          duration: 5000,
        });
        
        // Reset the updating flag after a delay
        if (profileUpdateTimeout.current) {
          clearTimeout(profileUpdateTimeout.current);
        }
        
        profileUpdateTimeout.current = setTimeout(() => {
          if (!isMounted.current) return;
          
          isUpdatingProfile.current = false;
          if (isLoadingData) {
            isLoadingData.current = false;
          }
          
          batchStateUpdate(() => {
            setUpdateStatus('idle');
          });
          
          profileUpdateTimeout.current = null;
        }, 1000);
        
        return false;
      }
    } catch (error) {
      console.error('ClientOnlyProfile: Error saving profile:', error);
      
      // Enhanced error handling with more detailed messages
      let errorMessage = "Failed to update profile. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
        console.error('ClientOnlyProfile: Error details:', error.stack);
      }
      
      batchStateUpdate(() => {
        setLocalLoadingState(false);
        setUpdateStatus('error');
      });
      
      showToast({
        id: 'profile-save-error',
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });
      
      return false;
    } finally {
      // If there's no timeout active, reset the flags immediately
      if (!profileUpdateTimeout.current) {
        isUpdatingProfile.current = false;
        if (isLoadingData) {
          isLoadingData.current = false;
        }
        
        batchStateUpdate(() => {
          setLocalLoadingState(false);
        });
      }
    }
  }, [profile, updateProfile, showToast, batchStateUpdate, isLoadingData]);
  
  // Show loading state when not on client or auth is initializing
  if (!isClient || !authIsInitialized) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Initializing...</Text>
        </VStack>
      </Center>
    );
  }
  
  // Show loading state when profile data is loading
  if (isLoading || localLoadingState) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>{localLoadingState ? "Updating profile..." : "Loading profile data..."}</Text>
        </VStack>
      </Center>
    );
  }

  // Show error state with retry button
  if (error) {
    return (
      <Box p={5} borderWidth={1} borderRadius="md" bg="red.50" color="red.800">
        <Box fontWeight="bold" mb={2}>Error loading profile</Box>
        <Box>{error}</Box>
        <Box mt={4}>
          <Button 
            onClick={retryLoading}
            colorScheme="blue"
            isLoading={isLoading}
            loadingText="Retrying..."
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  // If user is not logged in
  if (!currentUser) {
    return (
      <Alert status="warning" borderRadius="md" mb={6}>
        <AlertIcon />
        <Box>
          <AlertTitle>Not logged in</AlertTitle>
          <AlertDescription>
            Please log in to view your profile.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  // If profile is not complete, show completion form
  if (!isProfileComplete && !isEditMode) {
    return (
      <ProfileCompletionForm 
        initialData={profile || undefined} 
        onSave={handleSaveProfile}
        isDisabled={isUpdatingProfile.current || localLoadingState}
      />
    );
  }

  // Show edit form if in edit mode
  if (isEditMode) {
    return (
      <Box mb={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <ResponsiveText variant="h2">Edit Profile</ResponsiveText>
          <Button 
            leftIcon={<FiX />} 
            variant="ghost" 
            onClick={handleCancelEdit}
            isDisabled={isUpdatingProfile.current || localLoadingState}
          >
            Cancel
          </Button>
        </Flex>
        <ProfileCompletionForm 
          onSave={handleSaveProfile}
          initialData={profile || undefined}
          isEditMode={true}
          onCancel={handleCancelEdit}
          isDisabled={isUpdatingProfile.current || localLoadingState}
        />
      </Box>
    );
  }

  // If profile is complete, render profile content
  return (
    <Box>
      {/* Profile header */}
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        align={{ base: 'center', md: 'flex-start' }} 
        justify="space-between"
        mb={6}
        p={6}
        bg={cardBg}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="sm"
      >
        {/* Profile info */}
        <Flex direction={{ base: 'column', md: 'row' }} align="center" mb={{ base: 4, md: 0 }}>
          <Avatar 
            size="xl" 
            name={profile?.name || 'User'} 
            src="/images/default-avatar.png" 
            mr={{ base: 0, md: 6 }}
            mb={{ base: 4, md: 0 }}
          />
          <Box textAlign={{ base: 'center', md: 'left' }}>
            <ResponsiveText variant="h2" mb={1}>
              {profile?.name || 'User'}
            </ResponsiveText>
            <Text color="gray.500" mb={2}>
              {profile?.role || 'Researcher'} at {profile?.institution || 'Institution'}
            </Text>
            <Flex gap={2} justify={{ base: 'center', md: 'flex-start' }}>
              <Badge colorScheme="blue">{profile?.department || 'Department'}</Badge>
              <Badge colorScheme="green">{profile?.position || 'Position'}</Badge>
            </Flex>
          </Box>
        </Flex>
        
        {/* Edit button */}
        <Button 
          leftIcon={<FiEdit />} 
          colorScheme="blue" 
          variant="outline"
          onClick={handleEditProfile}
          isDisabled={isUpdatingProfile.current || localLoadingState}
          isLoading={localLoadingState}
          loadingText="Updating..."
        >
          Edit Profile
        </Button>
      </Flex>
      
      {/* Profile content */}
      <Tabs 
        index={activeTab} 
        onChange={setActiveTab} 
        variant="enclosed" 
        colorScheme="blue"
        isLazy
      >
        <TabList>
          <Tab><Box as={FiUser} mr={2} /> Profile</Tab>
          <Tab><Box as={FiFileText} mr={2} /> Articles</Tab>
          <Tab><Box as={FiStar} mr={2} /> Reviews</Tab>
        </TabList>
        
        <TabPanels>
          {/* Profile tab */}
          <TabPanel p={0} pt={6}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Research interests */}
              <Card>
                <CardHeader>
                  <ResponsiveText variant="h3">Research Interests</ResponsiveText>
                </CardHeader>
                <CardBody>
                  <Flex wrap="wrap" gap={2}>
                    {profile?.researchInterests?.map((interest, index) => (
                      <Badge key={index} colorScheme="blue">
                        {interest}
                      </Badge>
                    ))}
                    {(!profile?.researchInterests || profile.researchInterests.length === 0) && (
                      <Text color="gray.500">No research interests specified</Text>
                    )}
                  </Flex>
                </CardBody>
              </Card>
              
              {/* Stats */}
              <Card>
                <CardHeader>
                  <ResponsiveText variant="h3">Activity</ResponsiveText>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel>Articles</StatLabel>
                      <StatNumber>{profile?.articles || 0}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Reviews</StatLabel>
                      <StatNumber>{profile?.reviews || 0}</StatNumber>
                    </Stat>
                  </SimpleGrid>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          {/* Articles tab */}
          <TabPanel>
            <ArticlesPanel 
              userId={currentUser?.uid} 
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </TabPanel>
          
          {/* Reviews tab */}
          <TabPanel>
            <ReviewsPanel 
              userId={currentUser?.uid}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ClientOnlyProfile;
