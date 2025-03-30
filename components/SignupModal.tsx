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
      
      // Step 1: Create the Firebase auth account
      const result = await signup(email, password, ''); // Pass empty name initially
      
      if (!result || !result.user || !result.user.uid) {
        // This case should ideally be handled by the signup function throwing an error
        throw new Error('Signup function did not return a valid user credential.');
      }
      
      logger.info('Signup successful', {
        context: { userId: result.user.uid },
        category: LogCategory.AUTH
      });
      
      // Step 2: Create default profile in Firestore within its own try/catch
      try {
        logger.info('Attempting to create default profile', {
          context: { userId: result.user.uid },
          category: LogCategory.DATA,
        });
        await updateUserData({
          name: '', // Will be set during profile completion
          email: email,
          role: 'Researcher', // Default role
          institution: '',
          department: '',
          position: '', // Deprecated, kept for schema consistency if needed
          researchInterests: [],
          articles: 0,
          reviews: 0,
          reputation: 0,
          profileComplete: false,
          hasChangedName: false, // Initialize field
          hasChangedInstitution: false, // Initialize field
          createdAt: new Date().toISOString(),
        }, result.user.uid);
        
        logger.info('Default profile created successfully', {
          context: { userId: result.user.uid },
          category: LogCategory.DATA
        });
        
        // Show success toast only after both steps succeed
        toast({
          id: 'signup-success',
          title: 'Account created.',
          description: "We've created your account. You can now complete your profile.",
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        onClose(); // Close modal on success
        
        // Redirect after success
        if (isClient) {
          logger.debug('Redirecting to profile page after successful signup and profile creation', {
            context: { redirectPath },
            category: LogCategory.UI
          });
          router.push(redirectPath);
        }
        
      } catch (profileError: any) {
        // Handle failure during profile creation specifically
        logger.error('Failed to create default profile after signup', {
          context: { userId: result.user.uid, error: profileError instanceof Error ? profileError.message : String(profileError) },
          category: LogCategory.DATA
        });
        // Show specific error toast to the user
        toast({
          id: 'profile-creation-error',
          title: 'Profile Creation Failed',
          description: 'Your account was created, but we failed to set up your initial profile. Please try logging in or contact support.',
          status: 'error',
          duration: 9000, // Longer duration for important errors
          isClosable: true,
        });
        // Decide if we should still close the modal or keep it open
        // Keeping it open might be confusing, closing allows login attempt
        onClose(); 
        // Do NOT redirect if profile creation failed
      }

    } catch (signupError: any) {
      // Handle errors during the initial signup (Auth step)
      logger.error('Signup error during auth creation', {
        context: { error: signupError instanceof Error ? signupError.message : String(signupError), code: signupError.code },
        category: LogCategory.AUTH
      });
      
      // Handle specific Firebase auth errors
      let errorMessage = 'An unexpected error occurred during signup. Please try again.';
      if (signupError.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use. Please use a different email or login.';
      } else if (signupError.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (signupError.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } // Add more specific error codes if needed
      
      setError(errorMessage); // Display error within the modal form
      
      // Show a generic error toast as well
      toast({
        id: 'signup-auth-error',
        title: 'Signup Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      // Do not close modal or redirect on signup auth failure
      
    } finally {
      // *** Crucial: Ensure loading state is always reset ***
      logger.info('Signup process finished (finally block), resetting loading state.', { category: LogCategory.AUTH });
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
