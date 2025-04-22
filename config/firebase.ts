import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { createLogger, LogCategory } from '../utils/logger';

// Create logger instance
const logger = createLogger('firebase-config');

// Configuration constants for Firebase initialization
// Can be adjusted via .env file for different environments
const MAX_INITIALIZATION_ATTEMPTS = Number(process.env.NEXT_PUBLIC_FIREBASE_MAX_INIT_ATTEMPTS) || 3;
const AUTH_EMULATOR_HOST = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
const FIRESTORE_EMULATOR_HOST = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost:8080';

// Helper function to check if code is running on client side
export const isClientSide = () => typeof window !== 'undefined';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBm1xnqw87ho4mXEEMVVvqNKismySpQOsU",
  authDomain: "researka.firebaseapp.com",
  projectId: "researka",
  storageBucket: "researka.appspot.com",
  messagingSenderId: "13219500485",
  appId: "1:13219500485:web:19c4dbdd41c2db5f813bac",
  measurementId: "G-1GK8GGNXXQ"
};

/**
 * Firebase instance container with singleton pattern
 * This ensures we only create one instance of each Firebase service
 */
class FirebaseInstance {
  private static instance: FirebaseInstance;
  private _app: FirebaseApp | null = null;
  private _auth: Auth | null = null;
  private _db: Firestore | null = null;
  private _analytics: Analytics | null = null;
  private _isInitialized = false;
  private _initializationAttempts = 0;
  private readonly _maxInitAttempts = MAX_INITIALIZATION_ATTEMPTS;
  private _cleanupFunctions: Array<() => void> = [];

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): FirebaseInstance {
    if (!FirebaseInstance.instance) {
      FirebaseInstance.instance = new FirebaseInstance();
    }
    return FirebaseInstance.instance;
  }

  /**
   * Initialize Firebase services
   * @returns boolean indicating if initialization was successful
   */
  public async initialize(): Promise<boolean> {
    // Only run on client side
    if (!isClientSide()) {
      return false;
    }
    
    // Don't retry too many times
    if (this._initializationAttempts >= this._maxInitAttempts) {
      logger.error(`Maximum initialization attempts (${this._maxInitAttempts}) reached`, {
        category: LogCategory.SYSTEM,
        context: { attempts: this._initializationAttempts }
      });
      return false;
    }
    
    // If already initialized successfully, return true
    if (this._isInitialized && this._app && this._auth && this._db) {
      return true;
    }
    
    this._initializationAttempts++;
    
    try {
      // Check if Firebase app is already initialized
      if (!getApps().length) {
        this._app = initializeApp(firebaseConfig);
      } else {
        this._app = getApps()[0];
      }
      
      // Initialize auth and firestore
      if (this._app) {
        this._auth = getAuth(this._app);
        this._db = getFirestore(this._app);
        
        // Connect to emulators if configured to do so
        if (shouldUseEmulator) {
          try {
            if (this._auth) {
              logger.info('Connecting to Firebase Auth emulator', {
                category: LogCategory.SYSTEM,
                context: { host: AUTH_EMULATOR_HOST }
              });
              connectAuthEmulator(
                this._auth, 
                `http://${AUTH_EMULATOR_HOST}`, 
                { disableWarnings: true }
              );
            }
            
            if (this._db) {
              const [host, portStr] = FIRESTORE_EMULATOR_HOST.split(':');
              const port = parseInt(portStr, 10);
              
              logger.info('Connecting to Firebase Firestore emulator', {
                category: LogCategory.SYSTEM,
                context: { host, port }
              });
              connectFirestoreEmulator(this._db, host, port);
            }
          } catch (emulatorError) {
            logger.error('Failed to connect to Firebase emulators', {
              category: LogCategory.ERROR,
              context: { error: emulatorError }
            });
            // Don't fail initialization if emulator connection fails
          }
        }
        
        // Initialize analytics only on client side and if supported
        if (isClientSide()) {
          try {
            const supported = await isSupported();
            if (supported && this._app) {
              this._analytics = getAnalytics(this._app);
            }
          } catch (analyticsError) {
            logger.error('Analytics initialization error', {
              category: LogCategory.ERROR,
              context: { error: analyticsError }
            });
          }
        }
        
        this._isInitialized = true;
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Firebase: Initialization error:', {
        category: LogCategory.ERROR,
        context: { error }
      });
      return false;
    }
  }

  /**
   * Register a cleanup function to be called when cleanup() is invoked
   * @param cleanupFn Function to call during cleanup
   */
  public registerCleanup(cleanupFn: () => void): void {
    this._cleanupFunctions.push(cleanupFn);
  }

  /**
   * Clean up Firebase resources
   * This doesn't actually terminate Firebase connections (as Firebase doesn't support that)
   * but it runs any registered cleanup functions and resets the initialization state
   */
  public cleanup(): void {
    // Run all registered cleanup functions
    this._cleanupFunctions.forEach(fn => {
      try {
        fn();
      } catch (error) {
        logger.error('Error in cleanup function', {
          category: LogCategory.ERROR,
          context: { error }
        });
      }
    });
    
    // Clear the cleanup functions array
    this._cleanupFunctions = [];
  }

  /**
   * Reset the initialization state
   * This is mainly for testing purposes
   */
  public reset(): void {
    this.cleanup();
    this._isInitialized = false;
    this._initializationAttempts = 0;
  }

  // Getters
  get app(): FirebaseApp | null {
    return this._app;
  }

  get auth(): Auth | null {
    return this._auth;
  }

  get db(): Firestore | null {
    return this._db;
  }

  get analytics(): Analytics | null {
    return this._analytics;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }
}

