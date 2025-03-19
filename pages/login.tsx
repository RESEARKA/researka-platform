import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const router = useRouter();
  
  // Get the redirect URL from query parameters or default to home
  const { redirect } = router.query;
  const redirectPath = typeof redirect === 'string' ? redirect : '/';
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      // In a real app, you would call your authentication API here
      // For now, we'll just show a success message and redirect
      
      // Check if the user's profile is already complete
      const profileComplete = localStorage.getItem('profileComplete');
      
      toast({
        title: 'Login Successful',
        description: 'Welcome to Researka!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setIsLoading(false);
      
      // If the redirect path is the default '/' and the profile is complete, 
      // redirect to the profile page instead
      if (redirectPath === '/' && profileComplete === 'true') {
        router.push('/profile');
      } else if (redirectPath === '/' && profileComplete !== 'true') {
        // If profile is not complete, redirect to profile completion
        router.push('/profile');
      } else {
        // Otherwise, follow the requested redirect path
        router.push(redirectPath);
      }
    }, 1500);
  };
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <>
      <Head>
        <title>Login | Researka</title>
        <meta name="description" content="Login to your Researka account" />
      </Head>
      
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
              <Heading as="h1" size="lg" textAlign="center">Login to Researka</Heading>
              
              <form onSubmit={handleLogin}>
                <VStack spacing={4}>
                  <FormControl id="email" isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="your.email@example.com"
                    />
                  </FormControl>
                  
                  <FormControl id="password" isRequired>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Enter your password"
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
                    width="full" 
                    mt={4} 
                    isLoading={isLoading}
                    loadingText="Logging in..."
                  >
                    Login
                  </Button>
                </VStack>
              </form>
              
              <Box textAlign="center">
                <ChakraLink color="blue.500" href="/forgot-password">
                  Forgot your password?
                </ChakraLink>
              </Box>
              
              <Divider />
              
              <Box textAlign="center">
                <Text mb={2}>Don't have an account?</Text>
                <Button 
                  as={Link} 
                  href="/register" 
                  variant="outline" 
                  colorScheme="blue" 
                  width="full"
                >
                  Create an Account
                </Button>
              </Box>
            </VStack>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default LoginPage;
