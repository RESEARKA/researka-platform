import React, { useEffect } from 'react';
import {
  Container,
  Spinner,
  Center,
  Text,
} from '@chakra-ui/react';
import { createLogger, LogCategory } from '../utils/logger';
import useAppToast from '../hooks/useAppToast';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

const logger = createLogger('ProfileRedirect');

function ProfilePage() {
  const router = useRouter();
  const toast = useAppToast();
  
  useEffect(() => {
    logger.info('Redirecting from old profile page to simplified profile', { 
      category: LogCategory.LIFECYCLE 
    });
    
    toast({
      id: 'profile-redirect',
      title: "Updated Profile System",
      description: "Redirecting to our new simplified profile page...",
      status: "info",
      duration: 3000,
    });
    
    const redirectTimer = setTimeout(() => {
      router.replace('/simple-profile');
    }, 1000);
    
    return () => clearTimeout(redirectTimer);
  }, []);

  return (
    <Layout>
      <Container maxW="container.lg" py={10}>
        <Center height="50vh" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4} fontSize="lg">
            Redirecting to simplified profile page...
          </Text>
        </Center>
      </Container>
    </Layout>
  );
}

export default ProfilePage;
