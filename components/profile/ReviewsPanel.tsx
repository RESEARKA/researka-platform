import React from 'react';
import {
  VStack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Flex,
  Box,
  Text,
  Button,
  Heading,
  HStack,
  Divider,
  useColorModeValue,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { FiCalendar, FiStar, FiExternalLink } from 'react-icons/fi';
import ResponsiveText from '../ResponsiveText';
import { Review, ReviewsResponse } from '../../hooks/useReviews';
import Link from 'next/link';

interface ReviewsPanelProps {
  reviewsData: ReviewsResponse | undefined;
  currentPage: number;
  onPageChange: (page: number) => void;
  EmptyState: React.FC<{ type: string }>;
  PaginationControl: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }>;
}

const ReviewsPanel: React.FC<ReviewsPanelProps> = ({
  reviewsData,
  currentPage,
  onPageChange,
  EmptyState,
  PaginationControl,
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <VStack spacing={4} align="stretch">
      {reviewsData && reviewsData.reviews && reviewsData.reviews.length > 0 ? (
        <>
          {reviewsData.reviews.map((review: Review) => (
            <Card 
              key={review.id} 
              borderWidth="1px" 
              borderColor={borderColor}
              bg={cardBg} 
              boxShadow="sm"
              transition="all 0.2s"
              _hover={{ boxShadow: 'md', borderColor: 'purple.300' }}
            >
              <CardHeader pb={2}>
                <Flex justify="space-between" align="center">
                  <Heading as="h3" size="md" fontWeight="600">
                    {review.articleTitle || 'Review'}
                  </Heading>
                  <Badge colorScheme="blue">Completed</Badge>
                </Flex>
              </CardHeader>
              
              <CardBody py={2}>
                <Text noOfLines={2} color="gray.600">
                  {review.content}
                </Text>
              </CardBody>
              
              <Divider borderColor={borderColor} />
              
              <CardFooter pt={2}>
                <Flex justify="space-between" width="100%" align="center">
                  <HStack spacing={2} color="gray.500">
                    <FiCalendar size={14} />
                    <Text fontSize="sm">{review.date}</Text>
                  </HStack>
                  
                  <Button
                    as={Link}
                    href={`/articles/${review.articleId}`}
                    size="sm"
                    variant="outline"
                    colorScheme="purple"
                    leftIcon={<FiExternalLink size={14} />}
                  >
                    View Article
                  </Button>
                </Flex>
              </CardFooter>
            </Card>
          ))}
          
          {reviewsData.totalPages > 1 && (
            <Box mt={4}>
              <PaginationControl
                currentPage={currentPage}
                totalPages={reviewsData.totalPages}
                onPageChange={onPageChange}
              />
            </Box>
          )}
        </>
      ) : (
        <EmptyState type="reviews" />
      )}
    </VStack>
  );
};

export default ReviewsPanel;
