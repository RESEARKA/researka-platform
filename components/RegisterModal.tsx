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
  Link as ChakraLink,
  Alert,
  AlertIcon,
  Box,
  Image,
  Center,
  Heading,
  FormErrorMessage,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useAuth, RegistrationData } from '../contexts/AuthContext';
import { useRegisterModal } from '../hooks/useRegisterModal';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export function RegisterModal({ isOpen, onClose, onLoginClick }: RegisterModalProps) {
  const router = useRouter();
  const { register, error: authError, clearError } = useAuth();
  const [formData, setFormData] = useState<RegistrationData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      await register(formData);
      onClose();
      router.push('/dashboard');
    } catch (err: any) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    onClose();
    onLoginClick();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent borderRadius="xl" p={4}>
        <ModalHeader p={0} mb={4}>
          <Center flexDirection="column">
            <Image 
              src="/images/researka-logo.svg" 
              alt="Researka Logo" 
              width="180px" 
              height="54px"
              mb={4}
            />
            <Heading size="md" textAlign="center">Create your account</Heading>
            <Text color="gray.600" fontSize="sm" mt={1}>
              Already have an account?{' '}
              <ChakraLink color="green.500" onClick={handleLoginClick}>
                Sign in
              </ChakraLink>
            </Text>
          </Center>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pt={0}>
          {authError && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {authError}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Stack spacing="5">
              <FormControl isInvalid={!!errors.username}>
                <FormLabel htmlFor="username">Username</FormLabel>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && (
                  <FormErrorMessage>{errors.username}</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!errors.email}>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!errors.password}>
                <FormLabel htmlFor="password">Password</FormLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                )}
              </FormControl>
              
              <Button
                colorScheme="green"
                type="submit"
                isLoading={isLoading}
                loadingText="Creating account"
                mt={4}
              >
                Sign up
              </Button>
            </Stack>
          </form>
          <Box mt={6} textAlign="center">
            <Text fontSize="sm" color="gray.600">
              By signing up, you agree to our{' '}
              <Link href="/legal" passHref>
                <ChakraLink color="green.500">Terms of Service</ChakraLink>
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" passHref>
                <ChakraLink color="green.500">Privacy Policy</ChakraLink>
              </Link>
            </Text>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
