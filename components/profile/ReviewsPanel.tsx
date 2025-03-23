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
} from '@chakra-ui/react';
import { FiCalendar, FiStar, FiExternalLink } from 'react-icons/fi';
import ResponsiveText from '../ResponsiveText';
import { Review, ReviewsResponse, SortOption, FilterOptions } from '../../hooks/useReviews';
import Link from 'next/link';
import ReviewFilters from './ReviewFilters';

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
  onFilterChange?: (filters: FilterOptions) => void;
  onSortChange?: (sortOption: SortOption) => void;
  currentSort?: SortOption;
  currentFilters?: FilterOptions;
}

const ReviewsPanel: React.FC<ReviewsPanelProps> = ({
  reviewsData,
  currentPage,
  onPageChange,
  EmptyState,
  PaginationControl,
  onFilterChange,
  onSortChange,
  currentSort = 'date_desc',
  currentFilters = {},
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Debug logging
  console.log('ReviewsPanel: Rendering with data:', reviewsData);
  
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
                  <HStack spacing={2}>
                    <Badge colorScheme="blue">
                      {review.recommendation ? 
                        review.recommendation.replace('_', ' ').charAt(0).toUpperCase() + 
                        review.recommendation.replace('_', ' ').slice(1) : 
                        'Completed'}
                    </Badge>
                    {review.score && (
                      <Badge colorScheme="green">
                        Score: {review.score}/5
                      </Badge>
                    )}
                  </HStack>
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
                  
                  {review.articleId && review.articleId !== 'test-article-id' && (
                    <Button
                      as={Link}
                      href={`/articles/${review.articleId}`}
                      size="sm"
                      variant="ghost"
                      colorScheme="purple"
                      rightIcon={<FiExternalLink size={14} />}
                    >
                      View Article
                    </Button>
                  )}
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
