'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Heading,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { AISummary } from './AISummary';
import { createDeepSeekAI } from '../utils/deepseekAI';
import { generatePrompt } from '../utils/geminiPrompts';
import { createLogger, LogCategory } from '../utils/logger';
import { Article, Review, ReviewSuggestion } from '../types/review';

// Create a logger for this component
const logger = createLogger('ReviewForm');

interface ReviewFormProps {
  article: Article;
  onSubmit: (review: Review) => Promise<void>;
}

/**
 * ReviewForm Component
 * 
 * Integrated form for reviewing academic articles with AI assistance.
 * The AI analysis is automatically triggered when the component loads.
 */
export function ReviewForm({ article, onSubmit }: ReviewFormProps) {
  // Form state
  const [review, setReview] = useState<Partial<Review>>({
    articleId: article.id,
    rating: 3,
    originality: 3,
    methodology: 3,
    clarity: 3,
    significance: 3,
    technicalQuality: 3,
    comments: '',
    recommendation: 'minor_revision',
  });
  
  // AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<ReviewSuggestion[]>([]);
  const [aiError, setAiError] = useState<Error | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  const toast = useToast();
  
  // Automatically trigger AI analysis when component loads
  useEffect(() => {
    if (article && !analysisComplete && !isAnalyzing) {
      analyzeArticle();
    }
  }, [article]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReview({
      ...review,
      [name]: name.includes('rating') || name.includes('originality') || 
               name.includes('methodology') || name.includes('clarity') || 
               name.includes('significance') || name.includes('technicalQuality')
        ? parseInt(value, 10)
        : value,
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(review as Review);
      toast({
        title: 'Review submitted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      logger.error('Error submitting review', { 
        context: { error, articleId: article.id },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error submitting review',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Analyze article with DeepSeek AI
  const analyzeArticle = async () => {
    if (!article || !article.title || !article.abstract) {
      toast({
        title: 'Missing article information',
        description: 'The article must have at least a title and abstract',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsAnalyzing(true);
    setAiError(null);
    
    try {
      // Create the DeepSeek AI client
      const deepseekAI = createDeepSeekAI();
      
      // Generate the prompt for article review
      const articlePrompt = generatePrompt('reviewArticle', {
        title: article.title,
        abstract: article.abstract,
        content: article.content || '',
        field: article.category || 'general academic',
      });
      
      // Send the request to DeepSeek
      const articleResponse = await deepseekAI.generateContent(articlePrompt);
      
      if (!articleResponse.success) {
        throw new Error(articleResponse.error?.message || 'Failed to analyze article');
      }
      
      // Parse the article analysis into structured suggestions
      const suggestions = parseArticleAnalysis(
        articleResponse.text,
        article.id
      );
      
      setAiSuggestions(suggestions);
      setAnalysisComplete(true);
      
      // Pre-fill some review fields based on AI suggestions if they exist
      if (suggestions.length > 0) {
        const recommendationSuggestion = suggestions.find(s => 
          s.category.toLowerCase().includes('recommendation')
        );
        
        if (recommendationSuggestion) {
          const recommendationText = recommendationSuggestion.content.toLowerCase();
          let recommendationValue = 'minor_revision';
          
          if (recommendationText.includes('accept') || recommendationText.includes('publish')) {
            recommendationValue = 'accept';
          } else if (recommendationText.includes('major revision')) {
            recommendationValue = 'major_revision';
          } else if (recommendationText.includes('reject')) {
            recommendationValue = 'reject';
          }
          
          setReview(prev => ({
            ...prev,
            recommendation: recommendationValue
          }));
        }
      }
      
    } catch (error) {
      logger.error('Error analyzing article', { 
        context: { error, articleId: article.id },
        category: LogCategory.ERROR
      });
      
      setAiError(error instanceof Error ? error : new Error('Unknown error occurred'));
      
      toast({
        title: 'Error analyzing article',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Parse the AI response into structured suggestions
  const parseArticleAnalysis = (text: string, articleId: string): ReviewSuggestion[] => {
    try {
      // Try to parse as JSON first
      try {
        const jsonResponse = JSON.parse(text);
        if (jsonResponse.suggestions && Array.isArray(jsonResponse.suggestions)) {
          return jsonResponse.suggestions.map((s: any, index: number) => ({
            id: `${articleId}-suggestion-${index}`,
            category: s.category || 'General',
            content: s.content || s.text || '',
            priority: s.priority || 'medium',
          }));
        }
      } catch (e) {
        // Not JSON, continue with text parsing
      }
      
      // Simple parsing for text responses
      const sections = text.split(/\n#{2,3}\s+/);
      return sections.slice(1).map((section, index) => {
        const lines = section.split('\n');
        const category = lines[0].trim();
        const content = lines.slice(1).join('\n').trim();
        
        return {
          id: `${articleId}-suggestion-${index}`,
          category,
          content,
          priority: content.toLowerCase().includes('critical') || 
                   content.toLowerCase().includes('major') ? 'high' : 'medium',
        };
      });
    } catch (error) {
      logger.error('Error parsing article analysis', { 
        context: { error, articleId },
        category: LogCategory.ERROR
      });
      return [];
    }
  };
  
  return (
    <Box as="form" onSubmit={handleSubmit}>
      {/* AI Summary Section - Always visible */}
      <AISummary 
        suggestions={aiSuggestions} 
        isLoading={isAnalyzing} 
        error={aiError} 
      />
      
      {/* Manual Review Form */}
      <VStack spacing={4} align="stretch">
        <Heading size="md">Your Expert Review</Heading>
        
        {/* Overall Rating */}
        <FormControl isRequired>
          <FormLabel>Overall Rating (1-5)</FormLabel>
          <Select 
            name="rating" 
            value={review.rating} 
            onChange={handleInputChange}
          >
            <option value={1}>1 - Poor</option>
            <option value={2}>2 - Fair</option>
            <option value={3}>3 - Good</option>
            <option value={4}>4 - Very Good</option>
            <option value={5}>5 - Excellent</option>
          </Select>
        </FormControl>
        
        {/* Detailed Ratings */}
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Originality</FormLabel>
            <Select 
              name="originality" 
              value={review.originality} 
              onChange={handleInputChange}
            >
              {[1, 2, 3, 4, 5].map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>Methodology</FormLabel>
            <Select 
              name="methodology" 
              value={review.methodology} 
              onChange={handleInputChange}
            >
              {[1, 2, 3, 4, 5].map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </Select>
          </FormControl>
        </HStack>
        
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Clarity</FormLabel>
            <Select 
              name="clarity" 
              value={review.clarity} 
              onChange={handleInputChange}
            >
              {[1, 2, 3, 4, 5].map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>Significance</FormLabel>
            <Select 
              name="significance" 
              value={review.significance} 
              onChange={handleInputChange}
            >
              {[1, 2, 3, 4, 5].map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </Select>
          </FormControl>
        </HStack>
        
        <FormControl>
          <FormLabel>Technical Quality</FormLabel>
          <Select 
            name="technicalQuality" 
            value={review.technicalQuality} 
            onChange={handleInputChange}
          >
            {[1, 2, 3, 4, 5].map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </Select>
        </FormControl>
        
        {/* Comments */}
        <FormControl isRequired>
          <FormLabel>Comments</FormLabel>
          <Textarea 
            name="comments" 
            value={review.comments} 
            onChange={handleInputChange} 
            placeholder="Provide detailed feedback on the article..."
            rows={6}
          />
        </FormControl>
        
        {/* Recommendation */}
        <FormControl isRequired>
          <FormLabel>Recommendation</FormLabel>
          <Select 
            name="recommendation" 
            value={review.recommendation} 
            onChange={handleInputChange}
          >
            <option value="accept">Accept</option>
            <option value="minor_revision">Accept with Minor Revisions</option>
            <option value="major_revision">Major Revision Required</option>
            <option value="reject">Reject</option>
          </Select>
        </FormControl>
        
        {/* Submit Button */}
        <Button 
          type="submit" 
          colorScheme="blue" 
          size="lg" 
          isLoading={isAnalyzing}
          loadingText="Analyzing..."
        >
          Submit Review
        </Button>
      </VStack>
      
      {/* Re-analyze Button */}
      {!isAnalyzing && (
        <Button 
          mt={4} 
          onClick={analyzeArticle} 
          size="sm" 
          variant="outline"
        >
          Re-analyze with AI
        </Button>
      )}
    </Box>
  );
}
