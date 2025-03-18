import React from 'react';
import { Box, Container, Heading, Text, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Divider, UnorderedList, ListItem } from '@chakra-ui/react';
import Layout from '../../components/Layout';

const LegalPage: React.FC = () => {
  return (
    <Layout title="Legal | Researka" description="Legal information for Researka platform">
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
              <BreadcrumbLink>Legal</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          
          <VStack spacing={6} align="start">
            <Heading as="h1" size="2xl">Legal Information</Heading>
            <Text>Last Updated: March 15, 2025</Text>
            
            <Heading as="h2" size="lg" pt={4}>Terms of Service</Heading>
            <Text>
              By accessing or using the Researka platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
            </Text>
            
            <Heading as="h3" size="md" pt={2}>Use License</Heading>
            <Text>
              Permission is granted to temporarily access the materials on Researka's platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </Text>
            <UnorderedList pl={6} spacing={2} mt={2}>
              <ListItem>Modify or copy the materials</ListItem>
              <ListItem>Use the materials for any commercial purpose or for any public display</ListItem>
              <ListItem>Attempt to decompile or reverse engineer any software contained on Researka's platform</ListItem>
              <ListItem>Remove any copyright or other proprietary notations from the materials</ListItem>
              <ListItem>Transfer the materials to another person or "mirror" the materials on any other server</ListItem>
            </UnorderedList>
            
            <Heading as="h2" size="lg" pt={4}>Disclaimer</Heading>
            <Text>
              The materials on Researka's platform are provided on an 'as is' basis. Researka makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </Text>
            <Text mt={2}>
              Further, Researka does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its platform or otherwise relating to such materials or on any sites linked to this platform.
            </Text>
            
            <Heading as="h2" size="lg" pt={4}>Limitations</Heading>
            <Text>
              In no event shall Researka or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Researka's platform, even if Researka or a Researka authorized representative has been notified orally or in writing of the possibility of such damage.
            </Text>
            
            <Heading as="h2" size="lg" pt={4}>Accuracy of Materials</Heading>
            <Text>
              The materials appearing on Researka's platform could include technical, typographical, or photographic errors. Researka does not warrant that any of the materials on its platform are accurate, complete, or current. Researka may make changes to the materials contained on its platform at any time without notice. However, Researka does not make any commitment to update the materials.
            </Text>
            
            <Heading as="h2" size="lg" pt={4}>Links</Heading>
            <Text>
              Researka has not reviewed all of the sites linked to its platform and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Researka of the site. Use of any such linked website is at the user's own risk.
            </Text>
            
            <Heading as="h2" size="lg" pt={4}>Modifications</Heading>
            <Text>
              Researka may revise these terms of service for its platform at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these terms of service.
            </Text>
            
            <Heading as="h2" size="lg" pt={4}>Governing Law</Heading>
            <Text>
              These terms and conditions are governed by and construed in accordance with the laws of the United Kingdom and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </Text>
            
            <Heading as="h2" size="lg" pt={4}>Contact Us</Heading>
            <Text>
              If you have any questions about these Terms, please contact us at legal@researka.io.
            </Text>
          </VStack>
        </Container>
      </Box>
    </Layout>
  );
};

export default LegalPage;
