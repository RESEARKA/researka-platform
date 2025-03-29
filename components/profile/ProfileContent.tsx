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
import { FiRefreshCw, FiFileText, FiStar } from 'react-icons/fi';
import { UserProfile } from '../../hooks/useProfileData';
import ArticlesPanel from './ArticlesPanel';
import ReviewsPanel from './ReviewsPanel';
import ProfileCompletionForm from '../ProfileCompletionForm';
import { ProfileLoadingState } from './types';

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
  isInLoadingState: (state: ProfileLoadingState) => boolean;
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
  // If there's an error, show error state with retry button
  if (error) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        borderRadius="md"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Error Loading Profile
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {error}
        </AlertDescription>
        <Button
          leftIcon={<FiRefreshCw />}
          mt={4}
          onClick={onRetryLoading}
          isLoading={isLoading}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  // If loading and no profile, show loading state
  if (isLoading && !profile) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    );
  }

  // If edit mode, show profile completion form
  if (isEditMode) {
    return (
      <ProfileCompletionForm
        initialData={profile || undefined}
        onSave={onSaveProfile}
        isLoading={isInLoadingState(ProfileLoadingState.UPDATING)}
        isEditMode={isEditMode}
      />
    );
  }

  // If no profile, show empty state
  if (!profile) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" fontWeight="medium">No Profile Data</Text>
      </Box>
    );
  }

  // Otherwise, show profile content with tabs
  return (
    <Tabs index={activeTab} onChange={onTabChange} variant="enclosed" colorScheme="teal">
      <TabList>
        <Tab><Box as="span" mr={2}><FiFileText /></Box> Articles</Tab>
        <Tab><Box as="span" mr={2}><FiStar /></Box> Reviews</Tab>
      </TabList>

      <TabPanels>
        {/* Articles Tab */}
        <TabPanel>
          <ArticlesPanel
            userId={profile?.uid || ''}
            currentPage={currentPage}
            onPageChange={onPageChange}
            isLoading={isInLoadingState(ProfileLoadingState.LOADING_ARTICLES)}
            EmptyState={() => <DefaultEmptyState type="Articles" />}
          />
        </TabPanel>

        {/* Reviews Tab */}
        <TabPanel>
          <ReviewsPanel
            userId={profile?.uid || ''}
            currentPage={currentPage}
            onPageChange={onPageChange}
            isLoading={isInLoadingState(ProfileLoadingState.LOADING_REVIEWS)}
            EmptyState={() => <DefaultEmptyState type="Reviews" />}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default ProfileContent;
