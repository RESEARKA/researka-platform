import React from 'react';
import { Box, Container, Heading, Text, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink, FormControl, FormLabel, Input, Textarea, Button, useToast, SimpleGrid } from '@chakra-ui/react';
import Layout from '../../components/Layout';
import Link from 'next/link';

const ContactPage: React.FC = () => {
  const toast = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send the form data to a server
    toast({
      title: "Message sent",
      description: "We've received your message and will respond shortly.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };
  
  return (
    <Layout title="Contact Us | RESEARKA" description="Get in touch with the RESEARKA team">
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
              <BreadcrumbLink>Contact</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <VStack spacing={8} align="start">
            <Heading as="h1" size="xl">Contact Us</Heading>
            
            <Text fontSize="lg">
              Have questions, feedback, or suggestions? We'd love to hear from you. 
              Fill out the form below or reach out to us directly using the contact information provided.
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} width="100%">
              <Box>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4} align="start">
                    <FormControl isRequired>
                      <FormLabel>Name</FormLabel>
                      <Input placeholder="Your name" />
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <Input type="email" placeholder="Your email address" />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Subject</FormLabel>
                      <Input placeholder="Subject of your message" />
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Message</FormLabel>
                      <Textarea placeholder="Your message" rows={6} />
                    </FormControl>
                    
                    <Button type="submit" colorScheme="blue" size="lg" width="100%">
                      Send Message
                    </Button>
                  </VStack>
                </form>
              </Box>
              
              <Box>
                <VStack spacing={6} align="start">
                  <Box>
                    <Heading as="h3" size="md" mb={2}>Email</Heading>
                    <Text>info@researka.io</Text>
                    <Text>support@researka.io</Text>
                  </Box>
                  
                  <Box>
                    <Heading as="h3" size="md" mb={2}>Address</Heading>
                    <Text>
                      RESEARKA Foundation<br />
                      123 Innovation Way<br />
                      Tech District<br />
                      San Francisco, CA 94105<br />
                      United States
                    </Text>
                  </Box>
                  
                  <Box>
                    <Heading as="h3" size="md" mb={2}>Social Media</Heading>
                    <Text>Twitter: @researka</Text>
                    <Text>LinkedIn: /company/researka</Text>
                    <Text>GitHub: /researka</Text>
                  </Box>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
    </Layout>
  );
};

export default ContactPage;
