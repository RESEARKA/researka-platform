import * as Sentry from '@sentry/nextjs';
import { UseToastOptions } from '@chakra-ui/react';
import { createLogger, LogCategory } from './logger';

// Create a logger instance for error handling
const logger = createLogger('errorHandling');

/**
 * Standard error categories for consistent error handling
 */
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  SERVER = 'server',
  DATABASE = 'database',
  TIMEOUT = 'timeout',
  NOT_FOUND = 'not_found',
  UNKNOWN = 'unknown'
}

/**
 * Standard error interface for consistent error handling
 */
export interface AppError extends Error {
  category?: ErrorCategory;
  statusCode?: number;
  originalError?: unknown;
  context?: Record<string, any>;
  retry?: boolean;
  code?: string;
}

/**
 * Captures an error with Sentry and returns a user-friendly error message
 * @param error The error to capture
 * @param context Additional context for the error
 * @returns A user-friendly error message
 */
export function captureError(error: unknown, context?: Record<string, any>): string {
  console.error('Error occurred:', error);
  
  // Capture the error with Sentry
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    const eventId = Sentry.captureException(error, {
      extra: {
        ...context,
        source: 'errorHandling.ts',
      },
    });
    console.log(`Sentry event ID: ${eventId}`);
  }
  
  // Return a user-friendly error message
  if (error instanceof Error) {
    // For known errors, return the error message
    return error.message;
  } else {
    // For unknown errors, return a generic message
    return 'An unexpected error occurred. Our team has been notified.';
  }
}

/**
 * Standardized error handling function
 * @param error The error object or message
 * @param operation Description of the operation that failed
 * @param context Additional context information
 * @returns Formatted AppError object
 */
export function handleError(error: unknown, operation: string, context?: Record<string, any>): AppError {
  // Determine error type and format appropriately
  const appError = formatError(error, context);
  
  // Log the error with our centralized logger
  logger.error(`${operation} failed: ${appError.message}`, {
    context: {
      ...context,
      errorCode: appError.code,
      errorCategory: appError.category,
      originalError: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    },
    category: LogCategory.ERROR
  });
  
  // Return the formatted error
  return appError;
}

/**
 * Formats an error into a standardized AppError object
 * @param error The error object or message
 * @param context Additional context information
 * @returns Formatted AppError object
 */
function formatError(error: unknown, context?: Record<string, any>): AppError {
  const appError = new Error() as AppError;
  
  // Determine error category
  let category = ErrorCategory.UNKNOWN;
  let statusCode: number | undefined = undefined;
  let message = '';
  let retry = false;
  let code = '';
  
  if (error instanceof Error) {
    message = error.message;
    
    // Extract Firebase error code if available
    const firebaseError = error as any;
    if (firebaseError.code) {
      code = firebaseError.code;
      
      // Handle specific Firebase auth errors
      switch (code) {
        case 'auth/invalid-credential':
          category = ErrorCategory.AUTHENTICATION;
          message = 'Your session has expired. Please sign in again.';
          break;
        case 'auth/user-token-expired':
          category = ErrorCategory.AUTHENTICATION;
          message = 'Your session has expired. Please sign in again.';
          break;
        case 'auth/user-not-found':
          category = ErrorCategory.AUTHENTICATION;
          message = 'No account found with this email. Please check your email or create a new account.';
          break;
        case 'auth/wrong-password':
          category = ErrorCategory.AUTHENTICATION;
          message = 'Incorrect password. Please try again or reset your password.';
          break;
        case 'auth/too-many-requests':
          category = ErrorCategory.AUTHENTICATION;
          message = 'Too many unsuccessful login attempts. Please try again later or reset your password.';
          break;
        case 'auth/email-already-in-use':
          category = ErrorCategory.AUTHENTICATION;
          message = 'An account with this email already exists. Please sign in or use a different email.';
          break;
        case 'auth/weak-password':
          category = ErrorCategory.AUTHENTICATION;
          message = 'Password is too weak. Please use a stronger password.';
          break;
        case 'auth/invalid-email':
          category = ErrorCategory.AUTHENTICATION;
          message = 'Invalid email format. Please enter a valid email address.';
          break;
        default:
          // Check for network errors
          if (
            message.includes('network') || 
            message.includes('offline') || 
            message.includes('connection')
          ) {
            category = ErrorCategory.NETWORK;
            retry = true;
          }
          
          // Check for timeout errors
          else if (
            message.includes('timeout') || 
            message.includes('timed out')
          ) {
            category = ErrorCategory.TIMEOUT;
            retry = true;
          }
          
          // Check for authentication errors
          else if (
            message.includes('auth') || 
            message.includes('login') || 
            message.includes('sign in') ||
            message.includes('token')
          ) {
            category = ErrorCategory.AUTHENTICATION;
          }
      }
    } else {
      // Check for network errors
      if (
        message.includes('network') || 
        message.includes('offline') || 
        message.includes('connection')
      ) {
        category = ErrorCategory.NETWORK;
        retry = true;
      }
      
      // Check for timeout errors
      else if (
        message.includes('timeout') || 
        message.includes('timed out')
      ) {
        category = ErrorCategory.TIMEOUT;
        retry = true;
      }
      
      // Check for authentication errors
      else if (
        message.includes('auth') || 
        message.includes('login') || 
        message.includes('sign in') ||
        message.includes('token')
      ) {
        category = ErrorCategory.AUTHENTICATION;
      }
    }
    
    // Check for AppError
    if ((error as AppError).category) {
      category = (error as AppError).category!;
      statusCode = (error as AppError).statusCode;
      retry = (error as AppError).retry || false;
      if (!(error as AppError).code) {
        // Keep the code we extracted above
      } else {
        code = (error as AppError).code || '';
      }
    }
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'An unknown error occurred';
  }
  
  // Create a standardized AppError
  appError.category = category;
  appError.statusCode = statusCode;
  appError.message = message;
  appError.retry = retry;
  appError.code = code;
  appError.context = context;
  
  return appError;
}

