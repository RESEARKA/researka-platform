import React from 'react';
import {
  Box,
  Heading,
  Text,
  Progress,
  Flex,
  Badge,
  HStack,
  VStack,
  Tooltip,
  Icon,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FiAlertCircle, 
  FiCheckCircle, 
  FiClock, 
  FiInfo, 
  FiUserCheck, 
  FiXCircle 
} from 'react-icons/fi';
import { Article } from '../utils/recommendationEngine';

interface ArticleReviewStatusProps {
  article: Article;
  reviews?: Array<{
    id: string;
    reviewerId: string;
    reviewerName: string;
    score: number;
    recommendation: 'accept' | 'minor_revisions' | 'major_revisions' | 'reject';
    createdAt: string;
  }>;
}

const ArticleReviewStatus: React.FC<ArticleReviewStatusProps> = ({
  article,
  reviews = []
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Calculate review progress
  const reviewsNeeded = 2;
  const reviewProgress = (reviews.length / reviewsNeeded) * 100;
  
  // Calculate average score (only if there are reviews)
  const totalScore = reviews.reduce((sum, review) => sum + review.score, 0);
  const averageScore = reviews.length > 0 ? totalScore / reviews.length : 0;
  
  // Determine if article passes review threshold (average score >= 3.0 with at least 2 reviews)
  const passesThreshold = averageScore >= 3.0 && reviews.length >= reviewsNeeded;
  
  // Get status display information
  const getStatusInfo = () => {
    // If all required reviews are received, show "Completed" status regardless of article.status
    if (reviews.length >= reviewsNeeded) {
      return {
        label: 'Completed',
        icon: FiCheckCircle,
        color: 'green',
        description: `This article has received all ${reviews.length} required reviews.`
      };
    }
    
    switch (article.status) {
      case 'pending':
        return {
          label: 'Pending Review',
          icon: FiClock,
          color: 'orange',
          description: 'This article is waiting for reviewers to be assigned.'
        };
      case 'under_review':
        return {
          label: 'Under Review',
          icon: FiUserCheck,
          color: 'blue',
          description: `This article has ${reviews.length} of ${reviewsNeeded} required reviews.`
        };
      case 'accepted':
        return {
          label: 'Accepted',
          icon: FiCheckCircle,
          color: 'green',
          description: 'This article has been accepted for publication.'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          icon: FiXCircle,
          color: 'red',
          description: 'This article has been rejected.'
        };
      default:
        return {
          label: 'Unknown Status',
          icon: FiInfo,
          color: 'gray',
          description: 'The status of this article is unknown.'
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  // Get recommendation display info
  const getRecommendationInfo = (recommendation: string) => {
    switch (recommendation) {
      case 'accept':
        return { label: 'Accept', color: 'green' };
      case 'minor_revisions':
        return { label: 'Minor Revisions', color: 'blue' };
      case 'major_revisions':
        return { label: 'Major Revisions', color: 'orange' };
      case 'reject':
        return { label: 'Reject', color: 'red' };
      default:
        return { label: 'Unknown', color: 'gray' };
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="sm">
      <CardHeader pb={2}>
        <Heading as="h3" size="md">
          Review Status
        </Heading>
      </CardHeader>
      <CardBody pt={2}>
        <VStack spacing={4} align="stretch">
          {/* Status Badge */}
          <Flex align="center" mb={2}>
            <Icon as={statusInfo.icon} color={`${statusInfo.color}.500`} mr={2} boxSize={5} />
            <Box>
              <Badge colorScheme={statusInfo.color} fontSize="sm">
                {statusInfo.label}
              </Badge>
              <Text fontSize="sm" color="gray.600" mt={1}>
                {statusInfo.description}
              </Text>
            </Box>
          </Flex>
          
          {/* Review Progress */}
          <Box>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="sm" fontWeight="medium">
                Review Progress
              </Text>
              <Text fontSize="sm" color="gray.600">
                {reviews.length} of {reviewsNeeded} reviews
              </Text>
            </Flex>
            <Progress 
              value={reviewProgress} 
              size="sm" 
              colorScheme={reviews.length >= reviewsNeeded ? "green" : "blue"}
              borderRadius="full"
              hasStripe={reviews.length < reviewsNeeded}
              isAnimated={reviews.length < reviewsNeeded}
            />
          </Box>
          
          {/* Average Score (only show if there are reviews) */}
          {reviews.length > 0 && (
            <Box>
              <Flex justify="space-between" mb={1}>
                <Text fontSize="sm" fontWeight="medium">
                  Average Score
                </Text>
                <HStack spacing={1}>
                  <Text fontSize="sm" fontWeight="bold" color={passesThreshold ? "green.500" : "gray.600"}>
                    {averageScore.toFixed(1)}
                  </Text>
                  <Text fontSize="sm" color="gray.600">/ 5.0</Text>
                  {reviews.length >= reviewsNeeded && (
                    <Tooltip label={passesThreshold ? "Meets publication threshold" : "Below publication threshold"}>
                      <Icon 
                        as={passesThreshold ? FiCheckCircle : FiAlertCircle} 
                        color={passesThreshold ? "green.500" : "red.500"} 
                        ml={1}
                      />
                    </Tooltip>
                  )}
                </HStack>
              </Flex>
              <Progress 
                value={(averageScore / 5) * 100} 
                size="sm" 
                colorScheme={averageScore >= 3 ? "green" : averageScore >= 2 ? "yellow" : "red"}
                borderRadius="full"
              />
              
              <Text fontSize="xs" color="gray.500" mt={1} textAlign="right">
                Threshold for publication: 3.0
              </Text>
            </Box>
          )}
          
          {/* Individual Reviews */}
          {reviews.length > 0 && (
            <Box mt={2}>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Reviews Received
              </Text>
              <VStack spacing={3} align="stretch">
                {reviews.map((review) => {
                  const recommendationInfo = getRecommendationInfo(review.recommendation);
                  
                  return (
                    <Box 
                      key={review.id} 
                      p={3} 
                      borderWidth="1px" 
                      borderColor={borderColor} 
                      borderRadius="md"
                      bg={useColorModeValue('gray.50', 'gray.700')}
                    >
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {review.reviewerName}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {formatDate(review.createdAt)}
                        </Text>
                      </Flex>
                      
                      <Flex justify="space-between" align="center">
                        <Badge colorScheme={recommendationInfo.color} variant="subtle">
                          {recommendationInfo.label}
                        </Badge>
                        <HStack spacing={1}>
                          <Text fontSize="sm" fontWeight="bold">
                            {review.score.toFixed(1)}
                          </Text>
                          <Text fontSize="sm" color="gray.600">/ 5.0</Text>
                        </HStack>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            </Box>
          )}
          
          {/* Publication Status */}
          {reviews.length >= reviewsNeeded && (
            <Box 
              mt={2} 
              p={3} 
              borderWidth="1px" 
              borderRadius="md"
              borderColor={passesThreshold ? "green.200" : "red.200"}
              bg={useColorModeValue(
                passesThreshold ? "green.50" : "red.50", 
                passesThreshold ? "green.900" : "red.900"
              )}
            >
              <Flex align="center">
                <Icon 
                  as={passesThreshold ? FiCheckCircle : FiXCircle} 
                  color={passesThreshold ? "green.500" : "red.500"} 
                  mr={2}
                  boxSize={5}
                />
                <Box>
                  <Text fontWeight="medium" color={passesThreshold ? "green.700" : "red.700"}>
                    {passesThreshold 
                      ? "This article meets the publication criteria" 
                      : "This article does not meet the publication criteria"
                    }
                  </Text>
                  <Text fontSize="sm" color={passesThreshold ? "green.600" : "red.600"}>
                    {passesThreshold 
                      ? "The article has received the required reviews and meets the minimum score threshold." 
                      : "The article has received the required reviews but does not meet the minimum score threshold."
                    }
                  </Text>
                </Box>
              </Flex>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ArticleReviewStatus;
