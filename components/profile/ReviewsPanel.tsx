import React, { useState } from 'react';
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
  Spinner,
  Center,
} from '@chakra-ui/react';
import { FiCalendar, FiStar, FiExternalLink } from 'react-icons/fi';
import ResponsiveText from '../ResponsiveText';
import { Review, ReviewsResponse, SortOption, FilterOptions } from '../../hooks/useReviews';
import Link from 'next/link';
import ReviewFilters from './ReviewFilters';

// Define default empty state component
const DefaultEmptyState: React.FC<{ type: string }> = ({ type }) => (
  <Box textAlign="center" py={10}>
    <Text fontSize="lg" fontWeight="medium" mb={2}>No {type} Found</Text>
    <Text color="gray.500">You haven't created any {type.toLowerCase()} yet.</Text>
  </Box>
);

// Define default pagination component
const DefaultPaginationControl: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  return (
    <Flex justify="center" mt={6}>
      <Button 
        size="sm" 
        onClick={() => onPageChange(currentPage - 1)} 
        isDisabled={currentPage === 1}
        mr={2}
      >
        Previous
      </Button>
      <Text alignSelf="center" mx={2}>
        Page {currentPage} of {totalPages}
      </Text>
      <Button 
        size="sm" 
        onClick={() => onPageChange(currentPage + 1)} 
        isDisabled={currentPage === totalPages}
        ml={2}
      >
        Next
      </Button>
    </Flex>
  );
};

interface ReviewsPanelProps {
  userId?: string;
  reviewsData?: ReviewsResponse;
  currentPage: number;
  onPageChange: (page: number) => void;
  EmptyState?: React.FC<{ type: string }>;
  PaginationControl?: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }>;
  onFilterChange?: (filters: FilterOptions) => void;
  onSortChange?: (sortOption: SortOption) => void;
  currentSort?: SortOption;
  currentFilters?: FilterOptions;
}

const ReviewsPanel: React.FC<ReviewsPanelProps> = ({
  userId,
  reviewsData: propReviewsData,
  currentPage,
  onPageChange,
  EmptyState = DefaultEmptyState,
  PaginationControl = DefaultPaginationControl,
  onFilterChange,
  onSortChange,
  currentSort = 'date_desc',
  currentFilters = {},
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Since we don't have a proper useReviews hook implementation, we'll just use the provided data
  // In a real implementation, we would use the hook like this:
  // const { data: reviews, isLoading, error } = useReviews(userId, currentPage, currentSort, currentFilters);
  
  // For now, we'll just use the prop data
  const reviewsData = propReviewsData || { reviews: [], totalPages: 0 };
  const isLoading = false;
  const error = null;
  
  if (isLoading) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading reviews...</Text>
        </VStack>
      </Center>
    );
  }
  
  if (error) {
    return (
      <Box p={5} borderWidth={1} borderRadius="md" bg="red.50" color="red.800">
        <Box fontWeight="bold" mb={2}>Error loading reviews</Box>
        <Box>{String(error)}</Box>
      </Box>
    );
  }
  
  return (
    <VStack spacing={4} align="stretch">
      {onFilterChange && onSortChange && (
        <ReviewFilters 
          onFilterChange={onFilterChange}
          onSortChange={onSortChange}
          currentSort={currentSort}
          currentFilters={currentFilters}
        />
      )}
      
      {reviewsData && reviewsData.reviews && reviewsData.reviews.length > 0 ? (
        <>
          {reviewsData.reviews.map((review: Review) => (
            <Card 
              key={review.id} 
              borderWidth="1px" 
              borderRadius="lg" 
              overflow="hidden"
              bg={cardBg}
              borderColor={borderColor}
              boxShadow="sm"
            >
              <CardHeader pb={0}>
                <Link href={`/reviews/${review.id}`} passHref>
                  <ChakraLink _hover={{ textDecoration: 'none' }}>
                    <ResponsiveText variant="h3" mb={2}>
                      {review.title}
                    </ResponsiveText>
                  </ChakraLink>
                </Link>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Review of: {review.articleTitle}
                </Text>
              </CardHeader>
              
              <CardBody py={3}>
                <Text noOfLines={2} color="gray.600">
                  {review.content?.substring(0, 150)}
                  {review.content && review.content.length > 150 ? '...' : ''}
                </Text>
              </CardBody>
              
              <CardFooter pt={0}>
                <Flex width="100%" justifyContent="space-between" alignItems="center">
                  <HStack spacing={4}>
                    <Flex align="center">
                      <Box as={FiCalendar} mr={1} />
                      <Text fontSize="sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </Flex>
                    
                    <Flex align="center">
                      <Box as={FiStar} mr={1} />
                      <Text fontSize="sm">
                        {review.score || 0}/5
                      </Text>
                    </Flex>
                  </HStack>
                  
                  <Link href={`/reviews/${review.id}`} passHref>
                    <Button
                      as={ChakraLink}
                      size="sm"
                      rightIcon={<FiExternalLink />}
                      variant="outline"
                    >
                      View
                    </Button>
                  </Link>
                </Flex>
              </CardFooter>
            </Card>
          ))}
          
          <PaginationControl 
            currentPage={currentPage} 
            totalPages={reviewsData.totalPages || 1} 
            onPageChange={onPageChange} 
          />
        </>
      ) : (
        <EmptyState type="Reviews" />
      )}
    </VStack>
  );
};

export default ReviewsPanel;
