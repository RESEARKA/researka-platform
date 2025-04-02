import React, { useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Icon,
  Select,
  Spinner,
  Stack,
  Text,
  Textarea,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';
import { useReviewForm } from '../../hooks/useReviewForm';
import { Review } from '../../types/review';
import { AISummary } from './AISummary';
import DeepSeekReviewAssistant from './DeepSeekReviewAssistant';
import { determineAIDecision } from '../../utils/reviewUtils';

// Define the props for the component
interface ReviewFormProps {
  article: {
    id: string;
    title: string;
    abstract: string;
    content?: string;
    category?: string;
  };
  initialReview?: Partial<Review>;
  onSubmit: (review: Partial<Review>) => Promise<void>;
}

// Rating criteria for the review form
const ratingCriteria = [
  {
    key: 'originality',
    label: 'Originality',
    description: 'The novelty and uniqueness of the research',
  },
  {
    key: 'methodology',
    label: 'Methodology',
    description: 'The soundness of the research methods',
  },
  {
    key: 'clarity',
    label: 'Clarity',
    description: 'How well the article is written and structured',
  },
  {
    key: 'significance',
    label: 'Significance',
    description: 'The importance and impact of the research',
  },
  {
    key: 'references',
    label: 'References',
    description: 'The quality and relevance of the cited works',
  },
];

// Decision labels for the review form
const decisionLabels = {
  accept: 'Accept',
  minor_revision: 'Minor Revision',
  major_revision: 'Major Revision',
  reject: 'Reject',
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
  onSubmit 
}) => {
  // Use the custom hook to manage all form state and logic
  const {
    review,
    suggestions,
    aiRatings, 
    isAIAnalyzing,
    setIsAIAnalyzing,
    isAIAnalysisComplete,
    isFormLocked,
    isSubmitting,
    setIsSubmitting, 
    errors,
    isEditing,
    handleChange, 
    handleSuggestionsGenerated, 
    handleAnalyzeRequest, 
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
          // Ensure aiRatings is not null and has valid structure before passing
          const validRatings = Object.entries(aiRatings).reduce((acc, [key, value]) => {
             if (typeof value === 'number') {
               acc[key as keyof Review['ratings']] = value;
             }
             return acc;
          }, {} as Review['ratings']);

          // Check if we have enough valid ratings to make a decision
          if(Object.keys(validRatings).length !== Object.keys(ratingCriteria).length) {
              console.warn("Cannot determine AI decision: Incomplete AI ratings.");
              return null;
          }
          
          return determineAIDecision(validRatings);
      } catch (error) {
          console.error("Error determining AI decision for display:", error);
          return null;
      }
  }, [aiRatings]);

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
                />
              </Box>
            )}
             {isAIAnalysisComplete && suggestions.length === 0 && (
               <Text color="green.600">AI analysis complete. No major issues found.</Text>
            )}
            {/* Always render DeepSeekReviewAssistant when analyzing */} 
            {isAIAnalyzing && (
              <DeepSeekReviewAssistant 
                article={article} 
                onSuggestionsGenerated={handleSuggestionsGenerated} 
                onAnalysisStateChange={(analyzing) => setIsAIAnalyzing(analyzing)}
                autoAnalyze={true}
                onError={(errorMsg) => {
                    console.error("AI Analysis Error:", errorMsg);
                    toast({ title: 'AI Analysis Failed', description: errorMsg, status: 'error', duration: 5000, isClosable: true });
                }}
              />
            )}
          </CardBody>
        </Card>

        {/* Ratings Section */}
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Heading as="h3" size="md" mb={4}>Review Criteria Ratings</Heading>
          {ratingCriteria.map((criterion) => {
             const ratingKey = criterion.key;
             const currentRating = review.ratings?.[ratingKey] ?? 3; 
             const aiSuggestion = aiRatings?.[ratingKey];

             return (
                <FormControl key={ratingKey} mb={4} isInvalid={!!errors.ratings}>
                <FormLabel>
                    {criterion.label}
                    <Tooltip label={criterion.description} placement="top" hasArrow>
                    <Icon as={FiInfo} ml={2} color="gray.500" />
                    </Tooltip>
                </FormLabel>
                <Select
                    value={currentRating}
                    onChange={(e) => {
                      const newRatingValue = parseInt(e.target.value, 10);
                      // Update the specific rating within the ratings object using hook's handler
                      handleChange('ratings', { 
                          ...(review.ratings || { originality: 3, methodology: 3, clarity: 3, significance: 3, references: 3 }), 
                          [ratingKey]: newRatingValue 
                      });
                    }}
                    isDisabled={isFormLocked} 
                    placeholder={`Select rating for ${criterion.label}`}
                >
                    {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>
                            {num} - {getRatingLabel('', num)}
                        </option>
                    ))}
                </Select>
                {aiSuggestion && (
                    <Text fontSize="sm" color="blue.600" mt={1}>
                        AI Suggested Rating: {aiSuggestion} 
                    </Text>
                )}
                {errors.ratings && ratingKey === 'originality' && (
                    <FormErrorMessage>{errors.ratings}</FormErrorMessage>
                )}
                </FormControl>
             );
          })}
        </Box>

        {/* Decision Section */}
        <FormControl mb={6} isInvalid={!!errors.decision}>
          <FormLabel>Decision</FormLabel>
          <Select
            value={review.decision || ''} 
            onChange={(e) => handleChange('decision', e.target.value as Review['decision'])}
            isDisabled={isFormLocked} 
            placeholder="Select decision"
          >
            {(Object.keys(decisionLabels) as Array<keyof typeof decisionLabels>).map((decisionKey) => (
              <option key={decisionKey} value={decisionKey}>
                {decisionLabels[decisionKey]}
              </option>
            ))}
          </Select>
          {aiSuggestedDecision && (
            <Text fontSize="sm" color="blue.600" mt={1}>
              AI Suggested Decision: {decisionLabels[aiSuggestedDecision] || aiSuggestedDecision}
            </Text>
          )}
          {errors.decision && (
            <FormErrorMessage>{errors.decision}</FormErrorMessage>
          )}
        </FormControl>

        {/* Comments Section */}
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Heading as="h3" size="md" mb={4}>Review Comments</Heading>
          <FormControl mb={4} isInvalid={!!errors.comments}>
            <FormLabel>Comments for Author</FormLabel>
            <Textarea
              value={review.comments || ''} 
              onChange={(e) => handleChange('comments', e.target.value)} 
              isDisabled={isFormLocked} 
              placeholder="Provide constructive feedback for the author..."
            />
            {errors.comments && (
              <FormErrorMessage>{errors.comments}</FormErrorMessage>
            )}
          </FormControl>
          
          <FormControl>
            <FormLabel>Private Comments (Optional)</FormLabel>
            <Textarea
              value={review.privateComments || ''} 
              onChange={(e) => handleChange('privateComments', e.target.value)} 
              isDisabled={isFormLocked} 
              placeholder="Private comments visible only to the editor..."
            />
            {/* No error message needed usually for private comments */}
          </FormControl>
        </Box>
        
        <Button 
          colorScheme="blue"
          onClick={handleSubmit}
          isLoading={isSubmitting} 
          isDisabled={isFormLocked || isSubmitting} 
        >
          {isEditing ? 'Update Review' : 'Submit Review'}
        </Button>
      </Stack>
    </Box>
  );
};
