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
  SkeletonCircle,
  SkeletonText,
  useColorModeValue,
  Icon,
  HStack,
  Tooltip,
} from '@chakra-ui/react';
import { FiInfo, FiUser, FiClock } from 'react-icons/fi';
import { getReviewsForArticle } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';

interface ArticleReviewersProps {
  articleId: string;
  limit?: number;
}

interface ReviewerProfile {
  id: string;
  name: string;
  institution?: string;
  avatar?: string;
  researchInterests?: string[];
}

const ArticleReviewers: React.FC<ArticleReviewersProps> = ({ articleId, limit = 3 }) => {
  const [reviewers, setReviewers] = useState<ReviewerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getUserProfile } = useAuth();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        setIsLoading(true);
        
        // Fetch reviews for this article
        const reviews = await getReviewsForArticle(articleId);
        
        if (!reviews || reviews.length === 0) {
          setReviewers([]);
          setIsLoading(false);
          return;
        }
        
        // Get unique reviewer IDs
        const uniqueReviewerIds = Array.from(new Set(reviews.map(review => review.reviewerId)));
        
        // Limit the number of reviewers if specified
        const limitedReviewerIds = limit ? uniqueReviewerIds.slice(0, limit) : uniqueReviewerIds;
        
        // Fetch profiles for each reviewer
        const reviewerProfiles = await Promise.all(
          limitedReviewerIds.map(async (reviewerId) => {
            try {
              const profile = await getUserProfile(reviewerId);
              
              if (!profile) {
                // If profile not found, use basic info from review
                const review = reviews.find(r => r.reviewerId === reviewerId);
                return {
                  id: reviewerId,
                  name: review?.reviewerName || 'Anonymous Reviewer',
                  institution: 'Unknown Institution',
                  researchInterests: [],
                };
              }
              
              // Convert researchInterests to array if it's a string
              let interests: string[] = [];
              if (profile.researchInterests) {
                interests = typeof profile.researchInterests === 'string'
                  ? profile.researchInterests.split(',').map(i => i.trim())
                  : profile.researchInterests;
              }
              
              return {
                id: reviewerId,
                name: profile.name || profile.displayName || 'Anonymous Reviewer',
                institution: profile.institution || 'Unknown Institution',
                avatar: profile.avatarUrl || profile.photoURL,
                researchInterests: interests,
              };
            } catch (error) {
              console.error('Error fetching reviewer profile:', error);
              // Return basic profile if there's an error
              const review = reviews.find(r => r.reviewerId === reviewerId);
              return {
                id: reviewerId,
                name: review?.reviewerName || 'Anonymous Reviewer',
                institution: 'Unknown Institution',
                researchInterests: [],
              };
            }
          })
        );
        
        setReviewers(reviewerProfiles);
      } catch (error) {
        console.error('Error fetching reviewers:', error);
        // Don't set error state, just leave reviewers empty
        setReviewers([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviewers();
  }, [articleId, getUserProfile, limit]);
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h2" size="md">
          Article Reviewers
        </Heading>
        <Tooltip label="These are the reviewers who have evaluated this article">
          <Box display="inline-flex" alignItems="center">
            <Icon as={FiInfo} mr={1} />
            <Text fontSize="sm" color="gray.500">Who reviewed this?</Text>
          </Box>
        </Tooltip>
      </Flex>
      
      {isLoading ? (
        <VStack spacing={4} align="stretch">
          {[...Array(2)].map((_, index: number) => (
            <Card key={index} bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="sm">
              <CardHeader>
                <Flex>
                  <SkeletonCircle size="12" mr={4} />
                  <Box flex="1">
                    <SkeletonText noOfLines={2} spacing="2" />
                  </Box>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                <Flex align="center" justify="center" py={4}>
                  <Icon as={FiClock} size="24px" color="gray.500" />
                  <Text fontSize="sm" color="gray.500" ml={2}>Loading...</Text>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </VStack>
      ) : reviewers.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {reviewers.map((reviewer: ReviewerProfile) => (
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
                      <Badge size="sm" colorScheme="blue">
                        <Flex align="center">
                          <Icon as={FiUser} mr={1} />
                          Reviewer
                        </Flex>
                      </Badge>
                    </HStack>
                  </Box>
                </Flex>
              </CardHeader>
              {reviewer.researchInterests && reviewer.researchInterests.length > 0 && (
                <CardBody pt={0}>
                  <Box mb={3}>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                      Research Interests:
                    </Text>
                    <Flex gap={2} flexWrap="wrap">
                      {reviewer.researchInterests.map((interest: string, index: number) => (
                        <Badge key={index} colorScheme="green" variant="subtle">
                          {interest}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                </CardBody>
              )}
            </Card>
          ))}
        </VStack>
      ) : (
        <Box textAlign="center" py={6} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
          <Flex direction="column" align="center" justify="center">
            <Icon as={FiClock} boxSize="24px" color="blue.500" mb={2} />
            <Text color="gray.600" fontWeight="medium">Pending Review</Text>
            <Text color="gray.500" fontSize="sm" mt={1}>
              This article is waiting for reviewers to evaluate it.
            </Text>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default ArticleReviewers;
