import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { db } from '../firebase/admin';
import { createLogger } from '../utils/logger';

const logger = createLogger('auth-middleware');

type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    uid: string;
    email: string;
    role?: 'User' | 'Reviewer' | 'JuniorAdmin' | 'Admin';
  };
}

/**
 * Middleware that verifies Firebase authentication token and adds user info to the request
 * @param handler The API route handler
 * @returns A new handler with authentication
 */
export function authMiddleware(handler: NextApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Get the authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header' });
      }

      // Extract and verify the token
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await getAuth().verifyIdToken(token);
      
      // Get user role from Firestore
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      const userData = userDoc.data();
      
      // Add user info to the request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        role: userData?.role || 'User'
      };
      
      logger.info('User authenticated', { 
        context: { 
          uid: decodedToken.uid,
          role: req.user.role
        }
      });

      // Call the handler
      return handler(req, res);
    } catch (error) {
      logger.error('Authentication error', { 
        context: { 
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };
}

/**
 * Middleware that requires the user to have Admin or JuniorAdmin role
 * @param handler The API route handler
 * @returns A new handler with admin role check
 */
export function adminMiddleware(handler: NextApiHandler) {
  return authMiddleware(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'JuniorAdmin')) {
      logger.warn('Unauthorized admin access attempt', { 
        context: { 
          uid: req.user?.uid,
          role: req.user?.role
        }
      });
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    return handler(req, res);
  });
}
