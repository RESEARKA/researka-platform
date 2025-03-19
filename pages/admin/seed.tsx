import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Button,
  Text,
  useToast,
  Alert,
  AlertIcon,
  Code,
  Divider,
} from '@chakra-ui/react';
import Layout from '../../components/Layout';
import { mockUsers } from '../../data/mockUsers';

const SeedPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleSeedUsers = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/seed-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ secret: 'researka-secret-key' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to seed users');
      }

      setResult(JSON.stringify(data, null, 2));
      toast({
        title: 'Success',
        description: 'Mock users seeded successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      console.error('Error seeding users:', err);
      setError(err.message || 'An error occurred');
      toast({
        title: 'Error',
        description: err.message || 'Failed to seed users',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Admin - Seed Data | Researka">
      <Box py={10} bg="gray.50" minH="calc(100vh - 64px)">
        <Container maxW="container.md">
          <VStack spacing={8} align="stretch">
            <Heading as="h1" size="xl">
              Admin - Seed Test Data
            </Heading>

            <Alert status="warning">
              <AlertIcon />
              This page is for development purposes only. It will create test users in your Firebase database.
            </Alert>

            <Box>
              <Heading as="h2" size="md" mb={4}>
                Mock Users
              </Heading>
              <Text mb={4}>
                The following mock users will be created in your Firebase Auth and Firestore database:
              </Text>
              {mockUsers.map((user, index) => (
                <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={4}>
                  <Text fontWeight="bold">{user.name}</Text>
                  <Text>Email: {user.email}</Text>
                  <Text>Password: {user.password}</Text>
                  <Text>Role: {user.role}</Text>
                  <Text>Institution: {user.institution}</Text>
                </Box>
              ))}
            </Box>

            <Button
              colorScheme="blue"
              size="lg"
              onClick={handleSeedUsers}
              isLoading={isLoading}
              loadingText="Seeding Users..."
            >
              Seed Mock Users
            </Button>

            {result && (
              <Box>
                <Heading as="h3" size="sm" mb={2}>
                  Result:
                </Heading>
                <Code p={4} borderRadius="md" whiteSpace="pre-wrap">
                  {result}
                </Code>
              </Box>
            )}

            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}
          </VStack>
        </Container>
      </Box>
    </Layout>
  );
};

export default SeedPage;
