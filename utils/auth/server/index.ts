import { getFirebaseAdmin } from '../../../config/firebase-admin';
import { logger } from '../../logger';
import { LogCategory } from '../../../types/logging';

/**
 * Verifies a Firebase ID token and returns the decoded token
 * @param idToken The Firebase ID token to verify
 * @returns The decoded token or null if verification fails
 */
export async function verifyIdToken(idToken: string): Promise<any | null> {
  try {
    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    logger.error('Error verifying ID token', {
      context: { error },
      category: LogCategory.AUTH
    });
    return null;
  }
}

/**
 * Checks if a user has admin privileges
 * @param uid User ID to check
 * @returns Boolean indicating if the user is an admin
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const admin = getFirebaseAdmin();
    const user = await admin.auth().getUser(uid);
    
    // Check if user's email is in the admin list
    const adminEmails = [
      'admin@researka.org',
      'dom123dxb@gmail.com',
      'dominic@dominic.ac'
    ];
    
    return user.email ? adminEmails.includes(user.email) : false;
  } catch (error) {
    logger.error('Error checking admin status', {
      context: { error, uid },
      category: LogCategory.AUTH
    });
    return false;
  }
}

/**
 * Gets a user's custom claims
 * @param uid User ID to get claims for
 * @returns The user's custom claims or null if retrieval fails
 */
export async function getUserClaims(uid: string): Promise<any | null> {
  try {
    const admin = getFirebaseAdmin();
    const user = await admin.auth().getUser(uid);
    return user.customClaims || {};
  } catch (error) {
    logger.error('Error getting user claims', {
      context: { error, uid },
      category: LogCategory.AUTH
    });
    return null;
  }
}
