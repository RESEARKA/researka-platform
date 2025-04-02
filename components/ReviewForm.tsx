import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
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
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { FiSend, FiStar, FiInfo } from 'react-icons/fi';
import { submitReview, logUserReviews } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';
import dynamic from 'next/dynamic';

// Dynamic import for the DeepSeekReviewAssistant to avoid SSR issues
const DynamicDeepSeekReviewAssistant = dynamic(
  () => import('./review/DeepSeekReviewAssistant'),
  { ssr: false }
);

// Dynamic import for the AISummary component
const DynamicAISummary = dynamic(
  () => import('./review/AISummary').then(mod => mod.AISummary),
  { ssr: false }
);

interface ReviewFormProps {
  articleId: string;
  articleTitle: string;
  articleAbstract?: string;
  articleContent?: string;
  articleCategory?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Define the review category scores interface
interface ReviewScores {
  originality: number;
  methodology: number;
  clarity: number;
  significance: number;
  technicalQuality: number;
  overall: number;
}

// Define review criteria with descriptions
const REVIEW_CRITERIA = [
  { id: 'originality', label: 'Originality/Novelty', description: 'Evaluate the originality of ideas, concepts, or approaches' },
  { id: 'methodology', label: 'Methodology/Rigor', description: 'Assess the soundness of research methods and analytical rigor' },
  { id: 'clarity', label: 'Clarity/Presentation', description: 'Rate the clarity of writing, organization, and presentation' },
  { id: 'significance', label: 'Significance/Impact', description: 'Evaluate the potential impact and significance of the work' },
  { id: 'technicalQuality', label: 'References', description: 'Assess the quality and relevance of citations and references' }
];

function ReviewForm({ 
  articleId, 
  articleTitle, 
  articleAbstract = '', 
  articleContent = '',
  articleCategory = 'general academic',
  onSuccess, 
  onCancel 
}: ReviewFormProps) {
  // Initialize all scores with default value of 3
  const [scores, setScores] = useState<ReviewScores>({
    originality: 3,
    methodology: 3,
    clarity: 3,
    significance: 3,
    technicalQuality: 3,
    overall: 3
  });
  const [recommendation, setRecommendation] = useState<'accept' | 'minor_revisions' | 'major_revisions' | 'reject'>('minor_revisions');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTooltip, setShowTooltip] = useState<{[key: string]: boolean}>({
    originality: false,
    methodology: false,
    clarity: false,
    significance: false,
    technicalQuality: false,
    overall: false
  });
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiScores, setAiScores] = useState<Record<string, number> | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  
  const { currentUser, getUserProfile } = useAuth();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Generate AI ratings based on suggestions
  const generateAIRatings = (suggestions: any[]): Record<string, number> => {
    // Default base rating
    const baseRating = 3;
    
    // Generate ratings for each criterion based on suggestion categories
    const ratings: Record<string, number> = {};
    
    // Set default ratings
    REVIEW_CRITERIA.forEach(criterion => {
      ratings[criterion.id] = baseRating;
    });
    
    // Adjust ratings based on suggestions
    suggestions.forEach(suggestion => {
      if (suggestion.category && ratings[suggestion.category]) {
        // Adjust rating based on priority
        if (suggestion.priority === 'high') {
          ratings[suggestion.category] = Math.max(1, ratings[suggestion.category] - 1);
        } else if (suggestion.priority === 'medium') {
          ratings[suggestion.category] = Math.max(1, ratings[suggestion.category] - 0.5);
        }
      }
    });
    
    // Round ratings to nearest 0.5
    Object.keys(ratings).forEach(key => {
      ratings[key] = Math.round(ratings[key] * 2) / 2;
    });
    
    return ratings;
  };

  // Handle AI suggestions
  const handleSuggestionsGenerated = (suggestions: any[]) => {
    setAiSuggestions(suggestions);
    setIsAiAnalyzing(false);
    
    // Generate AI ratings
    const ratings = generateAIRatings(suggestions);
    setAiScores(ratings);
    
    // Pre-fill the form with AI-generated ratings
    setScores(prev => {
      const newScores = { ...prev };
      
      // Update each category with AI rating
      Object.keys(ratings).forEach(category => {
        if (category in newScores) {
          newScores[category as keyof ReviewScores] = ratings[category];
        }
      });
      
      // Calculate overall score
      const { overall, ...categoryScores } = newScores;
      const sum = Object.values(categoryScores).reduce((a, b) => a + b, 0);
      const avg = sum / Object.values(categoryScores).length;
      
      return { ...newScores, overall: parseFloat(avg.toFixed(1)) };
    });
  };

  // Handle AI analysis error
  const handleAiError = (error: string) => {
    setAiError(error);
    setIsAiAnalyzing(false);
  };

  // Update a specific score category
  const updateScore = (category: keyof ReviewScores, value: number) => {
    // Ensure value is within valid range (1-5)
    if (value < 1) {
      value = 1;
    } else if (value > 5) {
      value = 5;
    }
    
    // Update the score
    setScores(prev => ({
      ...prev,
      [category]: value
    }));
  };

  // Toggle tooltip visibility for a specific slider
  const toggleTooltip = (category: keyof ReviewScores, isVisible: boolean) => {
    setShowTooltip(prev => ({ ...prev, [category]: isVisible }));
  };

  // Handle form submission
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
        score: scores.overall,
        scores: {
          originality: scores.originality,
          methodology: scores.methodology,
          clarity: scores.clarity,
          significance: scores.significance,
          technicalQuality: scores.technicalQuality
        },
        recommendation,
        content,
        aiAssisted: aiSuggestions.length > 0,
      };
      
      console.log('ReviewForm: Submitting review', reviewData);
      
      // Submit review
      await submitReview(reviewData);
      
      // Debug: Log all reviews for the current user
      console.log('ReviewForm: Logging all reviews for current user');
      await logUserReviews();
      
      toast({
        title: 'Review submitted',
        description: 'Your review has been successfully submitted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form
      setScores({
        originality: 3,
        methodology: 3,
        clarity: 3,
        significance: 3,
        technicalQuality: 3,
        overall: 3
      });
      setRecommendation('minor_revisions');
      setContent('');
      
      // Call onSuccess callback if provided - this should trigger a refresh of the articles list
      if (onSuccess) {
        console.log('ReviewForm: Calling onSuccess callback to refresh articles');
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

  // Create a slider for a specific review category
  const renderScoreSlider = (
    category: keyof ReviewScores, 
    label: string, 
    description: string
  ) => {
    // Determine if this rating has an AI suggestion
    const hasAiSuggestion = aiScores && category in aiScores;
    const aiValue = hasAiSuggestion ? aiScores[category] : null;
    
    return (
      <FormControl id={`score-${category}`} mb={4}>
        <FormLabel>
          {label}
          {hasAiSuggestion && (
            <Tooltip
              label={`AI suggested rating: ${aiValue}. You can adjust by +/- 1 point.`}
              placement="top"
              hasArrow
            >
              <Box as="span" ml={2} color="purple.500">
                <FiInfo />
              </Box>
            </Tooltip>
          )}
        </FormLabel>
        <Flex>
          <Box flex="1" pr={8}>
            <Slider
              id={`${category}-slider`}
              min={1}
              max={5}
              step={0.5}
              value={scores[category]}
              onChange={(val) => updateScore(category, val)}
              onMouseEnter={() => toggleTooltip(category, true)}
              onMouseLeave={() => toggleTooltip(category, false)}
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
                isOpen={showTooltip[category]}
                label={`${scores[category].toFixed(1)}`}
              >
                <SliderThumb boxSize={6}>
                  <Box color="purple.500" as={FiStar} />
                </SliderThumb>
              </Tooltip>
            </Slider>
          </Box>
          <Text fontWeight="bold" fontSize="xl">
            {scores[category].toFixed(1)}
            {hasAiSuggestion && aiValue === scores[category] && (
              <Text as="span" fontSize="sm" ml={1} color="purple.500">
                (AI)
              </Text>
            )}
          </Text>
        </Flex>
        <FormHelperText>{description}</FormHelperText>
      </FormControl>
    );
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
        
        {/* AI Analysis Section */}
        <Box 
          p={4} 
          bg={useColorModeValue('purple.50', 'purple.900')} 
          borderRadius="md"
          borderWidth="1px"
          borderColor={useColorModeValue('purple.200', 'purple.700')}
        >
          <Heading as="h4" size="sm" mb={4}>
            AI Analysis
          </Heading>
          
          {isAiAnalyzing ? (
            <Box textAlign="center" py={4}>
              <Text mb={2}>Analyzing article with AI...</Text>
              <Text fontSize="sm" color="gray.500">
                This may take a few moments. The AI is reviewing the article and generating suggestions.
              </Text>
            </Box>
          ) : aiError ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription>{aiError}</AlertDescription>
            </Alert>
          ) : (
            <>
              {aiSuggestions.length > 0 ? (
                <>
                  <DynamicAISummary 
                    suggestions={aiSuggestions} 
                    aiRatings={aiScores ? {
                      originality: aiScores.originality || 3,
                      methodology: aiScores.methodology || 3,
                      clarity: aiScores.clarity || 3,
                      significance: aiScores.significance || 3,
                      references: aiScores.technicalQuality || 3
                    } : null}
                    isLoading={false} 
                    error={null}
                  />
                  
                  <Alert status="info" mt={4} borderRadius="md">
                    <AlertIcon />
                    <AlertDescription>
                      AI has analyzed this article with suggested feedback.
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <Text>No AI suggestions available. Please proceed with your review.</Text>
              )}
            </>
          )}
        </Box>
        
        <Divider />
        
        {/* Review Form Section */}
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading as="h4" size="sm" mb={4}>
              Review Scores
            </Heading>
            
            {REVIEW_CRITERIA.map(criterion => (
              renderScoreSlider(
                criterion.id as keyof ReviewScores,
                criterion.label,
                criterion.description
              )
            ))}
            
            <Divider my={4} />
            
            <FormControl id="overall-score">
              <FormLabel fontWeight="bold">Overall Score (Auto-calculated)</FormLabel>
              <Flex>
                <Box flex="1" pr={8}>
                  <Slider
                    id="overall-slider"
                    min={1}
                    max={5}
                    step={0.1}
                    value={scores.overall}
                    isReadOnly
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
                    <SliderThumb boxSize={6}>
                      <Box color="purple.500" as={FiStar} />
                    </SliderThumb>
                  </Slider>
                </Box>
                <Text fontWeight="bold" fontSize="xl">
                  {scores.overall.toFixed(1)}
                </Text>
              </Flex>
              <FormHelperText>Average of all category scores</FormHelperText>
            </FormControl>
          </Box>
          
          <FormControl id="recommendation" isRequired>
            <FormLabel>Recommendation</FormLabel>
            <Select
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value as any)}
            >
              <option value="accept">Accept (No Revisions Needed)</option>
              <option value="minor_revisions">Accept with Minor Revisions</option>
              <option value="major_revisions">Major Revisions Required</option>
              <option value="reject">Reject</option>
            </Select>
            <FormHelperText>Your recommendation for this article</FormHelperText>
          </FormControl>
          
          <FormControl id="review-content" isRequired>
            <FormLabel>Review Content</FormLabel>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide detailed feedback on the article..."
              size="lg"
              rows={10}
            />
            <FormHelperText>
              Include specific feedback, suggestions for improvement, and justification for your scores
            </FormHelperText>
          </FormControl>
          
          <Flex justify="space-between">
            {onCancel && (
              <Button 
                onClick={onCancel}
                colorScheme="gray"
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit"
              colorScheme="purple"
              isLoading={isSubmitting}
              loadingText="Submitting..."
              rightIcon={<FiSend />}
              ml="auto"
            >
              Submit Review
            </Button>
          </Flex>
        </VStack>
        
        {/* Hidden DeepSeekReviewAssistant to perform the analysis */}
        <Box display="none">
          <DynamicDeepSeekReviewAssistant
            article={{
              id: articleId,
              title: articleTitle,
              abstract: articleAbstract,
              content: articleContent,
              category: articleCategory,
            }}
            onSuggestionsGenerated={handleSuggestionsGenerated}
            onError={handleAiError}
            autoAnalyze={true}
          />
        </Box>
      </VStack>
    </Box>
  );
}

export default ReviewForm;
