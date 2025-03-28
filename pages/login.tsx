import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Link as ChakraLink,
  useToast,
  InputGroup,
  InputRightElement,
  Divider,
  HStack,
  useColorModeValue,
  Alert,
  AlertIcon,
  Flex
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import { FaEthereum } from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import useClient from '../hooks/useClient';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const router = useRouter();
  const { login, currentUser, authIsInitialized } = useAuth();
  
  // Use our dedicated hook to check if we're on the client
  const isClient = useClient();
  
  // Get the redirect URL from query parameters or default to home
  const { redirect } = router.query;
  const redirectPath = typeof redirect === 'string' ? redirect : '/';
  
  // Handle redirection when user is already logged in
  useEffect(() => {
    if (authIsInitialized && currentUser) {
      console.log('Login page: User already logged in, redirecting...');
      if (redirectPath === '/') {
        router.replace('/profile');
      } else {
        router.replace(redirectPath);
      }
    }
  }, [authIsInitialized, currentUser, redirectPath, router]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Login page: Starting login process...');
      
      // Authenticate with Firebase
      await login(email, password);
      
      console.log('Login page: Login successful');
      
      toast({
        title: 'Login Successful',
        description: 'Welcome to Researka!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // The useEffect will handle redirection once currentUser is set
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific Firebase auth errors
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError('Failed to login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleWalletLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Simulate wallet connection and login
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set login state in localStorage for wallet users
      if (isClient) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loginMethod', 'wallet');
        
        // Check if profile is complete
        const hasCompletedProfile = Math.random() > 0.5;
        
        if (hasCompletedProfile) {
          if (isClient) {
            localStorage.setItem('profileComplete', 'true');
          }
          toast({
            title: 'Login successful',
            description: 'Welcome back to DecentraJournal!',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          
          router.push(redirectPath);
        } else {
          // Get existing profile or create new one
          const existingProfile = isClient ? localStorage.getItem('userProfile') : null;
          
          if (!existingProfile) {
            if (isClient) {
              localStorage.setItem('profileComplete', 'false');
              localStorage.setItem('userProfile', JSON.stringify({
                displayName: '',
                bio: '',
                interests: [],
                walletAddress: '0x1234...5678',
                createdAt: new Date().toISOString()
              }));
            }
          }
          
          toast({
            title: 'Login successful',
            description: 'Please complete your profile to continue',
            status: 'info',
            duration: 5000,
            isClosable: true,
          });
          
          router.push('/profile');
        }
      }
    } catch (error) {
      console.error('Wallet login error:', error);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Layout title="Login | Researka">
      <Box py={10} bg="gray.50" minH="calc(100vh - 64px)">
        <Container maxW="md">
          <Box 
            bg={bgColor} 
            p={8} 
            borderRadius="lg" 
            boxShadow="md"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <VStack spacing={6} align="stretch">
              <Heading as="h1" size="xl" textAlign="center">
                Login to Researka
              </Heading>
              
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              
              <Button 
                leftIcon={<FaEthereum />} 
                colorScheme="green" 
                size="lg"
                onClick={handleWalletLogin}
                isLoading={isLoading && !email}
                loadingText="Connecting..."
              >
                Connect Wallet
              </Button>
              
              <Flex align="center" my={2}>
                <Divider flex="1" />
                <Text px={3} color="gray.500" fontSize="sm">OR</Text>
                <Divider flex="1" />
              </Flex>
              
              <form onSubmit={handleLogin}>
                <VStack spacing={4}>
                  <FormControl isRequired isInvalid={!!error && !email}>
                    <FormLabel>Email Address</FormLabel>
                    <InputGroup>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </InputGroup>
                  </FormControl>
                  
                  <FormControl isRequired isInvalid={!!error && !password}>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <InputRightElement width="3rem">
                        <Button
                          h="1.5rem"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    width="full"
                    isLoading={isLoading && !!email}
                    loadingText="Logging in..."
                  >
                    Login with Email
                  </Button>
                </VStack>
              </form>
              
              <Flex justify="space-between" fontSize="sm" mt={2}>
                <Link href="/forgot-password" passHref>
                  <ChakraLink color="blue.500">
                    Forgot Password?
                  </ChakraLink>
                </Link>
                <Link href="/signup" passHref>
                  <ChakraLink color="blue.500">
                    Don't have an account? Sign Up
                  </ChakraLink>
                </Link>
              </Flex>
            </VStack>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
};

export default LoginPage;
