import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../../config/firebase-admin';
import { createLogger, LogCategory } from '../../../../utils/logger';

const logger = createLogger('api-check-user');

/**
 * API endpoint to check a user's status in the database
 * This is for debugging purposes only
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.query;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    logger.info('Checking user status by email', {
      context: { email },
      category: LogCategory.AUTH
    });

    // Query Firestore for the user with this email
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the first matching user
    const userData = snapshot.docs[0].data();
    const userId = snapshot.docs[0].id;
    
    // Return user data with sensitive fields removed
    return res.status(200).json({
      id: userId,
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      isActive: userData.isActive,
      isDeleted: userData.isDeleted || false,
      createdAt: userData.createdAt?.toDate(),
      lastLogin: userData.lastLogin?.toDate(),
      deletedAt: userData.deletedAt?.toDate(),
      deletedReason: userData.deletedReason
    });
  } catch (error) {
    logger.error('Error checking user', {
      context: { error },
      category: LogCategory.ERROR
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
