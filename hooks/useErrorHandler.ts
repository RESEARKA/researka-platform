import { useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { 
  handleComponentError, 
  AppError, 
  ErrorCategory,
  getErrorToastOptions 
} from '../utils/errorHandling';

interface ErrorHandlerOptions {
  /**
   * Component name for error tracking
   */
  componentName: string;
  
  /**
   * Whether to show toast notifications for errors
   * @default true
   */
  showToasts?: boolean;
  
  /**
   * Custom toast duration in milliseconds
   * @default 5000
   */
  toastDuration?: number;
  
  /**
   * Whether to automatically retry network errors
   * @default false
   */
  autoRetry?: boolean;
  
  /**
   * Maximum number of retries for auto-retry
   * @default 3
   */
  maxRetries?: number;
}

/**
 * Custom hook for standardized error handling across components
 * 
 * Provides consistent error handling with:
 * - Error categorization
 * - Automatic toast notifications
 * - Sentry error reporting
 * - Retry capabilities
 */
export function useErrorHandler({
  componentName,
  showToasts = true,
  toastDuration = 5000,
  autoRetry = false,
  maxRetries = 3
}: ErrorHandlerOptions) {
  const toast = useToast();
  
  /**
   * Handle an error with standardized logging and user feedback
   */
  const handleError = useCallback((
    error: unknown,
    operation: string,
    context?: Record<string, any>
  ): AppError => {
    // Create standardized error
    const appError = handleComponentError(error, componentName, operation, context);
    
    // Show toast notification if enabled
    if (showToasts) {
      const toastOptions = getErrorToastOptions(appError);
      
      // Override duration if specified
      if (toastDuration !== 5000) {
        toastOptions.duration = toastDuration;
      }
      
      toast(toastOptions);
    }
    
    return appError;
  }, [componentName, showToasts, toast, toastDuration]);
  
  /**
   * Wrap an async function with error handling
   */
  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    operation: string,
    context?: Record<string, any>
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error, operation, context);
        return undefined;
      }
    };
  }, [handleError]);
  
  /**
   * Wrap an async function with error handling and retry logic
   */
  const withRetry = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    operation: string,
    options?: {
      retryCount?: number;
      retryDelay?: number;
      onRetry?: (attempt: number, error: AppError) => void;
      context?: Record<string, any>;
    }
  ) => {
    const retryCount = options?.retryCount ?? (autoRetry ? maxRetries : 0);
    const retryDelay = options?.retryDelay ?? 1000;
    
    return async (...args: T): Promise<R | undefined> => {
      let lastError: AppError | undefined;
      
      for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
          return await fn(...args);
        } catch (error) {
          // Process the error
          lastError = handleComponentError(
            error, 
            componentName, 
            `${operation} (attempt ${attempt + 1}/${retryCount + 1})`,
            options?.context
          );
          
          // Show toast only on final attempt if retrying
          if (showToasts && (attempt === retryCount || !lastError.retry)) {
            toast(getErrorToastOptions(lastError));
          }
          
          // Call onRetry callback if provided
          if (options?.onRetry) {
            options.onRetry(attempt + 1, lastError);
          }
          
          // If error is not retryable or we've reached max retries, stop
          if (!lastError.retry || attempt === retryCount) {
            break;
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
      
      return undefined;
    };
  }, [autoRetry, componentName, handleError, maxRetries, showToasts, toast]);
  
  /**
   * Create an AppError with the given category
   */
  const createError = useCallback((
    message: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    context?: Record<string, any>
  ): AppError => {
    return handleComponentError(
      { message, category },
      componentName,
      'createError',
      context
    );
  }, [componentName]);
  
  return {
    handleError,
    withErrorHandling,
    withRetry,
    createError,
    ErrorCategory
  };
}

export default useErrorHandler;
