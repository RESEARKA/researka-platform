// scripts/test-realtime-analytics.js
const { io } = require('socket.io-client');
const readline = require('readline');

// Create interface for command-line input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const SOCKET_URL = 'http://localhost:3000';
const NUM_USERS = 5;
const ACTIVITY_TYPES = [
  'article_view',
  'search',
  'login',
  'signup',
  'comment_add'
];

// Connect multiple sockets to simulate users
const sockets = [];
let connectedCount = 0;
let authenticated = false;

console.log('🔌 Connecting test users to socket server...');

// Create multiple socket connections
for (let i = 0; i < NUM_USERS; i++) {
  const userId = `test-user-${i + 1}`;
  const socket = io(SOCKET_URL, {
    auth: {
      userId,
      token: 'test-token' // In a real app, this would be a JWT
    }
  });

  socket.on('connect', () => {
    console.log(`✅ User ${userId} connected with socket ID: ${socket.id}`);
    connectedCount++;
    
    if (connectedCount === NUM_USERS) {
      console.log('🎉 All test users connected successfully!');
      authenticated = true;
      showMenu();
    }
  });

  socket.on('connect_error', (err) => {
    console.error(`❌ Connection error for user ${userId}:`, err.message);
  });

  socket.on('activity_update', (data) => {
    console.log(`📊 Received activity update: ${JSON.stringify(data)}`);
  });

  socket.on('user_count_update', (count) => {
    console.log(`👥 Active users count updated: ${count}`);
  });

  sockets.push({ socket, userId });
}

// Generate a random activity
function generateRandomActivity() {
  const socketIndex = Math.floor(Math.random() * sockets.length);
  const { socket, userId } = sockets[socketIndex];
  const activityType = ACTIVITY_TYPES[Math.floor(Math.random() * ACTIVITY_TYPES.length)];
  
  let targetId = null;
  let metadata = {};
  
  // Generate appropriate metadata based on activity type
  switch (activityType) {
    case 'article_view':
      targetId = `article-${Math.floor(Math.random() * 100)}`;
      metadata = {
        title: `Test Article ${targetId}`,
        timeSpent: Math.floor(Math.random() * 300),
        isComplete: Math.random() > 0.5
      };
      break;
    case 'search':
      metadata = {
        query: `test query ${Math.floor(Math.random() * 10)}`,
        resultCount: Math.floor(Math.random() * 50)
      };
      break;
    case 'login':
    case 'signup':
      metadata = {
        email: `user${Math.floor(Math.random() * 100)}@example.com`,
        provider: 'email'
      };
      break;
    case 'comment_add':
      targetId = `article-${Math.floor(Math.random() * 100)}`;
      metadata = {
        commentLength: Math.floor(Math.random() * 200) + 10
      };
      break;
  }
  
  console.log(`🚀 Emitting ${activityType} activity for user ${userId}`);
  socket.emit('user_activity', {
    userId,
    activityType,
    targetId,
    metadata,
    timestamp: Date.now()
  });
}

// Generate multiple random activities
function generateBulkActivities(count) {
  console.log(`🔄 Generating ${count} random activities...`);
  
  const interval = setInterval(() => {
    generateRandomActivity();
    count--;
    
    if (count <= 0) {
      clearInterval(interval);
      console.log('✅ Finished generating activities');
      setTimeout(showMenu, 1000);
    }
  }, 500);
}

// Display the menu
function showMenu() {
  if (!authenticated) {
    console.log('❌ Not all users are connected. Please wait...');
    return;
  }
  
  console.log('\n📊 Real-time Analytics Test Menu:');
  console.log('1. Generate a single random activity');
  console.log('2. Generate 10 random activities');
  console.log('3. Generate 50 random activities');
  console.log('4. Disconnect all users');
  console.log('5. Exit');
  
  rl.question('Select an option: ', (answer) => {
    switch (answer) {
      case '1':
        generateRandomActivity();
        setTimeout(showMenu, 1000);
        break;
      case '2':
        generateBulkActivities(10);
        break;
      case '3':
        generateBulkActivities(50);
        break;
      case '4':
        disconnectAll();
        break;
      case '5':
        disconnectAll();
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Invalid option. Please try again.');
        showMenu();
    }
  });
}

// Disconnect all sockets
function disconnectAll() {
  console.log('👋 Disconnecting all users...');
  sockets.forEach(({ socket, userId }) => {
    socket.disconnect();
    console.log(`✅ User ${userId} disconnected`);
  });
  
  console.log('All users disconnected');
  setTimeout(() => {
    rl.close();
    process.exit(0);
  }, 1000);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Terminating test script...');
  disconnectAll();
});
