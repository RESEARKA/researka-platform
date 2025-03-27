import React from 'react';
import { Container, Tabs, TabList, TabPanels, Tab, TabPanel, Heading, Text, Box, Alert, AlertIcon } from '@chakra-ui/react';
import Layout from '../components/Layout';
import ProfileFlowTester from '../components/ProfileFlowTester';
import { useAuth } from '../contexts/AuthContext';
import FirebaseClientOnly from '../components/FirebaseClientOnly';
import useClient from '../hooks/useClient';

/**
 * Test page for the profile flow
 * This page allows testing the profile flow in isolation
 */
const ProfileTestPage: React.FC = () => {
  const { currentUser, authIsInitialized } = useAuth();
  const isClient = useClient();

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Heading as="h1" mb={4}>Profile Flow Testing</Heading>
        <Text mb={6}>
          This page allows you to test the profile flow functionality to ensure it works correctly.
        </Text>

        {isClient && !currentUser && (
          <Alert status="warning" mb={6}>
            <AlertIcon />
            You are not signed in. Please sign in to test the profile flow.
          </Alert>
        )}

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Profile Flow Tester</Tab>
            <Tab>Documentation</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={4}>
              <FirebaseClientOnly>
                <ProfileFlowTester />
              </FirebaseClientOnly>
            </TabPanel>

            <TabPanel p={4}>
              <Box>
                <Heading as="h2" size="lg" mb={4}>Profile Flow Testing Documentation</Heading>
                
                <Heading as="h3" size="md" mt={6} mb={3}>Test Profile Exists</Heading>
                <Text mb={4}>
                  This test checks if a profile document exists in Firestore for the current user.
                  It will retrieve the document and display its contents if it exists.
                </Text>
                
                <Heading as="h3" size="md" mt={6} mb={3}>Test Profile Loading</Heading>
                <Text mb={4}>
                  This test verifies that the useProfileData hook is correctly loading the profile data.
                  It will display the loading state, any errors, and the loaded profile data.
                </Text>
                
                <Heading as="h3" size="md" mt={6} mb={3}>Test Profile Update</Heading>
                <Text mb={4}>
                  This test updates the profile with a random name and verifies that the update is
                  correctly saved to Firestore. It will display the update result and verify that
                  the update was saved.
                </Text>
                
                <Heading as="h3" size="md" mt={6} mb={3}>Test Hydration</Heading>
                <Text mb={4}>
                  This test checks for hydration consistency between server and client rendering.
                  It will force a re-render to test for hydration issues and display any warnings
                  in the console.
                </Text>
                
                <Heading as="h3" size="md" mt={6} mb={3}>Common Issues</Heading>
                <Text mb={2}>
                  If you encounter any of the following issues, the profile flow may not be working correctly:
                </Text>
                <Box as="ul" pl={6} mb={4}>
                  <Box as="li" mb={1}>Profile does not exist in Firestore after signup</Box>
                  <Box as="li" mb={1}>Profile loading fails with errors</Box>
                  <Box as="li" mb={1}>Profile updates are not saved to Firestore</Box>
                  <Box as="li" mb={1}>Hydration warnings in the console</Box>
                  <Box as="li" mb={1}>Blank screens during profile loading</Box>
                </Box>
                
                <Heading as="h3" size="md" mt={6} mb={3}>How to Use</Heading>
                <Text mb={4}>
                  1. Sign in to your account<br />
                  2. Run the tests in sequence to verify the profile flow<br />
                  3. Check the test results for any errors or warnings<br />
                  4. If all tests pass, the profile flow is working correctly
                </Text>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Layout>
  );
};

export default ProfileTestPage;
