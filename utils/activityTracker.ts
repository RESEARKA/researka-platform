// utils/activityTracker.ts
import { getFirebaseFirestore } from '../config/firebase';
import { collection, addDoc, serverTimestamp, WriteBatch, doc } from 'firebase/firestore';
import { createLogger, LogCategory } from '../utils/logger';

const logger = createLogger('activity-tracker');

// Constants
export const USER_ACTIVITIES_COLLECTION = 'userActivities';

/**
 * Types of user activities that can be tracked
 */
export enum ActivityType {
  ARTICLE_VIEW = 'article_view',
  ARTICLE_CREATE = 'article_create',
  ARTICLE_EDIT = 'article_edit',
  COMMENT_ADD = 'comment_add',
  PROFILE_VIEW = 'profile_view',
  SEARCH = 'search',
  LOGIN = 'login',
  SIGNUP = 'signup',
  VOTE = 'vote'
}

/**
 * Metadata for activity tracking with proper typing
 */
export interface ActivityMetadata {
  category?: string;
  timeSpent?: number;
  referrer?: string;
  query?: string;
  page?: number;
  isInitialView?: boolean;
  isComplete?: boolean;
  isTimeUpdate?: boolean;
  keywords?: string;
  title?: string;
  timestamp?: number;
  // Using Record with index signature that matches the parent interface
  filters?: { [key: string]: string };
  [key: string]: string | number | boolean | object | undefined;
}

/**
 * Sanitizes metadata to prevent injection attacks
 * @param metadata Raw metadata object
 * @returns Sanitized metadata object
 */
function sanitizeMetadata(metadata: ActivityMetadata): ActivityMetadata {
  const sanitized: ActivityMetadata = {};
  
  // Only allow known properties and proper types
  if (metadata.category && typeof metadata.category === 'string') {
    sanitized.category = metadata.category.slice(0, 100); // Limit length
  }
  
  if (metadata.timeSpent !== undefined) {
    sanitized.timeSpent = Number(metadata.timeSpent) || 0;
  }
  
  if (metadata.referrer && typeof metadata.referrer === 'string') {
    sanitized.referrer = metadata.referrer.slice(0, 255); // Limit length
  }
  
  if (metadata.query && typeof metadata.query === 'string') {
    sanitized.query = metadata.query.slice(0, 255); // Limit length
  }
  
  if (metadata.page !== undefined) {
    sanitized.page = Number(metadata.page) || 1;
  }
  
  if (metadata.keywords && typeof metadata.keywords === 'string') {
    sanitized.keywords = metadata.keywords.slice(0, 255);
  }
  
  if (metadata.title && typeof metadata.title === 'string') {
    sanitized.title = metadata.title.slice(0, 255);
  }
  
  if (metadata.isInitialView !== undefined) {
    sanitized.isInitialView = Boolean(metadata.isInitialView);
  }
  
  if (metadata.isComplete !== undefined) {
    sanitized.isComplete = Boolean(metadata.isComplete);
  }
  
  if (metadata.isTimeUpdate !== undefined) {
    sanitized.isTimeUpdate = Boolean(metadata.isTimeUpdate);
  }
  
  if (metadata.timestamp !== undefined) {
    sanitized.timestamp = Number(metadata.timestamp) || Date.now();
  }
  
  // Handle filters object with extra caution
  if (metadata.filters && typeof metadata.filters === 'object') {
    sanitized.filters = {};
    Object.entries(metadata.filters).forEach(([key, value]) => {
      if (typeof key === 'string' && typeof value === 'string') {
        // Limit key and value length
        const safeKey = key.slice(0, 50);
        const safeValue = value.slice(0, 100);
        sanitized.filters![safeKey] = safeValue;
      }
    });
  }
  
  return sanitized;
}

/**
 * Validates the user ID
 * @param userId User ID to validate
 * @returns Boolean indicating if ID is valid
 */
function isValidUserId(userId: string): boolean {
  return typeof userId === 'string' && userId.trim().length > 0;
}

/**
 * Tracks a user activity in Firestore
 * 
 * @param userId ID of the user performing the activity
 * @param activityType Type of activity being performed
 * @param targetId Optional ID of the target resource (article, profile, etc.)
 * @param metadata Optional additional context about the activity
 * @param batch Optional Firestore batch to add the operation to
 * @returns Object indicating success or failure with error message
 */
export async function trackUserActivity(
  userId: string,
  activityType: ActivityType,
  targetId?: string,
  metadata?: ActivityMetadata,
  batch?: WriteBatch
): Promise<{ success: boolean; error?: string; docRef?: string }> {
  try {
    // Input validation
    if (!isValidUserId(userId)) {
      return { success: false, error: 'Invalid user ID' };
    }
    
    if (!Object.values(ActivityType).includes(activityType)) {
      return { success: false, error: 'Invalid activity type' };
    }
    
    const db = getFirebaseFirestore();
    if (!db) {
      return { success: false, error: 'Firestore not initialized' };
    }
    
    // Sanitize inputs
    const sanitizedMetadata = metadata ? sanitizeMetadata(metadata) : {};
    const safeTargetId = targetId ? targetId.slice(0, 100) : null;
    
    const activityData = {
      userId,
      activityType,
      targetId: safeTargetId,
      metadata: sanitizedMetadata,
      timestamp: serverTimestamp(),
      // Only collect minimal device info - no PII
      deviceType: typeof window !== 'undefined' ? 
        (window.innerWidth <= 768 ? 'mobile' : 'desktop') : null
    };
    
    // Use provided batch or create a new operation
    if (batch) {
      const docRef = doc(collection(db, USER_ACTIVITIES_COLLECTION));
      batch.set(docRef, activityData);
      return { success: true, docRef: docRef.id };
    } else {
      const docRef = await addDoc(collection(db, USER_ACTIVITIES_COLLECTION), activityData);
      return { success: true, docRef: docRef.id };
    }
  } catch (error) {
    // Safe error logging
    logger.error('Failed to track user activity', {
      context: { activityType, error },
      category: LogCategory.ERROR
    });
    
    return { 
      success: false, 
      error: 'Failed to track activity' // Generic message for security
    };
  }
}
