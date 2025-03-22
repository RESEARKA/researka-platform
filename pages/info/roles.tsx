import React from 'react';
import { Box, Container, Heading, Text, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, UnorderedList, ListItem } from '@chakra-ui/react';
import Layout from '../../components/Layout';
import Link from 'next/link';

const RolesPage: React.FC = () => {
  return (
    <Layout title="Roles | RESEARKA" description="Learn about the different roles in the RESEARKA ecosystem">
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
              <BreadcrumbLink>Roles</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <VStack spacing={8} align="start">
            <Heading as="h1" size="xl">Roles in the RESEARKA Ecosystem</Heading>
            
            <Text fontSize="lg">
              RESEARKA is a decentralized academic publishing platform that involves various stakeholders 
              with different roles and responsibilities. Understanding these roles is essential for 
              participating effectively in our ecosystem.
            </Text>
            
            <Accordion allowToggle width="100%">
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Heading as="h3" size="md">Researchers & Authors</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Text>
                    Researchers and authors are the primary content creators on RESEARKA. They submit their 
                    academic papers, research findings, and scholarly works to the platform. Authors retain 
                    full ownership of their intellectual property while gaining access to a global audience.
                  </Text>
                  <Text mt={2}>
                    <strong>Key Responsibilities:</strong>
                  </Text>
                  <UnorderedList>
                    <ListItem>Produce high-quality research content</ListItem>
                    <ListItem>Submit papers for peer review</ListItem>
                    <ListItem>Respond to reviewer feedback</ListItem>
                    <ListItem>Update and maintain their published works</ListItem>
                  </UnorderedList>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Heading as="h3" size="md">Peer Reviewers</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Text>
                    Peer reviewers are experts in their respective fields who evaluate submitted papers for 
                    scientific validity, originality, and significance. Their critical assessment ensures the 
                    quality and integrity of research published on RESEARKA.
                  </Text>
                  <Text mt={2}>
                    <strong>Key Responsibilities:</strong>
                  </Text>
                  <UnorderedList>
                    <ListItem>Evaluate research papers objectively</ListItem>
                    <ListItem>Provide constructive feedback</ListItem>
                    <ListItem>Identify methodological issues or errors</ListItem>
                    <ListItem>Recommend acceptance, revision, or rejection</ListItem>
                  </UnorderedList>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Heading as="h3" size="md">Editors</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Text>
                    Editors oversee the peer review process and make final decisions on manuscript acceptance. 
                    They ensure that all published content meets the platform's standards for quality and 
                    relevance.
                  </Text>
                  <Text mt={2}>
                    <strong>Key Responsibilities:</strong>
                  </Text>
                  <UnorderedList>
                    <ListItem>Manage the peer review process</ListItem>
                    <ListItem>Select appropriate reviewers</ListItem>
                    <ListItem>Make final publication decisions</ListItem>
                    <ListItem>Maintain academic standards</ListItem>
                  </UnorderedList>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Heading as="h3" size="md">Validators</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Text>
                    Validators are participants who help secure the RESEARKA blockchain network by validating 
                    transactions and maintaining consensus. They play a crucial role in ensuring the integrity 
                    and immutability of published research.
                  </Text>
                  <Text mt={2}>
                    <strong>Key Responsibilities:</strong>
                  </Text>
                  <UnorderedList>
                    <ListItem>Validate transactions on the blockchain</ListItem>
                    <ListItem>Maintain network consensus</ListItem>
                    <ListItem>Secure the decentralized infrastructure</ListItem>
                    <ListItem>Participate in governance decisions</ListItem>
                  </UnorderedList>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Heading as="h3" size="md">Readers</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Text>
                    Readers are the consumers of content on RESEARKA. They access, read, and cite published 
                    research. Readers benefit from open access to cutting-edge research and can provide 
                    feedback through comments and discussions.
                  </Text>
                  <Text mt={2}>
                    <strong>Key Responsibilities:</strong>
                  </Text>
                  <UnorderedList>
                    <ListItem>Access and read published research</ListItem>
                    <ListItem>Provide feedback through comments</ListItem>
                    <ListItem>Share and cite valuable research</ListItem>
                    <ListItem>Contribute to academic discussions</ListItem>
                  </UnorderedList>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        </Container>
      </Box>
    </Layout>
  );
};

export default RolesPage;
