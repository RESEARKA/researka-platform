import { useCallback, useRef } from 'react';
import { UserProfile, useProfileData, isInLoadingState as checkLoadingState } from './useProfileData';
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
    isUpdating,
    error, 
    isProfileComplete, 
    updateProfile: updateProfileData, 
    retryLoading,
    isLoadingData,
    isUpdatingProfile,
    updateOperationInProgress,
    loadingState,
    loadData
  } = useProfileData();
  
  // UI helpers
  const showToast = useAppToast();
  
  // Create refs to track operation state
  const operationStartTimeRef = useRef<number>(0);
  const updateInProgressRef = useRef<boolean>(false);
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
    
    // Reset operation flags
    updateInProgressRef.current = false;
    
    // Retry loading if appropriate
    retryLoading();
    
    return error;
  }, [retryLoading, showToast, loadingState]);
  
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
        
        return false;
      }
      
      // Set operation flags
      updateInProgressRef.current = true;
      
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
      
      // Reset operation flags
      updateInProgressRef.current = false;
      
      // Process any pending updates
      if (pendingUpdatesRef.current) {
        processPendingUpdates();
      }
      
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
      
      // Reset operation flags
      updateInProgressRef.current = false;
      
      // Show error toast
      showToast({
        title: 'Error updating profile',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        status: 'error',
      });
      
      throw error;
    }
  }, [canPerformOperation, logOperation, processPendingUpdates, showToast, updateProfileData]);
  
  // Batch update multiple profile fields in a single operation
  const batchUpdateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    try {
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
        
        return false;
      }
      
      // Set operation flags
      updateInProgressRef.current = true;
      
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
      
      // Reset operation flags
      updateInProgressRef.current = false;
      
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
      
      // Reset operation flags
      updateInProgressRef.current = false;
      
      // Show error toast and handle the error
      handleError(error);
      throw error;
    }
  }, [canPerformOperation, handleError, logOperation, processPendingUpdates, updateProfileData]);
  
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
