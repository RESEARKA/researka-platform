import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Switch,
  Button,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  useToast
} from '@chakra-ui/react';
import Layout from '../../components/Layout';

const PrivacyCenterPage: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const toast = useToast();
  
  // Privacy preference states
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [thirdPartyConsent, setThirdPartyConsent] = useState(false);
  
  const handleSavePreferences = () => {
    // In a real application, this would save to a backend or localStorage
    setShowSuccess(true);
    toast({
      title: "Preferences saved",
      description: "Your privacy preferences have been updated successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };
  
  return (
    <Layout title="Privacy Center | Researka" description="Manage your privacy settings and data">
      <Box py={8}>
        <Container maxW="container.xl">
          <Breadcrumb mb={6}>
            <BreadcrumbItem>
              <BreadcrumbLink as="a" href="/" onClick={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }}>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Privacy Center</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          
          <VStack spacing={6} align="start">
            <Heading as="h1" size="2xl">Privacy Center</Heading>
            <Text>Manage your privacy settings and control your data</Text>
            
            {showSuccess && (
              <Alert status="success" mb={4}>
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>
                    Your privacy preferences have been updated successfully.
                  </AlertDescription>
                </Box>
                <CloseButton position="absolute" right="8px" top="8px" onClick={() => setShowSuccess(false)} />
              </Alert>
            )}
            
            <Tabs width="100%" colorScheme="green">
              <TabList>
                <Tab>Privacy Preferences</Tab>
                <Tab>Your Data</Tab>
                <Tab>Cookie Settings</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel>
                  <VStack spacing={6} align="start">
                    <Heading as="h2" size="lg">Privacy Preferences</Heading>
                    <Text>Control how we use your personal information</Text>
                    
                    <FormControl display="flex" alignItems="center">
                      <Switch 
                        id="analytics-consent" 
                        isChecked={analyticsConsent}
                        onChange={() => setAnalyticsConsent(!analyticsConsent)}
                        colorScheme="green"
                        size="lg"
                        mr={3}
                      />
                      <Box>
                        <FormLabel htmlFor="analytics-consent" mb="0" fontWeight="bold">
                          Analytics
                        </FormLabel>
                        <Text fontSize="sm" color="gray.600">
                          Allow us to collect anonymous usage data to improve our platform
                        </Text>
                      </Box>
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <Switch 
                        id="marketing-consent" 
                        isChecked={marketingConsent}
                        onChange={() => setMarketingConsent(!marketingConsent)}
                        colorScheme="green"
                        size="lg"
                        mr={3}
                      />
                      <Box>
                        <FormLabel htmlFor="marketing-consent" mb="0" fontWeight="bold">
                          Marketing Communications
                        </FormLabel>
                        <Text fontSize="sm" color="gray.600">
                          Receive updates about new features and promotions
                        </Text>
                      </Box>
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <Switch 
                        id="third-party-consent" 
                        isChecked={thirdPartyConsent}
                        onChange={() => setThirdPartyConsent(!thirdPartyConsent)}
                        colorScheme="green"
                        size="lg"
                        mr={3}
                      />
                      <Box>
                        <FormLabel htmlFor="third-party-consent" mb="0" fontWeight="bold">
                          Third-Party Sharing
                        </FormLabel>
                        <Text fontSize="sm" color="gray.600">
                          Allow us to share your information with trusted partners
                        </Text>
                      </Box>
                    </FormControl>
                    
                    <Button 
                      colorScheme="green" 
                      size="md" 
                      mt={4}
                      onClick={handleSavePreferences}
                    >
                      Save Preferences
                    </Button>
                  </VStack>
                </TabPanel>
                
                <TabPanel>
                  <VStack spacing={6} align="start">
                    <Heading as="h2" size="lg">Your Data</Heading>
                    <Text>View and manage the data we have collected about you</Text>
                    
                    <Box width="100%" p={4} borderWidth="1px" borderRadius="lg">
                      <Heading as="h3" size="md" mb={2}>Download Your Data</Heading>
                      <Text mb={4}>
                        You can request a copy of all the personal data we have collected about you.
                      </Text>
                      <Button colorScheme="blue">Request Data Export</Button>
                    </Box>
                    
                    <Box width="100%" p={4} borderWidth="1px" borderRadius="lg">
                      <Heading as="h3" size="md" mb={2}>Delete Your Account</Heading>
                      <Text mb={4}>
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </Text>
                      <Button colorScheme="red">Request Account Deletion</Button>
                    </Box>
                  </VStack>
                </TabPanel>
                
                <TabPanel>
                  <VStack spacing={6} align="start">
                    <Heading as="h2" size="lg">Cookie Settings</Heading>
                    <Text>Manage how cookies are used when you visit our platform</Text>
                    
                    <FormControl display="flex" alignItems="center">
                      <Switch 
                        id="essential-cookies" 
                        isChecked={true}
                        isDisabled={true}
                        colorScheme="green"
                        size="lg"
                        mr={3}
                      />
                      <Box>
                        <FormLabel htmlFor="essential-cookies" mb="0" fontWeight="bold">
                          Essential Cookies
                        </FormLabel>
                        <Text fontSize="sm" color="gray.600">
                          Required for the platform to function properly (cannot be disabled)
                        </Text>
                      </Box>
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <Switch 
                        id="performance-cookies" 
                        isChecked={analyticsConsent}
                        onChange={() => setAnalyticsConsent(!analyticsConsent)}
                        colorScheme="green"
                        size="lg"
                        mr={3}
                      />
                      <Box>
                        <FormLabel htmlFor="performance-cookies" mb="0" fontWeight="bold">
                          Performance & Analytics Cookies
                        </FormLabel>
                        <Text fontSize="sm" color="gray.600">
                          Help us understand how visitors interact with our platform
                        </Text>
                      </Box>
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <Switch 
                        id="marketing-cookies" 
                        isChecked={marketingConsent}
                        onChange={() => setMarketingConsent(!marketingConsent)}
                        colorScheme="green"
                        size="lg"
                        mr={3}
                      />
                      <Box>
                        <FormLabel htmlFor="marketing-cookies" mb="0" fontWeight="bold">
                          Marketing Cookies
                        </FormLabel>
                        <Text fontSize="sm" color="gray.600">
                          Used to deliver relevant advertisements and track campaign performance
                        </Text>
                      </Box>
                    </FormControl>
                    
                    <Button 
                      colorScheme="green" 
                      size="md" 
                      mt={4}
                      onClick={handleSavePreferences}
                    >
                      Save Cookie Preferences
                    </Button>
                    
                    <Divider my={4} />
                    
                    <Box>
                      <Heading as="h3" size="md" mb={2}>More Information</Heading>
                      <Text>
                        For more details about how we use cookies, please read our{' '}
                        <a href="/governance/cookie-policy" target="_blank" rel="noopener noreferrer">
                          Cookie Policy
                        </a>.
                      </Text>
                    </Box>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Container>
      </Box>
    </Layout>
  );
};

export default PrivacyCenterPage;
