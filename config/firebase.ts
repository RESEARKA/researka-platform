import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBm1xnqw87ho4mXEEMVVvqNKismySpQOsU",
  authDomain: "researka.firebaseapp.com",
  projectId: "researka",
  storageBucket: "researka.appspot.com",
  messagingSenderId: "13219500485",
  appId: "1:13219500485:web:19c4dbdd41c2db5f813bac",
  measurementId: "G-1GK8GGNXXQ"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
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
    
    // Verify Firestore connection
    db.toJSON(); // This will throw if Firestore isn't properly initialized
    
    // Only initialize analytics on client side if supported
    isSupported().then(supported => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized');
      } else {
        console.log('Firebase Analytics not supported in this environment');
      }
    });
    
    // Connect to emulators if in development
    if (process.env.NODE_ENV === 'development' && process.env.FIREBASE_USE_EMULATOR === 'true') {
      console.log('Connecting to Firebase emulators');
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Rethrow to make initialization failures more visible
    throw new Error(`Firebase initialization failed: ${error}`);
  }
} else {
  // Server-side placeholder
  console.log('Firebase not initialized in server environment');
  // We need to provide these for TypeScript, but they won't be used server-side
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
}

export { app, auth, db, analytics };
