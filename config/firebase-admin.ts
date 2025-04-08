import * as admin from 'firebase-admin';
import logger from '../utils/logger';

/**
 * Get the Firebase Admin instance
 * This ensures we only initialize Firebase Admin once
 */
export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      // Check if environment variables are set
      if (!process.env.FIREBASE_PRIVATE_KEY) {
        logger.error('Firebase Admin initialization error: FIREBASE_PRIVATE_KEY is not set');
        throw new Error('FIREBASE_PRIVATE_KEY is not set');
      }

      if (!process.env.FIREBASE_CLIENT_EMAIL) {
        logger.error('Firebase Admin initialization error: FIREBASE_CLIENT_EMAIL is not set');
        throw new Error('FIREBASE_CLIENT_EMAIL is not set');
      }

      // Initialize Firebase Admin
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
      
      logger.info('Firebase Admin initialized successfully');
    } catch (error) {
      logger.error('Firebase Admin initialization error', { context: { error } });
      
      // Re-throw the error to be handled by the caller
      throw error;
    }
  }
  
  return admin;
}

// Export admin auth and firestore for convenience
export const adminAuth = () => getFirebaseAdmin().auth();
export const adminDb = () => getFirebaseAdmin().firestore();
export default getFirebaseAdmin;
