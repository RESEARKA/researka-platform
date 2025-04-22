import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

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
  private readonly MAX_INITIALIZATION_ATTEMPTS = 3;
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
  public initialize(): boolean {
    // Only run on client side
    if (!isClientSide()) {
      return false;
    }
    
    // Don't retry too many times
    if (this._initializationAttempts >= this.MAX_INITIALIZATION_ATTEMPTS) {
      console.error(`Firebase: Maximum initialization attempts (${this.MAX_INITIALIZATION_ATTEMPTS}) reached`);
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
        
        // Initialize analytics only on client side and if supported
        if (isClientSide()) {
          isSupported().then(supported => {
            if (supported && this._app) {
              this._analytics = getAnalytics(this._app);
            }
          }).catch(err => {
            console.error('Firebase: Analytics initialization error:', err);
          });
        }
        
        this._isInitialized = true;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Firebase: Initialization error:', error);
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
        console.error('Firebase: Error in cleanup function:', error);
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
export const initializeFirebase = (): boolean => {
  // Only run on client side
  if (!isClientSide()) {
    return false;
  }
  
  try {
    // Initialize using the singleton instance
    const result = firebaseInstance.initialize();
    return result;
  } catch (error) {
    console.error('Firebase: Critical initialization error:', error);
    return false;
  }
};

/**
 * Get Firebase Auth instance
 * Initializes Firebase if not already initialized
 * Enhanced with better error handling and logging
 * @returns Auth | null
 */
export const getFirebaseAuth = (): Auth | null => {
  if (!isClientSide()) {
    return null;
  }
  
  try {
    // Check if Firebase is initialized
    if (!firebaseInstance.isInitialized) {
      const initialized = initializeFirebase();
      
      if (!initialized) {
        return null;
      }
    }
    
    // Get Auth instance
    return firebaseInstance.auth;
  } catch (error) {
    console.error('Firebase: Error getting Auth instance:', error);
    return null;
  }
};

/**
 * Get Firebase Firestore instance
 * Initializes Firebase if not already initialized
 * Enhanced with better error handling and logging
 * @returns Firestore | null
 */
export const getFirebaseFirestore = (): Firestore | null => {
  if (!isClientSide()) {
    return null;
  }
  
  try {
    // Check if Firebase is initialized
    if (!firebaseInstance.isInitialized) {
      const initialized = initializeFirebase();
      
      if (!initialized) {
        return null;
      }
    }
    
    // Get Firestore instance
    return firebaseInstance.db;
  } catch (error) {
    console.error('Firebase: Error getting Firestore instance:', error);
    return null;
  }
};

/**
 * Get Firebase App instance
 * Initializes Firebase if not already initialized
 * @returns FirebaseApp | null
 */
export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isClientSide()) {
    return null;
  }
  
  if (!firebaseInstance.isInitialized) {
    firebaseInstance.initialize();
  }
  return firebaseInstance.app;
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
// These are null on the server side to prevent SSR issues
export const app = isClientSide() ? firebaseInstance.app : null;
export const auth = isClientSide() ? firebaseInstance.auth : null;
export const db = isClientSide() ? firebaseInstance.db : null;
export const analytics = isClientSide() ? firebaseInstance.analytics : null;
export const isInitialized = isClientSide() ? firebaseInstance.isInitialized : false;
