import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Select,
  VStack,
  Heading,
  useToast,
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { FiSend, FiStar } from 'react-icons/fi';
import { submitReview } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';

interface ReviewFormProps {
  articleId: string;
  articleTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function ReviewForm({ articleId, articleTitle, onSuccess, onCancel }: ReviewFormProps) {
  const [score, setScore] = useState(3);
  const [recommendation, setRecommendation] = useState<'accept' | 'minor_revisions' | 'major_revisions' | 'reject'>('minor_revisions');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { currentUser, getUserProfile } = useAuth();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to submit a review',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get user profile to get the reviewer name
      const userProfile = await getUserProfile();
      
      if (!userProfile) {
        toast({
          title: 'Profile required',
          description: 'You must complete your profile before submitting a review',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Prepare review data
      const reviewData = {
        articleId,
        articleTitle,
        reviewerId: currentUser.uid,
        reviewerName: userProfile.displayName || userProfile.name || 'Anonymous Reviewer',
        score,
        recommendation,
        content,
      };
      
      console.log('ReviewForm: Submitting review', reviewData);
      
      // Submit review
      await submitReview(reviewData);
      
      toast({
        title: 'Review submitted',
        description: 'Your review has been successfully submitted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form
      setScore(3);
      setRecommendation('minor_revisions');
      setContent('');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      bg={bgColor}
      p={6}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <VStack spacing={6} align="stretch">
        <Heading as="h3" size="md">
          Submit Review for "{articleTitle}"
        </Heading>
        
        <FormControl id="score" isRequired>
          <FormLabel>Score (1-5)</FormLabel>
          <Flex>
            <Box flex="1" pr={8}>
              <Slider
                id="score-slider"
                min={1}
                max={5}
                step={0.1}
                value={score}
                onChange={(val) => setScore(val)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <SliderMark value={1} mt={2} ml={-2.5} fontSize="sm">
                  1
                </SliderMark>
                <SliderMark value={2} mt={2} ml={-2.5} fontSize="sm">
                  2
                </SliderMark>
                <SliderMark value={3} mt={2} ml={-2.5} fontSize="sm">
                  3
                </SliderMark>
                <SliderMark value={4} mt={2} ml={-2.5} fontSize="sm">
                  4
                </SliderMark>
                <SliderMark value={5} mt={2} ml={-2.5} fontSize="sm">
                  5
                </SliderMark>
                <SliderTrack>
                  <SliderFilledTrack bg="purple.500" />
                </SliderTrack>
                <Tooltip
                  hasArrow
                  bg="purple.500"
                  color="white"
                  placement="top"
                  isOpen={showTooltip}
                  label={`${score.toFixed(1)}`}
                >
                  <SliderThumb boxSize={6}>
                    <Box color="purple.500" as={FiStar} />
                  </SliderThumb>
                </Tooltip>
              </Slider>
            </Box>
            <Text fontWeight="bold" fontSize="xl">
              {score.toFixed(1)}
            </Text>
          </Flex>
          <FormHelperText>Rate the article from 1 (poor) to 5 (excellent)</FormHelperText>
        </FormControl>
        
        <FormControl id="recommendation" isRequired>
          <FormLabel>Recommendation</FormLabel>
          <Select
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value as any)}
          >
            <option value="accept">Accept (Ready for publication)</option>
            <option value="minor_revisions">Minor Revisions (Accept with minor changes)</option>
            <option value="major_revisions">Major Revisions (Substantial changes needed)</option>
            <option value="reject">Reject (Not suitable for publication)</option>
          </Select>
          <FormHelperText>Your recommendation for this article</FormHelperText>
        </FormControl>
        
        <FormControl id="content" isRequired>
          <FormLabel>Review Content</FormLabel>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Provide your detailed review of the article..."
            minHeight="200px"
            resize="vertical"
          />
          <FormHelperText>
            Include specific feedback, suggestions for improvement, and justification for your recommendation
          </FormHelperText>
        </FormControl>
        
        <Flex justify="space-between" mt={4}>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            colorScheme="purple"
            isLoading={isSubmitting}
            loadingText="Submitting"
            leftIcon={<FiSend />}
            ml={onCancel ? 'auto' : 0}
          >
            Submit Review
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}

export default ReviewForm;
