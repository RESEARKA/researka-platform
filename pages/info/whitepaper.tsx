import React from 'react';
import Head from 'next/head';
import { Box, Container, Heading, Text, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Flex } from '@chakra-ui/react';
import Link from 'next/link';

const WhitepaperPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Whitepaper | RESEARKA</title>
        <meta name="description" content="RESEARKA Whitepaper - The technical foundation of our decentralized academic publishing platform" />
      </Head>

      <Box py={8}>
        <Container maxW="container.xl">
          <Breadcrumb mb={6}>
            <BreadcrumbItem>
              <BreadcrumbLink as="a" href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Whitepaper</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <VStack spacing={8} align="start">
            <Heading as="h1" size="xl">RESEARKA Whitepaper</Heading>
            
            <Text fontSize="lg">
              The RESEARKA Whitepaper outlines our vision, technology, and implementation plan for 
              revolutionizing academic publishing through blockchain technology. This document serves 
              as the technical foundation for our platform.
            </Text>
            
            <Flex justifyContent="center" width="100%" my={4}>
              <Button colorScheme="blue" size="lg">Download Whitepaper (PDF)</Button>
            </Flex>
            
            <Heading as="h2" size="lg">Executive Summary</Heading>
            <Text>
              RESEARKA is a decentralized academic publishing platform built on blockchain technology. 
              It aims to address the key challenges in traditional academic publishing, including high costs, 
              limited access, slow publication processes, and centralized control of intellectual property.
            </Text>
            
            <Heading as="h2" size="lg">Problem Statement</Heading>
            <Text>
              The current academic publishing landscape is dominated by a few large publishers who charge 
              high fees for access to research, while providing minimal compensation to authors. This creates 
              barriers to knowledge sharing and slows scientific progress. Additionally, the peer review 
              process lacks transparency and recognition for reviewers' contributions.
            </Text>
            
            <Heading as="h2" size="lg">Technical Architecture</Heading>
            <Text>
              RESEARKA utilizes a hybrid blockchain architecture combining the security of established 
              blockchain networks with the scalability needed for academic publishing. Our platform 
              implements smart contracts for managing peer review, publication, and compensation processes. 
              Content is stored using a distributed file system with cryptographic verification to ensure 
              integrity and permanence.
            </Text>
            
            <Heading as="h2" size="lg">Token Economics</Heading>
            <Text>
              The RESEARKA ecosystem is powered by the RSKA token, which serves multiple functions:
              <br /><br />
              • Access Control: Readers can use tokens to access paywalled content<br />
              • Author Compensation: Authors receive tokens when their work is accessed or cited<br />
              • Reviewer Incentives: Peer reviewers are rewarded with tokens for their contributions<br />
              • Governance: Token holders can participate in platform governance decisions<br />
              • Staking: Validators stake tokens to secure the network
            </Text>
            
            <Heading as="h2" size="lg">Roadmap</Heading>
            <Text>
              Our development roadmap outlines the key milestones in building and scaling the RESEARKA platform:
              <br /><br />
              • Phase 1 (Completed): Concept development and initial technical architecture<br />
              • Phase 2 (Current): Beta platform launch with core functionality<br />
              • Phase 3 (2025 Q3): Full platform launch with token economics implementation<br />
              • Phase 4 (2026): Integration with academic institutions and expansion of features<br />
              • Phase 5 (2026-2027): Scaling to global adoption and community governance
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default WhitepaperPage;
