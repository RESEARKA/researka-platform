import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

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
    if (typeof window === 'undefined') {
      console.log('Firebase: Cannot initialize in server environment');
      return false;
    }
    
    // Don't retry too many times
    if (this._initializationAttempts >= this.MAX_INITIALIZATION_ATTEMPTS) {
      console.error(`Firebase: Maximum initialization attempts (${this.MAX_INITIALIZATION_ATTEMPTS}) reached`);
      return false;
    }
    
    // If already initialized successfully, return true
    if (this._isInitialized && this._app && this._auth && this._db) {
      console.log('Firebase: Already initialized successfully');
      return true;
    }
    
    this._initializationAttempts++;
    
    try {
      console.log(`Firebase: Initialization attempt ${this._initializationAttempts}/${this.MAX_INITIALIZATION_ATTEMPTS}`);
      
      // Check if Firebase app is already initialized
      if (!getApps().length) {
        console.log('Firebase: Creating new app instance');
        this._app = initializeApp(firebaseConfig);
      } else {
        console.log('Firebase: Reusing existing app instance');
        this._app = getApps()[0];
      }
      
      // Initialize auth and firestore
      if (this._app) {
        this._auth = getAuth(this._app);
        this._db = getFirestore(this._app);
        
        // Initialize analytics only on client side and if supported
        if (typeof window !== 'undefined') {
          isSupported().then(supported => {
            if (supported && this._app) {
              this._analytics = getAnalytics(this._app);
              console.log('Firebase: Analytics initialized');
            }
          }).catch(err => {
            console.error('Firebase: Analytics initialization error:', err);
          });
        }
        
        this._isInitialized = true;
        console.log('Firebase: Initialization successful');
        return true;
      }
      
      console.error('Firebase: App initialization failed');
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
    console.log('Firebase: Running cleanup');
    
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

/**
 * Initialize Firebase on the client side with singleton pattern and retry logic
 * Enhanced with better error handling and detailed logging
 * @param options Optional configuration options
 * @returns boolean - True if initialization was successful
 */
export const initializeFirebase = (options: { 
  logDetails?: boolean;
  maxRetries?: number;
  retryDelayMs?: number;
} = {}): boolean => {
  // Default options
  const { 
    logDetails = false,
    maxRetries = 3,
    retryDelayMs = 1000
  } = options;
  
  // Only run on client side
  if (typeof window === 'undefined') {
    console.log('Firebase: Cannot initialize in server environment');
    return false;
  }
  
  try {
    // Performance tracking
    const startTime = performance.now();
    
    // Detailed logging if enabled
    if (logDetails) {
      console.log('Firebase: Starting initialization with options:', {
        logDetails,
        maxRetries,
        retryDelayMs,
        environment: typeof window !== 'undefined' ? 'client' : 'server',
        existingApps: getApps().length
      });
    }
    
    // Initialize using the singleton instance
    const result = firebaseInstance.initialize();
    
    // Log performance metrics
    const duration = Math.round(performance.now() - startTime);
    console.log(`Firebase: Initialization ${result ? 'successful' : 'failed'} in ${duration}ms`);
    
    return result;
  } catch (error) {
    // Enhanced error logging
    console.error('Firebase: Critical initialization error:', error);
    
    // Log additional diagnostic information
    console.error('Firebase: Diagnostic information:', {
      environment: typeof window !== 'undefined' ? 'client' : 'server',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
      existingApps: getApps().length,
      // Check for memory info in a type-safe way
      memoryInfo: typeof window !== 'undefined' && 
                 window.performance && 
                 // @ts-ignore - Some browsers expose memory info on performance
                 window.performance.memory ? {
                   // @ts-ignore - Access memory metrics with a type assertion
                   totalJSHeapSize: window.performance.memory?.totalJSHeapSize,
                   // @ts-ignore - Access memory metrics with a type assertion
                   usedJSHeapSize: window.performance.memory?.usedJSHeapSize
                 } : 'Not available'
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
export const getFirebaseAuth = (): Auth | null => {
  if (typeof window === 'undefined') {
    console.log('Firebase: Cannot get Auth in server environment');
    return null;
  }
  
  try {
    // Check if Firebase is initialized
    if (!firebaseInstance.isInitialized) {
      console.log('Firebase: Not initialized, initializing now before getting Auth...');
      const initialized = initializeFirebase();
      
      if (!initialized) {
        console.error('Firebase: Failed to initialize before getting Auth');
        return null;
      }
    }
    
    // Get Auth instance
    const auth = firebaseInstance.auth;
    
    if (!auth) {
      console.error('Firebase: Auth instance is null after initialization');
    }
    
    return auth;
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
  if (typeof window === 'undefined') {
    console.log('Firebase: Cannot get Firestore in server environment');
    return null;
  }
  
  try {
    // Check if Firebase is initialized
    if (!firebaseInstance.isInitialized) {
      console.log('Firebase: Not initialized, initializing now before getting Firestore...');
      const initialized = initializeFirebase();
      
      if (!initialized) {
        console.error('Firebase: Failed to initialize before getting Firestore');
        return null;
      }
    }
    
    // Get Firestore instance
    const db = firebaseInstance.db;
    
    if (!db) {
      console.error('Firebase: Firestore instance is null after initialization');
    }
    
    return db;
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
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!firebaseInstance.isInitialized) {
    console.log('Firebase: Not initialized, initializing now...');
    firebaseInstance.initialize();
  }
  return firebaseInstance.app;
};

/**
 * Check if Firebase is properly initialized
 * @returns boolean
 */
export const isFirebaseInitialized = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return firebaseInstance.isInitialized && !!firebaseInstance.app && !!firebaseInstance.auth && !!firebaseInstance.db;
};

/**
 * Register a cleanup function to be called when Firebase resources are cleaned up
 * @param cleanupFn Function to call during cleanup
 */
export const registerFirebaseCleanup = (cleanupFn: () => void): void => {
  if (typeof window === 'undefined') {
    return;
  }
  firebaseInstance.registerCleanup(cleanupFn);
};

/**
 * Clean up Firebase resources
 */
export const cleanupFirebase = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  firebaseInstance.cleanup();
};

// Initialize Firebase on client side only
if (typeof window !== 'undefined') {
  console.log('Firebase: Client-side environment detected, initializing...');
  initializeFirebase();
} else {
  console.log('Firebase: Not initialized in server environment');
}

// Export singleton instance properties for backward compatibility
export const app = typeof window !== 'undefined' ? firebaseInstance.app : null;
export const auth = typeof window !== 'undefined' ? firebaseInstance.auth : null;
export const db = typeof window !== 'undefined' ? firebaseInstance.db : null;
export const analytics = typeof window !== 'undefined' ? firebaseInstance.analytics : null;
export const isInitialized = typeof window !== 'undefined' ? firebaseInstance.isInitialized : false;
