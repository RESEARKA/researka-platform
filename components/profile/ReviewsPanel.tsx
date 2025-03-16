import React from 'react';
import {
  VStack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Flex,
} from '@chakra-ui/react';
import ResponsiveText from '../ResponsiveText';
import { Review, ReviewsResponse } from '../../hooks/useReviews';

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
  return (
    <VStack spacing={4} align="stretch">
      {reviewsData && reviewsData.reviews && reviewsData.reviews.length > 0 ? (
        reviewsData.reviews.map((review: Review) => (
          <Card key={review.id}>
            <CardHeader>
              <ResponsiveText variant="h3">{review.title}</ResponsiveText>
            </CardHeader>
            <CardBody>
              <ResponsiveText variant="body">{review.content}</ResponsiveText>
            </CardBody>
            <CardFooter>
              <Flex justify="space-between" width="100%">
                <Badge colorScheme="blue">Completed</Badge>
                <ResponsiveText variant="caption">{review.date}</ResponsiveText>
              </Flex>
            </CardFooter>
          </Card>
        ))
      ) : (
        <EmptyState type="Reviews" />
      )}
      
      {reviewsData && reviewsData.totalPages > 1 && (
        <PaginationControl 
          currentPage={currentPage} 
          totalPages={reviewsData.totalPages} 
          onPageChange={onPageChange} 
        />
      )}
    </VStack>
  );
};

export default ReviewsPanel;
