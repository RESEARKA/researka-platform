import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Code,
  Divider,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signup, currentUser, authIsInitialized } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Redirect if user is already logged in
  useEffect(() => {
    if (authIsInitialized && currentUser) {
      console.log('Signup page: User already logged in, redirecting to profile...');
      router.replace('/profile');
    }
  }, [authIsInitialized, currentUser, router]);

  const validateForm = () => {
    setError(null);
    setDetailedError(null);

    // Check for empty fields
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Check password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setError(null);
    setDetailedError(null);
    setSuccessMessage(null);
    
    // Validate form
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      console.log('Signup page: Starting signup process...');
      console.log('Signup page: Form data validated, calling signup function...');
      
      // Call signup function from AuthContext
      const result = await signup(email, password, name);
      
      console.log('Signup page: Signup successful, user created with ID:', result.user.uid);
      
      setSuccessMessage('Account created successfully!');
      
      toast({
        title: 'Account created.',
        description: "We've created your account. You can now complete your profile.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // The useEffect will handle redirection once currentUser is set
    } catch (err: any) {
      console.error('Signup page: Error during signup:', err);
      
      // Handle specific error cases
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
        toast({
          title: 'Account Exists',
          description: 'This email is already registered. Redirecting to login page...',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
        return;
      }
      
      // Handle other errors
      setError('Failed to create account. Please try again.');
      setDetailedError({
        code: err.code || 'unknown',
        message: err.message || 'Unknown error',
        stack: err.stack || 'No stack trace available'
      });
      
      toast({
        title: 'Error',
        description: err.message || 'Failed to create account',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Sign Up | Researka">
      <Box py={10} bg="gray.50" minH="calc(100vh - 64px)">
        <Container maxW="md">
          <Box p={8} bg="white" boxShadow="md" borderRadius="md">
            <Heading as="h1" size="xl" textAlign="center" mb={6}>
              Create an Account
            </Heading>
            
            {error && (
              <Alert status="error" mb={4} borderRadius="md">
                <AlertIcon />
                <AlertTitle mr={2}>Error!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                <CloseButton 
                  position="absolute" 
                  right="8px" 
                  top="8px" 
                  onClick={() => setError(null)}
                />
              </Alert>
            )}
            
            {successMessage && (
              <Alert status="success" mb={4} borderRadius="md">
                <AlertIcon />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl id="name" isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </FormControl>
                
                <FormControl id="email" isRequired>
                  <FormLabel>Email address</FormLabel>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </FormControl>
                
                <FormControl id="password" isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </FormControl>
                
                <FormControl id="confirmPassword" isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                  />
                </FormControl>
                
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  fontSize="md"
                  isLoading={isLoading}
                  loadingText="Creating Account..."
                  w="100%"
                  mt={4}
                >
                  Sign Up
                </Button>
              </Stack>
            </form>
            
            <Text mt={6} textAlign="center">
              Already have an account?{' '}
              <Link href="/login" passHref>
                <Text as="span" color="blue.500" cursor="pointer">
                  Log In
                </Text>
              </Link>
            </Text>
          </Box>
          
          {/* Detailed error information for debugging */}
          {detailedError && (
            <Box mt={8} p={4} bg="white" boxShadow="md" borderRadius="md">
              <Heading as="h3" size="md" mb={2}>
                Detailed Error Information (Debug Only)
              </Heading>
              <Divider mb={4} />
              <Text fontWeight="bold">Error Code:</Text>
              <Code p={2} mb={2} display="block">
                {detailedError.code}
              </Code>
              <Text fontWeight="bold">Error Message:</Text>
              <Code p={2} mb={2} display="block">
                {detailedError.message}
              </Code>
              <Text fontWeight="bold">Stack Trace:</Text>
              <Code p={2} mb={2} display="block" whiteSpace="pre-wrap">
                {detailedError.stack}
              </Code>
            </Box>
          )}
        </Container>
      </Box>
    </Layout>
  );
};

export default SignupPage;
