// This script tests Firebase initialization and authentication
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser
} = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc, deleteDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBm1xnqw87ho4mXEEMVVvqNKismySpQOsU",
  authDomain: "researka.firebaseapp.com",
  projectId: "researka",
  storageBucket: "researka.firebasestorage.app",
  messagingSenderId: "13219500485",
  appId: "1:13219500485:web:19c4dbdd41c2db5f813bac",
  measurementId: "G-1GK8GGNXXQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Test user credentials
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'Test123!';
const testName = 'Test User';

// Test Firebase Auth and Firestore
async function testFirebase() {
  console.log('Starting Firebase test...');
  console.log(`Test user: ${testEmail}`);
  
  try {
    // Test user creation
    console.log('\n1. Testing user creation...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('User created successfully:', userCredential.user.uid);
    
    // Test Firestore document creation
    console.log('\n2. Testing Firestore document creation...');
    try {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: testName,
        email: testEmail,
        role: 'Tester',
        createdAt: new Date().toISOString()
      });
      console.log('User document created successfully');
      
      // Test document retrieval
      console.log('\n3. Testing document retrieval...');
      const docSnap = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (docSnap.exists()) {
        console.log('Document data:', docSnap.data());
      } else {
        console.log('Document does not exist!');
      }
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError);
    }
    
    // Test user login
    console.log('\n4. Testing user login...');
    const signInResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('User logged in successfully:', signInResult.user.uid);
    
    // Clean up - delete test user
    console.log('\n5. Cleaning up - deleting test user...');
    try {
      // Delete Firestore document
      await deleteDoc(doc(db, 'users', userCredential.user.uid));
      console.log('User document deleted successfully');
      
      // Delete user account
      await deleteUser(auth.currentUser);
      console.log('User account deleted successfully');
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testFirebase().catch(console.error);
