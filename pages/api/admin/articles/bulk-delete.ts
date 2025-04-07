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

const adminAuth = admin.auth();
const adminDb = admin.firestore();

const logger = createLogger('api:admin:articles:bulk-delete');

/**
 * API endpoint to bulk delete articles
 * This is a soft delete that marks the articles as deleted in Firestore
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract data from request body
    const { articleIds, reason } = req.body;

    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      return res.status(400).json({ error: 'Article IDs array is required' });
    }

    // Verify the requester is an admin or junior admin
    const adminIdToken = req.headers.authorization?.split('Bearer ')[1];
    if (!adminIdToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let adminId: string;

    try {
      const decodedToken = await adminAuth.verifyIdToken(adminIdToken);
      adminId = decodedToken.uid;
      
      // Check if the user is an admin or junior admin
      const adminDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
      const adminData = adminDoc.data();
      
      if (!adminData || (adminData.role !== 'Admin' && adminData.role !== 'JuniorAdmin')) {
        return res.status(403).json({ error: 'Forbidden: Admin or Junior Admin access required' });
      }
    } catch (authError) {
      logger.error('Authentication error', {
        context: { error: authError },
        category: LogCategory.AUTH
      });
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    logger.info('Bulk deleting articles', {
      context: { articleCount: articleIds.length, adminId, reason },
      category: LogCategory.DATA
    });

    // Process results
    const results = {
      success: [] as string[],
      failed: [] as { id: string; reason: string }[]
    };

    // Process each article in parallel using Promise.all
    await Promise.all(
      articleIds.map(async (articleId) => {
        try {
          const articleRef = adminDb.collection('articles').doc(articleId);
          const articleDoc = await articleRef.get();
          
          if (!articleDoc.exists) {
            results.failed.push({ id: articleId, reason: 'Article not found' });
            return;
          }
          
          await articleRef.update({
            isDeleted: true,
            deletedAt: admin.firestore.FieldValue.serverTimestamp(),
            deletedReason: reason || 'Bulk deleted by admin',
            deletedBy: adminId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          results.success.push(articleId);
        } catch (error) {
          logger.error('Error deleting article', {
            context: { error, articleId },
            category: LogCategory.ERROR
          });
          results.failed.push({ id: articleId, reason: 'Database error' });
        }
      })
    );

    logger.info('Bulk delete operation completed', {
      context: { 
        successCount: results.success.length,
        failedCount: results.failed.length
      },
      category: LogCategory.DATA
    });

    // Return results
    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${results.success.length} articles, ${results.failed.length} failed`,
      results
    });
  } catch (error) {
    logger.error('Unexpected error in bulk delete articles API', {
      context: { error },
      category: LogCategory.ERROR
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
