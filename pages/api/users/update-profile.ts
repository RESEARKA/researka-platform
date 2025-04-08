import { NextApiRequest, NextApiResponse } from 'next';
import { getFirebaseAdmin } from '../../../config/firebase-admin';
import logger from '../../../utils/logger';

/**
 * API endpoint for updating user profiles
 * This server-side approach bypasses Firestore security rules by using admin privileges
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the user's authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - Missing or invalid token' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized - Missing token' });
    }

    // Get Firebase Admin instance
    const admin = getFirebaseAdmin();
    
    // Verify the token and get the user
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      if (!decodedToken || !decodedToken.uid) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
      }

      const userId = decodedToken.uid;
      const profileData = req.body;

      // Validate the profile data
      if (!profileData || typeof profileData !== 'object') {
        return res.status(400).json({ error: 'Bad request - Invalid profile data' });
      }

      // Ensure the profile data contains the user's ID and prevent ID spoofing
      if (profileData.uid && profileData.uid !== userId) {
        return res.status(403).json({ error: 'Forbidden - Cannot update another user\'s profile' });
      }

      // Add required fields if not present
      const updatedData = {
        ...profileData,
        uid: userId,
        updatedAt: new Date().toISOString()
      };

      // If this is a new profile, add createdAt
      if (!profileData.createdAt) {
        updatedData.createdAt = new Date().toISOString();
      }

      // Get Firestore instance
      const db = admin.firestore();

      // Check if user document exists
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        logger.info('Creating new user profile via API', {
          context: { userId }
        });
      } else {
        logger.info('Updating existing user profile via API', {
          context: { userId }
        });
      }

      // Update the user profile with admin privileges
      await db.collection('users').doc(userId).set(updatedData, { merge: true });

      // Get the updated profile
      const updatedProfile = await db.collection('users').doc(userId).get();
      
      if (!updatedProfile.exists) {
        logger.error('Profile not found after update', {
          context: { userId }
        });
        return res.status(404).json({ error: 'Profile not found after update' });
      }

      // Return the updated profile
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        profile: updatedProfile.data()
      });
    } catch (tokenError) {
      logger.error('Error verifying ID token', {
        context: { error: tokenError }
      });
      return res.status(401).json({ 
        error: 'Unauthorized - Token verification failed',
        details: tokenError instanceof Error ? tokenError.message : 'Unknown error'
      });
    }
  } catch (error) {
    logger.error('Error updating profile', {
      context: { error }
    });
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
