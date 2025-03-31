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
  const reviewsData = data || propReviewsData || { reviews: [], totalPages: 0, totalCount: 0 };
  const isLoading = reviewsLoading || externalLoading;
  
  // Get the current user from the AuthContext
  const { currentUser } = useAuth();
  
  /**
   * Update the user's review count in their profile
   * @param userId - The user ID
   * @param reviewCount - The number of reviews
   */
  const updateUserReviewCount = async (userId: string, reviewCount: number) => {
    try {
      logger.debug(`Updating user review count to ${reviewCount}`, {
        context: { userId, reviewCount },
        category: LogCategory.DATA
      });

      if (!userId) {
        logger.error('Cannot update review count: No user ID provided', {
          category: LogCategory.ERROR
        });
        return;
      }

      // Get Firestore instance
      const db = getFirebaseFirestore();
      if (!db) {
        logger.error('Cannot update review count: Firestore not initialized', {
          category: LogCategory.ERROR
        });
        return;
      }

      // Get user document reference
      const userDocRef = doc(db, 'users', userId);
      
      // Update the user document with the new review count
      await updateDoc(userDocRef, {
        reviewCount: reviewCount,
        reviews: reviewCount, // For backward compatibility
        updatedAt: new Date().toISOString()
      });

      logger.info(`Successfully updated user review count to ${reviewCount}`, {
        context: { userId, reviewCount },
        category: LogCategory.DATA
      });

      // Dispatch a custom event to notify other components about the review count update
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('profile-review-count-updated', {
          detail: { reviewCount }
        });
        window.dispatchEvent(event);
        logger.debug('Dispatched profile-review-count-updated event', {
          context: { reviewCount },
          category: LogCategory.DATA
        });
      }
    } catch (error) {
      logger.error('Error updating user review count', {
        context: { error, userId, reviewCount },
        category: LogCategory.ERROR
      });
    }
  };

  // Log when reviews data changes
  useEffect(() => {
    if (reviewsData && userId) {
      const totalCount = reviewsData.totalCount ?? reviewsData.reviews?.length ?? 0;
      
      logger.debug('Reviews data updated', {
        context: {
          reviewCount: totalCount,
          displayedReviews: reviewsData.reviews?.length || 0,
          totalPages: reviewsData.totalPages,
          userId: userId,
          hasReviews: totalCount > 0,
          reviewSample: reviewsData.reviews?.length > 0 ? reviewsData.reviews[0] : null
        },
        category: LogCategory.DATA
      });
      
      // Log to console for easier debugging
      console.log('ReviewsPanel: Reviews data', {
        totalCount,
        displayedReviews: reviewsData.reviews?.length || 0,
        totalPages: reviewsData.totalPages,
        userId: userId,
        currentUserUid: currentUser?.uid,
        hasReviews: totalCount > 0,
        reviewSample: reviewsData.reviews?.length > 0 ? reviewsData.reviews[0] : null
      });

      // Update the user profile with the correct review count
      // Use the total count, not just the current page's reviews length
      updateUserReviewCount(userId, totalCount);
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
    
    // Force a refresh of the reviews data when the component mounts
    if (userId && !isLoading) {
      logger.debug('ReviewsPanel: Forcing refresh of reviews data', {
        context: { userId },
        category: LogCategory.LIFECYCLE
      });
    }
  }, [userId, currentUser?.uid, isLoading]);

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
                  <ResponsiveText variant="h3" mb={2} _hover={{ textDecoration: 'underline', cursor: 'pointer' }}>
                    {review.title || `Review of ${review.articleTitle || 'Article'}`}
                  </ResponsiveText>
                </Link>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Review of: {review.articleTitle || 'Untitled Article'}
                </Text>
              </CardHeader>
              
              <CardBody py={3}>
                <Text noOfLines={2} color="gray.600">
                  {review.content?.substring(0, 150) || 'No content available'}
                  {review.content && review.content.length > 150 ? '...' : ''}
                </Text>
              </CardBody>
              
              <CardFooter pt={0}>
                <Flex width="100%" justifyContent="space-between" alignItems="center">
                  <HStack spacing={4}>
                    <Flex align="center">
                      <Box as={FiCalendar} mr={1} />
                      <Text fontSize="sm">
                        {review.date ? new Date(review.date).toLocaleDateString() : 'No date'}
                      </Text>
                    </Flex>
                    
                    <Flex align="center">
                      <Box as={FiStar} mr={1} />
                      <Text fontSize="sm">
                        {typeof review.score === 'number' ? `${review.score}/5` : 'No score'}
                      </Text>
                    </Flex>
                  </HStack>
                  
                  <Link href={`/articles/${review.articleId}`} passHref>
                    <Button
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
