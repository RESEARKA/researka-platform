import { NextApiRequest, NextApiResponse } from 'next';
import admin, { adminAuth, adminDb } from '../../config/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Test creating a user with Firebase Admin SDK
    try {
      console.log('API: Creating user with Firebase Admin SDK...');
      const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: name,
      });
      
      console.log('API: User created successfully:', userRecord.uid);
      
      // Test creating a user document with Admin SDK
      try {
        console.log('API: Creating user document in Firestore...');
        await adminDb.collection('users').doc(userRecord.uid).set({
          name,
          email,
          role: 'Researcher',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('API: User document created successfully');
        
        return res.status(200).json({ 
          message: 'Firebase check successful', 
          user: {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName
          }
        });
      } catch (firestoreError: any) {
        console.error('API: Firestore error:', firestoreError);
        
        // Clean up by deleting the user if Firestore fails
        await adminAuth.deleteUser(userRecord.uid);
        
        return res.status(500).json({ 
          message: 'Firebase Auth successful but Firestore failed', 
          error: {
            code: firestoreError.code,
            message: firestoreError.message
          }
        });
      }
    } catch (authError: any) {
      console.error('API: Auth error:', authError);
      
      return res.status(500).json({ 
        message: 'Firebase Auth failed', 
        error: {
          code: authError.code,
          message: authError.message
        }
      });
    }
  } catch (error: any) {
    console.error('Error in check-firebase API:', error);
    return res.status(500).json({ 
      message: 'Error checking Firebase', 
      error: {
        message: error.message
      }
    });
  }
}
