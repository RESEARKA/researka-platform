import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, Button, Text, VStack, Heading, Code, Container, Divider } from '@chakra-ui/react';

export default function AuthTest() {
  const { 
    currentUser, 
    signInAnonymousUser, 
    isAnonymousUser, 
    updateUserData, 
    getUserProfile,
    testFirestoreWrite 
  } = useAuth();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [testResults, setTestResults] = useState<Array<{message: string, success: boolean}>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Add a test result to the list
  const addResult = (message: string, success: boolean) => {
    setTestResults(prev => [...prev, { message, success }]);
  };
  
  // Run all tests in sequence
  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Check if user is signed in
      if (currentUser) {
        addResult(`User is signed in: ${currentUser.uid}`, true);
      } else {
        addResult('No user is signed in', false);
        
        // Try to sign in anonymously
        try {
          const result = await signInAnonymousUser();
          addResult(`Anonymous sign in successful: ${result.user.uid}`, true);
        } catch (error: any) {
          addResult(`Anonymous sign in failed: ${error.message}`, false);
        }
      }
      
      // Test 2: Check if user is anonymous
      const anonymous = isAnonymousUser();
      addResult(`User is anonymous: ${anonymous}`, true);
      
      // Test 3: Test Firestore write to public_test
      try {
        const writeResult = await testFirestoreWrite();
        addResult(`Firestore write test: ${writeResult ? 'Success' : 'Failed'}`, writeResult);
      } catch (error: any) {
        addResult(`Firestore write test failed: ${error.message}`, false);
      }
      
      // Test 4: Get user profile
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
        addResult('User profile retrieved successfully', true);
      } catch (error: any) {
        addResult(`Failed to get user profile: ${error.message}`, false);
      }
      
      // Test 5: Update user profile
      try {
        const testData = {
          name: 'Test User',
          email: 'test@example.com',
          updatedAt: new Date().toISOString()
        };
        
        const updateResult = await updateUserData(testData);
        addResult(`User profile update: ${updateResult ? 'Success' : 'Failed'}`, updateResult);
        
        // Refresh profile after update
        const updatedProfile = await getUserProfile();
        setUserProfile(updatedProfile);
      } catch (error: any) {
        addResult(`Failed to update user profile: ${error.message}`, false);
      }
    } catch (error: any) {
      addResult(`Unexpected error: ${error.message}`, false);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Container maxW="container.md" py={8}>
      <Heading as="h1" mb={4}>Firebase Authentication Test</Heading>
      <Text mb={4}>This page tests Firebase authentication and Firestore operations using the AuthContext.</Text>
      
      <Button 
        colorScheme="blue" 
        onClick={runAllTests} 
        isLoading={isLoading}
        mb={6}
      >
        Run All Tests
      </Button>
      
      <Box mb={6}>
        <Heading as="h2" size="md" mb={2}>Test Results</Heading>
        <VStack align="stretch" spacing={2} bg="gray.50" p={4} borderRadius="md">
          {testResults.length === 0 ? (
            <Text color="gray.500">No tests run yet</Text>
          ) : (
            testResults.map((result, index) => (
              <Box key={index} p={2} bg={result.success ? 'green.50' : 'red.50'} borderRadius="sm">
                <Text color={result.success ? 'green.600' : 'red.600'}>
                  {result.success ? '✅ ' : '❌ '} {result.message}
                </Text>
              </Box>
            ))
          )}
        </VStack>
      </Box>
      
      <Divider my={4} />
      
      <Box>
        <Heading as="h2" size="md" mb={2}>User Profile</Heading>
        {currentUser ? (
          <Box>
            <Text mb={2}><strong>User ID:</strong> {currentUser.uid}</Text>
            <Text mb={2}><strong>Anonymous:</strong> {isAnonymousUser() ? 'Yes' : 'No'}</Text>
          </Box>
        ) : (
          <Text color="orange.500">No user signed in</Text>
        )}
        
        <Heading as="h3" size="sm" mt={4} mb={2}>Profile Data</Heading>
        {userProfile ? (
          <Code p={4} borderRadius="md" whiteSpace="pre-wrap" display="block">
            {JSON.stringify(userProfile, null, 2)}
          </Code>
        ) : (
          <Text color="gray.500">No profile data available</Text>
        )}
      </Box>
    </Container>
  );
}
