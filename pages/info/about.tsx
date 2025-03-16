import React from 'react';
import Head from 'next/head';
import { Box, Container, Heading, Text, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import Link from 'next/link';

const AboutPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>About | RESEARKA</title>
        <meta name="description" content="Learn about RESEARKA - a decentralized academic publishing platform" />
      </Head>

      <Box py={8}>
        <Container maxW="container.xl">
          <Breadcrumb mb={6}>
            <BreadcrumbItem>
              <BreadcrumbLink as="a" href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>About</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <VStack spacing={8} align="start">
            <Heading as="h1" size="xl">About RESEARKA</Heading>
            
            <Text fontSize="lg">
              RESEARKA is a revolutionary decentralized academic publishing platform powered by blockchain technology. 
              Our mission is to democratize academic research by providing an open, transparent, and accessible platform 
              for researchers worldwide.
            </Text>
            
            <Heading as="h2" size="lg">Our Vision</Heading>
            <Text>
              We envision a world where academic knowledge is freely accessible to all, where researchers have 
              full control over their intellectual property, and where the academic publishing process is transparent, 
              efficient, and fair.
            </Text>
            
            <Heading as="h2" size="lg">What We Do</Heading>
            <Text>
              RESEARKA leverages blockchain technology to create a decentralized platform for academic publishing. 
              Our platform allows researchers to publish their work directly, retain ownership of their intellectual 
              property, and receive fair compensation for their contributions.
            </Text>
            
            <Heading as="h2" size="lg">Our Values</Heading>
            <Text>
              <strong>Transparency:</strong> We believe in open and transparent processes in academic publishing.<br />
              <strong>Accessibility:</strong> We strive to make academic research accessible to everyone.<br />
              <strong>Innovation:</strong> We continuously innovate to improve the academic publishing experience.<br />
              <strong>Integrity:</strong> We uphold the highest standards of academic integrity and ethics.<br />
              <strong>Community:</strong> We foster a collaborative community of researchers, reviewers, and readers.
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default AboutPage;
