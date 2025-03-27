import { useState, useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';
import useFirebaseInitialization, { FirebaseStatus } from './useFirebaseInitialization';
import useClient from './useClient';

/**
 * Auth initialization status enum
 */
export enum AuthStatus {
  INITIALIZING = 'initializing',
  READY = 'ready',
  ERROR = 'error',
  TIMEOUT = 'timeout',
  UNAVAILABLE = 'unavailable' // For server-side or when window is undefined
}

/**
 * Auth initialization result interface
 */
export interface AuthInitResult {
  status: AuthStatus;
  error: Error | null;
  user: User | null;
  isAnonymous: boolean;
}

/**
 * Options for Auth initialization
 */
export interface AuthInitOptions {
  /**
   * Timeout in milliseconds before initialization is considered failed
   * Default: 10000 (10 seconds)
   */
  timeoutMs?: number;
  
  /**
   * Whether to enable detailed logging
   * Default: false
   */
  enableLogging?: boolean;
  
  /**
   * Whether to persist auth state in local storage
   * Default: true
   */
  persistState?: boolean;
}

/**
 * Custom hook for Firebase Authentication initialization
 * 
 * This hook centralizes all Firebase auth initialization logic and provides:
 * 1. Clear status reporting (INITIALIZING, READY, ERROR, TIMEOUT)
 * 2. Better debugging information during initialization
 * 3. Prevention of duplicate Firebase auth instances
 * 4. Proper cleanup on component unmount
 * 
 * @param options Configuration options for auth initialization
 * @returns Auth initialization result
 */
export function useAuthInitialization(options: AuthInitOptions = {}): AuthInitResult {
  // Default options
  const {
    timeoutMs = 10000,
    enableLogging = false,
    persistState = true
  } = options;
  
  // State for tracking auth status
  const [result, setResult] = useState<AuthInitResult>({
    status: AuthStatus.INITIALIZING,
    error: null,
    user: null,
    isAnonymous: false
  });
  
  // Refs to track initialization state
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const authListenerSetupRef = useRef<boolean>(false);
  
  // Check if we're on the client side
  const isClient = useClient();
  
  // Use the Firebase initialization hook to ensure Firebase is initialized first
  const { 
    status: firebaseStatus, 
    error: firebaseError, 
    auth 
  } = useFirebaseInitialization({
    timeoutMs,
    enableLogging
  });
  
  // Log function that respects enableLogging option
  const log = (message: string, level: 'log' | 'warn' | 'error' = 'log') => {
    if (enableLogging || level === 'error') {
      if (level === 'log') console.log(`useAuthInitialization: ${message}`);
      else if (level === 'warn') console.warn(`useAuthInitialization: ${message}`);
      else if (level === 'error') console.error(`useAuthInitialization: ${message}`);
    }
  };
  
  // Update result state only if component is still mounted
  const safeSetResult = (newResult: Partial<AuthInitResult>) => {
    if (isMountedRef.current) {
      setResult(prev => ({ ...prev, ...newResult }));
    }
  };
  
  // Initialize auth listener
  useEffect(() => {
    // Skip if not on client side
    if (!isClient) {
      log('Not on client side, skipping initialization', 'warn');
      safeSetResult({ status: AuthStatus.UNAVAILABLE });
      return;
    }
    
    // Set mounted flag
    isMountedRef.current = true;
    
    // Handle Firebase initialization errors
    if (firebaseStatus === FirebaseStatus.ERROR || firebaseStatus === FirebaseStatus.TIMEOUT) {
      log(`Firebase initialization failed: ${firebaseError?.message}`, 'error');
      safeSetResult({
        status: AuthStatus.ERROR,
        error: firebaseError || new Error('Firebase initialization failed')
      });
      return;
    }
    
    // Wait for Firebase to be initialized
    if (firebaseStatus !== FirebaseStatus.INITIALIZED || !auth) {
      if (firebaseStatus === FirebaseStatus.INITIALIZING) {
        log('Waiting for Firebase to initialize...');
      }
      return;
    }
    
    // Skip if auth listener is already set up
    if (authListenerSetupRef.current) {
      log('Auth listener already set up, skipping');
      return;
    }
    
    // Mark that we've started setting up the auth listener
    authListenerSetupRef.current = true;
    
    log('Setting up auth state listener...');
    
    // Add timeout to prevent hanging indefinitely
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        log(`Auth initialization timed out after ${timeoutMs}ms`, 'error');
        safeSetResult({
          status: AuthStatus.TIMEOUT,
          error: new Error(`Auth initialization timed out after ${timeoutMs}ms`)
        });
      }
    }, timeoutMs);
    
    // Set up auth state listener
    const setupAuthListener = async () => {
      try {
        // Dynamically import Firebase auth functions
        const { onAuthStateChanged } = await import('firebase/auth');
        
        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          log(`Auth state changed: ${user ? `User: ${user.uid}` : 'No user'}`);
          
          // Clear the timeout since auth state has changed
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          
          // Update state with user info
          safeSetResult({
            status: AuthStatus.READY,
            error: null,
            user,
            isAnonymous: user?.isAnonymous || false
          });
        }, (error) => {
          // Handle auth state change errors
          log(`Auth state change error: ${error.message}`, 'error');
          safeSetResult({
            status: AuthStatus.ERROR,
            error
          });
          
          // Clear the timeout since we got an error
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        });
        
        // Return cleanup function
        return unsubscribe;
      } catch (error) {
        // Handle setup errors
        const err = error instanceof Error ? error : new Error(String(error));
        log(`Error setting up auth listener: ${err.message}`, 'error');
        safeSetResult({
          status: AuthStatus.ERROR,
          error: err
        });
        
        // Clear the timeout since we got an error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        return () => {}; // Return empty cleanup function
      }
    };
    
    // Set up the auth listener and store the cleanup function
    let unsubscribe: (() => void) | undefined;
    
    setupAuthListener().then(cleanup => {
      unsubscribe = cleanup;
    }).catch(error => {
      log(`Error in setupAuthListener: ${error}`, 'error');
    });
    
    // Cleanup function
    return () => {
      log('Cleanup: Component unmounting');
      isMountedRef.current = false;
      
      // Unsubscribe from auth state changes
      if (unsubscribe) {
        unsubscribe();
      }
      
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isClient, firebaseStatus, firebaseError, auth, timeoutMs, enableLogging]);
  
  return result;
}

/**
 * Utility function to check if a user is anonymous
 * @param user Firebase User object or null
 * @returns boolean indicating if the user is anonymous
 */
export function isAnonymousUser(user: User | null): boolean {
  return user?.isAnonymous || false;
}

export default useAuthInitialization;
