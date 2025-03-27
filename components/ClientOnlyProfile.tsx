import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const showToast = useAppToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.700');
  
  const { currentUser, authIsInitialized } = useAuth();
  const { 
    profile, 
    isLoading, 
    error, 
    isProfileComplete, 
    updateProfile, 
    retryLoading 
  } = useProfileData();
  const isClient = useClient();

  // Function to toggle edit mode
  const handleEditProfile = () => {
    setIsEditMode(true);
  };
  
  // Function to cancel edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
  };
  
  // Function to save profile edits
  const handleSaveProfile = async (updatedProfile: Partial<UserProfile>): Promise<boolean> => {
    try {
      const success = await updateProfile(updatedProfile);
      
      if (success) {
        setIsEditMode(false);
        
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

  // Show loading state when not on client or auth is initializing
  if (!isClient || !authIsInitialized || isLoading) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading profile data...</Text>
        </VStack>
      </Center>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box p={5} borderWidth={1} borderRadius="md" bg="red.50" color="red.800">
        <Box fontWeight="bold" mb={2}>Error loading profile</Box>
        <Box>{error}</Box>
        <Box mt={4}>
          <Button 
            onClick={retryLoading}
            colorScheme="blue"
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
          >
            Cancel
          </Button>
        </Flex>
        <ProfileCompletionForm 
          onSave={handleSaveProfile}
          initialData={profile || undefined}
          isEditMode={true}
          onCancel={handleCancelEdit}
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
          <TabPanel p={0} pt={6}>
            <ArticlesPanel 
              articlesData={{ articles: [], totalPages: 0, lastVisible: null, hasMore: false }}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              EmptyState={EmptyState}
              PaginationControl={PaginationControl}
            />
          </TabPanel>
          
          {/* Reviews tab */}
          <TabPanel p={0} pt={6}>
            <ReviewsPanel 
              reviewsData={{ reviews: [], totalPages: 0, lastVisible: null, hasMore: false }}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              EmptyState={EmptyState}
              PaginationControl={PaginationControl}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ClientOnlyProfile;
