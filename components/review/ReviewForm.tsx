import React, { useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Stack,
  Text,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Spinner,
  Card,
  CardBody,
  Heading,
  FormErrorMessage,
  useToast,
  Tooltip,
  Icon
} from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';
import { Review, Article } from '../../types/review'; 
import { useReviewForm } from '../../hooks/useReviewForm';
import DeepSeekReviewAssistant from './DeepSeekReviewAssistant';
import { AISummary } from './AISummary'; 

// Interface for component props
interface ReviewFormProps {
  article: Article; 
  initialReview?: Partial<Review>; 
  onSubmit: (reviewData: Partial<Review>) => Promise<void>; 
  isLoading?: boolean;
  errors?: Record<string, string>;
}

// Define the structure for rating criteria
interface RatingCriterion {
  key: keyof Review['ratings']; 
  label: string;
  description: string;
}

// Update rating criteria to match the Review type
const ratingCriteria: RatingCriterion[] = [
  {
    key: 'originality',
    label: 'Originality & Novelty',
    description: 'How original is the work? Does it present novel ideas or approaches?',
  },
  {
    key: 'methodology',
    label: 'Methodology & Rigor',
    description: 'Is the methodology sound, rigorous, and appropriate for the research question?',
  },
  {
    key: 'clarity',
    label: 'Clarity & Presentation',
    description: 'Is the paper well-written, clearly structured, and easy to understand?',
  },
  {
    key: 'significance',
    label: 'Significance & Impact',
    description: 'What is the potential impact and significance of this research in its field?',
  },
  {
    key: 'references',
    label: 'References & Citations',
    description: 'Are the references appropriate, comprehensive, and correctly cited?',
  },
];

// Define decision labels with explicit type for keys
const decisionLabels: Record<string, string> = {
  accept: 'Accept',
  minor_revision: 'Minor Revision',
  major_revision: 'Major Revision',
  revise: 'Revision Required',
  reject: 'Reject',
};

// Create a constant for default ratings
const DEFAULT_RATINGS: Record<string, number> = {
  originality: 3,
  methodology: 3,
  clarity: 3,
  significance: 3,
  references: 3
};

// Helper function to get rating label based on value
const getRatingLabel = (_criterionKey: string, value: number): string => {
  const labels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };
  
  return labels[value as keyof typeof labels] || 'Unknown';
};

/**
 * ReviewForm Component
 * 
 * A form for creating or editing article reviews with AI assistance.
 * Includes rating criteria, decision selection, and comment fields.
 */
