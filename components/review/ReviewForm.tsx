'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Textarea,
  Select,
  Stack,
  Heading,
  Text,
  useToast,
  Flex,
  Card,
  CardBody,
  Spinner,
  Tooltip,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import DeepSeekReviewAssistant from './DeepSeekReviewAssistant';
import { AISummary } from './AISummary';
import { Article, Review, ReviewSuggestion } from '../../types/review';

// Define rating options
const RATING_OPTIONS = [
  { value: 1, label: '1 - Poor' },
  { value: 2, label: '2 - Fair' },
  { value: 3, label: '3 - Good' },
  { value: 4, label: '4 - Very Good' },
  { value: 5, label: '5 - Excellent' },
];

// Define review criteria
const REVIEW_CRITERIA = [
  { id: 'originality', label: 'Originality' },
  { id: 'methodology', label: 'Methodology' },
  { id: 'clarity', label: 'Clarity' },
  { id: 'significance', label: 'Significance' },
  { id: 'references', label: 'References' },
];

// Define decision options
const DECISION_OPTIONS = [
  { value: 'accept', label: 'Accept' },
  { value: 'minorRevisions', label: 'Accept with Minor Revisions' },
  { value: 'majorRevisions', label: 'Major Revisions Required' },
  { value: 'reject', label: 'Reject' },
];

interface ReviewFormProps {
  article: Article;
  onSubmit: (review: Review) => Promise<void>;
  initialReview?: Partial<Review>;
  isEditing?: boolean;
}

