import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Heading,
  Text,
  useToast,
  Center,
  Spinner,
} from '@chakra-ui/react';
import Layout from '../../../components/Layout';

/**
 * Redirect component for the old review page
 * This redirects users from /articles/[id]/review to /review/[id]
 */
const SubmitReviewPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  
  useEffect(() => {
    if (!router.isReady || !id) return;
    
    // Log the redirect
    console.log(`Redirecting from old review page to new tabbed interface: /review/${id}`);
    
    // Show toast notification about the redirect
    toast({
      title: 'Redirecting',
      description: 'Taking you to our new and improved review interface',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    // Redirect to the new review page with a short delay to allow the toast to be seen
    const redirectTimer = setTimeout(() => {
      router.replace(`/review/${id}`);
    }, 1000);
    
    return () => clearTimeout(redirectTimer);
  }, [id, router, toast]);
  
  return (
    <Layout title="Redirecting | Researka" description="Redirecting to the new review interface">
      <Container maxW="container.lg" py={8}>
        <Center h="50vh" flexDirection="column">
          <Spinner size="xl" color="blue.500" mb={4} />
          <Heading as="h2" size="md" mb={2}>Redirecting</Heading>
          <Text>Taking you to our new and improved review interface...</Text>
        </Center>
      </Container>
    </Layout>
  );
};

export default SubmitReviewPage;
