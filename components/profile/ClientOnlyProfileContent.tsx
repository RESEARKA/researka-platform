import React, { useState } from 'react';
import { Box, Container } from '@chakra-ui/react';
import { UserProfile } from '../../hooks/useProfileData';
import { ProfileLoadingState } from './types';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileContent from './ProfileContent';

/**
 * Props for the ClientOnlyProfileContent component
 */
interface ClientOnlyProfileContentProps {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isInLoadingState: (state: ProfileLoadingState) => boolean;
  onSaveProfile: (updatedProfile: Partial<UserProfile>) => Promise<boolean>;
  onRetryLoading: () => void;
}

/**
 * ClientOnlyProfileContent component
 * Renders the profile UI with proper state management
 */
function ClientOnlyProfileContent({
  profile,
  isLoading,
  error,
  isInLoadingState,
  onSaveProfile,
  onRetryLoading
}: ClientOnlyProfileContentProps) {
  // Local UI state
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  
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
    setIsEditMode(true);
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditMode(false);
  };
  
  // Handle save profile with edit mode state update
  const handleSaveProfile = async (updatedProfile: Partial<UserProfile>) => {
    const success = await onSaveProfile(updatedProfile);
    
    if (success) {
      setIsEditMode(false);
    }
    
    return success;
  };
  
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
          isLoading={isLoading}
        />
      )}
      
      {/* Profile Content */}
      <Box mt={6}>
        <ProfileContent
          profile={profile}
          activeTab={activeTab}
          isEditMode={isEditMode}
          isLoading={isLoading}
          error={error}
          currentPage={currentPage}
          isInLoadingState={isInLoadingState}
          onTabChange={handleTabChange}
          onPageChange={handlePageChange}
          onSaveProfile={handleSaveProfile}
          onRetryLoading={onRetryLoading}
        />
      </Box>
    </Container>
  );
}

export default ClientOnlyProfileContent;