export const ReviewForm: React.FC<ReviewFormProps> = ({
  article, 
  initialReview,
  onSubmit,
  isLoading,
  errors,
}) => {
  // Extract all the necessary values and functions from the useReviewForm hook
  const {
    review,
    suggestions,
    aiRatings,
    isAIAnalyzing,
    isAIAnalysisComplete,
    isSubmitting,
    setIsSubmitting,
    isEditing,
    handleChange,
    handleSuggestionsGenerated,
    handleAnalyzeRequest,
    handleAnalysisStateChange,
    validateForm,
  } = useReviewForm(initialReview);

  const toast = useToast(); 

  // Wrapper for the submission logic passed from parent
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Failed',
        description: 'Please correct the errors before submitting.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsSubmitting(true); 
    try {
      // Ensure ratings object exists and has all keys before submission
      const finalReviewData = {
        ...review,
        ratings: {
          originality: review.ratings?.originality ?? 3,
          methodology: review.ratings?.methodology ?? 3,
          clarity: review.ratings?.clarity ?? 3,
          significance: review.ratings?.significance ?? 3,
          references: review.ratings?.references ?? 3,
        } as Review['ratings'], 
        // Ensure decision has a valid default if somehow missing
        decision: review.decision ?? 'minor_revision',
      };
      await onSubmit(finalReviewData); 
      toast({ 
        title: 'Review Submitted', 
        description: 'Your review has been successfully submitted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [review, validateForm, onSubmit, toast, setIsSubmitting]);

  // Calculate suggested decision based on aiRatings from hook
  const aiSuggestedDecision = useMemo(() => {
    if (!aiRatings) return null;
    
    try {
      // Calculate average rating
      const ratingValues = Object.values(aiRatings);
      const avgRating = ratingValues.reduce((sum, val) => sum + val, 0) / ratingValues.length;
      
      // Determine decision based on average rating
      if (avgRating >= 4) return 'accept';
      if (avgRating >= 3) return 'revise';
      return 'reject';
    } catch (error) {
      // Use toast for error feedback instead of silent console.error
      console.error('Error calculating AI decision:', error);
      toast({
        title: 'AI Decision Error',
        description: 'Failed to calculate AI suggested decision',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  }, [aiRatings, toast]);

  // Effect to auto-start AI analysis for new reviews
  useEffect(() => {
    if (!isEditing && !isAIAnalysisComplete && !isAIAnalyzing) {
      // Auto-trigger analysis for new reviews
      handleAnalyzeRequest();
    }
  }, [isEditing, isAIAnalysisComplete, isAIAnalyzing, handleAnalyzeRequest]);

  return (
    <Box>
      <Stack spacing={6}>
        {/* AI Review Section */}
        <Card mb={4} variant="outline">
          <CardBody>
            <Heading size="md" mb={4}>AI Review Assistant</Heading>
            {isAIAnalyzing && (
              <Box textAlign="center">
                <Spinner size="xl" />
                <Text mt={2}>AI analysis in progress...</Text>
                <Text fontSize="sm" color="gray.500">Please wait while we analyze the article. Form fields will be unlocked when analysis is complete.</Text>
              </Box>
            )}
            {!isAIAnalyzing && !isAIAnalysisComplete && !isEditing && (
              <Text color="gray.500">AI analysis will start automatically for new reviews.</Text>
            )}
             {!isAIAnalyzing && !isAIAnalysisComplete && isEditing && (
               <Button onClick={handleAnalyzeRequest} isLoading={isAIAnalyzing} size="sm">
                 Run AI Analysis
               </Button>
            )}
            {isAIAnalysisComplete && suggestions.length > 0 && (
              <Box mb={6}>
                <AISummary 
                  suggestions={suggestions} 
                  aiRatings={aiRatings}
                  isLoading={false}
                  error={null}
                  key={`ai-summary-${suggestions.length}`}
                />
              </Box>
            )}
             {isAIAnalysisComplete && suggestions.length === 0 && (
               <Text color="green.600">AI analysis complete. No major issues found.</Text>
            )}
            <DeepSeekReviewAssistant 
              article={article} 
              onSuggestionsGenerated={handleSuggestionsGenerated} 
              onAnalysisStateChange={handleAnalysisStateChange}
              autoAnalyze={!isAIAnalysisComplete && !isAIAnalyzing}
              onError={(errorMsg) => {
                  console.error("AI Analysis Error:", errorMsg);
                  toast({ title: 'AI Analysis Failed', description: errorMsg, status: 'error', duration: 5000, isClosable: true });
              }}
            />
          </CardBody>
        </Card>

        {/* Ratings Section */}
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Heading as="h3" size="md" mb={4}>Review Criteria Ratings</Heading>
          {ratingCriteria.map((criterion) => (
            <FormControl key={`criterion-${criterion.key}`} isRequired mb={4}>
              <FormLabel 
                htmlFor={`rating-${criterion.key}`}
                display="flex" 
                alignItems="center"
              >
                {criterion.label}
                <Tooltip label={criterion.description} hasArrow placement="top">
                  <Icon as={FiInfo} ml={2} color="gray.500" />
                </Tooltip>
              </FormLabel>
              
              <Select
                id={`rating-${criterion.key}`}
                value={review.ratings?.[criterion.key] || DEFAULT_RATINGS[criterion.key]}
                onChange={(e) => {
                  const newRatingValue = parseInt(e.target.value, 10);
                  // Update the specific rating within the ratings object using hook's handler
                  handleChange('ratings', { 
                      ...(review.ratings || { originality: 3, methodology: 3, clarity: 3, significance: 3, references: 3 }), 
                      [criterion.key]: newRatingValue 
                  });
                }}
                isDisabled={isLoading}
                data-testid={`rating-${criterion.key}`}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={`${criterion.key}-rating-${value}`} value={value}>
                    {value} - {getRatingLabel('', value)}
                  </option>
                ))}
              </Select>
              {aiRatings?.[criterion.key] && (
                <Text fontSize="sm" color="blue.600" mt={1}>
                  AI Suggested Rating: {aiRatings[criterion.key]} 
                </Text>
              )}
              {errors?.ratings && criterion.key === 'originality' && (
                <FormErrorMessage>{errors.ratings}</FormErrorMessage>
              )}
            </FormControl>
          ))}
        </Box>

        {/* Decision Section */}
        <FormControl mb={6} isInvalid={!!errors?.decision}>
          <FormLabel>Decision</FormLabel>
          <Select
            value={review.decision || ''} 
            onChange={(e) => handleChange('decision', e.target.value as Review['decision'])}
          >
            {(Object.keys(decisionLabels) as Array<keyof typeof decisionLabels>).map((decisionKey) => (
              <option key={decisionKey} value={decisionKey}>
                {decisionLabels[decisionKey]}
              </option>
            ))}
          </Select>
          {aiSuggestedDecision && (
            <Text fontSize="sm" color="blue.600" mt={1}>
              AI Suggested Decision: {
                aiSuggestedDecision === 'revise' 
                  ? decisionLabels.major_revision 
                  : decisionLabels[aiSuggestedDecision as keyof typeof decisionLabels] || aiSuggestedDecision
              }
            </Text>
          )}
          {errors?.decision && (
            <FormErrorMessage>{errors.decision}</FormErrorMessage>
          )}
        </FormControl>

        {/* Comments Section */}
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Heading as="h3" size="md" mb={4}>Review Comments</Heading>
          <FormControl isInvalid={!!errors?.comments} isRequired mb={6}>
            <FormLabel htmlFor="comments-author">Comments for Author</FormLabel>
            <Textarea
              id="comments-author"
              aria-describedby={errors?.comments ? "comments-error" : undefined}
              placeholder="Provide detailed feedback for the author..."
              value={review.comments || ''} 
              onChange={(e) => handleChange('comments', e.target.value)} 
              isDisabled={isLoading}
              minH="150px"
              data-testid="comments-input"
            />
            {errors?.comments && (
              <FormErrorMessage id="comments-error">
                {errors.comments}
              </FormErrorMessage>
            )}
          </FormControl>
          
          <FormControl isInvalid={!!errors?.privateComments} mb={6}>
            <FormLabel htmlFor="comments-editor">Comments for Editor (Optional)</FormLabel>
            <Textarea
              id="comments-editor"
              aria-describedby={errors?.privateComments ? "comments-editor-error" : undefined}
              placeholder="Private comments for the editor only..."
              value={review.privateComments || ''} 
              onChange={(e) => handleChange('privateComments', e.target.value)} 
              isDisabled={isLoading}
              minH="100px"
              data-testid="comments-editor-input"
            />
            {errors?.privateComments && (
              <FormErrorMessage id="comments-editor-error">
                {errors.privateComments}
              </FormErrorMessage>
            )}
          </FormControl>
        </Box>
        
        <Button 
          colorScheme="blue"
          onClick={handleSubmit}
          isLoading={isSubmitting || isLoading} 
        >
          {isEditing ? 'Update Review' : 'Submit Review'}
        </Button>
      </Stack>
    </Box>
  );
};
