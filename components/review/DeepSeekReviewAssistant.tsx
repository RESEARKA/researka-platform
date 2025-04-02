/**
 * DeepSeekReviewAssistant Component
 * 
 * A React component that integrates DeepSeek-V3-0324 AI capabilities
 * into the article review workflow, providing AI-assisted suggestions
 * for reviewers.
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Spinner,
  Text,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { createDeepSeekAI } from '../../utils/deepseekAI';
import { generatePrompt } from '../../utils/geminiPrompts';
import { createLogger, LogCategory } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { Article, ReviewSuggestion } from '../../types/review';

// Create a logger for this component
const logger = createLogger('DeepSeekReviewAssistant');

// Constants
const MAX_SUGGESTIONS = 4;
const MAX_ERROR_LENGTH = 100;

// Define component props
interface DeepSeekReviewAssistantProps {
  article: Article;
  onSuggestionsGenerated?: (suggestions: ReviewSuggestion[]) => void;
  onError?: (error: string) => void;
  onAnalysisStateChange?: (isAnalyzing: boolean) => void;
  autoAnalyze?: boolean;
}

/**
 * DeepSeekReviewAssistant component for providing AI-assisted review suggestions
 * 
 * This component is designed to be more concise and integrated directly into
 * the review workflow rather than as a separate tab.
 */
export default function DeepSeekReviewAssistant({
  article,
  onSuggestionsGenerated,
  onError,
  onAnalysisStateChange,
  autoAnalyze = false,
}: DeepSeekReviewAssistantProps) {
  // State for the component
  const [suggestions, setSuggestions] = useState<ReviewSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Toast for notifications
  const toast = useToast();
  
  // Effect to notify parent component of analysis state changes
  useEffect(() => {
    if (onAnalysisStateChange) {
      onAnalysisStateChange(isAnalyzing);
    }
  }, [isAnalyzing, onAnalysisStateChange]);
  
  // Auto-analyze on component mount if enabled
  useEffect(() => {
    if (autoAnalyze && article && !analysisComplete && !isAnalyzing) {
      analyzeArticle();
    }
  }, [article, autoAnalyze, analysisComplete, isAnalyzing]);
  
  // Ensure suggestions are properly passed to parent when component mounts
  useEffect(() => {
    if (analysisComplete && suggestions.length > 0 && onSuggestionsGenerated) {
      onSuggestionsGenerated(suggestions);
    }
  }, [analysisComplete, suggestions, onSuggestionsGenerated]);
  
  // Analyze the article with DeepSeek AI
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
    if (onAnalysisStateChange) {
      onAnalysisStateChange(true);
    }
    
    setError(null);
    setSuggestions([]);
    setAnalysisComplete(false);
    
    try {
      // Create the DeepSeek AI client
      const deepseekAI = createDeepSeekAI();
      
      // Log the analysis attempt
      logger.debug('Analyzing article', {
        context: { articleId: article.id, title: article.title },
        category: LogCategory.SYSTEM
      });
      
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
      const articleSuggestions = parseArticleAnalysis(
        articleResponse.text,
        article.id
      );
      
      // Update state with the suggestions
      setSuggestions(articleSuggestions);
      setAnalysisComplete(true);
      
      // Call the callback if provided
      if (onSuggestionsGenerated) {
        onSuggestionsGenerated(articleSuggestions);
      }
      
      logger.debug('Article analysis complete', {
        context: { 
          articleId: article.id, 
          suggestionCount: articleSuggestions.length 
        },
        category: LogCategory.SYSTEM
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message.substring(0, MAX_ERROR_LENGTH) 
        : 'Unknown error occurred';
      
      logger.error('Error analyzing article', { 
        context: { error: errorMessage, articleId: article.id },
        category: LogCategory.ERROR
      });
      
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      
      if (onError) {
        onError(errorMessage);
      }
      
      toast({
        title: 'Error analyzing article',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAnalyzing(false);
      if (onAnalysisStateChange) {
        onAnalysisStateChange(false);
      }
    }
  };
  
  return (
    <Box>
      {isAnalyzing ? (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          p={4}
          borderRadius="md"
          bg="gray.50"
        >
          <Spinner size="sm" mr={2} />
          <Text>Analyzing article with DeepSeek AI...</Text>
          <Text ml={2} fontSize="sm" color="gray.500">This may take a minute or two.</Text>
        </Box>
      ) : (
        <>
          {!analysisComplete && (
            <Button
              onClick={analyzeArticle}
              colorScheme="blue"
              isLoading={isAnalyzing}
              loadingText="Analyzing..."
              width="100%"
              mb={4}
            >
              Analyze Article
            </Button>
          )}
          
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          
          {analysisComplete && suggestions.length > 0 && (
            <Text color="green.600">Analysis complete. Suggestions have been generated.</Text>
          )}
        </>
      )}
    </Box>
  );
}

/**
 * Parse article analysis from DeepSeek into structured suggestions
 */
function parseArticleAnalysis(analysisText: string, articleId: string): ReviewSuggestion[] {
  try {
    // Try to parse as JSON first
    try {
      const jsonResponse = JSON.parse(analysisText);
      if (jsonResponse.suggestions && Array.isArray(jsonResponse.suggestions)) {
        return jsonResponse.suggestions.map((s: any, index: number) => ({
          id: s.id || `${articleId}-suggestion-${index}-${uuidv4().substring(0, 8)}`,
          category: s.category || 'GENERAL',
          content: s.content || s.text || '',
          priority: s.priority || determinePriority(s.content || s.text || ''),
        })).slice(0, MAX_SUGGESTIONS);
      }
    } catch (e) {
      // Not JSON, continue with text parsing
    }
    
    // Simple parsing for text responses
    const sections = analysisText.split(/\n#{2,3}\s+/);
    return sections.slice(1).map((section, index) => {
      const lines = section.split('\n');
      const category = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      
      return {
        id: `${articleId}-suggestion-${index}-${uuidv4().substring(0, 8)}`,
        category,
        content,
        priority: determinePriority(content),
      };
    }).slice(0, MAX_SUGGESTIONS);
  } catch (error) {
    logger.error('Error parsing article analysis', { 
      context: { error, articleId },
      category: LogCategory.ERROR
    });
    return [];
  }
}

/**
 * Determine the priority of a suggestion based on its content
 */
function determinePriority(text: string): 'high' | 'medium' | 'low' {
  const lowerText = text.toLowerCase();
  
  if (
    lowerText.includes('critical') || 
    lowerText.includes('serious') || 
    lowerText.includes('major issue') ||
    lowerText.includes('significant problem')
  ) {
    return 'high';
  }
  
  if (
    lowerText.includes('should') || 
    lowerText.includes('recommend') || 
    lowerText.includes('consider') ||
    lowerText.includes('improve')
  ) {
    return 'medium';
  }
  
  return 'low';
}