export function ReviewForm({
  article,
  onSubmit,
  initialReview,
  isEditing = false,
}: ReviewFormProps) {
  // State for form fields
  const [review, setReview] = useState<Partial<Review>>(
    initialReview || {
      articleId: article.id,
      ratings: {
        originality: 0,
        methodology: 0,
        clarity: 0,
        significance: 0,
        references: 0
      },
      decision: '' as any,
      comments: '',
      privateComments: '',
    }
  );
  
  // State for AI suggestions and ratings
  const [suggestions, setSuggestions] = useState<ReviewSuggestion[]>([]);
  const [aiRatings, setAiRatings] = useState<Record<string, number>>({});
  const [isAIAnalysisComplete, setIsAIAnalysisComplete] = useState(false);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  
  // State for form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast for notifications
  const toast = useToast();
  
  // Handle AI suggestions
  const handleSuggestionsGenerated = (newSuggestions: ReviewSuggestion[]) => {
    setSuggestions(newSuggestions);
    setIsAIAnalysisComplete(true);
    setIsAIAnalyzing(false);
    
    // Generate AI ratings based on suggestions
    const generatedRatings = generateAIRatings(newSuggestions);
    setAiRatings(generatedRatings);
    
    // Pre-fill review fields with AI-generated ratings
    if (!isEditing) {
      setReview(prev => ({
        ...prev,
        ratings: {
          ...generatedRatings
        } as Review['ratings'],
      }));
    }
  };
  
  // Generate AI ratings based on suggestions
  const generateAIRatings = (suggestions: ReviewSuggestion[]): Record<string, number> => {
    // Default base rating
    const baseRating = 3;
    
    // Generate ratings for each criterion based on suggestion categories
    const ratings: Record<string, number> = {};
    
    // Set default ratings
    REVIEW_CRITERIA.forEach(criterion => {
      ratings[criterion.id] = baseRating;
    });
    
    // Adjust ratings based on suggestion categories
    suggestions.forEach(suggestion => {
      const category = suggestion.category.toLowerCase();
      const impact = suggestion.priority === 'high' ? -1 : 
                    suggestion.priority === 'medium' ? -0.5 : 0;
      
      if (category.includes('method') || category.includes('approach')) {
        ratings.methodology = Math.max(1, Math.min(5, (ratings.methodology || baseRating) + impact));
      }
      
      if (category.includes('original') || category.includes('novel') || category.includes('innovation')) {
        ratings.originality = Math.max(1, Math.min(5, (ratings.originality || baseRating) + impact));
      }
      
      if (category.includes('clear') || category.includes('writing') || category.includes('structure')) {
        ratings.clarity = Math.max(1, Math.min(5, (ratings.clarity || baseRating) + impact));
      }
      
      if (category.includes('impact') || category.includes('significance') || category.includes('important')) {
        ratings.significance = Math.max(1, Math.min(5, (ratings.significance || baseRating) + impact));
      }
      
      if (category.includes('reference') || category.includes('citation') || category.includes('literature')) {
        ratings.references = Math.max(1, Math.min(5, (ratings.references || baseRating) + impact));
      }
    });
    
    // Round all ratings to integers
    Object.keys(ratings).forEach(key => {
      ratings[key] = Math.round(ratings[key]);
    });
    
    return ratings;
  };
  
  // Handle form field changes
  const handleChange = (
    field: string,
    value: string | number | Record<string, number>
  ) => {
    setReview((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle rating changes with +/- 1 restriction
  const handleRatingChange = (criterionId: string, value: number) => {
    // Get the AI-suggested rating for this criterion
    const aiRating = aiRatings[criterionId] || 3;
    
    // Check if the new rating is within +/- 1 of the AI rating
    if (Math.abs(value - aiRating) > 1) {
      toast({
        title: 'Rating adjustment limited',
        description: `You can only adjust the AI-suggested rating (${aiRating}) by +/- 1`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setReview((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [criterionId]: value,
      } as Review['ratings'],
    }));
    
    // Clear error for ratings if it exists
    if (errors.ratings) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.ratings;
        return newErrors;
      });
    }
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Check if all ratings are provided
    const hasAllRatings = REVIEW_CRITERIA.every(
      (criterion) => {
        const ratings = review.ratings || {};
        return (ratings[criterion.id as keyof typeof ratings] || 0) > 0;
      }
    );
    
    if (!hasAllRatings) {
      newErrors.ratings = 'Please provide ratings for all criteria';
    }
    
    // Check if decision is provided
    if (!review.decision) {
      newErrors.decision = 'Please select a decision';
    }
    
    // Check if comments are provided
    if (!review.comments || review.comments.trim().length < 10) {
      newErrors.comments = 'Please provide meaningful comments (at least 10 characters)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: 'Form validation failed',
        description: 'Please fix the errors in the form',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(review as Review);
      
      toast({
        title: isEditing ? 'Review updated' : 'Review submitted',
        description: isEditing
          ? 'Your review has been updated successfully'
          : 'Your review has been submitted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Start AI analysis when component mounts
  useEffect(() => {
    if (!isEditing && !isAIAnalysisComplete && !isAIAnalyzing) {
      setIsAIAnalyzing(true);
    }
  }, [isEditing, isAIAnalysisComplete, isAIAnalyzing]);
  
  return (
    <Box>
      <Stack spacing={6}>
        {/* AI Review Section - Always visible and running automatically */}
        {isAIAnalyzing && !isAIAnalysisComplete ? (
          <Card mb={4} variant="outline">
            <CardBody>
              <Heading size="md" mb={4}>
                AI Review Analysis
              </Heading>
              <Box 
                display="flex" 
                alignItems="center" 
                p={4}
                borderRadius="md"
                bg="gray.50"
              >
                <Spinner size="sm" mr={2} />
                <Text>Analyzing article with AI...</Text>
                <Text ml={2} fontSize="sm" color="gray.500">This may take a minute or two.</Text>
              </Box>
            </CardBody>
          </Card>
        ) : !isAIAnalysisComplete ? (
          <Card mb={4} variant="outline">
            <CardBody>
              <Heading size="md" mb={4}>
                AI Review Analysis
              </Heading>
              <DeepSeekReviewAssistant
                article={article}
                onSuggestionsGenerated={handleSuggestionsGenerated}
                autoAnalyze={true}
              />
            </CardBody>
          </Card>
        ) : (
          <Card mb={4} variant="outline">
            <CardBody>
              <Heading size="md" mb={4}>
                AI Review Analysis
              </Heading>
              <AISummary
                suggestions={suggestions}
                isLoading={false}
                error={null}
              />
            </CardBody>
          </Card>
        )}
        
        {/* Ratings Section */}
        <Box>
          <Heading size="md" mb={4}>Your Review</Heading>
          <Heading size="sm" mb={3}>Ratings</Heading>
          <Text fontSize="sm" color="gray.600" mb={3}>
            Note: You can adjust AI-suggested ratings by +/- 1 point
          </Text>
          <Stack spacing={3}>
            {REVIEW_CRITERIA.map((criterion) => (
              <FormControl 
                key={criterion.id} 
                isInvalid={!!errors.ratings}
              >
                <Flex align="center">
                  <FormLabel width="150px" mb={0}>
                    {criterion.label}
                  </FormLabel>
                  <Select
                    value={review.ratings?.[criterion.id as keyof Review['ratings']] || 0}
                    onChange={(e) => handleRatingChange(criterion.id, parseInt(e.target.value))}
                    placeholder="Select rating"
                  >
                    {RATING_OPTIONS.map((option) => {
                      const aiRating = aiRatings[criterion.id] || 3;
                      const isWithinRange = Math.abs(option.value - aiRating) <= 1;
                      
                      return (
                        <option 
                          key={option.value} 
                          value={option.value}
                          disabled={isAIAnalysisComplete && !isWithinRange}
                        >
                          {option.label} {option.value === aiRating ? '(AI suggested)' : ''}
                        </option>
                      );
                    })}
                  </Select>
                  
                  {isAIAnalysisComplete && (
                    <Tooltip 
                      label={`AI suggested rating: ${aiRatings[criterion.id] || 3}. You can adjust by +/- 1.`}
                    >
                      <Box ml={2}>
                        <InfoIcon color="blue.500" />
                      </Box>
                    </Tooltip>
                  )}
                </Flex>
              </FormControl>
            ))}
            {errors.ratings && (
              <FormErrorMessage>{errors.ratings}</FormErrorMessage>
            )}
          </Stack>
        </Box>
        
        {/* Decision Section */}
        <FormControl isInvalid={!!errors.decision}>
          <FormLabel>Decision</FormLabel>
          <Select
            value={review.decision || ''}
            onChange={(e) => handleChange('decision', e.target.value)}
            placeholder="Select decision"
          >
            {DECISION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {errors.decision && (
            <FormErrorMessage>{errors.decision}</FormErrorMessage>
          )}
        </FormControl>
        
        {/* Comments Section */}
        <Box>
          <FormControl isInvalid={!!errors.comments} mb={4}>
            <FormLabel>
              Public Comments (visible to authors)
            </FormLabel>
            <Textarea
              value={review.comments || ''}
              onChange={(e) => handleChange('comments', e.target.value)}
              placeholder="Provide your review comments for the authors. Be constructive and specific."
              minHeight="200px"
            />
            {errors.comments && (
              <FormErrorMessage>{errors.comments}</FormErrorMessage>
            )}
          </FormControl>
          
          <FormControl>
            <FormLabel>
              Private Comments (visible to editors only)
            </FormLabel>
            <Textarea
              value={review.privateComments || ''}
              onChange={(e) => handleChange('privateComments', e.target.value)}
              placeholder="Provide any private comments for editors only. These will not be shared with the authors."
              minHeight="150px"
            />
          </FormControl>
        </Box>
        
        {/* Submit Button */}
        <Button
          colorScheme="blue"
          size="lg"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          loadingText={isEditing ? 'Updating...' : 'Submitting...'}
          isDisabled={!isAIAnalysisComplete}
        >
          {isEditing ? 'Update Review' : 'Submit Review'}
        </Button>
        
        {!isAIAnalysisComplete && (
          <Text color="gray.500" fontSize="sm" textAlign="center">
            Please wait for AI analysis to complete before submitting your review
          </Text>
        )}
      </Stack>
    </Box>
  );
}
