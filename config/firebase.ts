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
 * Initialize Firebase on the client side with singleton pattern and retry logic
 * @returns boolean - True if initialization was successful
 */
export const initializeFirebase = (): boolean => {
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
  if (isInitialized && app && auth && db) {
    console.log('Firebase: Already initialized successfully');
    return true;
  }
  
  initializationAttempts++;
  
  try {
    console.log(`Firebase: Initialization attempt ${initializationAttempts}/${MAX_INITIALIZATION_ATTEMPTS}`);
    
    // Check if Firebase app is already initialized
    if (!getApps().length) {
      console.log('Firebase: Creating new app instance');
      app = initializeApp(firebaseConfig);
    } else {
      console.log('Firebase: Reusing existing app instance');
      app = getApps()[0];
    }
    
    // Initialize auth and firestore
    if (app) {
      auth = getAuth(app);
      db = getFirestore(app);
      
      // Initialize analytics only on client side and if supported
      if (typeof window !== 'undefined') {
        isSupported().then(supported => {
          if (supported && app) {
            analytics = getAnalytics(app);
            console.log('Firebase: Analytics initialized');
          }
        }).catch(err => {
          console.error('Firebase: Analytics initialization error:', err);
        });
      }
      
      isInitialized = true;
      console.log('Firebase: Initialization successful');
      return true;
    }
    
    console.error('Firebase: App initialization failed');
    return false;
  } catch (error) {
    console.error('Firebase: Initialization error:', error);
    return false;
  }
};

/**
 * Get Firebase Auth instance
 * Initializes Firebase if not already initialized
 * @returns Auth | null
 */
export const getFirebaseAuth = (): Auth | null => {
  if (!isInitialized && typeof window !== 'undefined') {
    console.log('Firebase: Not initialized, initializing now...');
    initializeFirebase();
  }
  return auth;
};

/**
 * Get Firebase Firestore instance
 * Initializes Firebase if not already initialized
 * @returns Firestore | null
 */
export const getFirebaseFirestore = (): Firestore | null => {
  if (!isInitialized && typeof window !== 'undefined') {
    console.log('Firebase: Not initialized, initializing now...');
    initializeFirebase();
  }
  return db;
};

/**
 * Get Firebase App instance
 * Initializes Firebase if not already initialized
 * @returns FirebaseApp | null
 */
export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isInitialized && typeof window !== 'undefined') {
    console.log('Firebase: Not initialized, initializing now...');
    initializeFirebase();
  }
  return app;
};

/**
 * Check if Firebase is properly initialized
 * @returns boolean
 */
export const isFirebaseInitialized = (): boolean => {
  return isInitialized && !!app && !!auth && !!db;
};

// Initialize Firebase on client side only
if (typeof window !== 'undefined') {
  console.log('Firebase: Client-side environment detected, initializing...');
  initializeFirebase();
} else {
  console.log('Firebase: Not initialized in server environment');
}

export { app, auth, db, analytics, isInitialized };
