import { useCallback, useRef } from 'react';
import { UserProfile, useProfileData } from './useProfileData';
import useAppToast from './useAppToast';
import { createLogger, LogCategory } from '../utils/logger';
import { ProfileLoadingState } from '../components/profile/types';

// Create a logger instance for profile operations
const logger = createLogger('profileOperations');

// Define additional loading states that might not be in the enum
export type ExtendedProfileLoadingState = ProfileLoadingState;

/**
 * Custom hook for profile operations
 * Centralizes business logic for profile-related operations
 */
export function useProfileOperations() {
  // Get profile data and operations from the useProfileData hook
  const { 
    profile, 
    isLoading,
    error, 
    isProfileComplete, 
    updateProfile: updateProfileData, 
    retryLoading,
    updateOperationInProgress,
    loadingState,
    loadData
  } = useProfileData();
  
  // UI helpers
  const showToast = useAppToast();
  
  // Create refs to track operation state
  const operationStartTimeRef = useRef<number>(0);
  const updateInProgressRef = useRef(false);
  const lastOperationTimestampRef = useRef<number>(0);
  const pendingUpdatesRef = useRef<Partial<UserProfile> | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Minimum time between operations to prevent rapid updates
  const MIN_OPERATION_INTERVAL = 500; // ms
  
  // Helper function to check if the loading state is in a specific set of states
  const isInLoadingState = useCallback((states: ExtendedProfileLoadingState[]) => {
    return states.includes(loadingState as ExtendedProfileLoadingState);
  }, [loadingState]);
  
  // Helper function to check if a component loading state is active
  const isInComponentLoadingState = useCallback((state: ProfileLoadingState): boolean => {
    // Map the component loading state to the appropriate hook loading state
    let stateToCheck: ExtendedProfileLoadingState;
    
    switch (state) {
      case ProfileLoadingState.LOADING_PROFILE:
        stateToCheck = ProfileLoadingState.LOADING;
        break;
      case ProfileLoadingState.UPDATING_PROFILE:
        stateToCheck = ProfileLoadingState.UPDATING;
        break;
      default:
        stateToCheck = state;
    }
    
    return loadingState === stateToCheck;
  }, [loadingState]);
  
  // Helper to check if an operation can be performed
  const canPerformOperation = useCallback(() => {
    // Check if any operation is in progress
    if (updateInProgressRef.current || updateOperationInProgress.current) {
      logger.debug('Operation in progress, cannot perform new operation', {
        context: {
          updateInProgress: updateInProgressRef.current,
          operationInProgress: updateOperationInProgress.current,
          timeSinceLastOperation: Date.now() - lastOperationTimestampRef.current
        },
        category: LogCategory.LIFECYCLE
      });
      return false;
    }
    
    // Check if we need to throttle operations
    const timeSinceLastOperation = Date.now() - lastOperationTimestampRef.current;
    if (timeSinceLastOperation < MIN_OPERATION_INTERVAL) {
      logger.debug(`Operation throttled (${timeSinceLastOperation}ms since last operation)`, {
        category: LogCategory.PERFORMANCE
      });
      return false;
    }
    
    return true;
  }, [updateOperationInProgress]);
  
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
    
    // Update last operation timestamp
    lastOperationTimestampRef.current = now;
  }, [loadingState]);
  
  // Handle errors consistently
  const handleError = useCallback((error: any) => {
    // Log error with detailed context
    logger.error('Error in profile operation', {
      context: {
        error,
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      category: LogCategory.ERROR
    });
    
    // Show error toast with a consistent ID to prevent duplicates
    showToast({
      id: 'profile-operation-error',
      title: 'Update failed',
      description: 'There was a problem updating your profile. Please try again.',
      status: 'error',
    });
  }, [showToast]);
  
  // Clear any pending debounced updates
  const clearPendingUpdates = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    pendingUpdatesRef.current = null;
  }, []);
  
  // Process pending updates
  const processPendingUpdates = useCallback(async () => {
    // Skip if no pending updates
    if (!pendingUpdatesRef.current) {
      return;
    }
    
    // Get the pending updates
    const updates = pendingUpdatesRef.current;
    
    // Clear pending updates
    pendingUpdatesRef.current = null;
    
    // Process the updates
    try {
      await batchUpdateProfile(updates);
    } catch (error) {
      handleError(error);
    }
  }, []);
  
  // Batch update multiple profile fields in a single operation
  const batchUpdateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    // Check if we can perform the operation
    if (!canPerformOperation()) {
      // Queue the update for later
      pendingUpdatesRef.current = {
        ...pendingUpdatesRef.current,
        ...profileData
      };
      
      logger.debug('Batch operation queued for later processing', {
        context: {
          pendingFields: pendingUpdatesRef.current ? Object.keys(pendingUpdatesRef.current) : []
        },
        category: LogCategory.LIFECYCLE
      });
      
      // Set up debounce timeout to process pending updates
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        processPendingUpdates();
      }, MIN_OPERATION_INTERVAL);
      
      // Don't return false immediately for queued operations
      // Instead, show a "queued" toast and return true
      showToast({
        id: 'profile-save-queued',
        title: "Saving Profile",
        description: "Your profile changes are being processed...",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return true; // Return true since we've queued the operation
    }
    
    // Mark operation as started
    updateInProgressRef.current = true;
      
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
      
      // Show success toast with consistent ID
      if (result) {
        showToast({
          id: 'profile-update-success',
          title: 'Profile updated',
          description: 'Your profile has been successfully updated.',
          status: 'success',
        });
      }
      
      // Return the result
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
      throw error; // Re-throw error after handling
    } finally {
       // Mark operation as finished
       updateInProgressRef.current = false;
       logger.debug('Reset updateInProgressRef in batchUpdateProfile finally block', { category: LogCategory.LIFECYCLE });
    }
  }, [canPerformOperation, handleError, logOperation, processPendingUpdates, showToast, updateProfileData]);
  
  // Update profile with timeout handling and error management
  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    try {
      // Check if we can perform the operation
      if (!canPerformOperation()) {
        // Queue the update for later
        pendingUpdatesRef.current = {
          ...pendingUpdatesRef.current,
          ...profileData
        };
        
        logger.debug('Operation queued for later processing', {
          context: {
            pendingFields: pendingUpdatesRef.current ? Object.keys(pendingUpdatesRef.current) : []
          },
          category: LogCategory.LIFECYCLE
        });
        
        // Set up debounce timeout to process pending updates
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        
        debounceTimeoutRef.current = setTimeout(() => {
          processPendingUpdates();
        }, MIN_OPERATION_INTERVAL);
        
        // Don't return false immediately for queued operations
        // Instead, show a "queued" toast and return true
        showToast({
          id: 'profile-save-queued',
          title: "Saving Profile",
          description: "Your profile changes are being processed...",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        return true; // Return true since we've queued the operation
      }
      
      // Mark operation as started
      updateInProgressRef.current = true;
      operationStartTimeRef.current = Date.now();
      logOperation('Starting profile update', { fields: Object.keys(profileData) });

      // Call the underlying update function (batchUpdateProfile handles calling updateProfileData from useProfileData)
      const success = await batchUpdateProfile(profileData);

      if (success) {
        logOperation('Profile update completed', { success: true });
        showToast({
          id: 'profile-save-success',
          title: "Profile Saved",
          description: "Your profile has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        return true;
      } else {
        logOperation('Profile update failed', { success: false });
        showToast({
          id: 'profile-save-failed',
          title: "Save Failed",
          description: "Could not save your profile. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return false;
      }
    } catch (error) {
      handleError(error);
      logOperation('Profile update failed with error', { error: (error as Error).message });
      return false;
    } finally {
      // Mark operation as finished
      updateInProgressRef.current = false;
      operationStartTimeRef.current = 0;
      
      // If there are pending updates, process them immediately
      if (pendingUpdatesRef.current) {
        processPendingUpdates();
      }
    }
  }, [canPerformOperation, batchUpdateProfile, showToast, logOperation, handleError, processPendingUpdates]);

  // Function to handle retry loading
  const handleRetryLoading = useCallback(() => {
    // Skip if an operation is in progress
    if (updateInProgressRef.current || updateOperationInProgress.current) {
      logger.debug('Operation in progress, cannot retry loading', {
        category: LogCategory.LIFECYCLE
      });
      return;
    }
    
    logOperation('Retrying profile load');
    retryLoading();
  }, [logOperation, retryLoading, updateOperationInProgress]);
  
  // Function to refresh profile data
  const refreshProfileData = useCallback(() => {
    // Skip if an operation is in progress
    if (updateInProgressRef.current || updateOperationInProgress.current) {
      logger.debug('Operation in progress, cannot refresh profile data', {
        category: LogCategory.LIFECYCLE
      });
      return;
    }
    
    logOperation('Manually refreshing profile data');
    loadData(); // Use loadData directly
  }, [loadData, logOperation, updateOperationInProgress]);
  
  return {
    profile,
    isLoading,
    error,
    isProfileComplete,
    loadingState,
    isInLoadingState,
    isInComponentLoadingState,
    logOperation,
    handleSaveProfile: batchUpdateProfile,
    handleRetryLoading,
    updateProfile,
    handleError,
    refreshProfileData,
    operationStartTimeRef,
    updateInProgressRef,
    pendingUpdatesRef,
    clearPendingUpdates
  };
}
