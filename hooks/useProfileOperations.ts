import { useCallback, useRef } from 'react';
import { UserProfile, useProfileData, ProfileLoadingState, isInLoadingState as checkLoadingState } from './useProfileData';
import useAppToast from './useAppToast';

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
    
    console.log(`[ProfileOperations] ${operation} ${duration ? `in ${duration}ms` : ''}`, {
      loadingState,
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
  }, [loadingState]);
  
  // Function to handle errors
  const handleError = useCallback((error: unknown, title: string = 'Error') => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logOperation(`Error: ${errorMessage}`, { error });
    
    showToast({
      id: 'profile-error',
      title,
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true
    });
  }, [logOperation, showToast]);
  
  // Function to update profile
  const updateProfile = useCallback(async (updatedProfile: Partial<UserProfile>): Promise<boolean> => {
    try {
      operationStartTimeRef.current = Date.now();
      logOperation('Starting profile update', { updatedProfile });
      
      const success = await updateProfileData(updatedProfile);
      
      if (success) {
        logOperation('Profile update completed successfully');
        return true;
      } else {
        logOperation('Profile update failed');
        return false;
      }
    } catch (error) {
      handleError(error, 'Error updating profile');
      return false;
    }
  }, [updateProfileData, logOperation, handleError]);
  
  // Function to handle saving profile
  const handleSaveProfile = useCallback(async (
    updatedProfile: Partial<UserProfile>,
    isUpdatingRef: React.MutableRefObject<boolean>,
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>,
    onSuccess: () => void,
    onError: () => void
  ): Promise<boolean> => {
    // Prevent duplicate save operations
    if (isUpdatingRef.current || checkLoadingState([ProfileLoadingState.UPDATING], loadingState)) {
      logOperation('Save operation ignored - already in progress', {
        isUpdatingRef: isUpdatingRef.current,
        loadingState
      });
      return false;
    }
    
    // Set updating flag
    isUpdatingRef.current = true;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    try {
      // Start operation timer
      operationStartTimeRef.current = Date.now();
      logOperation('Starting profile save operation', { updatedProfile });
      
      // Update profile
      const success = await updateProfileData(updatedProfile);
      
      if (success) {
        logOperation('Profile save completed successfully');
        onSuccess();
        return true;
      } else {
        logOperation('Profile save failed');
        onError();
        return false;
      }
    } catch (error) {
      logOperation('Profile save error', { error });
      handleError(error, 'Error saving profile');
      onError();
      return false;
    } finally {
      // Set timeout to reset updating flag after a delay
      // This prevents rapid consecutive save attempts
      timeoutRef.current = setTimeout(() => {
        isUpdatingRef.current = false;
        timeoutRef.current = null;
        logOperation('Reset updating flag');
      }, 1000);
    }
  }, [updateProfileData, logOperation, handleError, isLoadingData, loadingState]);
  
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
    handleSaveProfile,
    handleRetryLoading,
    updateProfile,
    handleError,
    refreshProfileData,
    operationStartTimeRef
  };
}
