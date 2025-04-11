// Socket.IO client test script
const { io } = require('socket.io-client');
const readline = require('readline');

// Create readline interface for interactive testing
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('DecentraJournal Socket.IO Connection Test');
console.log('=======================================');

// Mock token for testing - replace with a valid token if available
let authToken = process.env.AUTH_TOKEN || '';

// Ask for auth token if not provided
if (!authToken) {
  rl.question('Enter Firebase auth token (leave empty to skip authentication): ', (token) => {
    authToken = token.trim();
    connectSocket(authToken);
  });
} else {
  connectSocket(authToken);
}

function connectSocket(token) {
  console.log(`\nConnecting to socket server at http://localhost:3000/api/socket...`);
  console.log(`Authentication: ${token ? 'Enabled' : 'Disabled'}\n`);
  
  // Initialize socket connection
  const socket = io('http://localhost:3000', {
    path: '/api/socket',
    autoConnect: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: token ? { token } : undefined,
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Connected to socket server');
    console.log(`Socket ID: ${socket.id}`);
    
    // Try to join admin room
    console.log('\nAttempting to join admin room...');
    socket.emit('join_admin_room', (response) => {
      if (response.success) {
        console.log('✅ Successfully joined admin room');
      } else {
        console.log(`❌ Failed to join admin room: ${response.error || 'Unknown error'}`);
      }
    });
    
    // Menu for testing
    showMenu(socket);
  });

  socket.on('connect_error', (error) => {
    console.log(`❌ Connection error: ${error.message}`);
    if (error.message.includes('xhr poll error')) {
      console.log('   This may indicate the server is not running or CORS issues');
    }
    if (error.message.includes('not authorized')) {
      console.log('   Authentication failed - invalid or expired token');
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`❌ Disconnected: ${reason}`);
  });

  socket.on('error', (error) => {
    console.log(`❌ Socket error: ${error}`);
  });

  // Listen for admin events
  socket.on('active_users_count', (count) => {
    console.log(`📊 Active users count: ${count}`);
  });

  socket.on('activity_update', (activity) => {
    console.log(`📊 Activity update: ${JSON.stringify(activity)}`);
  });
}

function showMenu(socket) {
  console.log('\n--- Test Menu ---');
  console.log('1. Request active users count');
  console.log('2. Send test activity');
  console.log('3. Disconnect');
  console.log('4. Exit');
  
  rl.question('Select an option: ', (option) => {
    switch(option) {
      case '1':
        socket.emit('get_active_users_count');
        console.log('Request sent for active users count');
        setTimeout(() => showMenu(socket), 1000);
        break;
      case '2':
        const testActivity = {
          userId: 'test-user',
          activityType: 'TEST_ACTIVITY',
          timestamp: Date.now(),
          metadata: { test: true }
        };
        socket.emit('track_activity', testActivity);
        console.log('Test activity sent');
        setTimeout(() => showMenu(socket), 1000);
        break;
      case '3':
        socket.disconnect();
        console.log('Socket disconnected');
        setTimeout(() => showMenu(socket), 1000);
        break;
      case '4':
        socket.disconnect();
        console.log('Exiting...');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Invalid option');
        showMenu(socket);
    }
  });
}
