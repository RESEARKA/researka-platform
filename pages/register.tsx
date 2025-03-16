import { useState } from 'react';
import { useRouter } from 'next/router';
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
  Flex,
  Link as ChakraLink,
  Alert,
  AlertIcon,
  useColorModeValue,
  FormErrorMessage,
  Image,
  Center,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useAuth, RegistrationData } from '../contexts/AuthContext';

export default function Register() {
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
      router.push('/');
    } catch (err: any) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack spacing="8">
        <Stack spacing="6" align="center">
          <Center>
            <Link href="/" passHref>
              <ChakraLink>
                <Image 
                  src="/images/researka-logo.svg" 
                  alt="Researka Logo" 
                  width="200px" 
                  height="60px"
                  mb={4}
                />
              </ChakraLink>
            </Link>
          </Center>
          <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
            <Heading size={{ base: 'md', md: 'lg' }}>Create your account</Heading>
            <Text color="gray.600">
              Already have an account?{' '}
              <Link href="/login" passHref>
                <ChakraLink color="green.500">Sign in</ChakraLink>
              </Link>
            </Text>
          </Stack>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          {authError && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {authError}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Stack spacing="6">
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
              </Stack>
              
              <Button
                colorScheme="green"
                type="submit"
                isLoading={isLoading}
                loadingText="Creating account"
              >
                Create Account
              </Button>
            </Stack>
          </form>
          <Box mt={6} textAlign="center">
            <Text fontSize="sm" color="gray.600">
              By creating an account, you agree to our{' '}
              <Link href="/legal" passHref>
                <ChakraLink color="green.500">Terms of Service</ChakraLink>
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" passHref>
                <ChakraLink color="green.500">Privacy Policy</ChakraLink>
              </Link>
            </Text>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
