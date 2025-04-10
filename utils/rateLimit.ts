/**
 * Rate limiting utility for API endpoints
 * Uses Firestore to track and enforce rate limits
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  Timestamp, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { createLogger } from './logger';

const logger = createLogger('utils/rateLimit');

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in milliseconds
}

/**
 * Apply rate limiting to an operation
 * 
 * @param identifier Unique identifier for the rate limit (e.g., userId or IP address)
 * @param limit Maximum number of operations allowed in the time window
 * @param windowSeconds Time window in seconds
 * @returns Object with rate limit information
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    // Get current time
    const now = Date.now();
    
    // Calculate reset time
    const resetTime = now + (windowSeconds * 1000);
    
    // Create reference to rate limit document
    const rateLimitRef = doc(db, 'rateLimits', identifier);
    
    // Get current rate limit data
    const rateLimitSnap = await getDoc(rateLimitRef);
    
    // If rate limit document doesn't exist, create it
    if (!rateLimitSnap.exists()) {
      await setDoc(rateLimitRef, {
        count: 1,
        reset: Timestamp.fromMillis(resetTime),
        lastUpdated: serverTimestamp()
      });
      
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: resetTime
      };
    }
    
    // Get rate limit data
    const data = rateLimitSnap.data();
    const resetTimestamp = data.reset.toMillis();
    
    // If reset time has passed, reset the counter
    if (now > resetTimestamp) {
      await setDoc(rateLimitRef, {
        count: 1,
        reset: Timestamp.fromMillis(resetTime),
        lastUpdated: serverTimestamp()
      });
      
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
    await setDoc(rateLimitRef, {
      count: currentCount + 1,
      reset: data.reset,
      lastUpdated: serverTimestamp()
    }, { merge: true });
    
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
