import React from 'react';
import { Box, Container, Heading, Text, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import Layout from '../../components/Layout';

const AboutPage: React.FC = () => {
  return (
    <Layout title="About | Researka" description="Learn about Researka's mission and vision">
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
              <BreadcrumbLink>About</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <VStack spacing={8} align="start">
            <Heading as="h1" size="xl">About Researka</Heading>
            
            <Text fontSize="lg">
              Researka is a decentralized platform revolutionizing how research is published, accessed, and evaluated.
              Our mission is to democratize knowledge and accelerate scientific progress through open collaboration.
            </Text>
            
            <Heading as="h2" size="lg">Our Vision</Heading>
            <Text>
              We envision a world where scientific knowledge is accessible to everyone, where researchers have full control over their work, 
              and where the scientific community collaboratively evaluates research based on merit rather than prestige.
            </Text>
            <Text mt={4}>
              By leveraging blockchain technology and decentralized governance, we're creating a transparent, 
              equitable, and efficient ecosystem for scientific communication that serves the global community.
            </Text>
            
            <Heading as="h2" size="lg">What We Do</Heading>
            <Text>
              Researka leverages blockchain technology to create a decentralized platform for academic publishing. 
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
    </Layout>
  );
};

export default AboutPage;
