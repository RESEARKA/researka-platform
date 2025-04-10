import { NextApiRequest, NextApiResponse } from 'next';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  limit
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../../../../../config/firebase';
import { createLogger, LogCategory } from '../../../../../utils/logger';
import { FlagCategory } from '../../../../../types/moderation';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '../../../../../utils/firebaseAdmin';

const logger = createLogger('api/v1/articles/flag');

// Validate flag category
const validCategories: FlagCategory[] = [
  'misinformation',
  'offensive',
  'plagiarism',
  'spam',
  'other'
];

// Simple in-memory rate limiting
// In production, this should be replaced with a Redis-based solution
const rateLimits: Record<string, { count: number, reset: number }> = {};

/**
 * Apply rate limiting to an operation
 * 
 * @param identifier Unique identifier for the rate limit (e.g., userId or IP address)
 * @param limit Maximum number of operations allowed in the time window
 * @param windowSeconds Time window in seconds
 * @returns Object with rate limit information
 */
async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    // Get current time
    const now = Date.now();
    
    // Calculate reset time
    const resetTime = now + (windowSeconds * 1000);
    
    // If rate limit doesn't exist, create it
    if (!rateLimits[identifier]) {
      rateLimits[identifier] = {
        count: 1,
        reset: resetTime
      };
      
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: resetTime
      };
    }
    
    // Get rate limit data
    const data = rateLimits[identifier];
    const resetTimestamp = data.reset;
    
    // If reset time has passed, reset the counter
    if (now > resetTimestamp) {
      rateLimits[identifier] = {
        count: 1,
        reset: resetTime
      };
      
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: resetTime
      };
    }
    
    // Check if limit has been reached
    const currentCount = data.count || 0;
    
    if (currentCount >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: resetTimestamp
      };
    }
    
    // Increment count
    rateLimits[identifier] = {
      count: currentCount + 1,
      reset: resetTimestamp
    };
    
    return {
      success: true,
      limit,
      remaining: limit - (currentCount + 1),
      reset: resetTimestamp
    };
  } catch (error) {
    // Log error
    logger.error('Rate limit error', { context: { error, identifier } });
    
    // In case of error, allow the operation to proceed
    // This is a fail-open approach to prevent blocking legitimate users
    return {
      success: true,
      limit,
      remaining: 1,
      reset: Date.now() + (windowSeconds * 1000)
    };
  }
}

/**
 * API endpoint for flagging inappropriate content
 * 
 * @param req NextApiRequest
 * @param res NextApiResponse
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed'
      }
    });
  }

  try {
    // Get article ID from URL
    const { id } = req.query;
    
    // Validate article ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ 
        error: {
          code: 'INVALID_ARTICLE_ID',
          message: 'Invalid article ID'
        }
      });
    }

    // Initialize Firebase Admin
    initAdmin();
    
    // Get user from authorization token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      const userId = decodedToken.uid;
      
      // Apply rate limiting (5 flags per day per user)
      const identifier = `flag_${userId}`;
      const rateLimitResult = await rateLimit(identifier, 5, 60 * 60 * 24);
      
      if (!rateLimitResult.success) {
        return res.status(429).json({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'You have reached the maximum number of reports allowed per day',
            details: {
              limit: rateLimitResult.limit,
              remaining: rateLimitResult.remaining,
              reset: new Date(rateLimitResult.reset).toISOString()
            }
          }
        });
      }

      // Get request body
      const { category, reason } = req.body;
      
      // Validate category
      if (!category || !validCategories.includes(category)) {
        return res.status(400).json({ 
          error: {
            code: 'INVALID_CATEGORY',
            message: 'Invalid category',
            details: {
              validCategories
            }
          }
        });
      }
      
      // Validate reason (optional but if provided must be a string)
      if (reason !== undefined && (typeof reason !== 'string' || reason.length > 500)) {
        return res.status(400).json({ 
          error: {
            code: 'INVALID_REASON',
            message: 'Reason must be a string with maximum 500 characters'
          }
        });
      }

      // Get Firestore instance
      const db = getFirebaseFirestore();
      if (!db) {
        throw new Error('Firestore is not initialized');
      }

      // Check if article exists
      const articleRef = doc(db, 'articles', id);
      const articleSnap = await getDoc(articleRef);
      
      if (!articleSnap.exists()) {
        return res.status(404).json({ 
          error: {
            code: 'ARTICLE_NOT_FOUND',
            message: 'Article not found'
          }
        });
      }
      
      // Get article data
      const articleData = articleSnap.data();
      
      // Check if article is already removed
      if (articleData.isDeleted === true || articleData.moderationStatus === 'removed') {
        return res.status(400).json({ 
          error: {
            code: 'ARTICLE_ALREADY_REMOVED',
            message: 'This article has already been removed'
          }
        });
      }

      // Check if user has already flagged this article
      // Using a more efficient query on the flags collection
      const flagsRef = collection(db, 'flags');
      const flagQuery = query(
        flagsRef,
        where('articleId', '==', id),
        where('reportedBy', '==', userId),
        limit(1)
      );
      
      const flagSnap = await getDocs(flagQuery);
      
      if (!flagSnap.empty) {
        return res.status(400).json({ 
          error: {
            code: 'ALREADY_FLAGGED',
            message: 'You have already reported this article'
          }
        });
      }

      // Create a new flag
      const flagRef = doc(collection(db, 'flags'));
      await setDoc(flagRef, {
        id: flagRef.id,
        articleId: id,
        reportedBy: userId,
        reason: reason || '',
        category,
        timestamp: serverTimestamp(),
        status: 'pending'
      });
      
      // Get current flag data
      const flaggedBy = articleData.flaggedBy || [];
      const flagCount = (articleData.flagCount || 0) + 1;
      
      // Determine if article should be put under review (2 or more flags)
      const newModerationStatus = flagCount >= 2 ? 'under_review' : (articleData.moderationStatus || 'active');
      
      // Update article with flag information
      await updateDoc(articleRef, {
        flagCount,
        flaggedBy: [...flaggedBy, userId],
        lastFlaggedAt: serverTimestamp(),
        moderationStatus: newModerationStatus
      });
      
      // Log the flag
      logger.info('Article flagged', {
        context: {
          articleId: id,
          userId,
          category,
          flagCount,
          moderationStatus: newModerationStatus
        },
        category: LogCategory.DOCUMENT
      });
      
      // Return success response
      return res.status(200).json({
        success: true,
        flagCount,
        moderationStatus: newModerationStatus
      });
    } catch (authError) {
      logger.error('Authentication error', { 
        context: { error: authError },
        category: LogCategory.AUTH
      });
      
      return res.status(401).json({ 
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token'
        }
      });
    }
  } catch (error) {
    // Log error
    logger.error('Error flagging article', {
      context: { error },
      category: LogCategory.ERROR
    });
    
    // Return error response
    return res.status(500).json({ 
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
}
