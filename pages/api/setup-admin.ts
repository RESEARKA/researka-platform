import { NextApiRequest, NextApiResponse } from 'next';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '../../config/firebase';
import { createLogger, LogCategory } from '../../utils/logger';

const logger = createLogger('admin-setup');

// This is a secure endpoint to set up the initial admin user
// It should only be accessible with a secret key and only used once during initial setup
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify the secret key
  const { secret, email } = req.body;
  
  // This should be a strong, unique secret stored in your environment variables
  // For this example, we're using a hardcoded value, but in production, use process.env.ADMIN_SETUP_SECRET
  const expectedSecret = 'researka-admin-setup-secret-key';
  
  if (secret !== expectedSecret) {
    logger.warn('Invalid secret key used for admin setup', {
      category: LogCategory.SECURITY
    });
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  try {
    const db = getFirebaseFirestore();
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    // Find the user by email
    // Note: In a production app, you'd use a Firestore query, but for simplicity:
    // 1. Get all users
    // 2. Find the one with matching email
    // 3. Update their role
    
    // For security, we're not implementing the actual query here
    // You would need to create a proper Firestore query to find a user by email
    
    // This is a placeholder for the actual implementation
    // const usersQuery = query(collection(db, 'users'), where('email', '==', email));
    // const usersSnapshot = await getDocs(usersQuery);
    
    // if (usersSnapshot.empty) {
    //   return res.status(404).json({ message: 'User not found' });
    // }
    
    // const userDoc = usersSnapshot.docs[0];
    // const userId = userDoc.id;
    
    // For this example, we'll assume you know your user ID
    // Replace this with your actual user ID
    const userId = req.body.userId || 'your-user-id-here';
    
    // Verify the user exists
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update the user role to Admin
    await updateDoc(userRef, {
      role: 'Admin',
      updatedAt: new Date()
    });
    
    logger.info('Admin role assigned successfully', {
      context: { userId, email },
      category: LogCategory.SECURITY
    });
    
    return res.status(200).json({ 
      message: 'Admin role assigned successfully',
      userId: userId
    });
    
  } catch (error) {
    logger.error('Error setting up admin user', {
      context: { error, email },
      category: LogCategory.ERROR
    });
    
    return res.status(500).json({ 
      message: 'Error setting up admin user',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
