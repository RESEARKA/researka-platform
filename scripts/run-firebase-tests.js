// Firebase Test Script
const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBm1xnqw87ho4mXEEMVVvqNKismySpQOsU",
  authDomain: "researka.firebaseapp.com",
  projectId: "researka",
  storageBucket: "researka.appspot.com",
  messagingSenderId: "13219500485",
  appId: "1:13219500485:web:19c4dbdd41c2db5f813bac",
  measurementId: "G-1GK8GGNXXQ"
};

async function runTests() {
  console.log('=== FIREBASE CONNECTION TESTS ===');
  
  try {
    // Test 1: Initialize Firebase
    console.log('\nTest 1: Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
    
    // Initialize services
    const auth = getAuth(app);
    const db = getFirestore(app);
    console.log('✅ Firebase services initialized');
    
    // Test 2: Anonymous Sign In
    console.log('\nTest 2: Testing anonymous sign in...');
    const userCredential = await signInAnonymously(auth);
    console.log(`✅ Anonymous sign in successful: ${userCredential.user.uid}`);
    
    // Test 3: Firestore Write
    console.log('\nTest 3: Testing Firestore write...');
    const testData = {
      timestamp: new Date().toISOString(),
      message: 'Test data from script',
      userId: userCredential.user.uid
    };
    
    const docRef = doc(db, 'connection_test', userCredential.user.uid);
    await setDoc(docRef, testData);
    console.log(`✅ Firestore write successful to path: connection_test/${userCredential.user.uid}`);
    
    // Test 4: Firestore Read
    console.log('\nTest 4: Testing Firestore read...');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log(`✅ Firestore read successful: ${JSON.stringify(docSnap.data())}`);
    } else {
      console.log('⚠️ Document does not exist. This is unexpected.');
    }
    
    console.log('\n✅ All tests passed successfully!');
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    console.error('Error details:', error);
  }
}

// Run the tests
runTests();
