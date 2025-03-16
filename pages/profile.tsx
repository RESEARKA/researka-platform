import React from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Flex,
  Heading,
  Text,
  VStack,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Avatar,
  Badge,
  Divider,
  useColorModeValue,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { FiEdit, FiFileText, FiStar, FiSettings, FiBookmark, FiChevronDown } from 'react-icons/fi';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '../components/NavBar';

const ProfilePage: React.FC = () => {
  // In a real app, you would fetch this data from your API
  const user = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    role: 'Researcher',
    institution: 'University of Science & Technology',
    bio: 'PhD in Computer Science with focus on distributed systems and blockchain technology. Published 15+ papers in peer-reviewed journals.',
    joinDate: 'March 2024',
    articles: 5,
    reviews: 12,
    reputation: 87,
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <>
      <Head>
        <title>Profile | Researka</title>
        <meta name="description" content="Your Researka profile" />
      </Head>
      
      {/* Header/Navigation */}
      <NavBar 
        activePage="profile"
        isLoggedIn={true}
      />
      
      <Box py={8} bg="gray.50" minH="calc(100vh - 64px)">
        <Container maxW="container.lg">
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            gap={8}
          >
            {/* Profile Sidebar */}
            <Box 
              w={{ base: '100%', md: '30%' }}
              bg={bgColor}
              p={6}
              borderRadius="lg"
              boxShadow="sm"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <VStack spacing={6} align="center">
                <Avatar size="2xl" name={user.name} />
                <VStack spacing={1}>
                  <Heading as="h2" size="md">{user.name}</Heading>
                  <Text color="gray.600">{user.role}</Text>
                  <Badge colorScheme="green" mt={1}>{user.institution}</Badge>
                </VStack>
                
                <Divider />
                
                <SimpleGrid columns={3} width="100%" spacing={4} textAlign="center">
                  <Stat>
                    <StatNumber>{user.articles}</StatNumber>
                    <StatLabel fontSize="xs">Articles</StatLabel>
                  </Stat>
                  <Stat>
                    <StatNumber>{user.reviews}</StatNumber>
                    <StatLabel fontSize="xs">Reviews</StatLabel>
                  </Stat>
                  <Stat>
                    <StatNumber>{user.reputation}</StatNumber>
                    <StatLabel fontSize="xs">Rep</StatLabel>
                  </Stat>
                </SimpleGrid>
                
                <Divider />
                
                <VStack width="100%" align="stretch" spacing={3}>
                  <Button leftIcon={<FiEdit />} size="sm" variant="outline">
                    Edit Profile
                  </Button>
                  <Button leftIcon={<FiSettings />} size="sm" variant="outline">
                    Account Settings
                  </Button>
                </VStack>
              </VStack>
            </Box>
            
            {/* Main Content */}
            <Box 
              w={{ base: '100%', md: '70%' }}
              bg={bgColor}
              borderRadius="lg"
              boxShadow="sm"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Tabs isFitted variant="enclosed">
                <TabList>
                  <Tab><Flex><FiFileText /><Text>My Articles</Text></Flex></Tab>
                  <Tab><Flex><FiStar /><Text>My Reviews</Text></Flex></Tab>
                  <Tab><Flex><FiBookmark /><Text>Saved</Text></Flex></Tab>
                </TabList>
                
                <TabPanels>
                  {/* My Articles Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      {[1, 2, 3].map((item) => (
                        <Card key={item}>
                          <CardHeader>
                            <Heading size="md">Blockchain Applications in Academic Publishing</Heading>
                          </CardHeader>
                          <CardBody>
                            <Text>A comprehensive analysis of how blockchain technology can transform the academic publishing industry by improving transparency, reducing costs, and enabling new incentive models.</Text>
                          </CardBody>
                          <CardFooter>
                            <Flex justify="space-between" width="100%">
                              <Badge colorScheme="green">Published</Badge>
                              <Text fontSize="sm" color="gray.500">March 10, 2025</Text>
                            </Flex>
                          </CardFooter>
                        </Card>
                      ))}
                      
                      <Button colorScheme="green" leftIcon={<FiFileText />} alignSelf="center" mt={4}>
                        Submit New Article
                      </Button>
                    </VStack>
                  </TabPanel>
                  
                  {/* My Reviews Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      {[1, 2, 3, 4].map((item) => (
                        <Card key={item}>
                          <CardHeader>
                            <Heading size="md">Review: Decentralized Identity in Academic Credentials</Heading>
                          </CardHeader>
                          <CardBody>
                            <Text>You provided a peer review for this article on March 5, 2025.</Text>
                          </CardBody>
                          <CardFooter>
                            <Flex justify="space-between" width="100%">
                              <Badge colorScheme="blue">Completed</Badge>
                              <Text fontSize="sm" color="gray.500">March 5, 2025</Text>
                            </Flex>
                          </CardFooter>
                        </Card>
                      ))}
                      
                      <Button colorScheme="green" leftIcon={<FiStar />} alignSelf="center" mt={4}>
                        Find Articles to Review
                      </Button>
                    </VStack>
                  </TabPanel>
                  
                  {/* Saved Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      {[1, 2].map((item) => (
                        <Card key={item}>
                          <CardHeader>
                            <Heading size="md">The Future of Decentralized Science</Heading>
                          </CardHeader>
                          <CardBody>
                            <Text>An exploration of how decentralized technologies are reshaping scientific research, funding, and collaboration.</Text>
                          </CardBody>
                          <CardFooter>
                            <Flex justify="space-between" width="100%">
                              <Badge>Saved</Badge>
                              <Text fontSize="sm" color="gray.500">Saved on March 12, 2025</Text>
                            </Flex>
                          </CardFooter>
                        </Card>
                      ))}
                      
                      <Button colorScheme="green" leftIcon={<FiBookmark />} alignSelf="center" mt={4}>
                        Browse Articles
                      </Button>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </Flex>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box py={6} bg="white" borderTop="1px" borderColor="gray.200">
        <Container maxW="container.xl">
          <Flex justify="center" align="center" direction="column">
            <Text fontSize="sm" color="gray.500">
              &copy; {new Date().getFullYear()} Researka Platform. All rights reserved.
            </Text>
            <Text fontSize="xs" color="gray.400" mt={1}>
              A decentralized academic publishing solution built on zkSync
            </Text>
          </Flex>
        </Container>
      </Box>
    </>
  );
};

export default ProfilePage;
