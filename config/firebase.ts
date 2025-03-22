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
let app: FirebaseApp = {} as FirebaseApp;
let auth: Auth = {} as Auth;
let db: Firestore = {} as Firestore;
let analytics: Analytics | null = null;

// Only initialize Firebase on the client side
if (typeof window !== 'undefined') {
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      console.log('Initializing Firebase for the first time');
      app = initializeApp(firebaseConfig);
    } else {
      console.log('Firebase already initialized, reusing instance');
      app = getApps()[0];
    }
    
    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Only initialize analytics on client side if supported
    isSupported().then(supported => {
      if (supported) {
        try {
          analytics = getAnalytics(app);
          console.log('Firebase Analytics initialized');
        } catch (analyticsError) {
          console.error('Error initializing Firebase Analytics:', analyticsError);
          // Don't throw, just log the error
        }
      } else {
        console.log('Firebase Analytics not supported in this environment');
      }
    }).catch(err => {
      console.error('Error checking analytics support:', err);
      // Don't throw, just log the error
    });
    
    // Connect to emulators if in development
    if (process.env.NODE_ENV === 'development' && process.env.FIREBASE_USE_EMULATOR === 'true') {
      try {
        console.log('Connecting to Firebase emulators');
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(db, 'localhost', 8080);
      } catch (emulatorError) {
        console.error('Error connecting to Firebase emulators:', emulatorError);
        // Don't throw, just log the error
      }
    }
    
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Already initialized with empty objects above, no need to reassign
  }
} else {
  // Server-side placeholder
  console.log('Firebase not initialized in server environment');
  // We're already using empty objects initialized above
}

// Helper functions to safely get Firebase services
export const getFirebaseAuth = (): Auth => {
  if (!auth || Object.keys(auth).length === 0) {
    throw new Error('Firebase Auth not initialized');
  }
  return auth;
};

export const getFirebaseFirestore = (): Firestore => {
  if (!db || Object.keys(db).length === 0) {
    throw new Error('Firebase Firestore not initialized');
  }
  return db;
};

export const getFirebaseApp = (): FirebaseApp => {
  if (!app || Object.keys(app).length === 0) {
    throw new Error('Firebase App not initialized');
  }
  return app;
};

export { app, auth, db, analytics };
