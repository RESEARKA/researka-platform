import { useState } from 'react';
import { useRouter } from 'next/router';
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
  Stack,
  Text,
  Checkbox,
  Flex,
  Link as ChakraLink,
  Alert,
  AlertIcon,
  Box,
  Image,
  Center,
  Heading,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useAuth, LoginCredentials } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

export function LoginModal({ isOpen, onClose, onRegisterClick }: LoginModalProps) {
  const router = useRouter();
  const { login, error: authError, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials & { rememberMe: boolean }>({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    clearError();
    setIsLoading(true);

    try {
      const { username, password, rememberMe } = formData;
      
      if (!username || !password) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      await login({ username, password });
      setFormData({
        username: '',
        password: '',
        rememberMe: false
      });
      onClose();
      router.push('/profile');
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader p={0}>
          <Center py={6} bg="blue.500" borderTopRadius="md">
            <Image src="/logo.png" alt="Researka Logo" height="50px" />
          </Center>
        </ModalHeader>
        <ModalCloseButton color="white" top={6} />
        
        <ModalBody py={6}>
          <Heading size="lg" mb={6} textAlign="center">Sign In</Heading>
          
          {(error || authError) && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {error || authError}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="username" isRequired>
                <FormLabel>Username</FormLabel>
                <Input 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                />
              </FormControl>
              
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <Input 
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
              </FormControl>
              
              <Flex justify="space-between" align="center">
                <Checkbox 
                  name="rememberMe"
                  isChecked={formData.rememberMe}
                  onChange={handleChange}
                >
                  Remember me
                </Checkbox>
                
                <ChakraLink as={Link} href="/forgot-password" color="blue.500" fontSize="sm">
                  Forgot password?
                </ChakraLink>
              </Flex>
              
              <Button 
                type="submit" 
                colorScheme="blue" 
                size="lg" 
                isLoading={isLoading}
                loadingText="Signing in..."
              >
                Sign In
              </Button>
              
              <Text align="center" mt={2}>
                Don't have an account?{' '}
                <ChakraLink color="blue.500" onClick={onRegisterClick} cursor="pointer">
                  Sign up
                </ChakraLink>
              </Text>
            </Stack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
