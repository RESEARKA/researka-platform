// Simple script to check articles in Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

async function checkArticles() {
  console.log('Starting article check...');
  
  // Initialize Firebase directly
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  try {
    // Get all articles without filtering
    const q = query(
      collection(db, 'articles'),
      where('status', '==', 'published')
    );
    
    const querySnapshot = await getDocs(q);
    
    console.log(`Found ${querySnapshot.size} total articles in Firestore`);
    
    // Log details of each article
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('-----------------------------------');
      console.log(`Article ID: ${doc.id}`);
      console.log(`Title: ${data.title || 'Untitled'}`);
      console.log(`Author: ${data.author || 'Unknown'}`);
      console.log(`Status: ${data.status}`);
      console.log(`Review Count: ${data.reviewCount || 0}`);
      console.log(`Created At: ${data.createdAt ? data.createdAt.toDate().toISOString() : 'Unknown'}`);
    });
    
    console.log('-----------------------------------');
    console.log('Article check complete.');
  } catch (error) {
    console.error('Error checking articles:', error);
  }
}

// Run the check
checkArticles().catch(console.error);
