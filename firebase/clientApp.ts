// Mock Firebase implementation for development
// This file would be replaced with actual Firebase configuration in production

import { getApps, initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { createLogger, LogCategory } from '../utils/logger';

const logger = createLogger('firebase-client');

// Use mock values for development if environment variables are not set
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDOCAbC123dEf456GhI789jKl012-MnO',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'researka.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'researka',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'researka.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:a1b2c3d4e5f6g7h8i9j0',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-ABCDEF1234'
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// Use emulators in development environment
if (process.env.NODE_ENV === 'development') {
  try {
    logger.info('Using Firebase emulators for development', {
      category: LogCategory.SYSTEM
    });
    
    if (typeof window !== 'undefined') {
      // Only connect to emulators in browser environment
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(firestore, 'localhost', 8080);
      connectStorageEmulator(storage, 'localhost', 9199);
    }
  } catch (error) {
    logger.error('Failed to connect to Firebase emulators', {
      context: { error },
      category: LogCategory.ERROR
    });
  }
}

export { app, auth, firestore, storage };
