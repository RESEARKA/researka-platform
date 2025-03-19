import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { collection, getDocs, addDoc, doc, setDoc, Firestore } from 'firebase/firestore';
import { Box, Button, Text, VStack, Code, Alert, AlertIcon } from '@chakra-ui/react';

export default function FirebaseTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addLogMessage = (message: string) => {
    setTestResults(prev => [...prev, message]);
  };

  const runFirebaseTests = async () => {
    setTestResults([]);
    setError(null);

    try {
      // Test 1: Check if Firebase is initialized
      addLogMessage('Test 1: Checking Firebase initialization...');
      if (!db) {
        throw new Error('Firestore is not initialized');
      }
      
      // Now TypeScript knows db is defined
      const firestore: Firestore = db;
      addLogMessage('Firestore is initialized');

      // Test 2: Simple write test
      addLogMessage('Test 2: Simple write test...');
      try {
        const simpleTestRef = doc(firestore, 'test', 'simple-test');
        await setDoc(simpleTestRef, { 
          test: 'Hello', 
          timestamp: new Date().toISOString() 
        });
        addLogMessage('Simple write test successful!');
      } catch (simpleWriteError: any) {
        addLogMessage(`Simple write test failed: ${simpleWriteError.message}`);
        addLogMessage(`Error code: ${simpleWriteError.code || 'unknown'}`);
        throw simpleWriteError;
      }

      // Test 3: Try to write to a test collection
      addLogMessage('Test 3: Writing to test collection...');
      const testData = {
        message: 'Test message',
        timestamp: new Date().toISOString()
      };
      
      try {
        const docRef = await addDoc(collection(firestore, 'test'), testData);
        addLogMessage(`Document written with ID: ${docRef.id}`);
      } catch (writeError: any) {
        addLogMessage(`Error writing document: ${writeError.message}`);
        throw writeError;
      }

      // Test 4: Try to read from the test collection
      addLogMessage('Test 4: Reading from test collection...');
      try {
        const querySnapshot = await getDocs(collection(firestore, 'test'));
        addLogMessage(`Read ${querySnapshot.size} documents from test collection`);
      } catch (readError: any) {
        addLogMessage(`Error reading documents: ${readError.message}`);
        throw readError;
      }

      addLogMessage('All tests completed successfully!');
    } catch (e: any) {
      console.error('Firebase test error:', e);
      setError(e.message);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" maxW="600px" mx="auto" my={4}>
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold">Firebase Connection Test</Text>
        
        <Button colorScheme="blue" onClick={runFirebaseTests}>
          Run Firebase Tests
        </Button>
        
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <Box bg="gray.50" p={3} borderRadius="md">
          <Text fontWeight="bold" mb={2}>Test Results:</Text>
          {testResults.length === 0 ? (
            <Text color="gray.500">No tests run yet</Text>
          ) : (
            <VStack align="stretch" spacing={1}>
              {testResults.map((result, index) => (
                <Code key={index} p={1} fontSize="sm">
                  {result}
                </Code>
              ))}
            </VStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
}
