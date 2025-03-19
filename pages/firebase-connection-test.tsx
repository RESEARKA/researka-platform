import { useState, useEffect } from 'react';
import { Box, Button, Text, VStack, Heading, Code, Alert, AlertIcon, Divider, Container } from '@chakra-ui/react';
import { app, auth, db } from '../config/firebase';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

export default function FirebaseConnectionTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };

  // Check Firebase initialization
  useEffect(() => {
    addLog('Checking Firebase initialization...');
    
    try {
      // Check app
      if (!app) {
        throw new Error('Firebase app is not initialized');
      }
      addLog('✅ Firebase app is initialized');
      
      // Check auth
      if (!auth) {
        throw new Error('Firebase auth is not initialized');
      }
      addLog('✅ Firebase auth is initialized');
      
      // Check db
      if (!db) {
        throw new Error('Firebase firestore is not initialized');
      }
      addLog('✅ Firebase firestore is initialized');
      
      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        addLog(`Auth state changed: User ${currentUser ? 'signed in' : 'signed out'}`);
        setUser(currentUser);
        setIsLoading(false);
      });
      
      return () => unsubscribe();
    } catch (err: any) {
      const errorMessage = `Error initializing Firebase: ${err.message}`;
      addLog(`❌ ${errorMessage}`);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  // Test anonymous sign in
  const testAnonymousSignIn = async () => {
    addLog('Testing anonymous sign in...');
    setError(null);
    
    try {
      if (!auth) {
        throw new Error('Firebase auth is not initialized');
      }
      
      const result = await signInAnonymously(auth);
      addLog(`✅ Anonymous sign in successful: ${result.user.uid}`);
    } catch (err: any) {
      const errorMessage = `Error signing in anonymously: ${err.message}`;
      addLog(`❌ ${errorMessage}`);
      setError(errorMessage);
    }
  };

  // Test Firestore write
  const testFirestoreWrite = async () => {
    if (!auth.currentUser) {
      console.error('No user is logged in');
      return;
    }
    
    try {
      const testData = {
        timestamp: new Date().toISOString(),
        message: 'Test data',
        userId: auth.currentUser.uid
      };
      
      // Use users collection now that rules allow authenticated access
      await setDoc(doc(db, 'users', auth.currentUser.uid), testData, { merge: true });
      addLog(`✅ Firestore write successful to users/${auth.currentUser.uid}`);
    } catch (error) {
      console.error('Error writing to Firestore:', error);
      addLog(`❌ Firestore write failed: ${(error as Error).message}`);
    }
  };

  // Test Firestore read
  const testFirestoreRead = async () => {
    if (!auth.currentUser) {
      console.error('No user is logged in');
      return;
    }
    
    try {
      // Use users collection now that rules allow authenticated access
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        addLog(`✅ Firestore read successful: ${JSON.stringify(docSnap.data())}`);
      } else {
        addLog('⚠️ Document does not exist. Try writing data first.');
      }
    } catch (error) {
      console.error('Error reading from Firestore:', error);
      addLog(`❌ Firestore read failed: ${(error as Error).message}`);
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl">Firebase Connection Test</Heading>
        
        <Text>
          This page tests the connection to Firebase services. It will help diagnose any issues with Firebase initialization, authentication, and Firestore operations.
        </Text>
        
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <Box>
          <Heading as="h2" size="md" mb={4}>Authentication Status</Heading>
          {isLoading ? (
            <Text>Checking authentication status...</Text>
          ) : (
            <Text>
              {user ? `Signed in as: ${user.uid} (${user.isAnonymous ? 'anonymous' : 'authenticated'})` : 'Not signed in'}
            </Text>
          )}
        </Box>
        
        <Box>
          <Heading as="h2" size="md" mb={4}>Test Actions</Heading>
          <VStack spacing={4} align="stretch">
            <Button colorScheme="blue" onClick={testAnonymousSignIn} isDisabled={isLoading}>
              Test Anonymous Sign In
            </Button>
            
            <Button colorScheme="green" onClick={testFirestoreWrite} isDisabled={isLoading || !user}>
              Test Firestore Write
            </Button>
            
            <Button colorScheme="purple" onClick={testFirestoreRead} isDisabled={isLoading || !user}>
              Test Firestore Read
            </Button>
          </VStack>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading as="h2" size="md" mb={4}>Test Logs</Heading>
          <Box 
            bg="gray.50" 
            p={4} 
            borderRadius="md" 
            maxH="400px" 
            overflowY="auto"
            fontFamily="monospace"
          >
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <Text key={index}>{log}</Text>
              ))
            ) : (
              <Text color="gray.500">No logs yet. Run tests to see results.</Text>
            )}
          </Box>
        </Box>
      </VStack>
    </Container>
  );
}
