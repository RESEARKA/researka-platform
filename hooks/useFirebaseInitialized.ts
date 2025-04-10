import { useState, useEffect } from 'react';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';
import { isSupported, getAnalytics } from 'firebase/analytics';

// Define the return type for the hook
export interface FirebaseInitStatus {
  initialized: boolean;
  error: Error | null;
  isTimedOut: boolean;
}

// Safely check if we're on the client side
const isClientSide = () => typeof window !== 'undefined';

// Global variables to hold Firebase instances
export let app: any;
export let auth: any;
export let db: any;
export let analytics: any;
let isInitialized = false;

export function initializeFirebase(): { success: boolean; error: Error | null } {
  // Only run on client side
  if (!isClientSide()) {
    return { success: false, error: new Error('Cannot initialize Firebase on server side') };
  }

  try {
    if (!isInitialized) {
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      auth = getAuth(app);
      db = getFirestore(app);

      // Initialize analytics if supported
      if (isClientSide()) {
        isSupported().then((supported) => {
          if (supported) {
            analytics = getAnalytics(app);
          }
        }).catch(() => {
          // Silently fail if analytics isn't supported
        });
      }
      
      isInitialized = true;
      return { success: true, error: null };
    }
    return { success: true, error: null };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error initializing Firebase') 
    };
  }
}

export function useFirebaseInitialized(): FirebaseInitStatus {
  const [status, setStatus] = useState<FirebaseInitStatus>({
    initialized: isClientSide() ? isInitialized : false,
    error: null,
    isTimedOut: false
  });

  useEffect(() => {
    // Only run on client side
    if (!isClientSide()) {
      return;
    }
    
    // Set a timeout to detect slow initialization
    const timeoutId = setTimeout(() => {
      setStatus(prev => ({ ...prev, isTimedOut: true }));
    }, 5000);

    try {
      const result = initializeFirebase();
      setStatus({
        initialized: result.success,
        error: result.error,
        isTimedOut: false
      });
    } catch (error) {
      setStatus({
        initialized: false,
        error: error instanceof Error ? error : new Error('Unknown error initializing Firebase'),
        isTimedOut: false
      });
    }

    // Clear timeout if initialization completes
    return () => clearTimeout(timeoutId);
  }, []);

  return status;
}

export default useFirebaseInitialized;
