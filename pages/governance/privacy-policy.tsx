import React from 'react';
import Head from 'next/head';
import { Box, Container, Heading, Text, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Divider, List, ListItem, ListIcon } from '@chakra-ui/react';
import Link from 'next/link';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy | RESEARKA</title>
        <meta name="description" content="RESEARKA's Privacy Policy - How we collect, use, and protect your data" />
      </Head>

      <Box py={8}>
        <Container maxW="container.xl">
          <Breadcrumb mb={6}>
            <BreadcrumbItem>
              <BreadcrumbLink as="a" href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Privacy Policy</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <VStack spacing={8} align="start">
            <Heading as="h1" size="xl">Privacy Policy</Heading>
            
            <Text fontSize="lg">
              At RESEARKA, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </Text>
            
            <Text>
              <strong>Last Updated:</strong> March 16, 2025
            </Text>
            
            <Heading as="h2" size="lg">Information We Collect</Heading>
            <Text>
              We collect information that you provide directly to us when you:
            </Text>
            <Box pl={4}>
              <Text>• Create an account or profile on our platform</Text>
              <Text>• Submit, publish, or review academic content</Text>
              <Text>• Participate in discussions or forums</Text>
              <Text>• Contact us for support or information</Text>
              <Text>• Subscribe to newsletters or updates</Text>
            </Box>
            
            <Text mt={2}>
              This information may include:
            </Text>
            <Box pl={4}>
              <Text>• Personal identifiers (name, email address, institutional affiliation)</Text>
              <Text>• Professional information (academic credentials, research interests, publication history)</Text>
              <Text>• Account credentials (username, password)</Text>
              <Text>• Content you submit (papers, reviews, comments)</Text>
              <Text>• Communication preferences</Text>
            </Box>
            
            <Text mt={2}>
              We also automatically collect certain information when you use our platform, including:
            </Text>
            <Box pl={4}>
              <Text>• IP address and device information</Text>
              <Text>• Browser type and settings</Text>
              <Text>• Usage data and interaction with our platform</Text>
              <Text>• Cookies and similar technologies</Text>
            </Box>
            
            <Divider />
            
            <Heading as="h2" size="lg">How We Use Your Information</Heading>
            <Text>
              We use the information we collect for various purposes, including:
            </Text>
            <Box pl={4}>
              <Text>• Providing and maintaining our platform</Text>
              <Text>• Processing and facilitating academic publishing and peer review</Text>
              <Text>• Managing your account and preferences</Text>
              <Text>• Communicating with you about our services</Text>
              <Text>• Improving and personalizing your experience</Text>
              <Text>• Analyzing usage patterns and trends</Text>
              <Text>• Ensuring the security and integrity of our platform</Text>
              <Text>• Complying with legal obligations</Text>
            </Box>
            
            <Divider />
            
            <Heading as="h2" size="lg">Data Sharing and Disclosure</Heading>
            <Text>
              We may share your information with:
            </Text>
            <Box pl={4}>
              <Text>• Other users, as necessary for the peer review and publishing process</Text>
              <Text>• Service providers who perform services on our behalf</Text>
              <Text>• Academic institutions and partners for verification purposes</Text>
              <Text>• Legal authorities when required by law or to protect our rights</Text>
            </Box>
            
            <Text mt={2}>
              We do not sell your personal information to third parties.
            </Text>
            
            <Divider />
            
            <Heading as="h2" size="lg">Data Security</Heading>
            <Text>
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </Text>
            <Box pl={4}>
              <Text>• Encryption of sensitive data</Text>
              <Text>• Secure storage using blockchain technology</Text>
              <Text>• Regular security assessments and audits</Text>
              <Text>• Access controls and authentication mechanisms</Text>
              <Text>• Staff training on data protection</Text>
            </Box>
            
            <Text mt={2}>
              However, no method of transmission over the Internet or electronic storage is 100% secure, 
              and we cannot guarantee absolute security.
            </Text>
            
            <Divider />
            
            <Heading as="h2" size="lg">Your Rights and Choices</Heading>
            <Text>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </Text>
            <Box pl={4}>
              <Text>• Access to your personal information</Text>
              <Text>• Correction of inaccurate or incomplete information</Text>
              <Text>• Deletion of your personal information</Text>
              <Text>• Restriction or objection to processing</Text>
              <Text>• Data portability</Text>
              <Text>• Withdrawal of consent</Text>
            </Box>
            
            <Text mt={2}>
              To exercise these rights, please contact us at privacy@researka.io.
            </Text>
            
            <Divider />
            
            <Heading as="h2" size="lg">Changes to This Privacy Policy</Heading>
            <Text>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
              We will notify you of any material changes by posting the updated policy on our platform and updating the 
              "Last Updated" date.
            </Text>
            
            <Divider />
            
            <Heading as="h2" size="lg">Contact Us</Heading>
            <Text>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, 
              please contact us at:
            </Text>
            <Box pl={4} mt={2}>
              <Text>Email: privacy@researka.io</Text>
              <Text>Address: RESEARKA Foundation, 123 Innovation Way, Tech District, San Francisco, CA 94105, United States</Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default PrivacyPolicyPage;
