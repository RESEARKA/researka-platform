import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Heading, Text } from '@chakra-ui/react';

// Import the FirebaseInitializationDemo component with SSR disabled
const FirebaseInitializationDemo = dynamic(
  () => import('../../components/FirebaseInitializationDemo'),
  { ssr: false }
);

// Import the AuthInitializationDemo component with SSR disabled
const AuthInitializationDemo = dynamic(
  () => import('../../components/AuthInitializationDemo'),
  { ssr: false }
);

// Import the FirebaseClientOnly component with SSR disabled
const FirebaseClientOnly = dynamic(
  () => import('../../components/FirebaseClientOnly'),
  { ssr: false }
);

/**
 * Demo page for Firebase initialization
 * Shows both the direct hook usage and the FirebaseClientOnly component
 */
export default function FirebaseDemoPage() {
  return (
    <Box maxWidth="800px" mx="auto" p={8}>
      <Heading as="h1" mb={6}>Firebase Initialization Demo</Heading>
      
      <Text mb={6}>
        This page demonstrates the new Firebase initialization system with both the 
        direct hook usage and the FirebaseClientOnly component.
      </Text>
      
      <Box mb={10}>
        <Heading as="h2" size="lg" mb={4}>Firebase Initialization Hook</Heading>
        <Text mb={4}>
          The component below uses the useFirebaseInitialization hook directly:
        </Text>
        <FirebaseInitializationDemo />
      </Box>
      
      <Box mb={10}>
        <Heading as="h2" size="lg" mb={4}>Auth Initialization Hook</Heading>
        <Text mb={4}>
          The component below uses the useAuthInitialization hook directly:
        </Text>
        <AuthInitializationDemo />
      </Box>
      
      <Box mb={10}>
        <Heading as="h2" size="lg" mb={4}>FirebaseClientOnly Component</Heading>
        <Text mb={4}>
          The component below uses the FirebaseClientOnly wrapper component:
        </Text>
        <FirebaseClientOnly
          fallback={
            <Box p={4} bg="gray.100" borderRadius="md">
              <Text>Loading Firebase services...</Text>
            </Box>
          }
          options={{
            timeoutMs: 8000,
            maxAttempts: 2,
            enableLogging: true
          }}
        >
          <Box p={4} bg="green.100" borderRadius="md">
            <Heading as="h3" size="md" mb={2}>Firebase is Ready!</Heading>
            <Text>
              This content is only shown when Firebase has been successfully initialized.
            </Text>
          </Box>
        </FirebaseClientOnly>
      </Box>
      
      <Box mt={10} p={4} bg="blue.50" borderRadius="md">
        <Heading as="h3" size="md" mb={2}>Implementation Details</Heading>
        <Text>
          The new Firebase initialization system includes:
        </Text>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>A robust singleton pattern for Firebase services</li>
          <li>Client-side only execution to prevent hydration errors</li>
          <li>Timeout handling to prevent hanging</li>
          <li>Detailed status reporting and error handling</li>
          <li>Proper cleanup on component unmount</li>
        </ul>
        
        <Text mt={4}>
          The new Auth initialization system includes:
        </Text>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Centralized authentication initialization logic</li>
          <li>Clear status enum (INITIALIZING, READY, ERROR, TIMEOUT)</li>
          <li>Better debugging information during initialization</li>
          <li>Prevention of duplicate Firebase auth instances</li>
          <li>Proper cleanup of auth listeners on component unmount</li>
        </ul>
      </Box>
    </Box>
  );
}
