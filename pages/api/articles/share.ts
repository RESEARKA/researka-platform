import { NextApiRequest, NextApiResponse } from 'next';
import { recordSocialShare } from '../../../utils/articleMetrics';
import { createLogger, LogCategory } from '../../../utils/logger';

const logger = createLogger('api-social-share');

/**
 * API endpoint to record a social share for an article
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
    const { articleId, platform } = req.body;

    if (!articleId) {
      return res.status(400).json({ error: 'Article ID is required' });
    }

    if (!platform || !['twitter', 'facebook', 'linkedin', 'email'].includes(platform)) {
      return res.status(400).json({ error: 'Valid platform is required' });
    }

    await recordSocialShare(articleId, platform);

    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error in social share API', {
      context: { error, body: req.body },
      category: LogCategory.ERROR
    });
    
    return res.status(500).json({ error: 'Failed to record social share' });
  }
}
