import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling } from '../apiErrorHandler';
import { handleApiError } from '../errorHandling';

// Mock the errorHandling module
jest.mock('../errorHandling', () => ({
  handleApiError: jest.fn(() => ({
    error: {
      message: 'Mocked error message',
      statusCode: 500,
    },
  })),
}));

describe('API Error Handler', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse> & { 
    status: jest.Mock; 
    json: jest.Mock;
    writableEnded: boolean;
  };
  
  beforeEach(() => {
    // Create mock request and response objects
    mockReq = {
      url: '/api/test',
      method: 'GET',
      query: { id: '123' },
      headers: {
        'content-type': 'application/json',
        'user-agent': 'jest-test',
      },
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      writableEnded: false,
    };
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  it('should call the handler function if no error occurs', async () => {
    // Create a mock handler that doesn't throw an error
    const mockHandler = jest.fn();
    const wrappedHandler = withErrorHandling(mockHandler);
    
    // Call the wrapped handler
    await wrappedHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);
    
    // Check that the original handler was called
    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
    
    // Check that the error handling wasn't triggered
    expect(handleApiError).not.toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });
  
  it('should handle errors thrown by the handler', async () => {
    // Create a mock handler that throws an error
    const mockError = new Error('Test error');
    const mockHandler = jest.fn().mockImplementation(() => {
      throw mockError;
    });
    
    const wrappedHandler = withErrorHandling(mockHandler);
    
    // Call the wrapped handler
    await wrappedHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);
    
    // Check that the original handler was called
    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
    
    // Check that the error was handled correctly
    expect(handleApiError).toHaveBeenCalledWith(mockError, expect.objectContaining({
      url: mockReq.url,
      method: mockReq.method,
      query: mockReq.query,
      headers: expect.objectContaining({
        'content-type': mockReq.headers ? mockReq.headers['content-type'] : undefined,
        'user-agent': mockReq.headers ? mockReq.headers['user-agent'] : undefined,
      }),
    }));
    
    // Check that the response was sent with the correct status and data
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        message: 'Mocked error message',
        statusCode: 500,
      },
    });
  });
  
  it('should not send a response if it has already been sent', async () => {
    // Create a mock handler that throws an error
    const mockHandler = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });
    
    const wrappedHandler = withErrorHandling(mockHandler);
    
    // Set writableEnded to true to simulate a response that has already been sent
    mockRes.writableEnded = true;
    
    // Call the wrapped handler
    await wrappedHandler(mockReq as NextApiRequest, mockRes as NextApiResponse);
    
    // Check that the error was handled
    expect(handleApiError).toHaveBeenCalled();
    
    // Check that no response was sent
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });
});
