import React from 'react';
import { Box, Container, Heading, Text, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Divider, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import Layout from '../../components/Layout';

const CookiePolicyPage: React.FC = () => {
  return (
    <Layout title="Cookie Policy | Researka" description="Researka's cookie policy">
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
              <BreadcrumbLink>Cookie Policy</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          
          <VStack spacing={6} align="start">
            <Heading as="h1" size="2xl">Cookie Policy</Heading>
            <Text fontSize="lg">
              This Cookie Policy explains how RESEARKA uses cookies and similar technologies to recognize you when you visit our platform. 
              It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </Text>
            
            <Text>
              <strong>Last Updated:</strong> March 16, 2025
            </Text>
            
            <Heading as="h2" size="lg" pt={4}>What Are Cookies?</Heading>
            <Text>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
              Cookies are widely used by website owners to make their websites work, or to work more efficiently, 
              as well as to provide reporting information.
            </Text>
            
            <Text mt={2}>
              Cookies set by the website owner (in this case, RESEARKA) are called "first-party cookies." 
              Cookies set by parties other than the website owner are called "third-party cookies." 
              Third-party cookies enable third-party features or functionality to be provided on or through the website 
              (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies 
              can recognize your computer both when it visits the website in question and also when it visits certain other websites.
            </Text>
            
            <Divider />
            
            <Heading as="h2" size="lg" pt={4}>Types of Cookies We Use</Heading>
            <Text mb={4}>
              We use the following types of cookies:
            </Text>
            
            <Table variant="simple" mb={4}>
              <Thead>
                <Tr>
                  <Th>Type of Cookie</Th>
                  <Th>Purpose</Th>
                  <Th>Duration</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td><strong>Essential Cookies</strong></Td>
                  <Td>These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms.</Td>
                  <Td>Session / Persistent</Td>
                </Tr>
                <Tr>
                  <Td><strong>Performance Cookies</strong></Td>
                  <Td>These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.</Td>
                  <Td>2 years</Td>
                </Tr>
                <Tr>
                  <Td><strong>Functionality Cookies</strong></Td>
                  <Td>These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.</Td>
                  <Td>1 year</Td>
                </Tr>
                <Tr>
                  <Td><strong>Targeting Cookies</strong></Td>
                  <Td>These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.</Td>
                  <Td>90 days</Td>
                </Tr>
              </Tbody>
            </Table>
            
            <Divider />
            
            <Heading as="h2" size="lg" pt={4}>Specific Cookies We Use</Heading>
            <Text mb={4}>
              Below is a detailed list of the cookies we use on our platform:
            </Text>
            
            <Table variant="simple" mb={4}>
              <Thead>
                <Tr>
                  <Th>Cookie Name</Th>
                  <Th>Provider</Th>
                  <Th>Purpose</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>_researka_session</Td>
                  <Td>RESEARKA</Td>
                  <Td>Maintains user session and authentication state</Td>
                </Tr>
                <Tr>
                  <Td>_researka_preferences</Td>
                  <Td>RESEARKA</Td>
                  <Td>Stores user preferences and settings</Td>
                </Tr>
                <Tr>
                  <Td>_researka_analytics</Td>
                  <Td>RESEARKA</Td>
                  <Td>Collects anonymous information about how users interact with the platform</Td>
                </Tr>
                <Tr>
                  <Td>_ga</Td>
                  <Td>Google Analytics</Td>
                  <Td>Used to distinguish users for analytics purposes</Td>
                </Tr>
                <Tr>
                  <Td>_gid</Td>
                  <Td>Google Analytics</Td>
                  <Td>Used to distinguish users for analytics purposes</Td>
                </Tr>
              </Tbody>
            </Table>
            
            <Divider />
            
            <Heading as="h2" size="lg" pt={4}>How to Control Cookies</Heading>
            <Text>
              You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, 
              you may still use our platform, though your access to some functionality and areas may be restricted. 
              As the means by which you can refuse cookies through your web browser controls vary from browser to browser, 
              you should visit your browser's help menu for more information.
            </Text>
            
            <Text mt={4}>
              In addition, most advertising networks offer you a way to opt out of targeted advertising. 
              If you would like to find out more information, please visit:
            </Text>
            <Box pl={4} mt={2}>
              <Text>• <a href="http://www.aboutads.info/choices/">Digital Advertising Alliance</a></Text>
              <Text>• <a href="https://youradchoices.ca/">Digital Advertising Alliance of Canada</a></Text>
              <Text>• <a href="http://www.youronlinechoices.com/">European Interactive Digital Advertising Alliance</a></Text>
            </Box>
            
            <Divider />
            
            <Heading as="h2" size="lg" pt={4}>Cookie Preferences</Heading>
            <Text>
              You can manage your cookie preferences at any time by visiting our 
              <a href="/governance/privacy-center">Privacy Center</a>. 
              There, you can choose which categories of cookies you accept or reject.
            </Text>
            
            <Divider />
            
            <Heading as="h2" size="lg" pt={4}>Changes to This Cookie Policy</Heading>
            <Text>
              We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. 
              Any changes will become effective when we post the revised Cookie Policy on our platform. 
              We encourage you to review this Cookie Policy periodically to stay informed about our use of cookies.
            </Text>
            
            <Divider />
            
            <Heading as="h2" size="lg" pt={4}>Contact Us</Heading>
            <Text>
              If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
            </Text>
            <Box pl={4} mt={2}>
              <Text>Email: privacy@researka.io</Text>
              <Text>Address: RESEARKA Foundation, 123 Innovation Way, Tech District, San Francisco, CA 94105, United States</Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    </Layout>
  );
};

export default CookiePolicyPage;
