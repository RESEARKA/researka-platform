import React, { useEffect, useState } from 'react';
import { Box, Button, Text, Code, VStack, Heading, Alert, AlertIcon, Divider } from '@chakra-ui/react';
import AdminLayout from '../../components/admin/AdminLayout';
import { initializeSocket, joinAdminRoom, cleanupSocket } from '../../services/socketService';
import { useAuth } from '../../contexts/AuthContext';

const SocketTest = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('Not connected');
  const { currentUser } = useAuth();
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };
  
  const clearLogs = () => {
    setLogs([]);
  };
  
  const testSocketConnection = async () => {
    addLog('Starting socket connection test...');
    addLog(`Current user: ${currentUser?.email || 'Not logged in'}`);
    
    try {
      // Initialize socket server
      addLog('Initializing socket server...');
      const serverResponse = await fetch('/api/socket');
      addLog(`Server initialization status: ${serverResponse.status} ${serverResponse.statusText}`);
      
      // Initialize socket
      addLog('Initializing socket client...');
      const socket = await initializeSocket({ auth: true });
      
      if (!socket) {
        addLog('❌ Failed to initialize socket');
        setConnectionStatus('Failed');
        return;
      }
      
      addLog('✅ Socket initialized successfully');
      setConnectionStatus('Initialized');
      
      // Join admin room
      addLog('Attempting to join admin room...');
      const joined = await joinAdminRoom();
      
      if (joined) {
        addLog('✅ Successfully joined admin room');
        setConnectionStatus('Connected as Admin');
        
        // Set up event listeners
        socket.on('active_users_count', (count) => {
          addLog(`Received active users count: ${count}`);
        });
        
        socket.on('activity_update', (activity) => {
          addLog(`Received activity update: ${activity.activityType}`);
        });
      } else {
        addLog('❌ Failed to join admin room');
        setConnectionStatus('Connected (Not Admin)');
      }
      
      // Listen for errors
      socket.on('connect_error', (err) => {
        addLog(`❌ Connection error: ${JSON.stringify(err)}`);
      });
      
      socket.on('error', (err) => {
        addLog(`❌ Socket error: ${JSON.stringify(err)}`);
      });
      
    } catch (error) {
      addLog(`❌ Error during test: ${error instanceof Error ? error.message : String(error)}`);
      setConnectionStatus('Error');
    }
  };
  
  const disconnectSocket = () => {
    addLog('Disconnecting socket...');
    cleanupSocket();
    setConnectionStatus('Disconnected');
    addLog('Socket disconnected');
  };
  
  return (
    <AdminLayout title="Socket Connection Test">
      <Box p={5}>
        <Heading size="lg" mb={4}>Socket Connection Test</Heading>
        
        <Box mb={4}>
          <Text fontWeight="bold">Connection Status: </Text>
          <Alert status={connectionStatus === 'Connected as Admin' ? 'success' : connectionStatus === 'Error' ? 'error' : 'info'}>
            <AlertIcon />
            {connectionStatus}
          </Alert>
        </Box>
        
        <Box mb={4}>
          <Text fontWeight="bold">User Info: </Text>
          <Code p={2} borderRadius="md">
            {currentUser ? `Email: ${currentUser.email}, UID: ${currentUser.uid}` : 'Not logged in'}
          </Code>
        </Box>
        
        <Box mb={4}>
          <Button colorScheme="blue" onClick={testSocketConnection} mr={2}>
            Test Socket Connection
          </Button>
          <Button colorScheme="red" onClick={disconnectSocket} mr={2}>
            Disconnect Socket
          </Button>
          <Button onClick={clearLogs}>Clear Logs</Button>
        </Box>
        
        <Divider my={4} />
        
        <Box>
          <Heading size="md" mb={2}>Connection Logs</Heading>
          <Box 
            bg="gray.100" 
            p={3} 
            borderRadius="md" 
            maxH="400px" 
            overflowY="auto"
            fontFamily="monospace"
          >
            <VStack align="stretch" spacing={1}>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <Text key={index} fontSize="sm">{log}</Text>
                ))
              ) : (
                <Text color="gray.500">No logs yet. Click "Test Socket Connection" to begin.</Text>
              )}
            </VStack>
          </Box>
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default SocketTest;
