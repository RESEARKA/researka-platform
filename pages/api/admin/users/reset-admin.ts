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

const logger = createLogger('api-reset-admin');

/**
 * API endpoint to reset the admin account status
 * This is a special endpoint to ensure the admin account is active
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

    logger.info('Checking admin account', {
      context: { email },
      category: LogCategory.AUTH
    });

    // Find the user by email
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the first matching user
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;
    
    // Check if the user exists in Firebase Auth
    try {
      const userRecord = await adminAuth.getUser(userId);
      
      // Reset the user in Firebase Auth if disabled
      if (userRecord.disabled) {
        await adminAuth.updateUser(userId, {
          disabled: false
        });
        logger.info('Enabled admin account in Firebase Auth', {
          context: { userId, email },
          category: LogCategory.AUTH
        });
      }
    } catch (authError) {
      logger.error('Error getting user from Firebase Auth', {
        context: { authError, userId, email },
        category: LogCategory.ERROR
      });
      return res.status(500).json({ error: 'Error checking Firebase Auth user' });
    }
    
    // Reset the user in Firestore
    const updates = {
      isDeleted: false,
      isActive: true,
      role: 'Admin',
      updatedAt: new Date()
    };
    
    // Remove deletion fields if they exist
    if (userData.deletedAt) {
      updates['deletedAt'] = admin.firestore.FieldValue.delete();
    }
    if (userData.deletedReason) {
      updates['deletedReason'] = admin.firestore.FieldValue.delete();
    }
    if (userData.deletedBy) {
      updates['deletedBy'] = admin.firestore.FieldValue.delete();
    }
    
    await adminDb.collection('users').doc(userId).update(updates);
    
    logger.info('Reset admin account successfully', {
      context: { userId, email },
      category: LogCategory.AUTH
    });
    
    return res.status(200).json({ 
      message: 'Admin account reset successfully',
      userId,
      email,
      previousStatus: {
        isDeleted: userData.isDeleted || false,
        isActive: userData.isActive
      }
    });
  } catch (error) {
    logger.error('Error resetting admin account', {
      context: { error },
      category: LogCategory.ERROR
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
