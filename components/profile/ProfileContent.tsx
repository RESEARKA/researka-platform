import React from 'react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Box,
  Center,
  Spinner,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from '@chakra-ui/react';
import { FiRefreshCw, FiFileText, FiStar, FiUser } from 'react-icons/fi';
import { UserProfile, ProfileLoadingState } from '../../hooks/useProfileData';
import ArticlesPanel from './ArticlesPanel';
import ReviewsPanel from './ReviewsPanel';
import ProfileCompletionForm from '../ProfileCompletionForm';
import { ExtendedProfileLoadingState } from '../../hooks/useProfileOperations';

// Define a default empty state component
const DefaultEmptyState: React.FC<{ type: string }> = ({ type }) => (
  <Box textAlign="center" py={10}>
    <Text fontSize="lg" fontWeight="medium" mb={2}>No {type} Found</Text>
    <Text color="gray.500">You haven't created any {type.toLowerCase()} yet.</Text>
  </Box>
);

interface ProfileContentProps {
  profile: UserProfile | null;
  activeTab: number;
  isEditMode: boolean;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  isInLoadingState: (states: ExtendedProfileLoadingState[]) => boolean;
  onTabChange: (index: number) => void;
  onPageChange: (page: number) => void;
  onSaveProfile: (updatedProfile: Partial<UserProfile>) => Promise<boolean>;
  onRetryLoading: () => void;
}

/**
 * Component to display profile content with tabs
 */
const ProfileContent: React.FC<ProfileContentProps> = ({
  profile,
  activeTab,
  isEditMode,
  isLoading,
  error,
  currentPage,
  isInLoadingState,
  onTabChange,
  onPageChange,
  onSaveProfile,
  onRetryLoading
}) => {
  // If there's an error, show error message
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
          onClick={onRetryLoading}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  // If loading, show spinner
  if (isLoading) {
    return (
      <Center py={10}>
        <Box textAlign="center">
          <Spinner size="xl" mb={4} />
          <Text>Loading profile data...</Text>
        </Box>
      </Center>
    );
  }

  // If in edit mode, show the profile completion form
  if (isEditMode) {
    return (
      <ProfileCompletionForm
        initialData={profile || undefined}
        onSave={onSaveProfile}
        isLoading={isInLoadingState([ProfileLoadingState.UPDATING])}
      />
    );
  }

  // Otherwise, show the profile tabs
  return (
    <Tabs index={activeTab} onChange={onTabChange} isLazy>
      <TabList>
        <Tab><Box as={FiUser} mr={2} />Profile</Tab>
        <Tab><Box as={FiFileText} mr={2} />Articles</Tab>
        <Tab><Box as={FiStar} mr={2} />Reviews</Tab>
      </TabList>

      <TabPanels>
        {/* Profile Tab */}
        <TabPanel px={0}>
          {/* Profile content is displayed in the parent component */}
        </TabPanel>

        {/* Articles Tab */}
        <TabPanel px={0}>
          <ArticlesPanel
            userId={profile?.uid || ''}
            currentPage={currentPage}
            onPageChange={onPageChange}
            isLoading={isInLoadingState(['LOADING_ARTICLES'])}
            EmptyState={() => <DefaultEmptyState type="Articles" />}
          />
        </TabPanel>

        {/* Reviews Tab */}
        <TabPanel px={0}>
          <ReviewsPanel
            userId={profile?.uid || ''}
            currentPage={currentPage}
            onPageChange={onPageChange}
            isLoading={isInLoadingState(['LOADING_REVIEWS'])}
            EmptyState={() => <DefaultEmptyState type="Reviews" />}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default ProfileContent;
