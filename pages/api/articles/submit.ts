import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '../../../utils/firebase';
import { auth } from '../../../utils/firebase-admin';
import logger from '../../../utils/logger';

/**
 * API endpoint to handle article submissions
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token and get user information
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Get article data from request body
    const articleData = req.body;
    
    // Add submission metadata
    const submissionData = {
      ...articleData,
      userId,
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to Firestore
    const articlesCollection = firestore.collection('articles');
    const docRef = await articlesCollection.add(submissionData);
    
    logger.info(`Article submitted successfully with ID: ${docRef.id}`);
    
    // Return success response with the article ID
    return res.status(200).json({ 
      success: true, 
      message: 'Article submitted successfully',
      articleId: docRef.id
    });
    
  } catch (error) {
    logger.error('Error submitting article:', error);
    return res.status(500).json({ 
      error: 'Failed to submit article',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
