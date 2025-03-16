import React, { useState } from 'react';
import Head from 'next/head';
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
  useToast,
  Divider,
  SimpleGrid,
  RadioGroup,
  Radio,
  Stack,
  Textarea,
  Input,
  Select
} from '@chakra-ui/react';

const PrivacyCenterPage: React.FC = () => {
  const toast = useToast();
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    performance: true,
    functionality: true,
    targeting: false
  });
  
  const [marketingPreferences, setMarketingPreferences] = useState({
    email: false,
    newsletter: false,
    updates: false
  });
  
  const [requestType, setRequestType] = useState('access');
  
  const handleCookiePreferenceChange = (name: string, value: boolean) => {
    setCookiePreferences({
      ...cookiePreferences,
      [name]: value
    });
  };
  
  const handleMarketingPreferenceChange = (name: string, value: boolean) => {
    setMarketingPreferences({
      ...marketingPreferences,
      [name]: value
    });
  };
  
  const handleSavePreferences = () => {
    // In a real implementation, this would save preferences to a server or local storage
    toast({
      title: "Preferences saved",
      description: "Your privacy preferences have been updated successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };
  
  const handleDataRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would submit the request to a server
    toast({
      title: "Request submitted",
      description: `Your ${requestType} request has been submitted and will be processed within 30 days.`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };
  
  return (
    <>
      <Head>
        <title>Privacy Center | RESEARKA</title>
        <meta name="description" content="Manage your privacy settings and data requests at RESEARKA's Privacy Center" />
      </Head>

      <Box py={8}>
        <Container maxW="container.xl">
          <Breadcrumb mb={6}>
            <BreadcrumbItem>
              <BreadcrumbLink as="a" href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Privacy Center</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <VStack spacing={8} align="start">
            <Heading as="h1" size="xl">Privacy Center</Heading>
            
            <Text fontSize="lg">
              Welcome to the RESEARKA Privacy Center. Here you can manage your privacy settings, 
              cookie preferences, and submit data requests in accordance with data protection regulations.
            </Text>
            
            <Tabs width="100%" colorScheme="blue" isLazy>
              <TabList>
                <Tab>Privacy Settings</Tab>
                <Tab>Data Requests</Tab>
              </TabList>
              
              <TabPanels>
                {/* Privacy Settings Tab */}
                <TabPanel>
                  <VStack spacing={6} align="start">
                    <Heading as="h2" size="lg">Cookie Preferences</Heading>
                    <Text>
                      Manage which types of cookies you allow RESEARKA to use when you visit our platform. 
                      Please note that essential cookies cannot be disabled as they are necessary for the platform to function properly.
                    </Text>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="100%">
                      <FormControl>
                        <FormLabel display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Text fontWeight="bold">Essential Cookies</Text>
                            <Text fontSize="sm" color="gray.600">Required for basic functionality</Text>
                          </Box>
                          <Switch isChecked={cookiePreferences.essential} isDisabled colorScheme="blue" />
                        </FormLabel>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Text fontWeight="bold">Performance Cookies</Text>
                            <Text fontSize="sm" color="gray.600">Help us improve our platform</Text>
                          </Box>
                          <Switch 
                            isChecked={cookiePreferences.performance} 
                            onChange={(e) => handleCookiePreferenceChange('performance', e.target.checked)} 
                            colorScheme="blue" 
                          />
                        </FormLabel>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Text fontWeight="bold">Functionality Cookies</Text>
                            <Text fontSize="sm" color="gray.600">Enable enhanced features</Text>
                          </Box>
                          <Switch 
                            isChecked={cookiePreferences.functionality} 
                            onChange={(e) => handleCookiePreferenceChange('functionality', e.target.checked)} 
                            colorScheme="blue" 
                          />
                        </FormLabel>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Text fontWeight="bold">Targeting Cookies</Text>
                            <Text fontSize="sm" color="gray.600">Used for personalized content</Text>
                          </Box>
                          <Switch 
                            isChecked={cookiePreferences.targeting} 
                            onChange={(e) => handleCookiePreferenceChange('targeting', e.target.checked)} 
                            colorScheme="blue" 
                          />
                        </FormLabel>
                      </FormControl>
                    </SimpleGrid>
                    
                    <Divider my={4} />
                    
                    <Heading as="h2" size="lg">Marketing Preferences</Heading>
                    <Text>
                      Control how RESEARKA communicates with you. You can opt in or out of different types of communications.
                    </Text>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="100%">
                      <FormControl>
                        <FormLabel display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Text fontWeight="bold">Email Communications</Text>
                            <Text fontSize="sm" color="gray.600">General updates and notifications</Text>
                          </Box>
                          <Switch 
                            isChecked={marketingPreferences.email} 
                            onChange={(e) => handleMarketingPreferenceChange('email', e.target.checked)} 
                            colorScheme="blue" 
                          />
                        </FormLabel>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Text fontWeight="bold">Newsletter</Text>
                            <Text fontSize="sm" color="gray.600">Monthly research highlights</Text>
                          </Box>
                          <Switch 
                            isChecked={marketingPreferences.newsletter} 
                            onChange={(e) => handleMarketingPreferenceChange('newsletter', e.target.checked)} 
                            colorScheme="blue" 
                          />
                        </FormLabel>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Text fontWeight="bold">Platform Updates</Text>
                            <Text fontSize="sm" color="gray.600">New features and improvements</Text>
                          </Box>
                          <Switch 
                            isChecked={marketingPreferences.updates} 
                            onChange={(e) => handleMarketingPreferenceChange('updates', e.target.checked)} 
                            colorScheme="blue" 
                          />
                        </FormLabel>
                      </FormControl>
                    </SimpleGrid>
                    
                    <Button colorScheme="blue" size="lg" mt={4} onClick={handleSavePreferences}>
                      Save Preferences
                    </Button>
                  </VStack>
                </TabPanel>
                
                {/* Data Requests Tab */}
                <TabPanel>
                  <VStack spacing={6} align="start">
                    <Heading as="h2" size="lg">Data Subject Requests</Heading>
                    <Text>
                      Under various data protection regulations, you have the right to access, correct, or delete your personal data. 
                      Use this form to submit a data request, and we will respond within 30 days.
                    </Text>
                    
                    <form onSubmit={handleDataRequest} style={{ width: '100%' }}>
                      <VStack spacing={4} align="start">
                        <FormControl isRequired>
                          <FormLabel>Request Type</FormLabel>
                          <RadioGroup onChange={setRequestType} value={requestType}>
                            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                              <Radio value="access">Access My Data</Radio>
                              <Radio value="correction">Correct My Data</Radio>
                              <Radio value="deletion">Delete My Data</Radio>
                              <Radio value="portability">Data Portability</Radio>
                            </Stack>
                          </RadioGroup>
                        </FormControl>
                        
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                          <FormControl isRequired>
                            <FormLabel>Full Name</FormLabel>
                            <Input placeholder="Your full name" />
                          </FormControl>
                          
                          <FormControl isRequired>
                            <FormLabel>Email Address</FormLabel>
                            <Input type="email" placeholder="Your email address" />
                          </FormControl>
                        </SimpleGrid>
                        
                        <FormControl>
                          <FormLabel>User ID (if known)</FormLabel>
                          <Input placeholder="Your RESEARKA user ID" />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Country of Residence</FormLabel>
                          <Select placeholder="Select country">
                            <option value="us">United States</option>
                            <option value="ca">Canada</option>
                            <option value="uk">United Kingdom</option>
                            <option value="eu">European Union</option>
                            <option value="other">Other</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Request Details</FormLabel>
                          <Textarea 
                            placeholder="Please provide any additional details about your request" 
                            rows={5}
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Verification</FormLabel>
                          <Text fontSize="sm" mb={2}>
                            To protect your privacy, we need to verify your identity. Please describe how you use our platform 
                            (e.g., as a researcher, reviewer, reader) and provide any additional information that can help us 
                            verify your identity.
                          </Text>
                          <Textarea 
                            placeholder="Information to help us verify your identity" 
                            rows={3}
                          />
                        </FormControl>
                        
                        <Button type="submit" colorScheme="blue" size="lg" width={{ base: '100%', md: 'auto' }} mt={4}>
                          Submit Request
                        </Button>
                      </VStack>
                    </form>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default PrivacyCenterPage;
