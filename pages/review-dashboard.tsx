import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Badge,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Divider,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiFileText, FiClock, FiCheck, FiAward, FiDollarSign } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

// Mock data for reviews
const availableReviews = [
  {
    id: '1',
    title: 'Advances in Quantum Computing: A New Paradigm',
    category: 'Technology & Engineering',
    submittedDate: '2023-04-15',
    deadline: '2023-05-15',
    reward: 50,
  },
  {
    id: '2',
    title: 'Novel Approaches to Climate Change Mitigation',
    category: 'Environmental Science',
    submittedDate: '2023-04-10',
    deadline: '2023-05-10',
    reward: 50,
  },
  {
    id: '3',
    title: 'The Impact of Social Media on Mental Health',
    category: 'Social Sciences',
    submittedDate: '2023-04-05',
    deadline: '2023-05-05',
    reward: 50,
  },
];

const inProgressReviews = [
  {
    id: '4',
    title: 'Blockchain Applications in Supply Chain Management',
    category: 'Technology & Engineering',
    submittedDate: '2023-03-20',
    deadline: '2023-04-20',
    progress: 60,
    reward: 50,
  },
];

const completedReviews = [
  {
    id: '5',
    title: 'Machine Learning in Healthcare: Ethical Considerations',
    category: 'Life Sciences & Biomedicine',
    submittedDate: '2023-02-10',
    completedDate: '2023-03-05',
    reward: 50,
  },
  {
    id: '6',
    title: 'Sustainable Urban Planning in Developing Countries',
    category: 'Social Sciences',
    submittedDate: '2023-01-15',
    completedDate: '2023-02-10',
    reward: 50,
  },
];

