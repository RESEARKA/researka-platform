import React from 'react';
import Head from 'next/head';
import { Box, Container, Heading, Text, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react';
import Link from 'next/link';

const RolesPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Roles | RESEARKA</title>
        <meta name="description" content="Learn about the different roles in the RESEARKA ecosystem" />
      </Head>

      <Box py={8}>
        <Container maxW="container.xl">
          <Breadcrumb mb={6}>
            <BreadcrumbItem>
              <BreadcrumbLink as="a" href="/">Home</BreadcrumbLink>
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
                    <ul>
                      <li>Produce high-quality research content</li>
                      <li>Submit papers for peer review</li>
                      <li>Respond to reviewer feedback</li>
                      <li>Update and maintain their published works</li>
                    </ul>
                  </Text>
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
                    <ul>
                      <li>Evaluate research papers objectively</li>
                      <li>Provide constructive feedback</li>
                      <li>Identify methodological issues or errors</li>
                      <li>Recommend acceptance, revision, or rejection</li>
                    </ul>
                  </Text>
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
                    <ul>
                      <li>Manage the peer review process</li>
                      <li>Select appropriate reviewers</li>
                      <li>Make final publication decisions</li>
                      <li>Maintain academic standards</li>
                    </ul>
                  </Text>
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
                    <ul>
                      <li>Validate transactions on the blockchain</li>
                      <li>Maintain network consensus</li>
                      <li>Secure the decentralized infrastructure</li>
                      <li>Participate in governance decisions</li>
                    </ul>
                  </Text>
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
                    <ul>
                      <li>Access and read published research</li>
                      <li>Provide feedback through comments</li>
                      <li>Share and cite valuable research</li>
                      <li>Contribute to academic discussions</li>
                    </ul>
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default RolesPage;
