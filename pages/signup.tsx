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
import useClient from '../hooks/useClient';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signup, currentUser, authIsInitialized, getUserProfile, updateUserData } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const isClient = useClient();

  // Redirect if user is already logged in - only on client side
  useEffect(() => {
    if (!isClient) return; // Skip on server-side
    
    if (authIsInitialized && currentUser) {
      console.log('Signup page: User already logged in, redirecting to profile...');
      router.replace('/profile');
    }
  }, [isClient, authIsInitialized, currentUser, router]);

  const validateForm = () => {
    setError(null);
    setDetailedError(null);

    // Check for empty fields
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }

    // Validate academic email format
    const academicEmailRegex = /^[^\s@]+@(([^\s@]+\.edu)|(([^\s@]+\.ac\.[a-z]{2})|([^\s@]+\.ac)))$/i;
    if (!academicEmailRegex.test(email)) {
      setError('Please enter a valid academic email address (.edu, .ac.xx, or .ac domain)');
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
    
    // Only proceed on client-side
    if (!isClient) return;
    
    // Reset messages
    setError(null);
    setDetailedError(null);
    setSuccessMessage(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Signup page: Starting signup process...');
      console.log('Signup page: Form data validated, calling signup function...');
      
      // Call signup function from AuthContext with empty name (will be set in profile)
      const result = await signup(email, password, '');
      
      console.log('Signup page: Signup successful, user created with ID:', result.user.uid);
      
      // Create default profile and ensure it's completed before proceeding
      const createDefaultProfileIfNeeded = async () => {
        if (!result.user || !result.user.uid) {
          console.error('Signup page: No user ID available for profile creation');
          return false;
        }
        
        try {
          // Check if user document exists in Firestore
          const userProfile = await getUserProfile();
          
          if (!userProfile) {
            console.log('Signup page: Creating default user profile...');
            // Create default profile with hasChangedName and hasChangedInstitution fields
            await updateUserData({
              name: '',
              email: email,
              role: 'Researcher',
              institution: '',
              department: '',
              position: '',
              researchInterests: [],
              articles: 0,
              reviews: 0,
              reputation: 0,
              profileComplete: false,
              hasChangedName: false,
              hasChangedInstitution: false,
              createdAt: new Date().toISOString()
            });
            console.log('Signup page: Default profile created successfully');
            return true;
          }
          
          console.log('Signup page: User profile already exists:', userProfile);
          return true;
        } catch (error) {
          console.error('Signup page: Error creating default profile:', error);
          return false;
        }
      };
      
      // Wait for profile creation to complete before showing success message
      const profileCreated = await createDefaultProfileIfNeeded();
      
      if (profileCreated) {
        setSuccessMessage('Account created successfully!');
        
        toast({
          title: 'Account created.',
          description: "We've created your account. You can now complete your profile.",
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Poll until auth is initialized and currentUser is available
      const waitForAuth = () => 
        new Promise<void>((resolve) => {
          console.log('Signup page: Starting waitForAuth polling...');
          let attempts = 0;
          const maxAttempts = 20; // Increased from 10 to 20 for more reliability
          
          const interval = setInterval(() => {
            attempts++;
            console.log(`Signup page: Checking auth state (attempt ${attempts}/${maxAttempts})...`, { 
              authIsInitialized, 
              currentUser: !!currentUser,
              uid: currentUser?.uid 
            });
            
            if (authIsInitialized && currentUser) {
              console.log('Signup page: Auth state initialized and user available, proceeding with redirect');
              clearInterval(interval);
              resolve();
            }
            
            // Failsafe timeout after max attempts
            if (attempts >= maxAttempts) {
              console.log('Signup page: Failsafe timeout reached, proceeding with redirect anyway');
              clearInterval(interval);
              resolve();
            }
          }, 300); // Increased from 200ms to 300ms for more reliability
        });
      
      await waitForAuth();
      
      // Add a longer delay before redirecting to ensure all state updates have propagated
      await new Promise(resolve => setTimeout(resolve, 1000)); // Increased from 500ms to 1000ms for more reliability
      
      console.log('Signup page: Redirecting to profile page...');
      try {
        // First try to navigate using router.push
        await router.push({
          pathname: '/profile',
          query: { new: 'true' } // Add a query parameter to indicate this is a new signup
        });
        
        // If router.push doesn't work, try a direct window location change as fallback
        // This is a more forceful approach but ensures navigation happens
        setTimeout(() => {
          console.log('Signup page: Checking if redirect happened, using fallback if needed');
          if (window.location.pathname !== '/profile') {
            console.log('Signup page: Using fallback redirect method');
            window.location.href = '/profile?new=true';
          }
        }, 1500);
      } catch (navError) {
        console.error('Signup page: Navigation error:', navError);
        // Fallback to direct location change if router.push fails
        window.location.href = '/profile?new=true';
      }
    } catch (err: any) {
      console.error('Signup page: Error during signup:', err);
      
      // Handle specific error cases
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
        toast({
          title: 'Account Exists',
          description: 'This email is already registered. Please use the login option.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        
        // Open login modal instead of redirecting to login page
        setTimeout(() => {
          router.back(); // Go back to previous page
        }, 1500);
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
                <FormControl id="email" isRequired>
                  <FormLabel>Email address</FormLabel>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your academic email"
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