/**
 * Handles API errors and returns a standardized response
 * @param error The error to handle
 * @param context Additional context for the error
 * @returns A standardized error response
 */
export function handleApiError(error: unknown, context?: Record<string, any>) {
  const appError = handleError(error, 'API request', context);
  
  return {
    error: {
      message: appError.message,
      statusCode: appError.statusCode,
      code: appError.code,
    },
  };
}

/**
 * Creates an error with a category and status code
 * @param message The error message
 * @param category The error category
 * @param statusCode The HTTP status code
 * @param originalError The original error
 * @returns An AppError
 */
export function createError(
  message: string, 
  category: ErrorCategory = ErrorCategory.UNKNOWN, 
  statusCode?: number,
  originalError?: unknown,
  context?: Record<string, any>
): AppError {
  const error = new Error(message) as AppError;
  error.category = category;
  error.statusCode = statusCode;
  error.originalError = originalError;
  error.context = context;
  return error;
}

/**
 * Checks if an error is a specific type
 * @param error The error to check
 * @param errorType The error type to check against
 * @returns Whether the error is of the specified type
 */
export function isErrorType<T extends Error>(
  error: unknown,
  errorType: new (...args: any[]) => T
): error is T {
  return error instanceof errorType;
}

/**
 * Handle component-specific errors with consistent logging and user feedback
 */
export function handleComponentError(
  error: unknown, 
  componentName: string, 
  operation: string, 
  context?: Record<string, any>
): AppError {
  // Add component name to context
  const enhancedContext = {
    component: componentName,
    ...context
  };
  
  // Log with component information
  logger.error(`Error in ${componentName}: ${operation}`, {
    context: enhancedContext,
    category: LogCategory.UI
  });
  
  // Format and return the error
  return handleError(error, operation, enhancedContext);
}

/**
 * Handle API/network errors with retry capability
 */
export function handleNetworkError(
  error: unknown, 
  endpoint: string, 
  operation: string, 
  context?: Record<string, any>
): AppError {
  // Enhance context with network information
  const enhancedContext = {
    endpoint,
    ...context
  };
  
  // Log with network category
  logger.error(`Network error calling ${endpoint}: ${operation}`, {
    context: enhancedContext,
    category: LogCategory.NETWORK
  });
  
  // Format and return the error
  return handleError(error, operation, enhancedContext);
}

/**
 * Handle authentication errors with appropriate user feedback
 */
export function handleAuthError(
  error: unknown, 
  operation: string, 
  context?: Record<string, any>
): AppError {
  // Log with auth category
  logger.error(`Authentication error: ${operation}`, {
    context,
    category: LogCategory.AUTH
  });
  
  // Format and return the error
  return handleError(error, operation, context);
}

/**
 * Get toast options based on error category
 * @param error The AppError
 * @returns Toast options for Chakra UI toast
 */
export function getErrorToastOptions(error: AppError): UseToastOptions {
  const baseOptions: UseToastOptions = {
    title: 'Error',
    status: 'error',
    duration: 5000,
    isClosable: true,
  };
  
  switch (error.category) {
    case ErrorCategory.NETWORK:
      return {
        ...baseOptions,
        title: 'Network Error',
        description: error.message || 'Unable to connect to the server. Please check your internet connection.',
        duration: 7000,
      };
      
    case ErrorCategory.AUTHENTICATION:
      return {
        ...baseOptions,
        title: 'Authentication Error',
        description: error.message || 'Your session may have expired. Please sign in again.',
        duration: 7000,
      };
      
    case ErrorCategory.AUTHORIZATION:
      return {
        ...baseOptions,
        title: 'Access Denied',
        description: error.message || 'You do not have permission to perform this action.',
      };
      
    case ErrorCategory.TIMEOUT:
      return {
        ...baseOptions,
        title: 'Request Timeout',
        description: error.message || 'The request took too long to complete. Please try again.',
      };
      
    case ErrorCategory.VALIDATION:
      return {
        ...baseOptions,
        title: 'Validation Error',
        description: error.message || 'Please check your input and try again.',
      };
      
    case ErrorCategory.NOT_FOUND:
      return {
        ...baseOptions,
        title: 'Not Found',
        description: error.message || 'The requested resource was not found.',
      };
      
    default:
      return {
        ...baseOptions,
        description: error.message || 'An unexpected error occurred. Please try again later.',
      };
  }
}

export default {
  captureError,
  handleApiError,
  createError,
  isErrorType,
  handleComponentError,
  handleNetworkError,
  handleAuthError,
  getErrorToastOptions,
  ErrorCategory
};
