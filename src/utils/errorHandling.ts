/**
 * Error handling utilities for Researka
 */

/**
 * Custom error types for the application
 */
export enum ErrorType {
  NETWORK = 'network',
  API = 'api',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  AUTHENTICATION = 'authentication',
  UNKNOWN = 'unknown'
}

/**
 * Application error with additional context
 */
export class AppError extends Error {
  type: ErrorType;
  statusCode?: number;
  context?: Record<string, any>;

  constructor(
    message: string, 
    type: ErrorType = ErrorType.UNKNOWN, 
    statusCode?: number,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.context = context;
  }
}

/**
 * Parse an error from an API response
 * @param response The fetch Response object
 * @returns A promise that resolves to an AppError
 */
export async function parseApiError(response: Response): Promise<AppError> {
  let errorMessage = `API Error: ${response.status} ${response.statusText}`;
  let errorType = ErrorType.API;
  
  try {
    // Try to parse error details from response body
    const data = await response.json();
    if (data.message) {
      errorMessage = data.message;
    }
    
    // Determine error type based on status code
    switch (response.status) {
      case 400:
        errorType = ErrorType.VALIDATION;
        break;
      case 401:
      case 403:
        errorType = ErrorType.AUTHENTICATION;
        break;
      case 404:
        errorType = ErrorType.NOT_FOUND;
        break;
      case 429:
        errorType = ErrorType.RATE_LIMIT;
        break;
      default:
        errorType = ErrorType.API;
    }
  } catch (e) {
    // If we can't parse the JSON, just use the status text
    console.warn('Failed to parse error response:', e);
  }
  
  return new AppError(errorMessage, errorType, response.status);
}

/**
 * Handles network errors and converts them to AppErrors
 * @param error The caught error
 * @returns An AppError
 */
export function handleNetworkError(error: any): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  const message = error.message || 'Network error occurred';
  return new AppError(message, ErrorType.NETWORK);
}

/**
 * Log an error with appropriate level and context
 * @param error The error to log
 * @param context Additional context
 */
export function logError(error: Error | AppError, context: Record<string, any> = {}): void {
  const isAppError = error instanceof AppError;
  const errorType = isAppError ? error.type : ErrorType.UNKNOWN;
  const statusCode = isAppError ? error.statusCode : undefined;
  
  // In production, this would send to a logging service
  if (import.meta.env.PROD) {
    // Production logging (would integrate with a service like Sentry)
    console.error('ERROR:', {
      message: error.message,
      type: errorType,
      statusCode,
      stack: error.stack,
      context: {
        ...(isAppError ? error.context || {} : {}),
        ...context
      }
    });
  } else {
    // Development logging
    console.error(
      `[${errorType.toUpperCase()}]${statusCode ? ` (${statusCode})` : ''}: ${error.message}`,
      {
        context: {
          ...(isAppError ? error.context || {} : {}),
          ...context
        },
        stack: error.stack
      }
    );
  }
}
