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
import { useProfileData, UserProfile, ProfileLoadingState } from '../hooks/useProfileData';
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
  const operationStartTimeRef = useRef<number>(0);
  
  // Auth and profile data
  const { currentUser, authIsInitialized } = useAuth();
  const { 
    profile, 
    isLoading, 
    error, 
    isProfileComplete, 
    updateProfile, 
    retryLoading,
    isLoadingData,
    loadingState
  } = useProfileData();
  const isClient = useClient();

  // Log component lifecycle events with performance metrics
  const logOperation = useCallback((
    operation: string, 
    details?: Record<string, any>
  ) => {
    const now = Date.now();
    const duration = operationStartTimeRef.current ? now - operationStartTimeRef.current : 0;
    
    console.log(`ClientOnlyProfile: ${operation} ${duration ? `in ${duration}ms` : ''}`, {
      userId: currentUser?.uid?.substring(0, 8) || 'none',
      loadingState,
      isEditMode,
      ...details
    });
    
    // Reset operation start time for completed operations
    if (operation.includes('completed') || operation.includes('failed')) {
      operationStartTimeRef.current = 0;
    } 
    // Set start time for new operations
    else if (operationStartTimeRef.current === 0 && 
             (operation.includes('starting') || operation.includes('initiating'))) {
      operationStartTimeRef.current = now;
    }
  }, [currentUser?.uid, loadingState, isEditMode]);

  // Set up component mount/unmount tracking
  useEffect(() => {
    logOperation('Component mounted');
    isMounted.current = true;
    
    return () => {
      logOperation('Component unmounting');
      isMounted.current = false;
      
      // Clean up any timeouts on unmount
      if (profileUpdateTimeout.current) {
        clearTimeout(profileUpdateTimeout.current);
        profileUpdateTimeout.current = null;
      }
    };
  }, [logOperation]);

  // Batch state updates to minimize renders
  const batchStateUpdate = useCallback((updates: () => void) => {
    if (isMounted.current) {
      updates();
    } else {
      console.log('ClientOnlyProfile: Skipping state update on unmounted component');
    }
  }, []);

  // Helper function to check if the loading state is in a specific set of states
  const isInLoadingState = (states: ProfileLoadingState[]) => {
    return states.includes(loadingState);
  };

  // Function to toggle edit mode with debounce protection
  const handleEditProfile = useCallback(() => {
    // Prevent edit mode when profile is being updated
    if (isUpdatingProfile.current || isInLoadingState([ProfileLoadingState.UPDATING])) {
      logOperation('Edit request ignored - update in progress', {
        isUpdatingProfile: isUpdatingProfile.current,
        loadingState
      });
      return;
    }
    
    // Prevent rapid toggling of edit mode
    const now = Date.now();
    if (now - lastUpdateTime.current < 1000) {
      logOperation('Edit request ignored - too soon after last action', {
        timeSinceLastAction: now - lastUpdateTime.current
      });
      return;
    }
    
    lastUpdateTime.current = now;
    logOperation('Entering edit mode');
    setIsEditMode(true);
  }, [loadingState, logOperation]);
  
  // Function to cancel edit mode
  const handleCancelEdit = useCallback(() => {
    // Prevent rapid toggling of edit mode
    const now = Date.now();
    if (now - lastUpdateTime.current < 1000) {
      logOperation('Cancel request ignored - too soon after last action', {
        timeSinceLastAction: now - lastUpdateTime.current
      });
      return;
    }
    
    lastUpdateTime.current = now;
    logOperation('Exiting edit mode (cancelled)');
    setIsEditMode(false);
  }, [logOperation]);
  
  // Function to save profile edits with enhanced error handling and state management
  const handleSaveProfile = useCallback(async (updatedProfile: Partial<UserProfile>): Promise<boolean> => {
    // Prevent duplicate updates
    if (isUpdatingProfile.current || isInLoadingState([ProfileLoadingState.UPDATING])) {
      logOperation('Save request ignored - update already in progress', {
        isUpdatingProfile: isUpdatingProfile.current,
        loadingState
      });
      return false;
    }
    
    // Prevent rapid save operations
    const now = Date.now();
    if (now - lastUpdateTime.current < 1000) {
      logOperation('Save request ignored - too soon after last action', {
        timeSinceLastAction: now - lastUpdateTime.current
      });
      return false;
    }
    
    lastUpdateTime.current = now;
    operationStartTimeRef.current = now;
    
    // Set local loading state for UI feedback
    batchStateUpdate(() => {
      setLocalLoadingState(true);
    });
    
    logOperation('Starting profile update', {
      fields: Object.keys(updatedProfile)
    });
    
    try {
      // Set the updating flag to prevent duplicate data loading
      isUpdatingProfile.current = true;
      
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
      
      logOperation('Sending profile update to server', {
        updatedFields: Object.keys(completeProfileUpdate)
      });
      
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
            logOperation(`Retrying profile update (attempt ${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          logOperation(`Error in profile update attempt ${attempts + 1}`, {
            error: error instanceof Error ? error.message : String(error)
          });
        }
        attempts++;
      }
      
      if (success) {
        // Exit edit mode and show success message
        // Use a batch update function to minimize renders
        batchStateUpdate(() => {
          setIsEditMode(false);
          setLocalLoadingState(false);
        });
        
        logOperation('Profile update completed successfully', {
          attempts
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
          profileUpdateTimeout.current = null;
          
          logOperation('Update lock released after timeout');
        }, 2000); // Increased timeout to ensure all operations complete
        
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
        });
        
        logOperation('Profile update failed after multiple attempts', {
          attempts
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
          profileUpdateTimeout.current = null;
          
          logOperation('Update lock released after error timeout');
        }, 2000);
        
        return false;
      }
    } catch (error) {
      logOperation('Error saving profile', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Enhanced error handling with more detailed messages
      let errorMessage = "Failed to update profile. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
        console.error('ClientOnlyProfile: Error details:', error.stack);
      }
      
      batchStateUpdate(() => {
        setLocalLoadingState(false);
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
        
        batchStateUpdate(() => {
          setLocalLoadingState(false);
        });
        
        logOperation('Update flags reset in finally block');
      }
    }
  }, [profile, updateProfile, showToast, batchStateUpdate, loadingState, logOperation]);
  
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
  if (isLoading || localLoadingState || isInLoadingState([ProfileLoadingState.LOADING, ProfileLoadingState.UPDATING, ProfileLoadingState.INITIALIZING])) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>
            {isInLoadingState([ProfileLoadingState.UPDATING]) ? "Updating profile..." : 
             localLoadingState ? "Saving changes..." : 
             "Loading profile data..."}
          </Text>
        </VStack>
      </Center>
    );
  }

  // Show error state with retry button
  if (error || isInLoadingState([ProfileLoadingState.ERROR])) {
    return (
      <Box p={5} borderWidth={1} borderRadius="md" bg="red.50" color="red.800">
        <Box fontWeight="bold" mb={2}>Error loading profile</Box>
        <Box>{error}</Box>
        <Box mt={4}>
          <Button 
            colorScheme="red" 
            size="sm" 
            onClick={() => {
              logOperation('Retrying profile load after error');
              retryLoading();
            }}
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  // Show profile completion form if profile is not complete
  if (!isProfileComplete && profile) {
    return (
      <Box p={5} maxW="800px" mx="auto">
        <Alert status="info" mb={5}>
          <AlertIcon />
          <Box>
            <AlertTitle>Complete your profile</AlertTitle>
            <AlertDescription>
              Please complete your profile to access all features of the platform.
            </AlertDescription>
          </Box>
        </Alert>
        <ProfileCompletionForm 
          initialData={profile} 
          onSave={handleSaveProfile} 
          isLoading={localLoadingState || isInLoadingState([ProfileLoadingState.UPDATING, ProfileLoadingState.LOADING])}
        />
      </Box>
    );
  }

  // If no profile exists, show an error
  if (!profile) {
    return (
      <Box p={5} borderWidth={1} borderRadius="md" bg="red.50" color="red.800">
        <Box fontWeight="bold" mb={2}>Profile not found</Box>
        <Box>Unable to load your profile. Please try refreshing the page.</Box>
        <Box mt={4}>
          <Button 
            colorScheme="red" 
            size="sm" 
            onClick={() => {
              logOperation('Retrying profile load - profile not found');
              retryLoading();
            }}
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  // Main profile view
  return (
    <Box p={{ base: 2, md: 5 }}>
      {/* Profile Header */}
      <Box 
        borderWidth={1} 
        borderRadius="lg" 
        overflow="hidden" 
        bg={bgColor} 
        borderColor={borderColor}
        mb={5}
      >
        <Box p={{ base: 4, md: 6 }}>
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            align={{ base: 'center', md: 'flex-start' }}
            justify="space-between"
          >
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              align={{ base: 'center', md: 'flex-start' }}
            >
              <Avatar 
                size="xl" 
                name={profile.name} 
                mb={{ base: 4, md: 0 }} 
                mr={{ base: 0, md: 6 }}
              />
              <Box textAlign={{ base: 'center', md: 'left' }}>
                <Box display="flex" alignItems="center" flexDirection={{ base: "column", md: "row" }}>
                  <ResponsiveText 
                    variant="h2"
                    fontSize={{ base: "xl", md: "2xl" }} 
                    fontWeight="bold" 
                    mb={{ base: 1, md: 0 }}
                  >
                    {profile.name}
                  </ResponsiveText>
                  <Badge 
                    ml={{ base: 0, md: 2 }} 
                    colorScheme="green"
                    mb={{ base: 2, md: 0 }}
                  >
                    {profile.role}
                  </Badge>
                </Box>
                <Text color="gray.600" fontSize="md" mb={2}>
                  {profile.institution || 'No institution specified'}
                </Text>
                <Text color="gray.600" fontSize="sm">
                  {profile.department ? `${profile.department}` : ''}
                  {profile.position && profile.department ? ` • ${profile.position}` : profile.position}
                </Text>
                {profile.researchInterests && profile.researchInterests.length > 0 && (
                  <Box mt={2}>
                    {profile.researchInterests.map((interest, index) => (
                      <Badge key={index} mr={2} mb={2} colorScheme="blue">
                        {interest}
                      </Badge>
                    ))}
                  </Box>
                )}
              </Box>
            </Flex>
            
            {/* Edit Profile Button */}
            {isEditMode ? (
              <Flex mt={{ base: 4, md: 0 }}>
                <Button 
                  leftIcon={<FiX />} 
                  colorScheme="gray" 
                  size="sm" 
                  onClick={handleCancelEdit}
                  mr={2}
                >
                  Cancel
                </Button>
              </Flex>
            ) : (
              <Button 
                leftIcon={<FiEdit />} 
                colorScheme="blue" 
                size="sm" 
                onClick={handleEditProfile}
                mt={{ base: 4, md: 0 }}
              >
                Edit Profile
              </Button>
            )}
          </Flex>
          
          {/* Profile Edit Form */}
          {isEditMode && (
            <Box mt={6}>
              <ProfileCompletionForm 
                initialData={profile} 
                onSave={handleSaveProfile} 
                isLoading={localLoadingState || isInLoadingState([ProfileLoadingState.UPDATING, ProfileLoadingState.LOADING])}
              />
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Profile Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Articles</StatLabel>
              <StatNumber>{profile.articles || 0}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Reviews</StatLabel>
              <StatNumber>{profile.reviews || 0}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Wallet</StatLabel>
              <StatNumber>
                {profile.walletAddress ? 
                  `${profile.walletAddress.substring(0, 6)}...${profile.walletAddress.substring(profile.walletAddress.length - 4)}` : 
                  'Not connected'}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Tabs for Articles, Reviews, etc. */}
      <Box 
        borderWidth={1} 
        borderRadius="lg" 
        overflow="hidden" 
        bg={bgColor} 
        borderColor={borderColor}
      >
        <Tabs 
          isFitted 
          variant="enclosed" 
          onChange={(index) => setActiveTab(index)}
          colorScheme="blue"
        >
          <TabList>
            <Tab><Box as={FiFileText} mr={2} /> Articles</Tab>
            <Tab><Box as={FiStar} mr={2} /> Reviews</Tab>
            <Tab><Box as={FiUser} mr={2} /> About</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <ArticlesPanel 
                userId={currentUser?.uid || ''} 
                EmptyState={() => <EmptyState type="Articles" />}
                currentPage={1}
                onPageChange={() => {}}
                isLoading={isLoading || localLoadingState || isInLoadingState([ProfileLoadingState.LOADING, ProfileLoadingState.INITIALIZING])}
              />
            </TabPanel>
            <TabPanel>
              <ReviewsPanel 
                userId={currentUser?.uid || ''} 
                EmptyState={() => <EmptyState type="Reviews" />}
                currentPage={1}
                onPageChange={() => {}}
                isLoading={isLoading || localLoadingState || isInLoadingState([ProfileLoadingState.LOADING, ProfileLoadingState.INITIALIZING])}
              />
            </TabPanel>
            <TabPanel>
              <Box>
                <Text fontWeight="bold" fontSize="lg" mb={3}>About</Text>
                <Text>
                  {profile.name} is a {profile.role.toLowerCase()} 
                  {profile.institution ? ` at ${profile.institution}` : ''}.
                </Text>
                {profile.researchInterests && profile.researchInterests.length > 0 && (
                  <Box mt={4}>
                    <Text fontWeight="bold" mb={2}>Research Interests</Text>
                    <Box>
                      {profile.researchInterests.map((interest, index) => (
                        <Badge key={index} mr={2} mb={2} colorScheme="blue">
                          {interest}
                        </Badge>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default ClientOnlyProfile;
