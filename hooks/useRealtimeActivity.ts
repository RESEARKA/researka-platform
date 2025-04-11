import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { ActivityType } from '../utils/activityTracker';
import { trackRealtimeActivity, connectUser } from '../services/realtimeActivityService';
import { cleanupSocket } from '../services/socketService';

/**
 * Hook for tracking user activity in real-time
 * Handles both historical tracking (Firestore) and real-time tracking (WebSockets)
 */
export const useRealtimeActivity = () => {
  const { user } = useAuth();
  
  // Connect user when they load the app
  useEffect(() => {
    const userId = user?.uid;
    
    // Connect user to socket for presence tracking
    const setupConnection = async () => {
      await connectUser(userId);
    };
    
    setupConnection();
    
    // Cleanup on unmount
    return () => {
      cleanupSocket();
    };
  }, [user]);
  
  // Track activity with proper error handling
  const trackActivity = useCallback(async (
    activityType: ActivityType,
    targetId?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    try {
      if (!user?.uid) {
        console.warn('Cannot track activity: User not authenticated');
        return false;
      }
      
      return await trackRealtimeActivity(user.uid, activityType, targetId, metadata);
    } catch (error) {
      console.error('Failed to track activity:', error);
      return false;
    }
  }, [user]);
  
  return { trackActivity };
};

export default useRealtimeActivity;
