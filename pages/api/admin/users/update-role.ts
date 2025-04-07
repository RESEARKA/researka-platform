import { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';
import { createLogger, LogCategory } from '../../../../utils/logger';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'researka',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace newlines in the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          : undefined,
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || 'researka'}.firebaseio.com`,
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

const logger = createLogger('api-admin-update-role');
const adminAuth = admin.auth();
const adminDb = admin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const adminId = decodedToken.uid;
    
    // Check if the requester is an admin
    const adminDoc = await adminDb.collection('users').doc(adminId).get();
    if (!adminDoc.exists) {
      return res.status(403).json({ message: 'Forbidden - User not found' });
    }
    
    const adminData = adminDoc.data();
    if (adminData?.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden - Only Admins can update user roles' });
    }
    
    // Get the user ID and new role from the request body
    const { userId, role } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate the role
    const validRoles = ['User', 'Reviewer', 'JuniorAdmin', 'Editor', 'Admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Only allow Admin to set Admin role
    if (role === 'Admin' && adminData?.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden - Only Admins can set Admin role' });
    }
    
    // Update the user's role in Firestore
    await adminDb.collection('users').doc(userId).update({
      role,
      updatedAt: new Date(),
      updatedBy: adminId
    });
    
    logger.info('User role updated', {
      context: { userId, role, adminId },
      category: LogCategory.DATA
    });
    
    return res.status(200).json({ message: 'User role updated successfully' });
  } catch (error) {
    logger.error('Error updating user role', {
      context: { error },
      category: LogCategory.ERROR
    });
    
    return res.status(500).json({ message: 'Internal server error' });
  }
}
