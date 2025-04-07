// Reset admin account script using service account key file
const admin = require('firebase-admin');
const path = require('path');

// Path to your service account key file
// This should be the path to your Firebase service account key JSON file
const serviceAccountPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account-key.json');

try {
  // Initialize the app with the service account key file
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });

  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase admin initialization error:', error);
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

async function resetAdmin() {
  const email = 'dominic@dominic.ac';
  console.log(`Resetting admin account for ${email}...`);
  
  try {
    // Find the user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log('User not found in Firestore');
      return;
    }
    
    // Get the user document
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;
    
    console.log(`Found user with ID: ${userId}`);
    console.log('Current user data:', {
      email: userData.email,
      isDeleted: userData.isDeleted,
      isActive: userData.isActive,
      role: userData.role
    });
    
    // Reset the user in Firebase Auth
    try {
      const userRecord = await auth.getUser(userId);
      
      if (userRecord.disabled) {
        console.log('User is disabled in Firebase Auth, enabling...');
        await auth.updateUser(userId, {
          disabled: false
        });
        console.log('User enabled in Firebase Auth');
      } else {
        console.log('User is already enabled in Firebase Auth');
      }
    } catch (authError) {
      console.error('Error getting user from Firebase Auth:', authError);
    }
    
    // Reset the user in Firestore
    const updates = {
      isDeleted: false,
      isActive: true,
      role: 'Admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    console.log('Updating user in Firestore with:', updates);
    await db.collection('users').doc(userId).update(updates);
    
    console.log('Admin account reset successfully');
  } catch (error) {
    console.error('Error resetting admin account:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

// Run the function
resetAdmin();
