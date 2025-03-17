"use client";

import React, { useEffect } from 'react';
import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import Layout from '../components/Layout';

interface User {
  id: string;
  username?: string;
  name?: string;
  email: string;
}

const TestLogin = () => {
  const simulateLogin = () => {
    // Create a mock user
    const mockUser: User = {
      id: '123',
      username: 'TestUser',
      name: 'Test User',
      email: 'test@example.com'
    };
    
    // Store in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-token-123');
    
    // Reload the page to see the changes
    window.location.reload();
  };
  
  const checkLoginStatus = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userJson = localStorage.getItem('user');
    
    return {
      isLoggedIn,
      user: userJson ? JSON.parse(userJson) as User : null
    };
  };
  
  const clearLogin = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Reload the page to see the changes
    window.location.reload();
  };
  
  const [loginStatus, setLoginStatus] = React.useState({ isLoggedIn: false, user: null as User | null });
  
  useEffect(() => {
    setLoginStatus(checkLoginStatus());
  }, []);
  
  return (
    <Layout title="Test Login | Researka" description="Test login functionality" activePage="test">
      <Container maxW="container.md" py={10}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl">Test Login Functionality</Heading>
          
          <Box p={6} borderWidth="1px" borderRadius="lg" bg="white">
            <Heading as="h2" size="md" mb={4}>Current Status</Heading>
            <Text mb={2}>Login Status: {loginStatus.isLoggedIn ? 'Logged In' : 'Logged Out'}</Text>
            {loginStatus.user && (
              <Text mb={2}>Username: {loginStatus.user.username || loginStatus.user.name}</Text>
            )}
            
            <Box mt={6}>
              {!loginStatus.isLoggedIn ? (
                <Button colorScheme="blue" onClick={simulateLogin}>
                  Simulate Login
                </Button>
              ) : (
                <Button colorScheme="red" onClick={clearLogin}>
                  Clear Login Data
                </Button>
              )}
            </Box>
          </Box>
          
          <Box p={6} borderWidth="1px" borderRadius="lg" bg="white">
            <Heading as="h2" size="md" mb={4}>Instructions</Heading>
            <Text mb={2}>1. Click "Simulate Login" to set login data in localStorage</Text>
            <Text mb={2}>2. Check if your username appears in the navigation bar</Text>
            <Text mb={2}>3. Try clicking on your username to see if a dropdown with logout appears</Text>
            <Text mb={2}>4. Try clicking logout to see if it properly logs you out</Text>
            <Text mb={2}>5. You can also click "Clear Login Data" to manually clear the login state</Text>
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
};

export default TestLogin;
