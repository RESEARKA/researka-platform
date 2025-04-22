import { Box, Heading, Text, Button, Container } from '@chakra-ui/react';
import Layout from '../components/Layout';
import Link from 'next/link';

export default function Custom404() {
  return (
    <Layout title="Page Not Found | RESEARKA" description="The page you're looking for doesn't exist">
      <Container maxW="container.md" py={10}>
        <Box textAlign="center" py={10} px={6}>
          <Heading
            display="inline-block"
            as="h1"
            size="2xl"
            bgGradient="linear(to-r, green.400, green.600)"
            backgroundClip="text"
          >
            404
          </Heading>
          <Text fontSize="xl" mt={3} mb={6}>
            Page Not Found
          </Text>
          <Text color={'gray.600'} mb={6}>
            The page you're looking for doesn't seem to exist
          </Text>

          <Link href="/" passHref>
            <Button
              colorScheme="green"
              bgGradient="linear(to-r, green.400, green.500, green.600)"
              color="white"
              variant="solid"
            >
              Go to Home
            </Button>
          </Link>
        </Box>
      </Container>
    </Layout>
  );
}
