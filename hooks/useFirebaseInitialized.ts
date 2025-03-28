import { useState, useEffect, useRef } from 'react';
import { initializeFirebase, isFirebaseInitialized } from '../config/firebase';
import { createLogger, LogCategory } from '../utils/logger';

// Create a logger instance for this hook
const logger = createLogger('useFirebaseInitialized');

// Constants
const INITIALIZATION_TIMEOUT_MS = 5000; // 5 seconds timeout

/**
 * Custom hook to ensure Firebase is initialized on the client side
 * and provide a clean way for components to know when Firebase is ready
 * 
 * Enhanced with better error handling, logging, and timeout detection
 * 
 * @returns {Object} Object containing:
 *   - initialized: boolean indicating if Firebase is initialized and ready to use
 *   - error: Error object if initialization failed, null otherwise
 *   - isTimedOut: boolean indicating if initialization timed out
 */
export function useFirebaseInitialized() {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
  
  // Use refs to track initialization attempts and timeouts
  const initAttempts = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef<boolean>(true);
  
  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;
    
    // Only run on client side
    if (typeof window === 'undefined') {
      logger.debug('Skipping Firebase initialization in server environment', {
        category: LogCategory.SYSTEM
      });
      return;
    }
    
    // Check if already initialized
    if (isFirebaseInitialized()) {
      logger.info('Firebase already initialized', {
        category: LogCategory.SYSTEM
      });
      
      if (isMounted.current) {
        setInitialized(true);
      }
      return;
    }
    
    // Set timeout to detect slow initialization
    timeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        logger.warn('Firebase initialization timeout exceeded', {
          context: {
            timeoutMs: INITIALIZATION_TIMEOUT_MS,
            attempts: initAttempts.current
          },
          category: LogCategory.PERFORMANCE
        });
        setIsTimedOut(true);
      }
    }, INITIALIZATION_TIMEOUT_MS);
    
    // Initialize Firebase
    try {
      initAttempts.current += 1;
      
      logger.info('Initializing Firebase', {
        context: { attempt: initAttempts.current },
        category: LogCategory.SYSTEM
      });
      
      const result = initializeFirebase();
      
      if (isMounted.current) {
        setInitialized(result);
        
        // Log initialization status
        if (result) {
          logger.info('Firebase initialized successfully', {
            context: { attempts: initAttempts.current },
            category: LogCategory.SYSTEM
          });
        } else {
          const initError = new Error('Firebase initialization failed');
          logger.error('Firebase initialization failed', {
            context: { 
              error: initError,
              attempts: initAttempts.current
            },
            category: LogCategory.ERROR
          });
          setError(initError);
        }
      }
    } catch (err) {
      // Handle initialization error
      const initError = err instanceof Error ? err : new Error('Unknown Firebase initialization error');
      
      logger.error('Firebase initialization error', {
        context: { 
          error: initError,
          attempts: initAttempts.current
        },
        category: LogCategory.ERROR
      });
      
      if (isMounted.current) {
        setError(initError);
        setInitialized(false);
      }
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      
      // Clear timeout if it exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);
  
  return {
    initialized,
    error,
    isTimedOut
  };
}

export default useFirebaseInitialized;
