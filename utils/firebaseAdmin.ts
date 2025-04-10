import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { createLogger, LogCategory } from './logger';

const logger = createLogger('utils/firebaseAdmin');

/**
 * Initialize Firebase Admin SDK
 * Uses a singleton pattern to ensure only one instance is created
 */
export function initAdmin() {
  try {
    if (getApps().length === 0) {
      // Get service account credentials from environment variables
      // For local development, these can be set in a .env.local file
      // For production, these should be set in the hosting environment
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
      
      if (!serviceAccount) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
      }
      
      // Initialize the app with credentials
      admin.initializeApp({
        credential: admin.credential.cert(
          // Parse the JSON string from environment variable
          JSON.parse(
            Buffer.from(serviceAccount, 'base64').toString('utf8')
          )
        ),
        // Use the same database URL as the client
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
      });
      
      logger.info('Firebase Admin initialized', {
        category: LogCategory.SYSTEM
      });
    }
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin', {
      context: { error },
      category: LogCategory.ERROR
    });
    throw error;
  }
}

/**
 * Get Firebase Admin Auth instance
 * @returns admin.auth.Auth
 */
export function getAdminAuth() {
  try {
    return admin.auth();
  } catch (error) {
    logger.error('Failed to get Firebase Admin Auth', {
      context: { error },
      category: LogCategory.ERROR
    });
    throw error;
  }
}

/**
 * Get Firebase Admin Firestore instance
 * @returns admin.firestore.Firestore
 */
export function getAdminFirestore() {
  try {
    return admin.firestore();
  } catch (error) {
    logger.error('Failed to get Firebase Admin Firestore', {
      context: { error },
      category: LogCategory.ERROR
    });
    throw error;
  }
}

/**
 * Verify Firebase ID token and get user
 * @param token Firebase ID token
 * @returns Firebase user record
 */
export async function verifyIdToken(token: string) {
  try {
    return await getAdminAuth().verifyIdToken(token);
  } catch (error) {
    logger.error('Failed to verify ID token', {
      context: { error },
      category: LogCategory.AUTH
    });
    throw error;
  }
}
