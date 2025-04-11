import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Badge,
  List,
  ListItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useColorModeValue,
  Divider,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Button
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { ActivityType } from '../../utils/activityTracker';
import { initializeSocket, joinAdminRoom, cleanupSocket } from '../../services/socketService';
import { throttle } from 'lodash';
import DOMPurify from 'dompurify';
import { Socket } from 'socket.io-client';

// Define proper types
interface Activity {
  activityType: ActivityType;
  userId: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

interface FormattedActivity {
  description: string;
  time: string;
  type: string;
  user: string;
  id: string;
}

const MAX_ACTIVITIES = 50;
const ACTIVITY_UPDATE_THROTTLE = 200; // ms

const LiveActivityDashboard: React.FC = () => {
  // State with proper typing
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityCounts, setActivityCounts] = useState<Record<string, number>>({});
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Use proper typing for socket reference
  const socketRef = useRef<Socket | null>(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  
  // Throttled update function to prevent excessive re-renders
  const updateActivities = useCallback(
    throttle((activity: Activity) => {
      setActivities(prev => {
        const newActivities = [activity, ...prev].slice(0, MAX_ACTIVITIES);
        return newActivities;
      });
      
      setActivityCounts(prev => {
        const newCounts = { ...prev };
        newCounts[activity.activityType] = (newCounts[activity.activityType] || 0) + 1;
        return newCounts;
      });
    }, ACTIVITY_UPDATE_THROTTLE),
    []
  );
  
  // Handle reconnection with proper cleanup
  const handleReconnect = useCallback(async () => {
    try {
      // Clean up existing socket first
      if (socketRef.current) {
        socketRef.current.off('active_users_count');
        socketRef.current.off('activity_update');
        socketRef.current.off('connect_error');
        socketRef.current.off('error');
        socketRef.current.disconnect();
      }
      cleanupSocket();
      
      setConnectionStatus('connecting');
      setErrorMessage(null);
      
      // Initialize socket with explicit path
      const socket = await initializeSocket({ 
        auth: true
      });
      
      if (!socket) {
        throw new Error('Failed to initialize socket');
      }
      
      socketRef.current = socket;
      
      // Join admin room with authentication
      const joined = await joinAdminRoom();
      
      if (!joined) {
        setConnectionStatus('error');
        setErrorMessage('Not authorized to view admin dashboard');
        return;
      }
      
      setConnectionStatus('connected');
      
      // Set up event listeners
      socket.on('active_users_count', (count: number) => {
        setActiveUsers(count);
      });
      
      socket.on('activity_update', (activity: Activity) => {
        updateActivities(activity);
      });
      
      socket.on('connect_error', (err: Error) => {
        console.error('Socket connection error:', err);
        setConnectionStatus('error');
        setErrorMessage(`Connection error: ${err.message}`);
      });
      
      socket.on('error', (errorMsg: string) => {
        console.error('Socket error:', errorMsg);
      });
      
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(`Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [updateActivities]);
  
  useEffect(() => {
    let mounted = true;
    
    const setupSocket = async () => {
      try {
        if (mounted) {
          await handleReconnect();
        }
      } catch (error) {
        if (mounted) {
          setConnectionStatus('error');
          setErrorMessage(`Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    };
    
    setupSocket();
    
    // Improved cleanup function to prevent memory leaks
    return () => {
      mounted = false;
      updateActivities.cancel();
      
      // Properly remove all event listeners
      if (socketRef.current) {
        socketRef.current.off('active_users_count');
        socketRef.current.off('activity_update');
        socketRef.current.off('connect_error');
        socketRef.current.off('error');
        socketRef.current.disconnect();
      }
      cleanupSocket();
    };
  }, [handleReconnect, updateActivities]);
  
  // Format activity with sanitization and improved type safety
  const formatActivity = (activity: Activity): FormattedActivity => {
    const { activityType, userId, targetId, metadata, timestamp } = activity;
    
    let description = '';
    switch (activityType) {
      case ActivityType.ARTICLE_VIEW:
        description = `User viewed article: ${DOMPurify.sanitize(targetId || 'unknown')}`;
        break;
      case ActivityType.SEARCH:
        // Improved type safety for metadata
        const query = typeof metadata?.query === 'string' ? metadata.query : 'unknown';
        description = `User searched for: ${DOMPurify.sanitize(query)}`;
        break;
      case ActivityType.LOGIN:
        description = `User logged in`;
        break;
      case ActivityType.SIGNUP:
        description = `New user signed up`;
        break;
      default:
        description = `${activityType.replace(/_/g, ' ')}`;
    }
    
    return {
      description,
      time: format(new Date(timestamp), 'HH:mm:ss'),
      type: activityType,
      user: userId.substring(0, 8), // Show only first 8 chars for privacy
      id: `${timestamp}-${userId}-${activityType}`
    };
  };
  
  // Helper to get color scheme based on activity type
  const getColorScheme = (activityType: string) => {
    switch (activityType) {
      case ActivityType.ARTICLE_VIEW:
        return 'blue';
      case ActivityType.SEARCH:
        return 'purple';
      case ActivityType.LOGIN:
        return 'green';
      case ActivityType.SIGNUP:
        return 'teal';
      default:
        return 'gray';
    }
  };
  
  // Show loading state
  if (connectionStatus === 'connecting') {
    return (
      <Center h="300px">
        <Flex direction="column" align="center">
          <Spinner size="xl" mb={4} />
          <Text>Connecting to real-time data...</Text>
        </Flex>
      </Center>
    );
  }
  
  // Show error state with reconnect button
  if (connectionStatus === 'error') {
    return (
      <Box>
        <Alert status="error" mb={4}>
          <AlertIcon />
          {errorMessage || 'Failed to connect to real-time data'}
        </Alert>
        <Button onClick={handleReconnect} colorScheme="blue">
          Retry Connection
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb={5}>
        <Box bg={bgColor} p={5} borderRadius="md" shadow="md">
          <Stat>
            <StatLabel>Active Users</StatLabel>
            <StatNumber>{activeUsers}</StatNumber>
            <StatHelpText>Currently online</StatHelpText>
          </Stat>
        </Box>
        
        <Box bg={bgColor} p={5} borderRadius="md" shadow="md">
          <Stat>
            <StatLabel>Activity Count</StatLabel>
            <StatNumber>{activities.length}</StatNumber>
            <StatHelpText>Recent activities</StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        {Object.entries(activityCounts).map(([type, count]) => (
          <Box key={type} bg={bgColor} p={5} borderRadius="md" shadow="md">
            <Stat>
              <StatLabel>{type.replace(/_/g, ' ')}</StatLabel>
              <StatNumber>{count}</StatNumber>
              <Badge colorScheme={getColorScheme(type)} mt={2}>
                {Math.round((count / activities.length) * 100)}%
              </Badge>
            </Stat>
          </Box>
        ))}
      </SimpleGrid>
      
      <Box bg={bgColor} p={5} borderRadius="md" shadow="md">
        <Heading size="md" mb={4}>
          Live Activity Feed
        </Heading>
        <Divider mb={4} />
        
        {activities.length === 0 ? (
          <Text>No activities recorded yet</Text>
        ) : (
          <List spacing={3} aria-live="polite" aria-relevant="additions" aria-label="Live activity feed updates">
            {activities.map(activity => {
              const formatted = formatActivity(activity);
              return (
                <ListItem key={formatted.id} role="status">
                  <Flex align="center">
                    <Badge colorScheme={getColorScheme(formatted.type)} mr={2}>
                      {formatted.time}
                    </Badge>
                    <Text fontWeight="medium">{formatted.description}</Text>
                  </Flex>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default LiveActivityDashboard;
