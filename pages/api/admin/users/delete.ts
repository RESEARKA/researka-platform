import { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';
import { createLogger, LogCategory } from '../../../../utils/logger';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'researka',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace newlines in the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          : undefined,
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || 'researka'}.firebaseio.com`,
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

const logger = createLogger('api:admin:users:delete');

/**
 * API endpoint to delete a user
 * This is a soft delete that marks the user as deleted in Firestore and disables the account in Firebase Auth
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract data from request body
    const { userId, reason, adminId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Verify the requester is an admin (you would implement proper auth checks here)
    // This is a simplified check - in production, use proper authentication middleware
    const adminIdToken = req.headers.authorization?.split('Bearer ')[1];
    if (!adminIdToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(adminIdToken);
      
      // Check if the user is an admin
      const adminDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
      const adminData = adminDoc.data();
      
      if (!adminData || adminData.role !== 'Admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }
    } catch (authError) {
      logger.error('Authentication error', {
        context: { error: authError },
        category: LogCategory.AUTH
      });
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    logger.info('Deleting user', {
      context: { userId, adminId, reason },
      category: LogCategory.AUTH
    });

    // 1. Disable the user in Firebase Auth
    try {
      await adminAuth.updateUser(userId, {
        disabled: true
      });
      
      logger.info('User disabled in Firebase Auth', {
        context: { userId },
        category: LogCategory.AUTH
      });
    } catch (authError: any) {
      // If the user doesn't exist in Auth, log it but continue
      if (authError.code === 'auth/user-not-found') {
        logger.warn('User not found in Firebase Auth', {
          context: { userId },
          category: LogCategory.AUTH
        });
      } else {
        logger.error('Error disabling user in Firebase Auth', {
          context: { error: authError, userId },
          category: LogCategory.ERROR
        });
        return res.status(500).json({ error: 'Failed to disable user authentication' });
      }
    }

    // 2. Mark the user as deleted in Firestore
    try {
      await adminDb.collection('users').doc(userId).update({
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
        deletedReason: reason || 'Deleted by admin',
        deletedBy: adminId,
        updatedAt: new Date()
      });
      
      logger.info('User marked as deleted in Firestore', {
        context: { userId, reason },
        category: LogCategory.DATA
      });
    } catch (firestoreError) {
      logger.error('Error marking user as deleted in Firestore', {
        context: { error: firestoreError, userId },
        category: LogCategory.ERROR
      });
      return res.status(500).json({ error: 'Failed to update user data' });
    }

    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'User successfully deleted',
      userId
    });
  } catch (error) {
    logger.error('Unexpected error in delete user API', {
      context: { error },
      category: LogCategory.ERROR
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
