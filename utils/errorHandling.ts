import * as Sentry from '@sentry/nextjs';

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
 * Handles API errors and returns a standardized response
 * @param error The error to handle
 * @param context Additional context for the error
 * @returns A standardized error response
 */
export function handleApiError(error: unknown, context?: Record<string, any>) {
  const errorMessage = captureError(error, context);
  
  // Determine the status code
  let statusCode = 500;
  if (error instanceof Error) {
    if ('statusCode' in error && typeof (error as any).statusCode === 'number') {
      statusCode = (error as any).statusCode;
    }
  }
  
  return {
    error: {
      message: errorMessage,
      statusCode,
    },
  };
}

/**
 * Creates an error with a status code
 * @param message The error message
 * @param statusCode The HTTP status code
 * @returns An error with a status code
 */
export function createError(message: string, statusCode: number): Error & { statusCode: number } {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
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

export default {
  captureError,
  handleApiError,
  createError,
  isErrorType,
};
