import { Box, Spinner, Center, Heading, Text } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';

// Import the ArticlesPageClient component dynamically with SSR disabled
const ArticlesPageClient = dynamic(
  () => import('../components/articles/ArticlesPageClient'),
  { 
    ssr: false,
    loading: () => (
      <Center h="70vh">
        <Box textAlign="center">
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" mb={4} />
          <Heading size="md" mb={2}>Loading Articles</Heading>
          <Text fontSize="sm" color="gray.600">Please wait while we fetch the articles...</Text>
        </Box>
      </Center>
    )
  }
);

export default function ArticlesPage() {
  return (
    <Layout 
      title="Articles | Researka" 
      description="Explore scientific articles shared by researchers worldwide"
      activePage="articles"
    >
      <ArticlesPageClient />
    </Layout>
  );
}
