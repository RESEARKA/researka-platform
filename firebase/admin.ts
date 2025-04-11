import * as admin from 'firebase-admin';
import { createLogger } from '../utils/logger';

const logger = createLogger('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check if we're using service account credentials or environment variables
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Parse the service account key from environment variable
      const serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8')
      );
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    } else {
      // Use default credentials (useful for local development or when deployed to Firebase hosting)
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
    
    logger.info('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('Error initializing Firebase Admin SDK', {
      context: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    // Throw error to prevent app from starting with broken Firebase connection
    throw new Error(`Failed to initialize Firebase Admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export the admin SDK and database
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

// Configure Firestore
db.settings({
  ignoreUndefinedProperties: true,
});

export default admin;
