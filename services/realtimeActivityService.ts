import { ActivityType } from '../utils/activityTracker';
import { trackUserActivity } from '../utils/activityTracker';
import { initializeSocket, activitySchema } from './socketService';
import DOMPurify from 'dompurify';
import { throttle } from 'lodash';

// Throttle function to prevent excessive updates
const throttledEmit = throttle((socket, eventName, data) => {
  socket.emit(eventName, data);
}, 200);

// Track activity with proper validation and error handling
export const trackRealtimeActivity = async (
  userId: string,
  activityType: ActivityType,
  targetId?: string,
  metadata?: Record<string, any>
): Promise<boolean> => {
  try {
    // Sanitize metadata to prevent XSS
    const sanitizedMetadata = metadata ? 
      Object.entries(metadata).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = DOMPurify.sanitize(value);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>) : 
      undefined;
    
    // Track in Firestore for historical data
    await trackUserActivity(userId, activityType, targetId, sanitizedMetadata);
    
    // Validate data before sending
    const activityData = {
      activityType,
      userId,
      targetId,
      metadata: sanitizedMetadata,
      timestamp: Date.now()
    };
    
    try {
      activitySchema.parse(activityData);
    } catch (error) {
      console.error('Invalid activity data:', error);
      return false;
    }
    
    // Initialize socket if needed
    const socket = await initializeSocket();
    if (!socket?.connected) {
      console.warn('Socket not connected, activity only saved to Firestore');
      return false;
    }
    
    // Emit to socket with throttling
    throttledEmit(socket, 'user_activity', activityData);
    return true;
  } catch (error) {
    console.error('Failed to track activity:', error);
    return false;
  }
};

// Connect user with proper handling
export const connectUser = async (userId?: string): Promise<boolean> => {
  try {
    const socket = await initializeSocket();
    if (!socket?.connected) return false;
    
    socket.emit('user_connect', {
      userId: userId || null,
      anonymous: !userId
    });
    
    return true;
  } catch (error) {
    console.error('Failed to connect user:', error);
    return false;
  }
};
