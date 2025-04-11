// Enhanced script to test socket connection with authentication
const { io } = require('socket.io-client');
const readline = require('readline');

// Configuration
const DEFAULT_PORT = 3000;
const DEFAULT_HOST = 'localhost';
const DEFAULT_PATH = '/api/socket';
const DEFAULT_TIMEOUT = 15000; // 15 seconds
const TEST_ADMIN_TOKEN = process.env.TEST_ADMIN_TOKEN || ''; // Should be set in environment

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Test options
const options = {
  host: DEFAULT_HOST,
  port: DEFAULT_PORT,
  path: DEFAULT_PATH,
  timeout: DEFAULT_TIMEOUT,
  token: TEST_ADMIN_TOKEN,
  verbose: false
};

// Parse command line arguments
process.argv.slice(2).forEach(arg => {
  const [key, value] = arg.split('=');
  if (key === '--host') options.host = value;
  if (key === '--port') options.port = parseInt(value, 10);
  if (key === '--path') options.path = value;
  if (key === '--timeout') options.timeout = parseInt(value, 10);
  if (key === '--token') options.token = value;
  if (key === '--verbose') options.verbose = value === 'true';
});

// Print test configuration
console.log('Socket Connection Test');
console.log('=====================');
console.log(`Host: ${options.host}`);
console.log(`Port: ${options.port}`);
console.log(`Path: ${options.path}`);
console.log(`Timeout: ${options.timeout}ms`);
console.log(`Auth Token: ${options.token ? '✓ (provided)' : '✗ (not provided)'}`);
console.log(`Verbose: ${options.verbose ? 'Yes' : 'No'}`);
console.log('=====================\n');

// Initialize socket server first by making a request to the API route
async function initializeSocketServer() {
  try {
    console.log('Initializing socket server...');
    // For Next.js, we need to make a request to the API route to initialize the Socket.IO server
    // This is a simple HTTP request to the API route
    const url = `http://${options.host}:${options.port}/api/socket`;
    console.log(`Making request to: ${url}`);
    
    // Use native http module for simplicity
    const http = require('http');
    
    return new Promise((resolve) => {
      const req = http.get(url, (res) => {
        console.log(`✓ Socket server initialization response: ${res.statusCode}`);
        resolve(res.statusCode >= 200 && res.statusCode < 300);
      });
      
      req.on('error', (error) => {
        console.error(`✗ Failed to initialize socket server: ${error.message}`);
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    console.error('✗ Failed to initialize socket server:', error.message);
    return false;
  }
}

// Test socket connection
async function testSocketConnection() {
  // First initialize the socket server
  const serverInitialized = await initializeSocketServer();
  if (!serverInitialized) {
    console.error('Cannot proceed with connection test due to server initialization failure');
    console.log('Make sure your Next.js development server is running on the specified port');
    process.exit(1);
  }

  console.log('\nTesting socket connection...');
  
  // Create a socket connection to the server
  const socketUrl = `http://${options.host}:${options.port}`;
  console.log(`Connecting to: ${socketUrl}`);
  
  const socket = io(socketUrl, {
    path: options.path,
    transports: ['polling', 'websocket'], // Try polling first, then websocket
    autoConnect: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
    timeout: 10000,
    forceNew: true,
    auth: options.token ? { token: options.token } : undefined,
  });

  // Track connection status
  let isConnected = false;
  let adminRoomJoined = false;
  
  // Log connection events
  socket.on('connect', () => {
    isConnected = true;
    console.log('✓ Connected to socket server!');
    console.log(`Socket ID: ${socket.id}`);
    
    // Test admin room access if token is provided
    if (options.token) {
      console.log('\nTesting admin room access...');
      socket.emit('join_admin', options.token, (response) => {
        if (response && response.success) {
          adminRoomJoined = true;
          console.log('✓ Successfully joined admin room');
        } else {
          console.error(`✗ Failed to join admin room: ${response?.error || 'Unknown error'}`);
        }
      });
    }
  });

  socket.on('connect_error', (err) => {
    console.error('✗ Connection error:', err.message);
    if (options.verbose) {
      console.error('Detailed error:', err);
    }
  });

  socket.on('disconnect', (reason) => {
    isConnected = false;
    console.log(`Disconnected: ${reason}`);
  });

  socket.on('error', (error) => {
    console.error('✗ Socket error:', error);
  });

  // Listen for activity updates
  socket.on('active_users_count', (count) => {
    console.log(`Received active users count: ${count}`);
  });

  socket.on('activity_update', (activity) => {
    if (options.verbose) {
      console.log('Received activity update:', JSON.stringify(activity, null, 2));
    } else {
      console.log(`Received activity update of type: ${activity.activityType}`);
    }
  });

  // Keep the script running for the specified timeout
  console.log(`\nTest will run for ${options.timeout / 1000} seconds...`);
  
  setTimeout(() => {
    console.log('\nTest Summary:');
    console.log('=====================');
    console.log(`Socket Connection: ${isConnected ? '✓ Connected' : '✗ Not connected'}`);
    
    if (options.token) {
      console.log(`Admin Room Access: ${adminRoomJoined ? '✓ Joined' : '✗ Not joined'}`);
    }
    
    console.log('=====================\n');
    
    console.log('Test completed. Disconnecting...');
    socket.disconnect();
    
    // Ask if user wants to run another test
    rl.question('Would you like to run another test? (y/n) ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        console.log('\n');
        testSocketConnection();
      } else {
        rl.close();
        process.exit(0);
      }
    });
  }, options.timeout);
}

// Start the test
testSocketConnection();

// Handle CTRL+C
process.on('SIGINT', () => {
  console.log('\nTest interrupted. Exiting...');
  rl.close();
  process.exit(0);
});
