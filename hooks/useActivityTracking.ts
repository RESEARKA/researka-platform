// hooks/useActivityTracking.ts
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { trackUserActivity, ActivityType, ActivityMetadata } from '../utils/activityTracker';
import { createLogger, LogCategory } from '../utils/logger';

const logger = createLogger('activity-tracking');

/**
 * Hook to track article view activity with time spent
 * 
 * @param targetId ID of the article being viewed
 * @param metadata Additional metadata about the view
 * @returns Object with tracking status
 */
export function useArticleViewTracking(
  targetId: string | undefined,
  metadata: ActivityMetadata = {}
) {
  const { user } = useAuth();
  const viewStartTime = useRef<number>(Date.now());
  const [hasTrackedInitialView, setHasTrackedInitialView] = useState<boolean>(false);
  const [trackingStatus, setTrackingStatus] = useState<{ success: boolean; error?: string }>({ 
    success: true 
  });

  // Track initial view when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const trackInitialView = async () => {
      // Only track if we have a user and article ID
      if (!user?.uid || !targetId || hasTrackedInitialView) return;
      
      try {
        // Reset the start time
        viewStartTime.current = Date.now();
        
        // Track the initial view
        const result = await trackUserActivity(
          user.uid,
          ActivityType.ARTICLE_VIEW,
          targetId,
          {
            ...metadata,
            referrer: typeof document !== 'undefined' ? document.referrer || 'direct' : 'unknown',
            isInitialView: true
          }
        );
        
        if (isMounted) {
          setTrackingStatus(result);
          setHasTrackedInitialView(result.success);
        }
      } catch (error) {
        logger.error('Failed to track initial article view', {
          context: { targetId, error },
          category: LogCategory.ERROR
        });
        
        if (isMounted) {
          setTrackingStatus({ success: false, error: 'Failed to track view' });
        }
      }
    };
    
    trackInitialView();
    
    // Cleanup function to track time spent when component unmounts
    return () => {
      isMounted = false;
      
      // Only track time spent if we successfully tracked the initial view
      if (user?.uid && targetId && hasTrackedInitialView) {
        const timeSpent = Math.floor((Date.now() - viewStartTime.current) / 1000);
        
        // Only track if meaningful time was spent (> 5 seconds)
        if (timeSpent > 5) {
          trackUserActivity(
            user.uid,
            ActivityType.ARTICLE_VIEW,
            targetId,
            {
              ...metadata,
              timeSpent,
              isComplete: timeSpent > 30, // Consider "read" if > 30 seconds
              isTimeUpdate: true
            }
          ).catch(error => {
            logger.error('Failed to track article time spent', {
              context: { targetId, timeSpent, error },
              category: LogCategory.ERROR
            });
          });
        }
      }
    };
  }, [user, targetId, hasTrackedInitialView, metadata]);

  return trackingStatus;
}

/**
 * Hook to track search activity
 * 
 * @param query Search query string
 * @param metadata Additional metadata about the search
 * @returns Function to trigger search tracking
 */
export function useSearchTracking() {
  const { user } = useAuth();
  
  const trackSearch = async (
    query: string,
    metadata: ActivityMetadata = {}
  ) => {
    if (!user?.uid || !query.trim()) return { success: false, error: 'Invalid input' };
    
    try {
      return await trackUserActivity(
        user.uid,
        ActivityType.SEARCH,
        undefined,
        {
          ...metadata,
          query: query.trim()
        }
      );
    } catch (error) {
      logger.error('Failed to track search activity', {
        context: { query, error },
        category: LogCategory.ERROR
      });
      
      return { success: false, error: 'Failed to track search' };
    }
  };
  
  return trackSearch;
}

/**
 * Hook to track user login activity
 * 
 * @returns Function to trigger login tracking
 */
export function useLoginTracking() {
  const trackLogin = async (userId: string) => {
    if (!userId) return { success: false, error: 'Invalid user ID' };
    
    try {
      return await trackUserActivity(
        userId,
        ActivityType.LOGIN,
        undefined,
        {
          timestamp: Date.now()
        }
      );
    } catch (error) {
      logger.error('Failed to track login activity', {
        context: { userId, error },
        category: LogCategory.ERROR
      });
      
      return { success: false, error: 'Failed to track login' };
    }
  };
  
  return trackLogin;
}

/**
 * Track user signup
 * 
 * @param userId User ID of the new user
 * @param metadata Additional signup metadata
 * @returns Promise with tracking result
 */
export async function trackSignup(
  userId: string,
  metadata: ActivityMetadata = {}
) {
  if (!userId) return { success: false, error: 'Invalid user ID' };
  
  try {
    return await trackUserActivity(
      userId,
      ActivityType.SIGNUP,
      undefined,
      metadata
    );
  } catch (error) {
    logger.error('Failed to track signup activity', {
      context: { userId, error },
      category: LogCategory.ERROR
    });
    
    return { success: false, error: 'Failed to track signup' };
  }
}
