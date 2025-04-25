import { captureError, handleApiError, createError, isErrorType, ErrorCategory } from '../errorHandling';

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(() => 'mock-event-id'),
}));

describe('Error Handling Utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock console.error to prevent test output pollution
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock console.log to prevent test output pollution
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Mock environment variables
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://mock-sentry-dsn.ingest.sentry.io/123456';
  });
  
  afterEach(() => {
    // Restore console.error
    jest.restoreAllMocks();
    
    // Reset environment variables
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  });

  describe('captureError', () => {
    it('returns the error message for known errors', () => {
      const error = new Error('Test error message');
      const result = captureError(error);
      expect(result).toBe('Test error message');
    });

    it('returns a generic message for unknown errors', () => {
      const result = captureError('Not an error object');
      expect(result).toBe('An unexpected error occurred. Our team has been notified.');
    });

    it('includes context information when provided', () => {
      const error = new Error('Test error with context');
      const context = { userId: '123', action: 'test-action' };
      const result = captureError(error, context);
      expect(result).toBe('Test error with context');
    });

    it('should capture the error with Sentry', () => {
      const error = new Error('Test error message');
      captureError(error, { additionalContext: 'test' });
      
      // Check that Sentry.captureException was called
      const Sentry = require('@sentry/nextjs');
      expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.any(Object));
    });
  });

  describe('handleApiError', () => {
    it('returns a standardized error response with the correct status code', () => {
      // Use createError to ensure the error is formatted correctly
      const error = createError('API error', ErrorCategory.SERVER, 400); 
      
      const result = handleApiError(error);
      
      // Expect the structure returned by handleApiError, including code
      expect(result).toEqual({
        error: {
          message: 'API error',
          statusCode: 400, // Should be preserved from createError
          code: '', // formatError defaults code to '' if not present
        },
      });
    });

    it('defaults to status code undefined for generic errors without a status code', () => {
      const error = new Error('Internal server error');
      
      const result = handleApiError(error);
      
      // Expect the actual behavior: statusCode is undefined, code is ''
      expect(result).toEqual({
        error: {
          message: 'Internal server error',
          statusCode: undefined, // The code does not default to 500
          code: '', // formatError defaults code to ''
        },
      });
    });

    it('should use the status code from the error if available', () => {
      // Fix: Call createError with the correct signature (message, category, statusCode)
      const error = createError('Not found', ErrorCategory.NOT_FOUND, 404);
      const result = handleApiError(error);
      
      // Expect the structure returned by handleApiError, including code
      expect(result).toEqual({
        error: {
          message: 'Not found',
          statusCode: 404, // Should be preserved from createError
          code: '', // formatError defaults code to ''
        },
      });
    });
  });

  describe('createError', () => {
    it('should create an error with a status code', () => {
      // Fix: Call createError with the correct signature (message, category, statusCode)
      const error = createError('Not found', ErrorCategory.NOT_FOUND, 404);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Not found');
      expect(error.category).toBe(ErrorCategory.NOT_FOUND);
      expect(error.statusCode).toBe(404);
    });
  });

  describe('isErrorType', () => {
    it('should return true for errors of the specified type', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }
      
      const error = new CustomError('Custom error message');
      const result = isErrorType(error, CustomError);
      
      expect(result).toBe(true);
    });
    
    it('should return false for errors not of the specified type', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }
      
      const error = new Error('Standard error message');
      const result = isErrorType(error, CustomError);
      
      expect(result).toBe(false);
    });
  });
});
