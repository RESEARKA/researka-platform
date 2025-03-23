import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Flex,
  Divider,
  useToast,
  InputGroup,
  InputRightElement,
  FormErrorMessage,
  Alert,
  AlertIcon,
  Link
} from '@chakra-ui/react';
import { FaEthereum } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string; // Used for redirecting to /submit or /review pages, otherwise defaults to /profile
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, redirectPath = '/profile' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const router = useRouter();
  const { login, signInAnonymousUser, updateUserData } = useAuth();
  
  // Debug: Log the redirectPath value when component mounts or redirectPath changes
  React.useEffect(() => {
    console.log('LoginModal received redirectPath:', redirectPath);
  }, [redirectPath]);

  const handleWalletLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Use Firebase anonymous authentication for wallet users
      // In a real app, you would integrate with MetaMask and create a custom token
      
      // Sign in anonymously
      const result = await signInAnonymousUser();
      
      // Update the anonymous user's profile with wallet-specific data
      await updateUserData({
        name: 'Wallet User',
        role: 'Researcher',
        institution: 'Decentralized University',
        walletConnected: true,
        articles: 0,
        reviews: 0,
        reputation: 0,
        profileComplete: redirectPath === '/submit' || redirectPath === '/review'
      });
      
      toast({
        title: "Wallet connected",
        description: "You've been successfully logged in",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
      
      // Use Next.js router for redirection
      console.log('Redirecting to:', redirectPath);
      router.push(redirectPath);
    } catch (err) {
      console.error('Wallet login error:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Authenticate with Firebase
      await login(email, password);
      
      toast({
        title: "Login successful",
        description: "You've been logged in via email",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
      
      // Use Next.js router for redirection
      console.log('Redirecting to:', redirectPath);
      router.push(redirectPath);
    } catch (err: any) {
      console.error('Email login error:', err);
      
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="white">
        <ModalHeader color="gray.800">Login to Researka</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          <VStack spacing={4} align="stretch">
            <Button 
              leftIcon={<FaEthereum />} 
              colorScheme="green" 
              onClick={handleWalletLogin}
              width="full"
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
            
            <form onSubmit={handleEmailLogin}>
              <VStack spacing={4}>
                <FormControl isRequired isInvalid={!!error && !email}>
                  <FormLabel htmlFor="email" color="gray.700">Email Address</FormLabel>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="white"
                    color="gray.800"
                  />
                </FormControl>
                
                <FormControl isRequired isInvalid={!!error && !password}>
                  <FormLabel htmlFor="password" color="gray.700">Password</FormLabel>
                  <InputGroup>
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="********" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      bg="white"
                      color="gray.800"
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
                  isLoading={isLoading && !!email}
                  loadingText="Logging in..."
                >
                  Login with Email
                </Button>
              </VStack>
            </form>
            
            <Flex justify="space-between" fontSize="sm" mt={2}>
              <Link color="blue.500" href="/forgot-password">
                Forgot Password?
              </Link>
              <Link 
                color="blue.500" 
                onClick={() => {
                  onClose();
                  router.push('/signup');
                }}
                cursor="pointer"
              >
                Don't have an account? Sign Up
              </Link>
            </Flex>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
