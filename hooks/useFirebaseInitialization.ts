import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  initializeFirebase, 
  isFirebaseInitialized,
  cleanupFirebase,
  registerFirebaseCleanup,
  getFirebaseAuth,
  getFirebaseFirestore
} from '../config/firebase';
import useClient from './useClient';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

// Firebase initialization status
export enum FirebaseStatus {
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  ERROR = 'error',
  TIMEOUT = 'timeout',
  UNAVAILABLE = 'unavailable'
}

// Result of Firebase initialization
export interface FirebaseInitResult {
  status: FirebaseStatus;
  error?: Error;
  retry: () => void;
  auth: Auth | null;
  db: Firestore | null;
}

// Options for Firebase initialization
interface FirebaseInitOptions {
  timeoutMs?: number;
  maxAttempts?: number;
  enableLogging?: boolean;
}

/**
 * Hook to centralize Firebase initialization logic
 * Ensures Firebase is only initialized on the client side
 * Handles timeouts and retries for initialization
 */
export function useFirebaseInitialization(options: FirebaseInitOptions = {}): FirebaseInitResult {
  // Default options
  const {
    timeoutMs = 10000,
    maxAttempts = 3,
    enableLogging = false
  } = options;
  
  // Check if we're on the client side
  const isClient = useClient();
  
  // State to track initialization status
  const [result, setResult] = useState<Omit<FirebaseInitResult, 'retry'>>({
    status: isClient ? FirebaseStatus.INITIALIZING : FirebaseStatus.UNAVAILABLE,
    auth: null,
    db: null
  });
  
  // Refs to track initialization attempts and timeout
  const attemptCount = useRef(0);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  
  // Safe state setter that checks if component is still mounted
  const safeSetResult = useCallback((newResult: Omit<FirebaseInitResult, 'retry'>) => {
    if (isMounted.current) {
      setResult(newResult);
    }
  }, []);
  
  // Logging function
  const log = useCallback((message: string, level: 'log' | 'warn' | 'error' = 'log') => {
    if (enableLogging) {
      switch (level) {
        case 'warn':
          console.warn(`[FirebaseInit] ${message}`);
          break;
        case 'error':
          console.error(`[FirebaseInit] ${message}`);
          break;
        default:
          console.log(`[FirebaseInit] ${message}`);
      }
    }
  }, [enableLogging]);
  
  // Function to initialize Firebase
  const initializeFirebaseWithRetry = useCallback(async () => {
    // Clear any existing timeout
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
    
    // If we've reached max attempts, set error state
    if (attemptCount.current >= maxAttempts) {
      log(`Maximum initialization attempts (${maxAttempts}) reached`, 'error');
      safeSetResult({ 
        status: FirebaseStatus.ERROR,
        error: new Error(`Failed to initialize Firebase after ${maxAttempts} attempts`),
        auth: null,
        db: null
      });
      return;
    }
    
    // Increment attempt counter
    attemptCount.current += 1;
    log(`Initialization attempt ${attemptCount.current}/${maxAttempts}`);
    
    // Set initializing state
    safeSetResult({ 
      status: FirebaseStatus.INITIALIZING,
      auth: null,
      db: null
    });
    
    // Set timeout for initialization
    timeoutId.current = setTimeout(() => {
      if (result.status === FirebaseStatus.INITIALIZING) {
        log(`Initialization timed out after ${timeoutMs}ms`, 'warn');
        safeSetResult({ 
          status: FirebaseStatus.TIMEOUT,
          error: new Error(`Firebase initialization timed out after ${timeoutMs}ms`),
          auth: null,
          db: null
        });
      }
    }, timeoutMs);
    
    try {
      // Check if we're on client side
      if (!isClient) {
        log('Not on client side, skipping initialization', 'warn');
        safeSetResult({ 
          status: FirebaseStatus.UNAVAILABLE,
          auth: null,
          db: null
        });
        return;
      }
      
      // Try to initialize Firebase
      const success = initializeFirebase();
      
      // Clear timeout if initialization completed
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
      
      if (success) {
        log('Initialization successful');
        const auth = getFirebaseAuth();
        const db = getFirebaseFirestore();
        safeSetResult({ status: FirebaseStatus.INITIALIZED, auth, db });
        
        // Register cleanup function
        registerFirebaseCleanup(() => {
          log('Cleanup triggered from Firebase');
        });
      } else {
        log('Initialization failed', 'error');
        
        // If we haven't reached max attempts, retry after a delay
        if (attemptCount.current < maxAttempts) {
          log(`Will retry in 1000ms (attempt ${attemptCount.current}/${maxAttempts})`);
          setTimeout(() => {
            if (isMounted.current) {
              initializeFirebaseWithRetry();
            }
          }, 1000);
        } else {
          safeSetResult({ 
            status: FirebaseStatus.ERROR,
            error: new Error('Failed to initialize Firebase'),
            auth: null,
            db: null
          });
        }
      }
    } catch (error) {
      log(`Error during initialization: ${error}`, 'error');
      
      // Clear timeout if initialization completed
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
      
      safeSetResult({ 
        status: FirebaseStatus.ERROR,
        error: error instanceof Error ? error : new Error(String(error)),
        auth: null,
        db: null
      });
    }
  }, [isClient, log, maxAttempts, result.status, safeSetResult, timeoutMs]);
  
  // Function to retry initialization
  const retry = useCallback(() => {
    log('Manually retrying initialization');
    attemptCount.current = 0;
    initializeFirebaseWithRetry();
  }, [initializeFirebaseWithRetry, log]);
  
  // Initialize Firebase on mount
  useEffect(() => {
    // Skip initialization if not on client
    if (!isClient) {
      log('Not on client side, skipping initialization effect', 'warn');
      return;
    }
    
    // Check if Firebase is already initialized
    if (isFirebaseInitialized()) {
      log('Firebase already initialized, skipping initialization');
      const auth = getFirebaseAuth();
      const db = getFirebaseFirestore();
      safeSetResult({ status: FirebaseStatus.INITIALIZED, auth, db });
      return;
    }
    
    // Initialize Firebase
    initializeFirebaseWithRetry();
    
    // Cleanup on unmount
    return () => {
      log('Component unmounting, cleaning up');
      isMounted.current = false;
      
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
    };
  }, [initializeFirebaseWithRetry, isClient, log, safeSetResult]);
  
  // Return the result with retry function
  return {
    ...result,
    retry
  };
}
