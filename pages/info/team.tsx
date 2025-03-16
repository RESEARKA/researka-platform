import React from 'react';
import Head from 'next/head';
import { Box, Container, Heading, Text, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink, SimpleGrid, Image, Flex } from '@chakra-ui/react';
import Link from 'next/link';

// Team member data
const TEAM_MEMBERS = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'Founder & Chief Scientist',
    bio: 'Dr. Johnson is a renowned researcher in distributed systems with over 15 years of experience in academic publishing.',
    image: '/images/team/optimized/team-member-1.jpg'
  },
  {
    name: 'Michael Chen',
    role: 'Chief Technology Officer',
    bio: 'Michael leads our technical development with expertise in blockchain technology and decentralized applications.',
    image: '/images/team/optimized/team-member-2.jpg'
  },
  {
    name: 'Dr. Amara Okafor',
    role: 'Head of Research',
    bio: 'Dr. Okafor oversees our research initiatives and partnerships with academic institutions worldwide.',
    image: '/images/team/optimized/team-member-3.jpg'
  },
  {
    name: 'James Wilson',
    role: 'Chief Operating Officer',
    bio: 'James brings 20 years of experience in operations management to ensure smooth functioning of the platform.',
    image: '/images/team/optimized/team-member-4.jpg'
  },
  {
    name: 'Dr. Maria Rodriguez',
    role: 'Head of Community',
    bio: 'Dr. Rodriguez builds and nurtures our global community of researchers, reviewers, and readers.',
    image: '/images/team/optimized/team-member-5.jpg'
  }
];

const TeamPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Our Team | RESEARKA</title>
        <meta name="description" content="Meet the team behind RESEARKA - a decentralized academic publishing platform" />
      </Head>

      <Box py={8}>
        <Container maxW="container.xl">
          <Breadcrumb mb={6}>
            <BreadcrumbItem>
              <BreadcrumbLink as="a" href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Team</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <VStack spacing={8} align="start">
            <Heading as="h1" size="xl">Our Team</Heading>
            
            <Text fontSize="lg">
              RESEARKA is powered by a diverse team of experts in academic research, blockchain technology, 
              and publishing. Together, we're working to revolutionize academic publishing and make research 
              more accessible to all.
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} width="100%">
              {TEAM_MEMBERS.map((member, index) => (
                <Box 
                  key={index} 
                  p={5} 
                  shadow="md" 
                  borderWidth="1px" 
                  borderRadius="lg"
                  _hover={{ shadow: "lg", transform: "translateY(-5px)" }}
                  transition="all 0.3s"
                >
                  <Flex direction="column" align="center">
                    <Image
                      borderRadius="full"
                      boxSize="150px"
                      src={member.image}
                      alt={member.name}
                      mb={4}
                      fallbackSrc="https://via.placeholder.com/150"
                    />
                    <Heading as="h3" size="md" textAlign="center">{member.name}</Heading>
                    <Text color="gray.500" fontWeight="bold" mb={2} textAlign="center">{member.role}</Text>
                    <Text textAlign="center">{member.bio}</Text>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default TeamPage;
