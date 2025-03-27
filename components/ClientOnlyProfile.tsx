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
import { FiEdit, FiFileText, FiStar, FiUser, FiX, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useProfileData, UserProfile, ProfileLoadingState } from '../hooks/useProfileData';
import ProfileCompletionForm from './ProfileCompletionForm';
import useClient from '../hooks/useClient';
import ResponsiveText from './ResponsiveText';
import ArticlesPanel from './profile/ArticlesPanel';
import ReviewsPanel from './profile/ReviewsPanel';
import useAppToast from '../hooks/useAppToast';
import BrowserOnly from './BrowserOnly';
import { getConsistentInitialState, isClientSide, createStableKey } from '../utils/hydrationHelpers';

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

// Define custom types for additional loading states
type ExtendedProfileLoadingState = ProfileLoadingState | 'LOADING_ARTICLES' | 'LOADING_REVIEWS';

/**
 * Client-only wrapper for profile-related components
 * This ensures Firebase is only initialized on the client side
 */
const ClientOnlyProfile: React.FC = () => {
  // Component state with consistent initial values for SSR/CSR
  const [activeTab, setActiveTab] = useState(getConsistentInitialState(0, 0));
  const [currentPage, setCurrentPage] = useState(getConsistentInitialState(1, 1));
  const [isEditMode, setIsEditMode] = useState(getConsistentInitialState(false, false));
  const [localLoadingState, setLocalLoadingState] = useState(getConsistentInitialState(false, false));
  
  // UI helpers
  const showToast = useAppToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // Create refs to prevent duplicate operations
  const isUpdatingProfile = useRef(false);
  const profileUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(isClientSide());
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

  // Define additional loading states that might not be in the enum
  // This allows us to check for them without TypeScript errors
  const LOADING_ARTICLES = 'LOADING_ARTICLES' as ExtendedProfileLoadingState;
  const LOADING_REVIEWS = 'LOADING_REVIEWS' as ExtendedProfileLoadingState;

  // Log component lifecycle events with performance metrics
  const logOperation = useCallback((
    operation: string, 
    details?: Record<string, any>
  ) => {
    // Skip logging during SSR
    if (!isClientSide()) return;
    
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
  const isInLoadingState = useCallback((states: ExtendedProfileLoadingState[]) => {
    return states.includes(loadingState as ExtendedProfileLoadingState);
  }, [loadingState]);

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
    
    batchStateUpdate(() => {
      setIsEditMode(prev => !prev);
    });
    
    logOperation(isEditMode ? 'Exiting edit mode' : 'Entering edit mode');
  }, [batchStateUpdate, isEditMode, isInLoadingState, loadingState, logOperation]);

  // Function to save profile edits
  const handleSaveProfile = useCallback(async (updatedProfile: Partial<UserProfile>): Promise<boolean> => {
    // Prevent duplicate updates
    if (isUpdatingProfile.current || isInLoadingState([ProfileLoadingState.UPDATING])) {
      logOperation('Save request ignored - update already in progress', {
        isUpdatingProfile: isUpdatingProfile.current,
        loadingState
      });
      return false;
    }
    
    try {
      // Set the updating flag to prevent duplicate data loading
      isUpdatingProfile.current = true;
      
      // If the hook also has a loading flag, set it
      if (isLoadingData) {
        isLoadingData.current = true;
      }
      
      // Start loading state
      batchStateUpdate(() => {
        setLocalLoadingState(true);
      });
      
      logOperation('Starting profile update', { updatedFields: Object.keys(updatedProfile) });
      operationStartTimeRef.current = Date.now();
      
      // Update profile using the hook's function
      const success = await updateProfile(updatedProfile);
      
      if (success) {
        logOperation('Profile update completed successfully');
        
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
          
          logOperation('Reset update flags after timeout');
        }, 1000);
        
        // Exit edit mode
        batchStateUpdate(() => {
          setIsEditMode(false);
          setLocalLoadingState(false);
        });
        
        showToast({
          id: 'profile-updated',
          title: "Profile updated",
          description: "Your profile has been successfully updated",
          status: "success",
          duration: 3000,
        });
        
        return true;
      } else {
        logOperation('Profile update failed', { reason: 'updateProfile returned false' });
        
        batchStateUpdate(() => {
          setLocalLoadingState(false);
        });
        
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logOperation('Profile update failed with exception', { error: errorMessage });
      
      batchStateUpdate(() => {
        setLocalLoadingState(false);
      });
      
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
  }, [batchStateUpdate, isInLoadingState, isLoadingData, loadingState, logOperation, showToast, updateProfile]);

  // Handle tab changes
  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
    setCurrentPage(1); // Reset pagination when changing tabs
    logOperation('Tab changed', { newTab: index });
  }, [logOperation]);

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    logOperation('Page changed', { newPage: page });
  }, [logOperation]);

  // Cancel edit mode
  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    logOperation('Edit mode cancelled');
  }, [logOperation]);

  // Get profile data with proper type safety
  const getProfileData = useCallback(() => {
    return profile || {} as Partial<UserProfile>;
  }, [profile]);

  // Safe access to profile properties
  const safeProfileData = getProfileData();
  const profileName = safeProfileData.name || 'Anonymous User';
  const profileInstitution = safeProfileData.institution || '';
  const profileRole = safeProfileData.role || '';
  const profileBio = safeProfileData.bio || '';
  const profileAvatarUrl = safeProfileData.avatarUrl || undefined;
  const profileArticleCount = safeProfileData.articleCount || 0;
  const profileReviewCount = safeProfileData.reviewCount || 0;
  const profileReputation = safeProfileData.reputation || 0;
  const profileResearchInterests = typeof safeProfileData.researchInterests === 'string' 
    ? safeProfileData.researchInterests 
    : Array.isArray(safeProfileData.researchInterests) 
      ? safeProfileData.researchInterests.join(', ') 
      : '';

  // If we're not on the client, return a loading state
  if (!isClient) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading profile...</Text>
        </VStack>
      </Center>
    );
  }

  // If there's an error, show it
  if (error && !isLoading) {
    return (
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
    );
  }

  // If profile is loading, show a loading state
  if (isLoading || isInLoadingState([ProfileLoadingState.LOADING, ProfileLoadingState.INITIALIZING])) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading profile data...</Text>
        </VStack>
      </Center>
    );
  }

  // If profile is not complete, show the profile completion form
  if (!isProfileComplete) {
    return (
      <Box 
        p={6} 
        borderWidth="1px" 
        borderRadius="lg" 
        bg={bgColor} 
        borderColor={borderColor}
        shadow="md"
      >
        <Text fontSize="xl" fontWeight="bold" mb={6}>
          Complete Your Profile
        </Text>
        <ProfileCompletionForm 
          initialData={profile || undefined} 
          onSave={handleSaveProfile} 
          isLoading={localLoadingState || isInLoadingState([ProfileLoadingState.UPDATING])}
        />
      </Box>
    );
  }

  // Render the complete profile
  return (
    <BrowserOnly>
      <Box>
        {/* Profile Header */}
        <Box 
          p={6} 
          borderWidth="1px" 
          borderRadius="lg" 
          bg={bgColor} 
          borderColor={borderColor}
          shadow="md"
          mb={6}
        >
          <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'flex-start' }}>
            {/* Avatar and basic info */}
            <Flex direction="column" align="center" mr={{ base: 0, md: 8 }} mb={{ base: 6, md: 0 }}>
              <Avatar 
                size="2xl" 
                name={profileName} 
                src={profileAvatarUrl} 
                mb={4}
              />
              
              {isEditMode ? (
                <Flex mt={2}>
                  <Button 
                    size="sm" 
                    colorScheme="green" 
                    mr={2}
                    isLoading={localLoadingState || isInLoadingState([ProfileLoadingState.UPDATING])}
                    onClick={() => handleSaveProfile({})} // Save without changes just exits edit mode
                  >
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    colorScheme="red" 
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </Flex>
              ) : (
                <Button 
                  leftIcon={<FiEdit />} 
                  size="sm" 
                  onClick={handleEditProfile}
                  isDisabled={isInLoadingState([ProfileLoadingState.UPDATING])}
                >
                  Edit Profile
                </Button>
              )}
            </Flex>
            
            {/* Profile details */}
            <Box flex="1">
              <Flex justify="space-between" align="center" mb={4}>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold">{profileName}</Text>
                  {profileInstitution && (
                    <Text color="gray.500">{profileInstitution}</Text>
                  )}
                </Box>
                
                {profileRole && (
                  <Badge colorScheme="blue" fontSize="0.8em" p={2}>
                    {profileRole}
                  </Badge>
                )}
              </Flex>
              
              {profileBio && (
                <Text mb={4}>{profileBio}</Text>
              )}
              
              {/* Profile stats */}
              <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mt={6}>
                <Card bg={cardBg}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Articles</StatLabel>
                      <StatNumber>{profileArticleCount}</StatNumber>
                    </Stat>
                  </CardBody>
                </Card>
                <Card bg={cardBg}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Reviews</StatLabel>
                      <StatNumber>{profileReviewCount}</StatNumber>
                    </Stat>
                  </CardBody>
                </Card>
                <Card bg={cardBg}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Reputation</StatLabel>
                      <StatNumber>{profileReputation}</StatNumber>
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </Box>
          </Flex>
        </Box>
        
        {/* Tabs for different sections */}
        <Box 
          borderWidth="1px" 
          borderRadius="lg" 
          bg={bgColor} 
          borderColor={borderColor}
          shadow="md"
        >
          <Tabs index={activeTab} onChange={handleTabChange}>
            <TabList>
              <Tab><FiUser /> <Text ml={2}>About</Text></Tab>
              <Tab><FiFileText /> <Text ml={2}>Articles</Text></Tab>
              <Tab><FiStar /> <Text ml={2}>Reviews</Text></Tab>
            </TabList>
            
            <TabPanels>
              {/* About Panel */}
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box>
                    <Text fontWeight="bold" mb={2}>Bio</Text>
                    <Text>{profileBio || 'No bio provided.'}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold" mb={2}>Research Interests</Text>
                    <Text>{profileResearchInterests || 'No research interests specified.'}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold" mb={2}>Institution</Text>
                    <Text>{profileInstitution || 'No institution specified.'}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold" mb={2}>Role</Text>
                    <Text>{profileRole || 'No role specified.'}</Text>
                  </Box>
                </SimpleGrid>
              </TabPanel>
              
              {/* Articles Panel */}
              <TabPanel>
                <ArticlesPanel 
                  userId={currentUser?.uid || ''}
                  EmptyState={() => <EmptyState type="Articles" />}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  isLoading={isInLoadingState([ProfileLoadingState.LOADING, LOADING_ARTICLES])}
                />
              </TabPanel>
              
              {/* Reviews Panel */}
              <TabPanel>
                <ReviewsPanel 
                  userId={currentUser?.uid || ''}
                  EmptyState={() => <EmptyState type="Reviews" />}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  isLoading={isInLoadingState([ProfileLoadingState.LOADING, LOADING_REVIEWS])}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </BrowserOnly>
  );
};

export default ClientOnlyProfile;
