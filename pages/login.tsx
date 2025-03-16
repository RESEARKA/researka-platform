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
  Checkbox,
  Flex,
  Link as ChakraLink,
  Alert,
  AlertIcon,
  useColorModeValue,
  Image,
  Center,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useAuth, LoginCredentials } from '../contexts/AuthContext';

export default function Login() {
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
      const credentials: LoginCredentials = {
        username: formData.username,
        password: formData.password
      };
      await login(credentials);
      router.push('/');
    } catch (err: any) {
      setError('Invalid username or password. Please try again.');
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
            <Heading size={{ base: 'md', md: 'lg' }}>Log in to your account</Heading>
            <Text color="gray.600">
              Don't have an account?{' '}
              <Link href="/register" passHref>
                <ChakraLink color="green.500">Sign up</ChakraLink>
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
          {(error || authError) && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {error || authError}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Stack spacing="6">
              <Stack spacing="5">
                <FormControl>
                  <FormLabel htmlFor="username">Username</FormLabel>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </FormControl>
              </Stack>
              <Stack spacing="6">
                <Flex justify="space-between">
                  <Checkbox
                    id="rememberMe"
                    name="rememberMe"
                    isChecked={formData.rememberMe}
                    onChange={handleChange}
                  >
                    Remember me
                  </Checkbox>
                  <Link href="/forgot-password" passHref>
                    <ChakraLink color="green.500" fontSize="sm">
                      Forgot password?
                    </ChakraLink>
                  </Link>
                </Flex>
                <Button
                  colorScheme="green"
                  type="submit"
                  isLoading={isLoading}
                  loadingText="Logging in"
                >
                  Sign in
                </Button>
              </Stack>
            </Stack>
          </form>
          <Box mt={6} textAlign="center">
            <Text fontSize="sm" color="gray.600">
              By signing in, you agree to our{' '}
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
