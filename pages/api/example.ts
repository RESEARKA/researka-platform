import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling } from '../../utils/apiErrorHandler';

/**
 * Example API handler for testing purposes
 * 
 * Handles GET requests and returns a simple message
 * Can be used to test error handling by sending a request with x-trigger-error header
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simulate an error if the x-trigger-error header is present
  if (req.headers['x-trigger-error']) {
    throw new Error('This is a test error');
  }

  // Return a successful response
  return res.status(200).json({ message: 'Hello from API!' });
}

// Wrap the handler with error handling middleware
export default withErrorHandling(handler);
