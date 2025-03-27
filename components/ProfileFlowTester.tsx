import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Code,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  List,
  ListItem,
  Text,
  VStack,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useProfileData } from '../hooks/useProfileData';
import {
  checkUserProfileExists,
  getCurrentUserProfile,
  logProfileFlowState,
} from '../utils/testUtils';
import useClient from '../hooks/useClient';

/**
 * Component for testing the profile flow
 * This component provides buttons to test different parts of the profile flow
 */
const ProfileFlowTester: React.FC = () => {
  const toast = useToast();
  const { currentUser, authIsInitialized, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, error, updateProfile } = useProfileData();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const isClient = useClient();

  // Log important state changes
  useEffect(() => {
    if (!isClient) return;
    
    console.log('[ProfileFlowTester] Auth state:', {
      authIsInitialized,
      authLoading,
      currentUser: currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
      } : null,
    });
  }, [isClient, authIsInitialized, authLoading, currentUser]);

  useEffect(() => {
    if (!isClient) return;
    
    console.log('[ProfileFlowTester] Profile state:', {
      isLoading: profileLoading,
      error: error ? 'Error: ' + (typeof error === 'string' ? error : JSON.stringify(error)) : null,
      profile: profile ? 'Exists' : 'Not loaded',
    });
  }, [isClient, profileLoading, error, profile]);

  // Add a test result
  const addResult = (message: string) => {
    setTestResults(prev => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev
    ]);
  };

  // Clear test results
  const clearResults = () => {
    setTestResults([]);
  };

  // Test profile existence
  const testProfileExists = async () => {
    if (!currentUser) {
      addResult('❌ No user is signed in');
      return;
    }

    setIsRunningTest(true);
    try {
      addResult('🔍 Checking if profile exists...');
      const exists = await checkUserProfileExists(currentUser.uid);
      
      if (exists) {
        addResult('✅ Profile exists in Firestore');
        const profile = await getCurrentUserProfile(currentUser.uid);
        addResult(`📋 Profile data: ${JSON.stringify(profile, null, 2)}`);
      } else {
        addResult('❌ Profile does not exist in Firestore');
      }
    } catch (error: unknown) {
      console.error('Error testing profile existence:', error);
      if (error instanceof Error) {
        addResult(`❌ Error: ${error.message}`);
      } else {
        addResult(`❌ Error: ${String(error)}`);
      }
    } finally {
      setIsRunningTest(false);
    }
  };

  // Test profile loading
  const testProfileLoading = async () => {
    if (!currentUser) {
      addResult('❌ No user is signed in');
      return;
    }

    setIsRunningTest(true);
    try {
      addResult('🔄 Testing profile loading...');
      
      // Log the current state
      await logProfileFlowState(currentUser.uid);
      
      if (profileLoading) {
        addResult('⏳ Profile is currently loading');
      } else if (error) {
        addResult(`❌ Error loading profile: ${typeof error === 'object' && error !== null ? 
          (error as Error).message || JSON.stringify(error) : 
          String(error)}`);
      } else if (profile) {
        addResult('✅ Profile loaded successfully');
        addResult(`📋 Profile data from hook: ${JSON.stringify(profile, null, 2)}`);
      } else {
        addResult('❓ Profile is not loading, but no data or error is present');
      }
    } catch (error: unknown) {
      console.error('Error testing profile loading:', error);
      if (error instanceof Error) {
        addResult(`❌ Error: ${error.message}`);
      } else {
        addResult(`❌ Error: ${String(error)}`);
      }
    } finally {
      setIsRunningTest(false);
    }
  };

  // Test profile update
  const testProfileUpdate = async () => {
    if (!currentUser) {
      addResult('❌ No user is signed in');
      return;
    }

    setIsRunningTest(true);
    try {
      addResult('🔄 Testing profile update...');
      
      // Generate a random number to make the update unique
      const randomNum = Math.floor(Math.random() * 1000);
      
      // Update the profile with a test value
      const updateResult = await updateProfile({
        name: `Test User ${randomNum}`,
      });
      
      if (updateResult) {
        addResult(`✅ Profile updated successfully with name: Test User ${randomNum}`);
      } else {
        addResult('❌ Profile update failed');
      }
      
      // Check if the update was saved to Firestore
      const updatedProfile = await getCurrentUserProfile(currentUser.uid);
      
      if (updatedProfile && updatedProfile.name === `Test User ${randomNum}`) {
        addResult('✅ Update verified in Firestore');
      } else {
        addResult('❌ Update not verified in Firestore');
        addResult(`📋 Current Firestore data: ${JSON.stringify(updatedProfile, null, 2)}`);
      }
    } catch (error: unknown) {
      console.error('Error testing profile update:', error);
      if (error instanceof Error) {
        addResult(`❌ Error: ${error.message}`);
      } else {
        addResult(`❌ Error: ${String(error)}`);
      }
    } finally {
      setIsRunningTest(false);
    }
  };

  // Test hydration consistency
  const testHydrationConsistency = () => {
    addResult('🔄 Testing hydration consistency...');
    
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      addResult('⚠️ Running on server, cannot test hydration');
      return;
    }
    
    // Check for any hydration warnings in the console
    addResult('✅ Client-side rendering confirmed');
    
    // Add a note about checking the console
    addResult('ℹ️ Check browser console for any hydration warnings');
    
    // Force a re-render to test hydration
    setTestResults(prev => [
      `[${new Date().toLocaleTimeString()}] 🔄 Forcing re-render to test hydration...`,
      ...prev
    ]);
  };

  // If not client-side yet, render a minimal version to avoid hydration issues
  if (!isClient) {
    return (
      <Container maxW="container.lg" py={8}>
        <Heading size="lg" mb={4}>Profile Flow Tester</Heading>
        <Text>Loading tester...</Text>
      </Container>
    );
  }

  // If auth is not initialized yet, show loading state
  if (!authIsInitialized || authLoading) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Profile Flow Tester</Heading>
          <Box p={8} textAlign="center">
            <Spinner size="xl" mb={4} />
            <Text>Initializing authentication...</Text>
          </Box>
        </VStack>
      </Container>
    );
  }

  // If not signed in, show sign-in prompt
  if (!currentUser) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Profile Flow Tester</Heading>
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Not signed in</AlertTitle>
              <AlertDescription>
                Please sign in to test the profile flow.
              </AlertDescription>
            </Box>
          </Alert>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Profile Flow Tester</Heading>
        
        <Box p={4} borderWidth={1} borderRadius="md">
          <Heading size="md" mb={4}>Current State</Heading>
          <List spacing={2}>
            <ListItem>
              <Text>
                <strong>Auth Initialized:</strong> {authIsInitialized ? '✅' : '❌'}
              </Text>
            </ListItem>
            <ListItem>
              <Text>
                <strong>User Signed In:</strong> {currentUser ? '✅' : '❌'}
              </Text>
            </ListItem>
            {currentUser && (
              <>
                <ListItem>
                  <Text>
                    <strong>User ID:</strong> <Code>{currentUser.uid}</Code>
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    <strong>User Email:</strong> <Code>{currentUser.email}</Code>
                  </Text>
                </ListItem>
              </>
            )}
            <ListItem>
              <Text>
                <strong>Profile Loading:</strong> {profileLoading ? '⏳' : '✅'}
              </Text>
            </ListItem>
            <ListItem>
              <Text>
                <strong>Profile Error:</strong> {error ? '❌' : '✅'}
              </Text>
            </ListItem>
            <ListItem>
              <Text>
                <strong>Profile Loaded:</strong> {profile ? '✅' : '❌'}
              </Text>
            </ListItem>
          </List>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>Test Actions</Heading>
          <HStack spacing={4} wrap="wrap">
            <Button 
              colorScheme="blue" 
              onClick={testProfileExists}
              isLoading={isRunningTest}
              loadingText="Testing..."
              isDisabled={!currentUser}
            >
              Test Profile Exists
            </Button>
            <Button 
              colorScheme="green" 
              onClick={testProfileLoading}
              isLoading={isRunningTest}
              loadingText="Testing..."
              isDisabled={!currentUser}
            >
              Test Profile Loading
            </Button>
            <Button 
              colorScheme="purple" 
              onClick={testProfileUpdate}
              isLoading={isRunningTest || profileLoading}
              loadingText="Testing..."
              isDisabled={!currentUser || !profile}
            >
              Test Profile Update
            </Button>
            <Button 
              colorScheme="orange" 
              onClick={testHydrationConsistency}
            >
              Test Hydration
            </Button>
            <Button 
              variant="outline" 
              onClick={clearResults}
            >
              Clear Results
            </Button>
          </HStack>
        </Box>
        
        <Divider />
        
        <Box>
          <Flex justify="space-between" align="center" mb={2}>
            <Heading size="md">Test Results</Heading>
            <Text fontSize="sm" color="gray.500">
              {testResults.length} results
            </Text>
          </Flex>
          <Box 
            p={4} 
            borderWidth={1} 
            borderRadius="md" 
            bg="gray.50" 
            maxH="400px" 
            overflowY="auto"
          >
            {testResults.length > 0 ? (
              <List spacing={1}>
                {testResults.map((result, index) => (
                  <ListItem key={index} fontFamily="mono" fontSize="sm" whiteSpace="pre-wrap">
                    {result}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Text color="gray.500" textAlign="center">No test results yet</Text>
            )}
          </Box>
        </Box>
      </VStack>
    </Container>
  );
};

export default ProfileFlowTester;
