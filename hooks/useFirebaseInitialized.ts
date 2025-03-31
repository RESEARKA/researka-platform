import { useState, useEffect } from 'react';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase'; // Corrected path to firebase config
import { isSupported, getAnalytics } from 'firebase/analytics';
import { createLogger, LogCategory } from '../utils/logger';

// Create a logger instance for this hook
const logger = createLogger('useFirebaseInitialized');

export let app: any;
export let auth: any;
export let db: any;
export let analytics: any;
let isInitialized = false;

// Define the return type for the hook
export interface FirebaseInitStatus {
  initialized: boolean;
  error: Error | null;
  isTimedOut: boolean;
}

export function initializeFirebase(): { success: boolean; error: Error | null } {
  if (typeof window === 'undefined') {
    return { success: false, error: new Error('Cannot initialize Firebase on server side') };
  }

  try {
    if (!isInitialized) {
      if (getApps().length === 0) {
        logger.debug('Initializing Firebase for the first time', {
          category: LogCategory.SYSTEM
        });
        app = initializeApp(firebaseConfig);
      } else {
        logger.debug('Reusing existing Firebase app', {
          category: LogCategory.SYSTEM
        });
        app = getApps()[0];
      }
      auth = getAuth(app);
      db = getFirestore(app);

      // Initialize analytics if supported
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      });
      isInitialized = true;
      return { success: true, error: null };
    }
    return { success: true, error: null };
  } catch (error) {
    logger.error('Error initializing Firebase:', {
      context: { error },
      category: LogCategory.SYSTEM
    });
    return { success: false, error: error instanceof Error ? error : new Error('Unknown error initializing Firebase') };
  }
}

export function useFirebaseInitialized(): FirebaseInitStatus {
  const [status, setStatus] = useState<FirebaseInitStatus>({
    initialized: false,
    error: null,
    isTimedOut: false
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set a timeout to detect slow initialization
      const timeoutId = setTimeout(() => {
        setStatus(prev => ({ ...prev, isTimedOut: true }));
      }, 5000);

      const result = initializeFirebase();
      setStatus({
        initialized: result.success,
        error: result.error,
        isTimedOut: false
      });

      // Clear timeout if initialization completes
      return () => clearTimeout(timeoutId);
    }
    return undefined; // Explicit return for server-side rendering
  }, []);

  return status;
}

export default useFirebaseInitialized;
