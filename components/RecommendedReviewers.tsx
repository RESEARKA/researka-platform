import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Flex,
  Badge,
  Button,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  useColorModeValue,
  Icon,
  HStack,
  Tooltip,
  Progress,
  Tag,
  TagLeftIcon,
  TagLabel,
} from '@chakra-ui/react';
import { FiInfo, FiStar, FiUser } from 'react-icons/fi';
import { findReviewersForArticle, Article } from '../utils/recommendationEngine';
import { getAllResearchFields } from '../utils/researchTaxonomy';

// Mock users for demonstration
const MOCK_USERS = [
  {
    id: 'user1',
    name: 'Dr. Emma Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    institution: 'Stanford University',
    researchInterests: ['quantum-computing', 'artificial-intelligence', 'algorithms'],
    reviewCount: 12,
    rating: 4.8,
  },
  {
    id: 'user2',
    name: 'Prof. Michael Chen',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    institution: 'MIT',
    researchInterests: ['machine-learning', 'data-science', 'neural-networks'],
    reviewCount: 27,
    rating: 4.9,
  },
  {
    id: 'user3',
    name: 'Dr. Sarah Williams',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    institution: 'University of California, Berkeley',
    researchInterests: ['blockchain', 'distributed-systems', 'cryptography'],
    reviewCount: 8,
    rating: 4.5,
  },
  {
    id: 'user4',
    name: 'Prof. David Kim',
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
    institution: 'Harvard University',
    researchInterests: ['genetics', 'molecular-biology', 'bioinformatics'],
    reviewCount: 19,
    rating: 4.7,
  },
  {
    id: 'user5',
    name: 'Dr. Jessica Martinez',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    institution: 'University of Oxford',
    researchInterests: ['neuroscience', 'cognitive-psychology', 'brain-imaging'],
    reviewCount: 15,
    rating: 4.6,
  },
  {
    id: 'user6',
    name: 'Prof. Robert Taylor',
    avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
    institution: 'ETH Zurich',
    researchInterests: ['climate-change', 'environmental-science', 'sustainability'],
    reviewCount: 23,
    rating: 4.8,
  },
  {
    id: 'user7',
    name: 'Dr. Lisa Brown',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    institution: 'University of Cambridge',
    researchInterests: ['artificial-intelligence', 'ethics', 'human-computer-interaction'],
    reviewCount: 11,
    rating: 4.7,
  },
  {
    id: 'user8',
    name: 'Prof. James Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
    institution: 'California Institute of Technology',
    researchInterests: ['quantum-physics', 'theoretical-physics', 'astrophysics'],
    reviewCount: 31,
    rating: 4.9,
  },
  {
    id: 'user9',
    name: 'Dr. Emily Davis',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    institution: 'University of Tokyo',
    researchInterests: ['robotics', 'computer-vision', 'machine-learning'],
    reviewCount: 14,
    rating: 4.6,
  },
  {
    id: 'user10',
    name: 'Prof. Thomas Anderson',
    avatar: 'https://randomuser.me/api/portraits/men/91.jpg',
    institution: 'Princeton University',
    researchInterests: ['renewable-energy', 'materials-science', 'nanotechnology'],
    reviewCount: 22,
    rating: 4.8,
  }
];

interface RecommendedReviewersProps {
  article: Article;
  limit?: number;
  onInvite?: (reviewerId: string) => void;
}

