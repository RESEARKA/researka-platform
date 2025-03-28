import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Link,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  useToast
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import useClient from '../hooks/useClient';
import { createLogger, LogCategory } from '../utils/logger';

// Create a logger instance for this component
const logger = createLogger('SignupModal');

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, redirectPath = '/profile' }) => {
  const isClient = useClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const router = useRouter();
  const { signup, updateUserData } = useAuth();

  const validateForm = () => {
    setError('');

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      logger.info('Starting signup process', {
        category: LogCategory.AUTH
      });
      
      // Call signup function from AuthContext with empty name (will be set in profile)
      const result = await signup(email, password, '');
      
      if (!result || !result.user || !result.user.uid) {
        throw new Error('Failed to create user account');
      }
      
      logger.info('Signup successful', {
        context: { userId: result.user.uid },
        category: LogCategory.AUTH
      });
      
      // Create default profile
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
      }, result.user.uid);
      
      logger.info('Default profile created', {
        context: { userId: result.user.uid },
        category: LogCategory.DATA
      });
      
      toast({
        title: 'Account created.',
        description: "We've created your account. You can now complete your profile.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
      
      // Use Next.js router for redirection
      if (isClient) {
        logger.debug('Redirecting to profile page', {
          context: { redirectPath },
          category: LogCategory.UI
        });
      }
      router.push(redirectPath);
    } catch (err: any) {
      logger.error('Signup error', {
        context: { error: err instanceof Error ? err.message : String(err) },
        category: LogCategory.AUTH
      });
      
      // Handle specific Firebase auth errors
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use. Please use a different email or login.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchToLogin = () => {
    onClose();
    // We'll handle opening the login modal in the parent component
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="white">
        <ModalHeader color="gray.800">Create an Account</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSignup}>
            <VStack spacing={4} align="stretch" mb={4}>
              <FormControl isRequired>
                <FormLabel htmlFor="email" color="gray.700">Email address</FormLabel>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="Enter your academic email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="white"
                  color="gray.800"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel htmlFor="password" color="gray.700">Password</FormLabel>
                <InputGroup>
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
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
              
              <FormControl isRequired>
                <FormLabel htmlFor="confirmPassword" color="gray.700">Confirm Password</FormLabel>
                <Input 
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"} 
                  placeholder="Confirm your password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  bg="white"
                  color="gray.800"
                />
              </FormControl>
              
              <Button 
                type="submit" 
                colorScheme="blue" 
                width="full"
                isLoading={isLoading}
                loadingText="Signing up..."
                mt={2}
              >
                Sign Up
              </Button>
            </VStack>
          </form>
          
          <Text fontSize="sm" textAlign="center" mb={4}>
            Already have an account?{' '}
            <Link 
              color="blue.500" 
              onClick={switchToLogin}
              cursor="pointer"
            >
              Log In
            </Link>
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SignupModal;
