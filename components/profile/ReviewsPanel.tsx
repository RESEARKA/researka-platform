import React, { useEffect } from 'react';
import {
  VStack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Flex,
  Box,
  Text,
  Button,
  HStack,
  useColorModeValue,
  Link as ChakraLink,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { FiCalendar, FiStar, FiExternalLink } from 'react-icons/fi';
import ResponsiveText from '../ResponsiveText';
import { Review, ReviewsResponse, SortOption, FilterOptions, useReviews } from '../../hooks/useReviews';
import Link from 'next/link';
import ReviewFilters from './ReviewFilters';
import { createLogger, LogCategory } from '../../utils/logger';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '../../config/firebase';

// Create a logger instance for this component
const logger = createLogger('ReviewsPanel');

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
  isLoading?: boolean;
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
  isLoading: externalLoading = false,
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Use the useReviews hook to fetch reviews data
  const { data, isLoading: reviewsLoading, error } = useReviews(
    userId,
    currentPage,
    5, // itemsPerPage
    currentSort,
    currentFilters
  );

  // Use either the data from the hook or the prop data
  const reviewsData = data || propReviewsData || { reviews: [], totalPages: 0 };
  const isLoading = reviewsLoading || externalLoading;
  
  // Get the current user from the AuthContext
  const { currentUser } = useAuth();
  
  // Function to update the user profile with the correct review count
  const updateUserReviewCount = async () => {
    try {
      if (!userId) {
        logger.warn('Cannot update review count without a user ID', {
          category: LogCategory.DATA
        });
        return;
      }

      const db = getFirebaseFirestore();
      if (!db) {
        logger.error('Firestore not initialized', {
          category: LogCategory.ERROR
        });
        return;
      }

      // Get the total number of reviews from the service directly
      // This ensures we count ALL reviews, not just the ones on the current page
      const { getUserReviews } = await import('../../services/reviewService');
      const allReviews = await getUserReviews(userId);
      const totalReviewCount = allReviews.length;

      logger.debug('Updating user profile with review count', {
        context: { userId, reviewCount: totalReviewCount },
        category: LogCategory.DATA
      });

      // Get the current profile data first
      const userRef = doc(db, 'users', userId);
      
      // Update the profile with the review count
      await updateDoc(userRef, {
        reviewCount: totalReviewCount,
        reviews: totalReviewCount, // Update both fields for backward compatibility
        updatedAt: new Date().toISOString()
      });

      logger.info('Successfully updated user profile with review count', {
        context: { reviewCount: totalReviewCount },
        category: LogCategory.DATA
      });

      // Update the UI without requiring a page reload
      // This will update the profile stats in real-time
      if (typeof window !== 'undefined') {
        // Dispatch a custom event that other components can listen for
        const event = new CustomEvent('profile-review-count-updated', { 
          detail: { reviewCount: totalReviewCount } 
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      logger.error('Error updating user profile with review count', {
        context: { error },
        category: LogCategory.ERROR
      });
    }
  };

  // Log when reviews data changes
  useEffect(() => {
    if (reviewsData && reviewsData.reviews) {
      logger.debug('Reviews data updated', {
        context: {
          reviewCount: reviewsData.reviews.length,
          totalPages: reviewsData.totalPages,
          userId: userId,
          hasReviews: reviewsData.reviews.length > 0,
          reviewSample: reviewsData.reviews.length > 0 ? reviewsData.reviews[0] : null
        },
        category: LogCategory.DATA
      });
      
      // Log to console for easier debugging
      console.log('ReviewsPanel: Reviews data', {
        reviewCount: reviewsData.reviews.length,
        totalPages: reviewsData.totalPages,
        userId: userId,
        currentUserUid: currentUser?.uid,
        hasReviews: reviewsData.reviews.length > 0,
        reviewSample: reviewsData.reviews.length > 0 ? reviewsData.reviews[0] : null
      });

      // Update the user profile with the correct review count
      updateUserReviewCount();
    }
  }, [reviewsData, userId, currentUser?.uid]);

  // Log when there's an error
  useEffect(() => {
    if (error) {
      console.error('ReviewsPanel: Error fetching reviews:', error);
    }
  }, [error]);

  // Log when the component mounts
  useEffect(() => {
    console.log('ReviewsPanel: Component mounted with userId:', userId);
    console.log('ReviewsPanel: Current user UID:', currentUser?.uid);
  }, [userId, currentUser?.uid]);

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
