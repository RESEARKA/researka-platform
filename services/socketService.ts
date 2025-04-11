import { io, Socket } from 'socket.io-client';
import { getAuth } from 'firebase/auth';
import { z } from 'zod';

// Define types
export interface SocketOptions {
  url?: string;
  auth?: boolean;
}

// Socket connection constants
let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_DELAY = 1000;
const MAX_DELAY = 30000;
const ADMIN_JOIN_TIMEOUT = 5000;

// Schema for validation
export const activitySchema = z.object({
  activityType: z.string(),
  targetId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Response schema
const responseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional()
});

// Initialize socket with proper error handling and authentication
export const initializeSocket = async (options: SocketOptions = {}): Promise<Socket | null> => {
  if (typeof window === 'undefined') return null;
  
  // If socket exists and is connected, return it
  if (socket?.connected) return socket;
  
  // If socket exists but is disconnected, clean it up
  if (socket) {
    cleanupSocket();
  }
  
  try {
    // Get authentication token if needed
    let authToken = null;
    if (options.auth) {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Force token refresh for security
        authToken = await currentUser.getIdToken(true);
        
        // Basic validation
        if (!authToken || authToken.length < 50) {
          console.error('Invalid auth token');
          return null;
        }
      }
    }
    
    // Calculate reconnection delay with exponential backoff
    const reconnectionDelay = Math.min(
      BASE_DELAY * Math.pow(2, reconnectAttempts),
      MAX_DELAY
    );
    
    console.log('Initializing socket connection with path: /api/socket');
    
    // Create socket with correct configuration for Next.js API routes
    socket = io({
      path: '/api/socket',
      autoConnect: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay,
      auth: authToken ? { token: authToken } : undefined,
      transports: ['websocket', 'polling'] // Try WebSocket first, then fallback to polling
    });
    
    // Set up error handling
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      reconnectAttempts++;
      
      // Implement custom reconnection logic if needed
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Max reconnection attempts reached');
        cleanupSocket();
      }
    });
    
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      reconnectAttempts = 0;
    });
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
    });
    
    return socket;
  } catch (error) {
    console.error('Failed to initialize socket:', error);
    return null;
  }
};

// Clean up socket properly to prevent memory leaks
export const cleanupSocket = () => {
  if (!socket) return;
  
  // Disconnect first to prevent new events
  socket.disconnect();
  
  // Remove all listeners for known events
  const knownEvents = ['connect', 'disconnect', 'connect_error', 'error'];
  knownEvents.forEach((event: string) => {
    socket?.removeAllListeners(event);
  });
  
  socket = null;
  reconnectAttempts = 0;
};

// Join admin room with proper authentication and timeout
export const joinAdminRoom = async (): Promise<boolean> => {
  if (!socket?.connected) {
    await initializeSocket({ auth: true });
  }
  
  if (!socket?.connected) return false;
  
  try {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken(true); // Force refresh
    
    if (!token || token.length < 50) {
      console.error('Invalid auth token for admin room');
      return false;
    }
    
    // Add timeout to prevent hanging promise
    return new Promise<boolean>((resolve) => {
      // Set timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.warn('Admin room join timeout');
        resolve(false);
      }, ADMIN_JOIN_TIMEOUT);
      
      socket!.emit('join_admin', token, (response: unknown) => {
        clearTimeout(timeout);
        
        // Validate response with schema
        const result = responseSchema.safeParse(response);
        if (!result.success) {
          console.error('Invalid response from server');
          resolve(false);
          return;
        }
        
        resolve(result.data.success);
      });
    });
  } catch (error) {
    console.error('Failed to join admin room:', error);
    return false;
  }
};
