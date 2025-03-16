import React from 'react';
import Head from 'next/head';
import { Box, Container, Heading, Text, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Divider } from '@chakra-ui/react';
import Link from 'next/link';

const LegalPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Legal Information | RESEARKA</title>
        <meta name="description" content="Legal information, terms of service, and copyright notices for RESEARKA" />
      </Head>

      <Box py={8}>
        <Container maxW="container.xl">
          <Breadcrumb mb={6}>
            <BreadcrumbItem>
              <BreadcrumbLink as="a" href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Legal</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <VStack spacing={8} align="start">
            <Heading as="h1" size="xl">Legal Information</Heading>
            
            <Text fontSize="lg">
              This page contains important legal information about RESEARKA, including our terms of service, 
              copyright notices, and other legal disclosures. Please read this information carefully.
            </Text>
            
            <Heading as="h2" size="lg">Terms of Service</Heading>
            <Text>
              By using the RESEARKA platform, you agree to comply with and be bound by the following terms and conditions. 
              These terms may be updated from time to time, and your continued use of the platform constitutes acceptance 
              of any changes.
            </Text>
            <Text mt={2}>
              <strong>1. Acceptance of Terms</strong><br />
              By accessing or using RESEARKA, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
              If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
            </Text>
            <Text mt={2}>
              <strong>2. Use License</strong><br />
              Permission is granted to temporarily access the materials on RESEARKA's platform for personal, non-commercial use. 
              This is the grant of a license, not a transfer of title, and under this license, you may not:
              <br />• Modify or copy the materials without explicit permission
              <br />• Use the materials for any commercial purpose
              <br />• Attempt to decompile or reverse engineer any software contained on the platform
              <br />• Remove any copyright or other proprietary notations from the materials
            </Text>
            
            <Divider />
            
            <Heading as="h2" size="lg">Copyright Notice</Heading>
            <Text>
              All content on the RESEARKA platform, including but not limited to text, graphics, logos, icons, images, 
              audio clips, digital downloads, and software, is the property of RESEARKA or its content suppliers and 
              is protected by international copyright laws.
            </Text>
            <Text mt={2}>
              The compilation of all content on this platform is the exclusive property of RESEARKA and is protected 
              by international copyright laws. All software used on this platform is the property of RESEARKA or its 
              software suppliers and is protected by international copyright laws.
            </Text>
            
            <Divider />
            
            <Heading as="h2" size="lg">Intellectual Property</Heading>
            <Text>
              RESEARKA respects the intellectual property rights of others and expects users of the platform to do the same. 
              We will respond to notices of alleged copyright infringement that comply with applicable law and are properly 
              provided to us.
            </Text>
            <Text mt={2}>
              If you believe that your content has been copied in a way that constitutes copyright infringement, please 
              provide us with the following information:
              <br />• A physical or electronic signature of the copyright owner or a person authorized to act on their behalf
              <br />• Identification of the copyrighted work claimed to have been infringed
              <br />• Identification of the material that is claimed to be infringing and where it is located on the platform
              <br />• Your contact information, including your address, telephone number, and email
              <br />• A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or law
              <br />• A statement, made under penalty of perjury, that the above information is accurate and that you are the copyright owner or are authorized to act on behalf of the owner
            </Text>
            
            <Divider />
            
            <Heading as="h2" size="lg">Disclaimer</Heading>
            <Text>
              The materials on RESEARKA's platform are provided on an 'as is' basis. RESEARKA makes no warranties, 
              expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, 
              implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
              of intellectual property or other violation of rights.
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default LegalPage;
