import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import exampleHandler from '../example';

// Mock the apiErrorHandler module
jest.mock('../../../utils/apiErrorHandler', () => ({
  withErrorHandling: (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => 
    async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
      try {
        await handler(req, res);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
      }
    }
}));

// Mock the errorHandling module
jest.mock('../../../utils/errorHandling', () => ({
  handleApiError: jest.fn((error: unknown) => ({
    error: {
      message: error instanceof Error ? error.message : 'Unknown error',
      statusCode: (error instanceof Error && 'statusCode' in error) 
        ? (error as any).statusCode 
        : 500
    }
  }))
}));

describe('Example API Route', () => {
  it('returns a successful response', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await exampleHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Hello from API!',
    });
  });

  it('returns an error for non-GET requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    await exampleHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed',
    });
  });

  it('handles errors properly', async () => {
    // Mock a request that will cause an error
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: {
        'x-trigger-error': 'true',
      },
    });

    await exampleHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
});
