import { useCallback, useRef } from 'react';
import { UserProfile, useProfileData, ProfileLoadingState, isInLoadingState as checkLoadingState } from './useProfileData';
import useAppToast from './useAppToast';
import { createLogger, LogCategory } from '../utils/logger';

// Create a logger instance for profile operations
const logger = createLogger('profileOperations');

// Define additional loading states that might not be in the enum
export type ExtendedProfileLoadingState = ProfileLoadingState | 'LOADING_ARTICLES' | 'LOADING_REVIEWS';

/**
 * Custom hook for profile operations
 * Centralizes business logic for profile-related operations
 */
export function useProfileOperations() {
  // Get profile data and operations from the useProfileData hook
  const { 
    profile, 
    isLoading,
    isUpdating,
    error, 
    isProfileComplete, 
    updateProfile: updateProfileData, 
    retryLoading,
    isLoadingData,
    loadingState,
    loadData
  } = useProfileData();
  
  // UI helpers
  const showToast = useAppToast();
  
  // Create refs to track operation state
  const operationStartTimeRef = useRef<number>(0);
  
  // Helper function to check if the loading state is in a specific set of states
  const isInLoadingState = useCallback((states: ExtendedProfileLoadingState[]) => {
    return states.includes(loadingState as ExtendedProfileLoadingState);
  }, [loadingState]);
  
  // Log component lifecycle events with performance metrics
  const logOperation = useCallback((
    operation: string, 
    details?: Record<string, any>
  ) => {
    const now = Date.now();
    const duration = operationStartTimeRef.current ? now - operationStartTimeRef.current : 0;
    
    logger.info(`${operation} ${duration ? `in ${duration}ms` : ''}`, {
      context: {
        loadingState,
        duration,
        ...details
      },
      category: LogCategory.LIFECYCLE
    });
    
    // Reset operation start time for completed operations
    if (operation.includes('completed') || operation.includes('failed')) {
      operationStartTimeRef.current = 0;
    }
  }, [loadingState]);
  
  // Handle errors with consistent logging and user feedback
  const handleError = useCallback((error: unknown) => {
    logger.error('Error', {
      context: { 
        error,
        loadingState
      },
      category: LogCategory.ERROR
    });
    
    // Show error toast
    showToast({
      title: 'Error',
      description: error instanceof Error ? error.message : String(error),
      status: 'error',
    });
    
    // Retry loading if appropriate
    retryLoading();
    
    return error;
  }, [retryLoading, showToast]);
  
  // Update profile with timeout handling and error management
  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    try {
      // Start timing the operation
      operationStartTimeRef.current = Date.now();
      logOperation('updateProfile started', { profileData });
      
      // Set up timeout warning
      const timeoutWarning = setTimeout(() => {
        logger.warn('Operation is taking longer than expected', {
          context: {
            operation: 'updateProfile',
            elapsedTime: Date.now() - operationStartTimeRef.current,
            profileData
          },
          category: LogCategory.PERFORMANCE
        });
      }, 5000); // 5 second timeout warning
      
      // Perform the update
      const result = await updateProfileData(profileData);
      
      // Clear timeout warning
      clearTimeout(timeoutWarning);
      
      // Log success
      logOperation('updateProfile completed', { 
        result,
        profileData
      });
      
      // Show success toast
      showToast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        status: 'success',
      });
      
      return result;
    } catch (error) {
      // Log error with detailed context
      logger.error('Error updating profile', {
        context: {
          error,
          profileData,
          elapsedTime: Date.now() - operationStartTimeRef.current
        },
        category: LogCategory.ERROR
      });
      
      // Show error toast
      showToast({
        title: 'Error updating profile',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        status: 'error',
      });
      
      throw error;
    }
  }, [updateProfileData, logOperation, showToast]);
  
  // Batch update multiple profile fields in a single operation
  const batchUpdateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    try {
      // Start timing the operation
      operationStartTimeRef.current = Date.now();
      logOperation('batchUpdateProfile started', { 
        fieldCount: Object.keys(profileData).length,
        fields: Object.keys(profileData)
      });
      
      // Perform the update
      const result = await updateProfileData(profileData);
      
      // Log success with performance metrics
      logOperation('batchUpdateProfile completed', { 
        result,
        fieldCount: Object.keys(profileData).length
      });
      
      // Show success toast
      showToast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        status: 'success',
      });
      
      return result;
    } catch (error) {
      // Log error with detailed context
      logger.error('Error batch updating profile', {
        context: {
          error,
          fieldCount: Object.keys(profileData).length,
          fields: Object.keys(profileData)
        },
        category: LogCategory.ERROR
      });
      
      // Show error toast and handle the error
      handleError(error);
      throw error;
    }
  }, [updateProfileData, logOperation, showToast, handleError]);
  
  // Function to handle retry loading
  const handleRetryLoading = useCallback(() => {
    logOperation('Retrying profile load');
    retryLoading();
  }, [retryLoading, logOperation]);
  
  // Function to refresh profile data
  const refreshProfileData = useCallback(() => {
    logOperation('Manually refreshing profile data');
    loadData(); // Use loadData directly
  }, [loadData, logOperation]);
  
  return {
    profile,
    isLoading,
    error,
    isProfileComplete,
    loadingState,
    isInLoadingState,
    logOperation,
    handleSaveProfile: batchUpdateProfile,
    handleRetryLoading,
    updateProfile,
    handleError,
    refreshProfileData,
    operationStartTimeRef
  };
}
