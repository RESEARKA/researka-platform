import { NextApiRequest, NextApiResponse } from 'next';
import { handleApiError } from './errorHandling';

/**
 * Higher-order function that wraps an API handler with error handling
 * @param handler The API handler function to wrap
 * @returns A wrapped API handler function with error handling
 */
export function withErrorHandling(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      await handler(req, res);
    } catch (error) {
      // Get context information from the request
      const context = {
        url: req.url,
        method: req.method,
        query: req.query,
        headers: {
          // Include only safe headers
          'content-type': req.headers['content-type'],
          'user-agent': req.headers['user-agent'],
        },
      };

      // Handle the error and send a standardized response
      const errorResponse = handleApiError(error, context);
      
      // Only send the response if it hasn't been sent already
      if (!res.writableEnded) {
        res.status(errorResponse.error.statusCode).json(errorResponse);
      }
    }
  };
}

/**
 * Example usage:
 * 
 * ```
 * import { withErrorHandling } from '../utils/apiErrorHandler';
 * 
 * async function handler(req: NextApiRequest, res: NextApiResponse) {
 *   // Your API logic here
 * }
 * 
 * export default withErrorHandling(handler);
 * ```
 */
