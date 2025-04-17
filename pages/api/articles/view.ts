import { NextApiRequest, NextApiResponse } from 'next';
import { incrementViewCount } from '../../../utils/articleMetrics';
import { createLogger, LogCategory } from '../../../utils/logger';

const logger = createLogger('api-view-count');

/**
 * API endpoint to increment the view count for an article
 * 
 * @param req NextApiRequest
 * @param res NextApiResponse
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { articleId } = req.body;

    if (!articleId) {
      return res.status(400).json({ error: 'Article ID is required' });
    }

    await incrementViewCount(articleId);

    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error in view count API', {
      context: { error, body: req.body },
      category: LogCategory.ERROR
    });
    
    return res.status(500).json({ error: 'Failed to increment view count' });
  }
}
