import React, { useState, useEffect } from 'react';
import { Box, Container, Heading, Text, Select, Button, Flex, Badge, Divider, VStack, HStack, Stat, StatLabel, StatNumber, StatHelpText, Grid, GridItem } from '@chakra-ui/react';
import { TEST_USERS, testRecommendationsForUser } from '../utils/testRecommendationEngine';
import { EnhancedRecommendationResult } from '../utils/recommendationEngine';

// Icons for recommendation types
const getRecommendationIcon = (type: string) => {
  switch (type) {
    case 'interest': return '🎯';
    case 'needs_reviews': return '📝';
    case 'oldest': return '⏳';
    case 'trending': return '🔥';
    default: return '📊';
  }
};

// Badge color for article status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted': return 'green';
    case 'under_review': return 'yellow';
    case 'pending': return 'gray';
    case 'rejected': return 'red';
    default: return 'blue';
  }
};

const TestRecommendationsPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string>(TEST_USERS[0].id);
  const [recommendationLimit, setRecommendationLimit] = useState<number>(10);
  const [results, setResults] = useState<EnhancedRecommendationResult[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState(TEST_USERS[0]);

  // Run test when user or limit changes
  const runTest = () => {
    const user = TEST_USERS.find(u => u.id === selectedUserId) || TEST_USERS[0];
    setSelectedUser(user);
    const testResults = testRecommendationsForUser(user, recommendationLimit);
    setResults(testResults.recommendations);
    setStats(testResults.stats);
  };

  // Run initial test on component mount
  useEffect(() => {
    runTest();
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={6}>Recommendation Engine Test</Heading>
      
      <Box mb={8} p={4} borderWidth="1px" borderRadius="lg">
        <Heading as="h2" size="md" mb={4}>Test Configuration</Heading>
        
        <Grid templateColumns="repeat(12, 1fr)" gap={4}>
          <GridItem colSpan={[12, 6, 5]}>
            <Text mb={2}>Select User Profile:</Text>
            <Select 
              value={selectedUserId} 
              onChange={(e) => setSelectedUserId(e.target.value)}
              mb={4}
            >
              {TEST_USERS.map(user => (
                <option key={user.id} value={user.id}>
                  {user.id}
                </option>
              ))}
            </Select>
          </GridItem>
          
          <GridItem colSpan={[12, 6, 4]}>
            <Text mb={2}>Number of Recommendations:</Text>
            <Select 
              value={recommendationLimit.toString()} 
              onChange={(e) => setRecommendationLimit(parseInt(e.target.value))}
              mb={4}
            >
              {[5, 10, 15, 20, 30, 50].map(num => (
                <option key={num} value={num.toString()}>
                  {num}
                </option>
              ))}
            </Select>
          </GridItem>
          
          <GridItem colSpan={[12, 12, 3]} alignSelf="end">
            <Button colorScheme="blue" onClick={runTest} width="full">
              Run Test
            </Button>
          </GridItem>
        </Grid>
      </Box>
      
      {selectedUser && (
        <Box mb={8} p={4} borderWidth="1px" borderRadius="lg">
          <Heading as="h2" size="md" mb={4}>User Profile</Heading>
          <Text><strong>ID:</strong> {selectedUser.id}</Text>
          <Text mb={2}><strong>Research Interests:</strong></Text>
          <Flex flexWrap="wrap" gap={2} mb={4}>
            {selectedUser.researchInterests.map(interest => (
              <Badge key={interest} colorScheme="purple" px={2} py={1} borderRadius="md">
                {interest}
              </Badge>
            ))}
          </Flex>
        </Box>
      )}
      
      {stats && (
        <Box mb={8} p={4} borderWidth="1px" borderRadius="lg">
          <Heading as="h2" size="md" mb={4}>Recommendation Statistics</Heading>
          
          <Grid templateColumns="repeat(12, 1fr)" gap={6}>
            <GridItem colSpan={[12, 6, 3]}>
              <Stat>
                <StatLabel>Total Recommendations</StatLabel>
                <StatNumber>{stats.totalRecommendations}</StatNumber>
              </Stat>
            </GridItem>
            
            <GridItem colSpan={[12, 6, 9]}>
              <Text mb={2}><strong>By Recommendation Type:</strong></Text>
              <Flex flexWrap="wrap" gap={3}>
                {Object.entries(stats.byRecommendationType).map(([type, count]) => (
                  <Badge key={type} colorScheme="blue" px={2} py={1} borderRadius="md">
                    {getRecommendationIcon(type)} {type}: {count}
                  </Badge>
                ))}
              </Flex>
            </GridItem>
            
            <GridItem colSpan={[12, 6, 6]}>
              <Text mb={2}><strong>By Category:</strong></Text>
              <Flex flexWrap="wrap" gap={2}>
                {Object.entries(stats.byCategory).map(([category, count]) => (
                  <Badge key={category} colorScheme="teal" px={2} py={1} borderRadius="md">
                    {category}: {count}
                  </Badge>
                ))}
              </Flex>
            </GridItem>
            
            <GridItem colSpan={[12, 6, 6]}>
              <Text mb={2}><strong>By Status:</strong></Text>
              <Flex flexWrap="wrap" gap={2}>
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <Badge key={status} colorScheme={getStatusColor(status)} px={2} py={1} borderRadius="md">
                    {status.replace('_', ' ')}: {count}
                  </Badge>
                ))}
              </Flex>
            </GridItem>
          </Grid>
        </Box>
      )}
      
      <Box p={4} borderWidth="1px" borderRadius="lg">
        <Heading as="h2" size="md" mb={4}>Recommendations</Heading>
        
        <VStack spacing={4} align="stretch">
          {results.map((recommendation, index) => (
            <Box 
              key={recommendation.article.id} 
              p={4} 
              borderWidth="1px" 
              borderRadius="md"
              borderLeftWidth="4px"
              borderLeftColor={getStatusColor(recommendation.article.status)}
            >
              <Flex justifyContent="space-between" alignItems="center" mb={2}>
                <Badge colorScheme="blue" px={2} py={1} borderRadius="md">
                  {getRecommendationIcon(recommendation.matchType)} {recommendation.matchType}
                </Badge>
                <Badge colorScheme={getStatusColor(recommendation.article.status)}>
                  {recommendation.article.status.replace('_', ' ')}
                </Badge>
              </Flex>
              
              <Heading as="h3" size="sm" mb={1}>
                {index + 1}. {recommendation.article.title}
              </Heading>
              
              <HStack spacing={4} mb={2}>
                <Text fontSize="sm" color="gray.500">Views: {recommendation.article.views}</Text>
                <Text fontSize="sm" color="gray.500">Citations: {recommendation.article.citations}</Text>
                <Text fontSize="sm" color="gray.500">Reviews: {recommendation.article.reviewCount}/2</Text>
              </HStack>
              
              <Text fontSize="sm" noOfLines={2} mb={2}>
                {recommendation.article.abstract}
              </Text>
              
              <Flex flexWrap="wrap" gap={2}>
                {recommendation.article.categories.map(category => (
                  <Badge key={category} colorScheme="teal" variant="outline" fontSize="xs">
                    {category}
                  </Badge>
                ))}
                {recommendation.article.keywords.map(keyword => (
                  <Badge key={keyword} colorScheme="purple" variant="outline" fontSize="xs">
                    {keyword}
                  </Badge>
                ))}
              </Flex>
              
              {recommendation.matchReason && (
                <Text fontSize="xs" mt={2} color="gray.600">
                  Match reason: {recommendation.matchReason}
                </Text>
              )}
            </Box>
          ))}
          
          {results.length === 0 && (
            <Box p={4} textAlign="center">
              <Text>No recommendations generated. Try adjusting the parameters.</Text>
            </Box>
          )}
        </VStack>
      </Box>
    </Container>
  );
};

export default TestRecommendationsPage;