// Create a singleton instance
const firebaseInstance = FirebaseInstance.getInstance();

// Helper: only use emulator when env flag is true *and* in dev mode
const shouldUseEmulator =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' &&
  process.env.NODE_ENV === 'development';

/**
 * Initialize Firebase on the client side with singleton pattern and retry logic
 * Enhanced with better error handling and detailed logging
 * @returns boolean - True if initialization was successful
 */
export const initializeFirebase = async (): Promise<boolean> => {
  // Only run on client side
  if (!isClientSide()) {
    return false;
  }
  
  try {
    // Initialize using the singleton instance
    const result = await firebaseInstance.initialize();
    return result;
  } catch (error) {
    logger.error('Critical initialization error', {
      category: LogCategory.ERROR,
      context: { error },
      sendToSentry: true
    });
    return false;
  }
};

/**
 * Get Firebase Auth instance
 * Initializes Firebase if not already initialized
 * Enhanced with better error handling and logging
 * @returns Auth | null
 */
export const getFirebaseAuth = async (): Promise<Auth | null> => {
  if (!isClientSide()) {
    return null;
  }
  
  try {
    // Check if Firebase is initialized and initialize if not
    if (!firebaseInstance.isInitialized) {
      const initialized = await initializeFirebase();
      
      if (!initialized) {
        return null;
      }
    }
    
    // Get Auth instance
    return firebaseInstance.auth;
  } catch (error) {
    logger.error('Error getting Auth instance', {
      category: LogCategory.ERROR,
      context: { error }
    });
    return null;
  }
};

/**
 * Get Firebase Firestore instance
 * Initializes Firebase if not already initialized
 * Enhanced with better error handling and logging
 * @returns Firestore | null
 */
export const getFirebaseFirestore = async (): Promise<Firestore | null> => {
  if (!isClientSide()) return null;
  
  try {
    // Fast path: if any app exists, just get Firestore immediately
    if (isFirebaseAppsInitialized()) {
      const app = getApps()[0];
      const firestore = getFirestore(app);
      (firebaseInstance as any)._db = firestore; // cache
      return firestore;
    }

    // Otherwise initialize quickly
    const success = await initializeFirebase();
    if (!success) {
      logger.error('Firebase failed to initialize', { category: LogCategory.ERROR });
      return null;
    }

    if (!firebaseInstance.db) {
      const app = getApps()[0];
      const firestore = getFirestore(app);
      (firebaseInstance as any)._db = firestore;
    }

    return firebaseInstance.db;
  } catch (error) {
    logger.error('Error getting Firestore instance', {
      category: LogCategory.ERROR,
      context: { error }
    });
    return null;
  }
};

/**
 * Get Firebase App instance
 * Initializes Firebase if not already initialized
 * @returns FirebaseApp | null
 */
export const getFirebaseApp = async (): Promise<FirebaseApp | null> => {
  if (!isClientSide()) {
    return null;
  }
  
  try {
    // Check if Firebase is initialized and initialize if not
    if (!firebaseInstance.isInitialized) {
      await initializeFirebase();
    }
    return firebaseInstance.app;
  } catch (error) {
    logger.error('Error getting Firebase app instance', {
      category: LogCategory.ERROR,
      context: { error }
    });
    return null;
  }
};

/**
 * Check if Firebase is properly initialized
 * @returns boolean
 */
export const isFirebaseInitialized = (): boolean => {
  if (!isClientSide()) {
    return false;
  }
  return firebaseInstance.isInitialized && !!firebaseInstance.app && !!firebaseInstance.auth && !!firebaseInstance.db;
};

/**
 * Simple utility to check if Firebase app has been initialized
 * Alternative implementation that doesn't depend on firebaseInstance
 */
export function isFirebaseAppsInitialized(): boolean {
  try {
    return getApps().length > 0;
  } catch {
    return false;
  }
}

/**
 * Register a cleanup function to be called when Firebase resources are cleaned up
 * @param cleanupFn Function to call during cleanup
 */
export const registerFirebaseCleanup = (cleanupFn: () => void): void => {
  if (!isClientSide()) {
    return;
  }
  firebaseInstance.registerCleanup(cleanupFn);
};

/**
 * Clean up Firebase resources
 */
export const cleanupFirebase = (): void => {
  if (!isClientSide()) {
    return;
  }
  firebaseInstance.cleanup();
};

// Initialize Firebase on client side only
if (isClientSide()) {
  initializeFirebase();
}

// Export Firebase instances
export const app = isClientSide() ? firebaseInstance.app : null;
export const auth = isClientSide() ? firebaseInstance.auth : null;
export const analytics = isClientSide() ? firebaseInstance.analytics : null;
export const isInitialized = isClientSide() ? firebaseInstance.isInitialized : false;