const RecommendedReviewers: React.FC<RecommendedReviewersProps> = ({
  article,
  limit = 5,
  onInvite
}) => {
  const [recommendedReviewers, setRecommendedReviewers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allFields, setAllFields] = useState<Record<string, string>>({});
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    // In a real application, you would fetch users from an API
    // For now, we'll use mock data
    
    // Create a map of field IDs to their names for display
    const fields = getAllResearchFields();
    const fieldMap = fields.reduce((acc, field) => {
      acc[field.id] = field.name;
      return acc;
    }, {} as Record<string, string>);
    setAllFields(fieldMap);
    
    // Get reviewer recommendations
    const reviewers = findReviewersForArticle(article, MOCK_USERS, limit);
    
    // Simulate API delay
    setTimeout(() => {
      setRecommendedReviewers(reviewers.map(reviewer => {
        const user = MOCK_USERS.find(u => u.id === reviewer.userId);
        return {
          ...user,
          matchScore: reviewer.matchScore,
          interestOverlap: reviewer.interestOverlap
        };
      }));
      setIsLoading(false);
    }, 1000);
  }, [article, limit]);
  
  // Get readable name for a field ID
  const getFieldName = (fieldId: string) => {
    return allFields[fieldId] || fieldId;
  };
  
  const handleInvite = (reviewerId: string) => {
    if (onInvite) {
      onInvite(reviewerId);
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h2" size="md">
          Recommended Reviewers
        </Heading>
        <Tooltip label="Reviewers are recommended based on research interest overlap with the article">
          <Box display="inline-flex" alignItems="center">
            <Icon as={FiInfo} mr={1} />
            <Text fontSize="sm" color="gray.500">How are these selected?</Text>
          </Box>
        </Tooltip>
      </Flex>
      
      {isLoading ? (
        <VStack spacing={4} align="stretch">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="sm">
              <CardHeader>
                <Flex>
                  <SkeletonCircle size="12" mr={4} />
                  <Box flex="1">
                    <SkeletonText noOfLines={2} spacing="2" />
                  </Box>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                <SkeletonText mt={2} noOfLines={3} spacing="2" />
                <Flex mt={4} justify="flex-end">
                  <Skeleton height="30px" width="100px" />
                </Flex>
              </CardBody>
            </Card>
          ))}
        </VStack>
      ) : recommendedReviewers.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {recommendedReviewers.map((reviewer) => (
            <Card key={reviewer.id} bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="sm">
              <CardHeader pb={2}>
                <Flex>
                  <Avatar 
                    src={reviewer.avatar} 
                    name={reviewer.name} 
                    size="md" 
                    mr={4}
                  />
                  <Box>
                    <Heading as="h3" size="sm">
                      {reviewer.name}
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      {reviewer.institution}
                    </Text>
                    <HStack mt={1} spacing={2}>
                      <Tag size="sm" colorScheme="blue">
                        <TagLeftIcon as={FiUser} />
                        <TagLabel>{reviewer.reviewCount} reviews</TagLabel>
                      </Tag>
                      <Tooltip label={`${Math.round(reviewer.matchScore * 100)}% interest match`}>
                        <Tag size="sm" colorScheme={reviewer.matchScore > 0.7 ? "green" : reviewer.matchScore > 0.4 ? "blue" : "gray"}>
                          <TagLeftIcon as={FiStar} />
                          <TagLabel>{Math.round(reviewer.matchScore * 100)}% match</TagLabel>
                        </Tag>
                      </Tooltip>
                    </HStack>
                  </Box>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                <Box mb={3}>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>
                    Matching Research Interests:
                  </Text>
                  <Flex gap={2} flexWrap="wrap">
                    {reviewer.interestOverlap.map((interest: string) => (
                      <Badge key={interest} colorScheme="green" variant="subtle">
                        {getFieldName(interest)}
                      </Badge>
                    ))}
                  </Flex>
                </Box>
                
                <Tooltip label={`${Math.round(reviewer.matchScore * 100)}% match with article`}>
                  <Box width="100%" mb={3}>
                    <Progress 
                      value={reviewer.matchScore * 100} 
                      size="xs" 
                      colorScheme={reviewer.matchScore > 0.7 ? "green" : reviewer.matchScore > 0.4 ? "blue" : "gray"}
                      borderRadius="full"
                    />
                  </Box>
                </Tooltip>
                
                <Flex justify="flex-end">
                  <Button 
                    size="sm" 
                    colorScheme="blue"
                    onClick={() => handleInvite(reviewer.id)}
                    title="This feature will be available in a future update"
                  >
                    Invite to Review
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </VStack>
      ) : (
        <Box textAlign="center" py={8}>
          <Text color="gray.500">No suitable reviewers found for this article.</Text>
        </Box>
      )}
    </Box>
  );
};

export default RecommendedReviewers;
