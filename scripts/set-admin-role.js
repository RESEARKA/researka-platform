// This script sets a user's role to 'Admin' in Firestore
// Run this script with: node scripts/set-admin-role.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc } = require('firebase/firestore');

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Email of the user to make admin
const adminEmail = 'dominic@dominic.ac';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setAdminRole() {
  try {
    // First, find the user document by email
    // Note: This is a simplified approach. In a production environment,
    // you would use Firebase Admin SDK with server-side authentication
    
    // Get all users and find the one with the matching email
    const usersCollection = await db.collection('users').get();
    let userId = null;
    
    usersCollection.forEach(doc => {
      const userData = doc.data();
      if (userData.email === adminEmail) {
        userId = doc.id;
      }
    });
    
    if (!userId) {
      console.error(`User with email ${adminEmail} not found`);
      return;
    }
    
    // Update the user's role to Admin
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: 'Admin',
      updatedAt: new Date()
    });
    
    console.log(`Successfully set ${adminEmail} as Admin`);
  } catch (error) {
    console.error('Error setting admin role:', error);
  }
}

setAdminRole().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
