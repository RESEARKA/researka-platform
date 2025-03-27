import React, { useEffect, useRef } from 'react';
import { Box, Container, useToast } from '@chakra-ui/react';
import { useProfileData } from '../hooks/useProfileData';
import { useProfileState } from '../hooks/useProfileState';
import { useProfileOperations } from '../hooks/useProfileOperations';
import ProfileHeader from './profile/ProfileHeader';
import ProfileStats from './profile/ProfileStats';
import ProfileContent from './profile/ProfileContent';
import useFirebaseInitialized from '../hooks/useFirebaseInitialized';

/**
 * Client-only profile component that handles profile data and UI
 * This component is responsible for orchestrating the profile page
 * by connecting the UI components with the business logic hooks
 * Now using the dedicated useFirebaseInitialized hook for better initialization management
 */
const ClientOnlyProfile: React.FC = () => {
  // Get toast for notifications
  const toast = useToast();
  
  // Use our new dedicated hook to ensure Firebase is initialized
  const isFirebaseReady = useFirebaseInitialized();
  
  // Track component mount state
  const isMounted = useRef(true);
  
  // Get profile data from hook
  const { 
    profile, 
    isLoading: isProfileLoading, 
    error: profileError,
    loadData: refreshProfileData
  } = useProfileData();
  
  // Get UI state from hook
  const { 
    activeTab, 
    currentPage, 
    isEditMode,
    setActiveTab,
    setCurrentPage,
    setEditMode
  } = useProfileState();
  
  // Get profile operations from hook
  const {
    isLoading,
    isInLoadingState,
    updateProfile,
    handleError,
    logOperation
  } = useProfileOperations();

  // Set up component lifecycle
  useEffect(() => {
    isMounted.current = true;
    
    // Log component mount
    logOperation('ClientOnlyProfile component mounted');
    
    // Load profile data when Firebase is ready
    if (isFirebaseReady) {
      logOperation('Firebase is ready, loading profile data');
      refreshProfileData();
    }
    
    return () => {
      isMounted.current = false;
      logOperation('ClientOnlyProfile component unmounted');
    };
  }, [isFirebaseReady, refreshProfileData, logOperation]);
  
  // Handle tab change
  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setCurrentPage(1); // Reset to first page when changing tabs
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle edit profile
  const handleEditProfile = () => {
    setEditMode(true);
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditMode(false);
  };
  
  // Handle save profile
  const handleSaveProfile = async (updatedProfile: any) => {
    try {
      const success = await updateProfile(updatedProfile);
      
      if (success) {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been successfully updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        setEditMode(false);
        return true;
      }
      
      return false;
    } catch (error) {
      handleError(error, 'Error updating profile');
      return false;
    }
  };
  
  // Handle retry loading
  const handleRetryLoading = () => {
    refreshProfileData();
  };
  
  // Show error toast when profile error occurs
  useEffect(() => {
    if (profileError) {
      toast({
        title: 'Error loading profile',
        description: profileError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [profileError, toast]);
  
  return (
    <Container maxW="container.lg" py={8}>
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        isEditMode={isEditMode}
        isLoading={isLoading}
        onEditClick={handleEditProfile}
        onCancelEdit={handleCancelEdit}
      />
      
      {/* Profile Stats */}
      {!isEditMode && profile && (
        <ProfileStats
          articlesCount={profile.articleCount || 0}
          reviewsCount={profile.reviewCount || 0}
          reputation={profile.reputation || 0}
        />
      )}
      
      {/* Profile Content */}
      <Box mt={6}>
        <ProfileContent
          profile={profile}
          activeTab={activeTab}
          isEditMode={isEditMode}
          isLoading={isProfileLoading}
          error={profileError}
          currentPage={currentPage}
          isInLoadingState={isInLoadingState}
          onTabChange={handleTabChange}
          onPageChange={handlePageChange}
          onSaveProfile={handleSaveProfile}
          onRetryLoading={handleRetryLoading}
        />
      </Box>
    </Container>
  );
};

export default ClientOnlyProfile;
