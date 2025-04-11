import { useEffect } from 'react';
import { useAuth } from './useAuth';
import useRealtimeActivity from './useRealtimeActivity';
import { ActivityType } from '../utils/activityTracker';

/**
 * Hook for tracking authentication-related activities in real-time
 * This hook is used in components that need to track auth events
 */
export const useAuthActivityTracking = () => {
  const { user, loading } = useAuth();
  const { trackActivity } = useRealtimeActivity();
  
  // Track login events
  useEffect(() => {
    // Only track when we have a user and loading is complete
    if (!user || loading) return;
    
    // Track the login activity with user metadata
    trackActivity(ActivityType.LOGIN, user.uid, {
      email: user.email || 'anonymous',
      role: user.role || 'User',
      timestamp: Date.now()
    });
    
    // We only want to track this once when the user first appears
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, loading]);
  
  return null; // This hook doesn't return anything, it just tracks
};

export default useAuthActivityTracking;
