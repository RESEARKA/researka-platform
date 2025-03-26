import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
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

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

// Track initialization state
let isInitialized = false;
let initializationAttempts = 0;
const MAX_INITIALIZATION_ATTEMPTS = 3;

/**
 * Initialize Firebase on the client side with retry logic
 * @returns Promise<boolean> - True if initialization was successful
 */
export const initializeFirebaseOnClient = async (): Promise<boolean> => {
  // Only run on client side
  if (typeof window === 'undefined') {
    console.log('Firebase: Cannot initialize in server environment');
    return false;
  }
  
  // Don't retry too many times
  if (initializationAttempts >= MAX_INITIALIZATION_ATTEMPTS) {
    console.error(`Firebase: Maximum initialization attempts (${MAX_INITIALIZATION_ATTEMPTS}) reached`);
    return false;
  }
  
  // If already initialized successfully, return true
  if (isInitialized && app) {
    console.log('Firebase: Already initialized successfully');
    return true;
  }
  
  initializationAttempts++;
  console.log(`Firebase: Initialization attempt ${initializationAttempts}/${MAX_INITIALIZATION_ATTEMPTS}`);
  
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      console.log('Firebase: Initializing Firebase for the first time');
      app = initializeApp(firebaseConfig);
    } else {
      console.log('Firebase: Already initialized, reusing existing instance');
      app = getApps()[0];
    }
    
    // Initialize services with detailed logging
    try {
      auth = getAuth(app);
      console.log('Firebase: Auth service initialized successfully');
    } catch (authError) {
      console.error('Firebase: Error initializing Auth service:', authError);
      auth = null;
    }
    
    try {
      db = getFirestore(app);
      console.log('Firebase: Firestore service initialized successfully');
    } catch (dbError) {
      console.error('Firebase: Error initializing Firestore service:', dbError);
      db = null;
    }
    
    // Only initialize analytics on client side if supported
    try {
      const analyticsSupported = await isSupported();
      if (analyticsSupported) {
        analytics = getAnalytics(app);
        console.log('Firebase: Analytics service initialized successfully');
      } else {
        console.log('Firebase: Analytics not supported in this environment');
        analytics = null;
      }
    } catch (analyticsError) {
      console.error('Firebase: Error initializing Analytics service:', analyticsError);
      analytics = null;
    }
    
    // Connect to emulators if in development
    if (process.env.NODE_ENV === 'development' && process.env.FIREBASE_USE_EMULATOR === 'true') {
      try {
        if (auth) {
          console.log('Firebase: Connecting to Auth emulator');
          connectAuthEmulator(auth, 'http://localhost:9099');
        }
        
        if (db) {
          console.log('Firebase: Connecting to Firestore emulator');
          connectFirestoreEmulator(db, 'localhost', 8080);
        }
      } catch (emulatorError) {
        console.error('Firebase: Error connecting to Firebase emulators:', emulatorError);
        // Don't throw, just log the error
      }
    }
    
    // Check if all required services are initialized
    if (app && auth && db) {
      isInitialized = true;
      console.log('Firebase: Initialized successfully');
      return true;
    } else {
      console.warn('Firebase: Partial initialization - some services failed');
      return false;
    }
  } catch (error) {
    console.error('Firebase: Error during initialization:', error);
    
    // Exponential backoff for retries
    if (initializationAttempts < MAX_INITIALIZATION_ATTEMPTS) {
      const retryDelay = Math.pow(2, initializationAttempts) * 500; // 500ms, 1s, 2s
      console.log(`Firebase: Retrying initialization in ${retryDelay}ms`);
      
      return new Promise((resolve) => {
        setTimeout(async () => {
          const retryResult = await initializeFirebaseOnClient();
          resolve(retryResult);
        }, retryDelay);
      });
    }
    
    return false;
  }
};

// Initialize Firebase on client side
if (typeof window !== 'undefined') {
  initializeFirebaseOnClient();
} else {
  // Server-side placeholder
  console.log('Firebase: Not initialized in server environment');
}

/**
 * Check if Firebase is properly initialized
 * @returns boolean
 */
export const isFirebaseInitialized = (): boolean => {
  return isInitialized && !!app && !!auth && !!db;
};

/**
 * Get Firebase Auth instance, returns null if not initialized
 */
export const getFirebaseAuth = (): Auth | null => {
  if (!auth) {
    console.warn('Firebase: Auth not initialized');
    return null;
  }
  return auth;
};

/**
 * Get Firebase Firestore instance, returns null if not initialized
 */
export const getFirebaseFirestore = (): Firestore | null => {
  if (!db) {
    console.warn('Firebase: Firestore not initialized');
    return null;
  }
  return db;
};

/**
 * Get Firebase App instance, returns null if not initialized
 */
export const getFirebaseApp = (): FirebaseApp | null => {
  if (!app) {
    console.warn('Firebase: App not initialized');
    return null;
  }
  return app;
};

export { app, auth, db, analytics, isInitialized };
