import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Center,
  Spinner,
  Box,
  Text,
  Container,
} from '@chakra-ui/react';
import Layout from '../../components/Layout';
import { createLogger, LogCategory } from '../../utils/logger';
import FirebaseClientOnly from '../../components/FirebaseClientOnly';

// Create a logger instance for this component
const logger = createLogger('ArticleRedirect');

/**
 * ArticleRedirect component
 * 
 * This component redirects users from the legacy /article/[id] route
 * to the standardized /articles/[id] route to ensure a consistent
 * article viewing experience across the application.
 */
const ArticleRedirect = () => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      logger.info('Redirecting to standardized article route', {
        context: { 
          from: `/article/${id}`, 
          to: `/articles/${id}` 
        },
        category: LogCategory.SYSTEM
      });
      
      router.replace(`/articles/${id}`);
    }
  }, [id, router]);

  return (
    <Layout title="Redirecting | Researka" description="Redirecting to article" activePage="">
      <Container maxW="container.lg" py={8}>
        <Center h="50vh">
          <Box textAlign="center">
            <Spinner size="xl" mb={4} color="blue.500" />
            <Text fontSize="lg">Redirecting to updated article page...</Text>
          </Box>
        </Center>
      </Container>
    </Layout>
  );
};

// Wrap with FirebaseClientOnly to ensure Firebase is initialized before any redirects
const ArticleRedirectWithFirebase = () => (
  <FirebaseClientOnly>
    <ArticleRedirect />
  </FirebaseClientOnly>
);

export default ArticleRedirectWithFirebase;
