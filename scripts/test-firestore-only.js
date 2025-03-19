// Firebase Test Script - Firestore Only
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, collection, addDoc } = require('firebase/firestore');

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
  console.log('=== FIREBASE FIRESTORE TESTS ===');
  
  try {
    // Test 1: Initialize Firebase
    console.log('\nTest 1: Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
    
    // Initialize Firestore
    const db = getFirestore(app);
    console.log('✅ Firestore initialized');
    
    // Test 2: Firestore Write to Public Collection
    console.log('\nTest 2: Testing Firestore write to public collection...');
    const testId = `test-${Date.now()}`;
    const testData = {
      timestamp: new Date().toISOString(),
      message: 'Test data from script',
      testId: testId
    };
    
    const docRef = doc(db, 'public_test', testId);
    await setDoc(docRef, testData);
    console.log(`✅ Firestore write successful to path: public_test/${testId}`);
    
    // Test 3: Firestore Read
    console.log('\nTest 3: Testing Firestore read...');
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
