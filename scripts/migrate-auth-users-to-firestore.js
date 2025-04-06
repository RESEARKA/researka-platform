/**
 * Script to migrate Firebase Auth users to Firestore
 * 
 * This script fetches all users from Firebase Authentication and creates
 * corresponding documents in the Firestore 'users' collection.
 * 
 * Usage:
 * 1. Make sure you have the Firebase Admin SDK installed
 * 2. Run this script with Node.js: node migrate-auth-users-to-firestore.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

/**
 * Migrate all Firebase Auth users to Firestore
 */
async function migrateUsersToFirestore() {
  try {
    console.log('Starting user migration...');
    
    // Get all users from Firebase Auth (in batches of 1000)
    let allUsers = [];
    let nextPageToken;
    
    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      allUsers = allUsers.concat(listUsersResult.users);
      nextPageToken = listUsersResult.pageToken;
      
      console.log(`Fetched ${listUsersResult.users.length} users from Firebase Auth`);
    } while (nextPageToken);
    
    console.log(`Total users fetched: ${allUsers.length}`);
    
    // Process each user and create/update Firestore document
    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const user of allUsers) {
      try {
        // Check if user document already exists
        const userDocRef = db.collection('users').doc(user.uid);
        const userDoc = await userDocRef.get();
        
        if (userDoc.exists) {
          // Update existing document
          await userDocRef.update({
            email: user.email || '',
            displayName: user.displayName || '',
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
          });
          updatedCount++;
        } else {
          // Create new user document
          await userDocRef.set({
            email: user.email || '',
            displayName: user.displayName || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            role: 'User',
            isActive: !user.disabled,
            articleCount: 0,
            reviewCount: 0
          });
          createdCount++;
        }
      } catch (error) {
        console.error(`Error processing user ${user.uid}:`, error);
        errorCount++;
      }
    }
    
    console.log('Migration completed:');
    console.log(`- Created: ${createdCount} users`);
    console.log(`- Updated: ${updatedCount} users`);
    console.log(`- Errors: ${errorCount} users`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the Firebase Admin app
    admin.app().delete();
  }
}

// Run the migration
migrateUsersToFirestore();
