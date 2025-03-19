import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Code,
  Alert,
  AlertIcon,
  Divider,
} from '@chakra-ui/react';
import Layout from '../components/Layout';
import { auth, db } from '../config/firebase';
import { collection, getDocs, query, limit, addDoc } from 'firebase/firestore';
import FirebaseTest from '../components/FirebaseTest';

const FirebaseTestPage: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [firestoreStatus, setFirestoreStatus] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Test Firebase Auth
  const testAuth = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if Firebase Auth is initialized
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }
      
      // Get current auth state
      const currentUser = auth.currentUser;
      
      setAuthStatus(`Firebase Auth is properly initialized. Current user: ${currentUser ? currentUser.email : 'No user signed in'}`);
    } catch (err: any) {
      console.error('Firebase Auth test error:', err);
      setAuthStatus('Failed to test Firebase Auth');
      setError(err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test Firestore
  const testFirestore = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if Firestore is initialized
      if (!db) {
        throw new Error('Firestore is not initialized');
      }
      
      // Try to query Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(1));
      
      try {
        const querySnapshot = await getDocs(q);
        setFirestoreStatus(`Firestore is properly initialized. Found ${querySnapshot.size} users.`);
      } catch (queryErr: any) {
        setFirestoreStatus(`Firestore is initialized but query failed: ${queryErr.message}`);
      }
    } catch (err: any) {
      console.error('Firestore test error:', err);
      setFirestoreStatus('Failed to test Firestore');
      setError(err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Run tests on page load
  useEffect(() => {
    testAuth();
    testFirestore();
  }, []);

  return (
    <Layout title="Firebase Test | Researka">
      <Box py={10} bg="gray.50" minH="calc(100vh - 64px)">
        <Container maxW="container.md">
          <VStack spacing={8} align="stretch">
            <Heading as="h1" size="xl">
              Firebase Configuration Test
            </Heading>
            
            <Text>
              This page tests if Firebase is properly configured and initialized in the application.
            </Text>
            
            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}
            
            <Box p={4} borderWidth="1px" borderRadius="md">
              <Heading as="h2" size="md" mb={4}>
                Firebase Auth Status
              </Heading>
              <Text>{authStatus}</Text>
              <Button 
                mt={4} 
                colorScheme="blue" 
                onClick={testAuth}
                isLoading={isLoading}
              >
                Test Auth Again
              </Button>
            </Box>
            
            <Box p={4} borderWidth="1px" borderRadius="md">
              <Heading as="h2" size="md" mb={4}>
                Firestore Status
              </Heading>
              <Text>{firestoreStatus}</Text>
              <Button 
                mt={4} 
                colorScheme="blue" 
                onClick={testFirestore}
                isLoading={isLoading}
              >
                Test Firestore Again
              </Button>
            </Box>
            
            <Divider />
            
            <Box p={4} borderWidth="1px" borderRadius="md">
              <Heading as="h2" size="md" mb={4}>
                Firebase Configuration
              </Heading>
              <Code p={4} borderRadius="md" whiteSpace="pre-wrap" display="block">
                {`
apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'Using hardcoded config'}"
authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'researka.firebaseapp.com'}"
projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'researka'}"
storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'researka.firebasestorage.app'}"
messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '13219500485'}"
appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:13219500485:web:19c4dbdd41c2db5f813bac'}"
                `}
              </Code>
            </Box>
            <FirebaseTest />
          </VStack>
        </Container>
      </Box>
    </Layout>
  );
};

export default FirebaseTestPage;
