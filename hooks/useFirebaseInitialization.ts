import { useState, useEffect, useRef } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { Analytics } from 'firebase/analytics';
import useClient from './useClient';

/**
 * Firebase initialization status enum
 */
export enum FirebaseStatus {
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  ERROR = 'error',
  TIMEOUT = 'timeout',
  UNAVAILABLE = 'unavailable' // For server-side or when window is undefined
}

/**
 * Firebase initialization result interface
 */
export interface FirebaseInitResult {
  status: FirebaseStatus;
  error: Error | null;
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  analytics: Analytics | null;
}

/**
 * Options for Firebase initialization
 */
export interface FirebaseInitOptions {
  /**
   * Timeout in milliseconds before initialization is considered failed
   * Default: 10000 (10 seconds)
   */
  timeoutMs?: number;
  
  /**
   * Maximum number of initialization attempts
   * Default: 3
   */
  maxAttempts?: number;
  
  /**
   * Whether to enable detailed logging
   * Default: false
   */
  enableLogging?: boolean;
  
  /**
   * Whether to initialize analytics
   * Default: true
   */
  initializeAnalytics?: boolean;
}

/**
 * Custom hook for Firebase initialization
 * 
 * This hook centralizes all Firebase initialization logic and provides:
 * 1. Singleton pattern to prevent multiple initializations
 * 2. Client-side only execution
 * 3. Timeout handling to prevent hanging
 * 4. Proper cleanup on component unmount
 * 5. Detailed status reporting
 * 
 * @param options Configuration options for initialization
 * @returns Firebase initialization result
 */
export function useFirebaseInitialization(options: FirebaseInitOptions = {}): FirebaseInitResult {
  // Default options
  const {
    timeoutMs = 10000,
    maxAttempts = 3,
    enableLogging = false,
    initializeAnalytics = true
  } = options;
  
  // State for tracking initialization status
  const [result, setResult] = useState<FirebaseInitResult>({
    status: FirebaseStatus.INITIALIZING,
    error: null,
    app: null,
    auth: null,
    db: null,
    analytics: null
  });
  
  // Refs to track initialization state
  const attemptCountRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const initializationInProgressRef = useRef<boolean>(false);
  
  // Check if we're on the client side
  const isClient = useClient();
  
  // Log function that respects enableLogging option
  const log = (message: string, level: 'log' | 'warn' | 'error' = 'log') => {
    if (enableLogging || level === 'error') {
      if (level === 'log') console.log(`useFirebaseInitialization: ${message}`);
      else if (level === 'warn') console.warn(`useFirebaseInitialization: ${message}`);
      else if (level === 'error') console.error(`useFirebaseInitialization: ${message}`);
    }
  };
  
  // Update result state only if component is still mounted
  const safeSetResult = (newResult: Partial<FirebaseInitResult>) => {
    if (isMountedRef.current) {
      setResult(prev => ({ ...prev, ...newResult }));
    }
  };
  
  // Initialize Firebase
  useEffect(() => {
    // Skip initialization if not on client side
    if (!isClient) {
      log('Not on client side, skipping initialization', 'warn');
      safeSetResult({ status: FirebaseStatus.UNAVAILABLE });
      return;
    }
    
    // Set mounted flag
    isMountedRef.current = true;
    
    // Function to initialize Firebase
    const initializeFirebase = async () => {
      // Prevent multiple simultaneous initialization attempts
      if (initializationInProgressRef.current) {
        log('Initialization already in progress, skipping', 'warn');
        return;
      }
      
      // Check if we've exceeded max attempts
      if (attemptCountRef.current >= maxAttempts) {
        log(`Maximum initialization attempts (${maxAttempts}) reached`, 'error');
        safeSetResult({
          status: FirebaseStatus.ERROR,
          error: new Error(`Maximum initialization attempts (${maxAttempts}) reached`)
        });
        return;
      }
      
      // Set initialization in progress flag
      initializationInProgressRef.current = true;
      attemptCountRef.current++;
      
      log(`Initialization attempt ${attemptCountRef.current}/${maxAttempts}`);
      
      // Set timeout to prevent hanging
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          log(`Initialization timed out after ${timeoutMs}ms`, 'error');
          safeSetResult({
            status: FirebaseStatus.TIMEOUT,
            error: new Error(`Firebase initialization timed out after ${timeoutMs}ms`)
          });
          initializationInProgressRef.current = false;
        }
      }, timeoutMs);
      
      try {
        // Dynamically import Firebase modules to ensure client-side only execution
        const firebaseApp = await import('firebase/app');
        const firebaseAuth = await import('firebase/auth');
        const firebaseFirestore = await import('firebase/firestore');
        
        // Import analytics conditionally
        let analytics: Analytics | null = null;
        if (initializeAnalytics) {
          const firebaseAnalytics = await import('firebase/analytics');
          
          // Check if analytics is supported in this environment
          const analyticsSupported = await firebaseAnalytics.isSupported().catch(() => false);
          if (analyticsSupported) {
            log('Analytics is supported in this environment');
          } else {
            log('Analytics is not supported in this environment', 'warn');
          }
        }
        
        // Import Firebase config
        const { firebaseConfig } = await import('../config/firebase');
        
        // Check if Firebase app is already initialized
        let app: FirebaseApp;
        if (firebaseApp.getApps().length > 0) {
          log('Firebase app already exists, reusing existing instance');
          app = firebaseApp.getApps()[0];
        } else {
          log('Initializing new Firebase app instance');
          app = firebaseApp.initializeApp(firebaseConfig);
        }
        
        // Initialize auth and firestore
        const auth = firebaseAuth.getAuth(app);
        const db = firebaseFirestore.getFirestore(app);
        
        // Initialize analytics if supported and requested
        if (initializeAnalytics) {
          try {
            const firebaseAnalytics = await import('firebase/analytics');
            const analyticsSupported = await firebaseAnalytics.isSupported();
            
            if (analyticsSupported) {
              analytics = firebaseAnalytics.getAnalytics(app);
              log('Analytics initialized successfully');
            }
          } catch (analyticsError) {
            log(`Analytics initialization error: ${analyticsError}`, 'warn');
          }
        }
        
        // Clear timeout since initialization succeeded
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        // Update state with successful initialization
        safeSetResult({
          status: FirebaseStatus.INITIALIZED,
          error: null,
          app,
          auth,
          db,
          analytics
        });
        
        log('Firebase initialized successfully');
      } catch (error) {
        // Handle initialization error
        log(`Initialization error: ${error}`, 'error');
        safeSetResult({
          status: FirebaseStatus.ERROR,
          error: error instanceof Error ? error : new Error(String(error))
        });
      } finally {
        // Reset initialization in progress flag
        initializationInProgressRef.current = false;
      }
    };
    
    // Start initialization
    initializeFirebase();
    
    // Cleanup function
    return () => {
      log('Cleanup: Component unmounting');
      isMountedRef.current = false;
      
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isClient, timeoutMs, maxAttempts, enableLogging, initializeAnalytics]);
  
  return result;
}

/**
 * Utility function to check if Firebase is available in the current environment
 * @returns boolean indicating if Firebase can be initialized
 */
export function canUseFirebase(): boolean {
  return typeof window !== 'undefined';
}

export default useFirebaseInitialization;
