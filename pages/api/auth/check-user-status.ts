import { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';
import { createLogger, LogCategory } from '../../../utils/logger';

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

const logger = createLogger('api-check-user-status');

/**
 * API endpoint to check if a user is allowed to access the system
 * This is used after Firebase Authentication to verify the user hasn't been deleted or deactivated
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the ID token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    logger.info('Checking user status', {
      context: { uid },
      category: LogCategory.AUTH
    });

    // Get the user from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      logger.warn('User document not found', {
        context: { uid },
        category: LogCategory.AUTH
      });
      return res.status(404).json({ error: 'User not found', code: 'user-not-found' });
    }

    const userData = userDoc.data();
    
    // Check if the user is deleted or deactivated
    if (userData?.isDeleted === true) {
      logger.warn('Deleted user attempted to access the system', {
        context: { uid },
        category: LogCategory.AUTH
      });
      
      // Ensure the user is disabled in Firebase Auth
      await adminAuth.updateUser(uid, { disabled: true });
      
      return res.status(403).json({ 
        error: 'Account has been deleted', 
        code: 'account-deleted' 
      });
    }

    if (userData?.isActive === false) {
      logger.warn('Deactivated user attempted to access the system', {
        context: { uid },
        category: LogCategory.AUTH
      });
      return res.status(403).json({ 
        error: 'Account has been deactivated', 
        code: 'account-deactivated' 
      });
    }

    // User is valid
    return res.status(200).json({ 
      status: 'active',
      role: userData?.role || 'User'
    });
  } catch (error) {
    logger.error('Error checking user status', {
      context: { error },
      category: LogCategory.ERROR
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
