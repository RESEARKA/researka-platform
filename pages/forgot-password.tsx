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
  useColorModeValue,
  Alert,
  AlertIcon,
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FiMail } from 'react-icons/fi';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const toast = useToast();
  const { resetPassword } = useAuth();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Send password reset email
      await resetPassword(email);
      
      setSuccess(true);
      toast({
        title: 'Reset email sent',
        description: 'Check your email for instructions to reset your password',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      // Handle specific Firebase auth errors
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout title="Forgot Password | Researka">
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
                Reset Password
              </Heading>
              
              <Text color="gray.600" textAlign="center">
                Enter your email address and we'll send you instructions to reset your password
              </Text>
              
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  Reset email sent! Check your inbox for instructions.
                </Alert>
              )}
              
              <form onSubmit={handleResetPassword}>
                <VStack spacing={4}>
                  <FormControl isRequired isInvalid={!!error && !email}>
                    <FormLabel>Email Address</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FiMail color="gray.300" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </InputGroup>
                    <FormErrorMessage>Please enter a valid email address</FormErrorMessage>
                  </FormControl>
                  
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    width="full"
                    mt={4}
                    isLoading={isLoading}
                    loadingText="Sending..."
                  >
                    Send Reset Link
                  </Button>
                </VStack>
              </form>
              
              <Text textAlign="center" mt={4}>
                Remember your password?{' '}
                <Link href="/login" passHref>
                  <ChakraLink color="blue.500">
                    Log In
                  </ChakraLink>
                </Link>
              </Text>
              
              <Text textAlign="center">
                Don't have an account?{' '}
                <Link href="/signup" passHref>
                  <ChakraLink color="blue.500">
                    Sign Up
                  </ChakraLink>
                </Link>
              </Text>
            </VStack>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
};

export default ForgotPasswordPage;
