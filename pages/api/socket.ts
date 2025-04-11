import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponseWithSocket } from '../../types/socket';
import { getFirebaseAdmin } from '../../config/firebase-admin';
import { z } from 'zod';

// Validation schema for activity data
const activitySchema = z.object({
  userId: z.string(),
  activityType: z.string(),
  targetId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.number().optional()
});

// Simple Next.js API route handler for Socket.io
const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  // Log request information for debugging
  console.log('Socket API route hit:', req.url);
  
  // If Socket.io server is already initialized, skip initialization
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Setting up Socket.io server');
  
  // Get allowed origins from environment variables
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3003', 'http://localhost:3007', 'http://localhost:3008'];
  
  // Initialize Socket.io server with proper CORS configuration
  const io = new Server(res.socket.server, {
    path: '/api/socket',
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 30000, // 30 seconds ping timeout
    pingInterval: 10000 // 10 seconds ping interval
  });
  
  // Store the io instance on the server
  res.socket.server.io = io;
  
  // Get Firebase Admin instances once to avoid multiple initializations
  const admin = getFirebaseAdmin();
  const auth = admin.auth();
  const firestore = admin.firestore();
  const database = admin.database();
  
  // Initialize activity tracking references
  const activitiesRef = database.ref('realtime/activities');

  // Handle new connections
  io.on('connection', socket => {
    console.log('New client connected:', socket.id);
    
    // Track connection count
    const connectionCount = io.engine.clientsCount;
    console.log(`Active connections: ${connectionCount}`);
    
    // Handle admin room join requests with rate limiting
    let adminJoinAttempts = 0;
    const MAX_JOIN_ATTEMPTS = 5;
    
    socket.on('join_admin', async (token, callback) => {
      // Rate limiting
      adminJoinAttempts++;
      if (adminJoinAttempts > MAX_JOIN_ATTEMPTS) {
        console.warn(`Too many admin join attempts from socket ${socket.id}`);
        callback?.({ success: false, error: 'Too many attempts' });
        return;
      }
      
      try {
        // Verify Firebase token
        const decodedToken = await auth.verifyIdToken(token);
        
        // Get user data from Firestore
        const userDoc = await firestore
          .collection('users')
          .doc(decodedToken.uid)
          .get();
        
        const userData = userDoc.data();
        
        // Check if user has admin or junior admin role
        if (userData?.role === 'Admin' || userData?.role === 'JuniorAdmin') {
          socket.join('admins');
          callback?.({ success: true });
          console.log(`Admin joined: ${decodedToken.uid}`);
        } else {
          callback?.({ success: false, error: 'Unauthorized' });
          console.log(`Unauthorized admin access attempt`);
        }
      } catch (error) {
        console.error('Admin verification error:', error);
        // Generic error message to avoid information leakage
        callback?.({ success: false, error: 'Authentication failed' });
      }
    });
    
    // Handle activity tracking with proper validation
    socket.on('track_activity', async (data, callback) => {
      try {
        // Validate data using zod schema
        const validationResult = activitySchema.safeParse(data);
        
        if (!validationResult.success) {
          callback?.({ success: false, error: 'Invalid activity data' });
          return;
        }
        
        const validData = validationResult.data;
        
        // Store activity in Firebase Realtime Database
        const newActivityRef = activitiesRef.push();
        
        await newActivityRef.set({
          ...validData,
          timestamp: validData.timestamp || Date.now()
        });
        
        // Broadcast to admin room
        io.to('admins').emit('activity_update', validData);
        
        callback?.({ success: true });
      } catch (error) {
        console.error('Activity tracking error:', error);
        callback?.({ success: false, error: 'Failed to track activity' });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  res.end();
};

export default SocketHandler;