export default function ReviewDashboard() {
  const router = useRouter();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalReviews: 0,
    tokensEarned: 0,
    pendingReviews: 0,
    completionRate: 0,
  });

  // Redirect if not authenticated
  if (typeof window !== 'undefined' && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  // Calculate stats
  useEffect(() => {
    const total = completedReviews.length;
    const tokensEarned = completedReviews.reduce((sum, review) => sum + review.reward, 0);
    const pending = inProgressReviews.length;
    const completionRate = total > 0 ? Math.round((total / (total + pending)) * 100) : 0;

    setStats({
      totalReviews: total,
      tokensEarned,
      pendingReviews: pending,
      completionRate,
    });
  }, []);

  const handleClaimReview = (reviewId: string) => {
    toast({
      title: 'Review claimed',
      description: 'The review has been added to your in-progress list.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleContinueReview = (reviewId: string) => {
    router.push(`/review/${reviewId}`);
  };

  const cardBg = useColorModeValue('white', 'gray.700');
  const statCardBg = useColorModeValue('green.50', 'green.900');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2}>Peer Review Dashboard</Heading>
          <Text color="gray.600">Contribute to academic quality and earn rewards</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Stat
            px={4}
            py={5}
            bg={statCardBg}
            borderRadius="lg"
            boxShadow="md"
          >
            <StatLabel fontWeight="medium">Completed Reviews</StatLabel>
            <StatNumber fontSize="3xl">{stats.totalReviews}</StatNumber>
            <StatHelpText>
              <Flex align="center">
                <Icon as={FiCheck} mr={1} />
                Finished
              </Flex>
            </StatHelpText>
          </Stat>
          
          <Stat
            px={4}
            py={5}
            bg={statCardBg}
            borderRadius="lg"
            boxShadow="md"
          >
            <StatLabel fontWeight="medium">Tokens Earned</StatLabel>
            <StatNumber fontSize="3xl">{stats.tokensEarned}</StatNumber>
            <StatHelpText>
              <Flex align="center">
                <Icon as={FiDollarSign} mr={1} />
                RSKA
              </Flex>
            </StatHelpText>
          </Stat>
          
          <Stat
            px={4}
            py={5}
            bg={statCardBg}
            borderRadius="lg"
            boxShadow="md"
          >
            <StatLabel fontWeight="medium">Pending Reviews</StatLabel>
            <StatNumber fontSize="3xl">{stats.pendingReviews}</StatNumber>
            <StatHelpText>
              <Flex align="center">
                <Icon as={FiClock} mr={1} />
                In Progress
              </Flex>
            </StatHelpText>
          </Stat>
          
          <Stat
            px={4}
            py={5}
            bg={statCardBg}
            borderRadius="lg"
            boxShadow="md"
          >
            <StatLabel fontWeight="medium">Completion Rate</StatLabel>
            <StatNumber fontSize="3xl">{stats.completionRate}%</StatNumber>
            <StatHelpText>
              <Flex align="center">
                <Icon as={FiAward} mr={1} />
                Efficiency
              </Flex>
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        <Tabs colorScheme="green" variant="enclosed">
          <TabList>
            <Tab>Available Reviews</Tab>
            <Tab>In Progress</Tab>
            <Tab>Completed</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pt={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {availableReviews.map((review) => (
                  <Card key={review.id} bg={cardBg} boxShadow="md" borderRadius="lg">
                    <CardHeader pb={2}>
                      <Heading size="md" noOfLines={2}>{review.title}</Heading>
                    </CardHeader>
                    <CardBody py={2}>
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <Badge colorScheme="green">{review.category}</Badge>
                          <Badge colorScheme="blue">50 RSKA</Badge>
                        </HStack>
                        <Text fontSize="sm">Submitted: {review.submittedDate}</Text>
                        <Text fontSize="sm">Deadline: {review.deadline}</Text>
                      </VStack>
                    </CardBody>
                    <CardFooter pt={0}>
                      <Button 
                        colorScheme="green" 
                        leftIcon={<FiFileText />}
                        onClick={() => handleClaimReview(review.id)}
                        width="full"
                      >
                        Claim Review
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>

            <TabPanel p={0} pt={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {inProgressReviews.map((review) => (
                  <Card key={review.id} bg={cardBg} boxShadow="md" borderRadius="lg">
                    <CardHeader pb={2}>
                      <Heading size="md" noOfLines={2}>{review.title}</Heading>
                    </CardHeader>
                    <CardBody py={2}>
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <Badge colorScheme="green">{review.category}</Badge>
                          <Badge colorScheme="blue">50 RSKA</Badge>
                        </HStack>
                        <Text fontSize="sm">Progress: {review.progress}%</Text>
                        <Text fontSize="sm">Deadline: {review.deadline}</Text>
                      </VStack>
                    </CardBody>
                    <CardFooter pt={0}>
                      <Button 
                        colorScheme="green" 
                        leftIcon={<FiClock />}
                        onClick={() => handleContinueReview(review.id)}
                        width="full"
                      >
                        Continue Review
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                {inProgressReviews.length === 0 && (
                  <Box p={4} textAlign="center" width="100%">
                    <Text>You have no reviews in progress.</Text>
                  </Box>
                )}
              </SimpleGrid>
            </TabPanel>

            <TabPanel p={0} pt={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {completedReviews.map((review) => (
                  <Card key={review.id} bg={cardBg} boxShadow="md" borderRadius="lg">
                    <CardHeader pb={2}>
                      <Heading size="md" noOfLines={2}>{review.title}</Heading>
                    </CardHeader>
                    <CardBody py={2}>
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <Badge colorScheme="green">{review.category}</Badge>
                          <Badge colorScheme="purple">Earned: {review.reward} RSKA</Badge>
                        </HStack>
                        <Text fontSize="sm">Submitted: {review.submittedDate}</Text>
                        <Text fontSize="sm">Completed: {review.completedDate}</Text>
                      </VStack>
                    </CardBody>
                    <CardFooter pt={0}>
                      <Button 
                        colorScheme="gray" 
                        leftIcon={<FiFileText />}
                        onClick={() => router.push(`/review/view/${review.id}`)}
                        width="full"
                      >
                        View Review
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
}
