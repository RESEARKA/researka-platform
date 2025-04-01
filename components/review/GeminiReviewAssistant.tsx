/**
 * GeminiReviewAssistant Component
 * 
 * A React component that integrates Gemini 2.5 Pro AI capabilities
 * into the article review workflow, providing AI-assisted suggestions
 * for reviewers.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  Badge,
  useToast,
  Spinner,
  Tooltip,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { CheckIcon, InfoIcon, WarningIcon, StarIcon } from '@chakra-ui/icons';
import { createGeminiAI } from '../../utils/geminiAI';
import { generatePrompt } from '../../utils/geminiPrompts';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger for this component
const logger = createLogger('GeminiReviewAssistant');

// Define article interface
interface Article {
  id: string;
  title: string;
  abstract: string;
  content?: string;
  author?: string;
  category?: string;
  codeSnippets?: Array<{
    language: string;
    code: string;
    description?: string;
  }>;
}

// Define component props
interface GeminiReviewAssistantProps {
  article: Article;
  onSuggestionsGenerated?: (suggestions: ReviewSuggestion[]) => void;
  autoAnalyze?: boolean;
}

// Define review suggestion interface
interface ReviewSuggestion {
  id: string;
  type: 'logic' | 'structure' | 'code' | 'citations' | 'general';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  section?: string;
  lineNumbers?: number[];
  codeSnippetId?: string;
}

/**
 * GeminiReviewAssistant component for providing AI-assisted review suggestions
 */
export default function GeminiReviewAssistant({
  article,
  onSuggestionsGenerated,
  autoAnalyze = false,
}: GeminiReviewAssistantProps) {
  // State for the component
  const [suggestions, setSuggestions] = useState<ReviewSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ReviewSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Toast for notifications
  const toast = useToast();
  
  // Analyze the article with Gemini AI
  const analyzeArticle = useCallback(async () => {
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
    setError(null);
    setSuggestions([]);
    setAnalysisComplete(false);
    
    try {
      // Create the Gemini AI client
      const geminiAI = createGeminiAI();
      
      // Start with analyzing the overall article structure and logic
      logger.debug('Analyzing article structure and logic', {
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
      
      // Send the request to Gemini
      const articleResponse = await geminiAI.generateContent(articlePrompt);
      
      if (!articleResponse.success) {
        throw new Error(articleResponse.error?.message || 'Failed to analyze article');
      }
      
      // Parse the article analysis into structured suggestions
      const articleSuggestions = parseArticleAnalysis(
        articleResponse.text,
        article.id
      );
      
      // If there are code snippets, analyze them too
      let codeSuggestions: ReviewSuggestion[] = [];
      
      if (article.codeSnippets && article.codeSnippets.length > 0) {
        logger.debug('Analyzing code snippets', {
          context: { articleId: article.id, snippetCount: article.codeSnippets.length },
          category: LogCategory.SYSTEM
        });
        
        // Analyze each code snippet
        const codePromises = article.codeSnippets.map(async (snippet, index) => {
          const codePrompt = generatePrompt('codeReview', {
            code: snippet.code,
            language: snippet.language,
            context: snippet.description || `Code snippet ${index + 1} from article "${article.title}"`,
          });
          
          const codeResponse = await geminiAI.generateContent(codePrompt);
          
          if (!codeResponse.success) {
            logger.error('Failed to analyze code snippet', {
              context: { error: codeResponse.error, snippetIndex: index },
              category: LogCategory.ERROR
            });
            return [];
          }
          
          return parseCodeAnalysis(
            codeResponse.text,
            article.id,
            index.toString(),
            snippet.language
          );
        });
        
        // Wait for all code analyses to complete
        const codeResults = await Promise.all(codePromises);
        codeSuggestions = codeResults.flat();
      }
      
      // Combine all suggestions
      const allSuggestions = [...articleSuggestions, ...codeSuggestions];
      
      // Update state with the suggestions
      setSuggestions(allSuggestions);
      setAnalysisComplete(true);
      
      // Call the callback if provided
      if (onSuggestionsGenerated) {
        onSuggestionsGenerated(allSuggestions);
      }
      
      logger.debug('Article analysis complete', {
        context: { 
          articleId: article.id, 
          suggestionCount: allSuggestions.length 
        },
        category: LogCategory.SYSTEM
      });
      
      toast({
        title: 'Analysis complete',
        description: `Generated ${allSuggestions.length} review suggestions`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      logger.error('Error analyzing article', {
        context: { error: err, articleId: article.id },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error analyzing article',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [article, toast, onSuggestionsGenerated]);
  
  // Run auto-analysis when the component mounts if autoAnalyze is true
  useEffect(() => {
    if (autoAnalyze && article && !analysisComplete && !isAnalyzing) {
      analyzeArticle();
    }
  }, [autoAnalyze, article, analysisComplete, isAnalyzing, analyzeArticle]);
  
  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: ReviewSuggestion) => {
    setSelectedSuggestion(suggestion);
    onOpen();
  }, [onOpen]);
  
  // Get badge color based on severity
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'warning':
        return 'orange';
      case 'info':
      default:
        return 'blue';
    }
  };
  
  // Get icon based on suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'logic':
        return <InfoIcon />;
      case 'code':
        return <WarningIcon />;
      case 'citations':
        return <StarIcon />;
      default:
        return <CheckIcon />;
    }
  };
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" width="100%">
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Heading size="md">AI Review Assistant</Heading>
          <Tooltip label="Powered by Gemini 2.5 Pro">
            <IconButton
              aria-label="Info"
              icon={<InfoIcon />}
              size="sm"
              variant="ghost"
            />
          </Tooltip>
        </HStack>
        
        <Text fontSize="sm" color="gray.600">
          Get AI-powered suggestions to help with your review of "{article.title}".
        </Text>
        
        {!analysisComplete && !isAnalyzing && (
          <Button
            colorScheme="blue"
            onClick={analyzeArticle}
            isLoading={isAnalyzing}
            loadingText="Analyzing..."
            leftIcon={isAnalyzing ? <Spinner size="sm" /> : undefined}
          >
            Analyze Article
          </Button>
        )}
        
        {isAnalyzing && (
          <VStack p={4} spacing={3}>
            <Spinner size="md" />
            <Text>Analyzing article with Gemini 2.5 Pro...</Text>
          </VStack>
        )}
        
        {error && (
          <Box p={4} borderWidth="1px" borderRadius="md" bg="red.50">
            <Heading size="sm" color="red.500" mb={2}>Error</Heading>
            <Text>{error}</Text>
          </Box>
        )}
        
        {analysisComplete && suggestions.length === 0 && (
          <Box p={4} borderWidth="1px" borderRadius="md" bg="green.50">
            <Heading size="sm" color="green.500" mb={2}>No Issues Found</Heading>
            <Text>The AI analysis did not find any significant issues with this article.</Text>
          </Box>
        )}
        
        {suggestions.length > 0 && (
          <>
            <Heading size="sm" mt={2}>
              Review Suggestions ({suggestions.length})
            </Heading>
            
            <Accordion allowMultiple>
              {suggestions.map((suggestion) => (
                <AccordionItem key={suggestion.id}>
                  <AccordionButton 
                    _expanded={{ bg: 'gray.100' }}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <HStack flex="1" textAlign="left" spacing={2}>
                      {getSuggestionIcon(suggestion.type)}
                      <Text fontWeight="medium">{suggestion.title}</Text>
                      <Badge colorScheme={getSeverityColor(suggestion.severity)}>
                        {suggestion.severity}
                      </Badge>
                      <Badge variant="outline">
                        {suggestion.type}
                      </Badge>
                    </HStack>
                    <AccordionIcon />
                  </AccordionButton>
                </AccordionItem>
              ))}
            </Accordion>
          </>
        )}
      </VStack>
      
      {/* Suggestion Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedSuggestion?.title}
            <Badge 
              ml={2} 
              colorScheme={getSeverityColor(selectedSuggestion?.severity || 'info')}
            >
              {selectedSuggestion?.severity}
            </Badge>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {selectedSuggestion?.section && (
              <Text fontSize="sm" color="gray.600" mb={2}>
                Section: {selectedSuggestion.section}
              </Text>
            )}
            
            <Text whiteSpace="pre-wrap">
              {selectedSuggestion?.description}
            </Text>
            
            {selectedSuggestion?.lineNumbers && selectedSuggestion.lineNumbers.length > 0 && (
              <Box mt={4}>
                <Text fontWeight="bold">Relevant Lines:</Text>
                <Text>{selectedSuggestion.lineNumbers.join(', ')}</Text>
              </Box>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

/**
 * Parse article analysis from Gemini into structured suggestions
 */
function parseArticleAnalysis(
  analysisText: string,
  articleId: string
): ReviewSuggestion[] {
  // Check if the response indicates test content
  if (analysisText.toUpperCase().includes('TEST CONTENT') || 
      analysisText.includes('placeholder content') ||
      analysisText.includes('not a real article')) {
    return [{
      id: `${articleId}-test-content`,
      type: 'general',
      title: 'Test Content Detected',
      description: 'This appears to be test or placeholder content rather than a real academic article. Please provide substantial content for a meaningful review.',
      severity: 'critical',
      section: 'General'
    }];
  }

  // Regular parsing logic for real content
  const suggestions: ReviewSuggestion[] = [];
  
  try {
    // Extract logical reasoning issues
    if (analysisText.includes('logical flow') || analysisText.includes('reasoning')) {
      const logicMatch = analysisText.match(/(?:logical flow|reasoning)[^\n]*(?:\n(?![\n\d]).*)*/) || [];
      if (logicMatch.length > 0 && logicMatch[0]) {
        suggestions.push({
          id: `${articleId}-logic-1`,
          type: 'logic',
          title: 'Logical Reasoning',
          description: logicMatch[0].trim(),
          severity: determineSeverity(logicMatch[0]),
          section: 'Logical Flow'
        });
      }
    }
    
    // Extract structure issues
    if (analysisText.includes('structure') || analysisText.includes('organization')) {
      const structureMatch = analysisText.match(/(?:structure|organization)[^\n]*(?:\n(?![\n\d]).*)*/) || [];
      if (structureMatch.length > 0 && structureMatch[0]) {
        suggestions.push({
          id: `${articleId}-structure-1`,
          type: 'structure',
          title: 'Article Structure',
          description: structureMatch[0].trim(),
          severity: determineSeverity(structureMatch[0]),
          section: 'Structure'
        });
      }
    }
    
    // Extract citation issues
    if (analysisText.includes('citation') || analysisText.includes('reference')) {
      const citationMatch = analysisText.match(/(?:citation|reference)[^\n]*(?:\n(?![\n\d]).*)*/) || [];
      if (citationMatch.length > 0 && citationMatch[0]) {
        suggestions.push({
          id: `${articleId}-citations-1`,
          type: 'citations',
          title: 'Citations and References',
          description: citationMatch[0].trim(),
          severity: determineSeverity(citationMatch[0]),
          section: 'Citations'
        });
      }
    }
    
    // Extract general suggestions
    const generalSuggestions = analysisText.match(/(?:suggestion|improvement|recommend)[^\n]*(?:\n(?![\n\d]).*)*/) || [];
    if (generalSuggestions.length > 0 && generalSuggestions[0]) {
      suggestions.push({
        id: `${articleId}-general-1`,
        type: 'general',
        title: 'General Suggestions',
        description: generalSuggestions[0].trim(),
        severity: 'info',
        section: 'General'
      });
    }
    
    // If no specific suggestions were found but we have analysis text,
    // create a general suggestion with the entire analysis
    if (suggestions.length === 0 && analysisText.trim().length > 0) {
      suggestions.push({
        id: `${articleId}-general-fallback`,
        type: 'general',
        title: 'Analysis Overview',
        description: analysisText.substring(0, 500) + (analysisText.length > 500 ? '...' : ''),
        severity: 'info',
        section: 'General'
      });
    }
  } catch (error) {
    logger.error('Error parsing article analysis', {
      context: { error, articleId },
      category: LogCategory.ERROR
    });
    
    // Return a fallback suggestion
    return [{
      id: `${articleId}-parse-error`,
      type: 'general',
      title: 'Analysis Processing Error',
      description: 'There was an error processing the AI analysis. Please try again or proceed with manual review.',
      severity: 'warning',
      section: 'General'
    }];
  }
  
  return suggestions;
}

/**
 * Parse code analysis from Gemini into structured suggestions
 */
function parseCodeAnalysis(
  analysisText: string,
  articleId: string,
  snippetId: string,
  language: string
): ReviewSuggestion[] {
  // Check if the response indicates test content
  if (analysisText.toUpperCase().includes('TEST CODE') || 
      analysisText.includes('placeholder code') ||
      analysisText.includes('not suitable for a meaningful review')) {
    return [{
      id: `${articleId}-code-${snippetId}-test`,
      type: 'code',
      title: 'Test Code Detected',
      description: 'This appears to be test or placeholder code rather than real implementation. Please provide substantial code for a meaningful review.',
      severity: 'critical',
      section: 'Code',
      codeSnippetId: snippetId
    }];
  }

  // Regular parsing logic for real content
  const suggestions: ReviewSuggestion[] = [];
  
  try {
    // Extract code quality issues
    if (analysisText.includes('quality') || analysisText.includes('best practice')) {
      const qualityMatch = analysisText.match(/(?:quality|best practice)[^\n]*(?:\n(?![\n\d]).*)*/) || [];
      if (qualityMatch.length > 0 && qualityMatch[0]) {
        suggestions.push({
          id: `${articleId}-code-${snippetId}-quality`,
          type: 'code',
          title: `${language} Code Quality`,
          description: qualityMatch[0].trim(),
          severity: determineSeverity(qualityMatch[0]),
          section: 'Code Quality',
          codeSnippetId: snippetId
        });
      }
    }
    
    // Extract bugs and issues
    if (analysisText.includes('bug') || analysisText.includes('issue') || analysisText.includes('error')) {
      const bugsMatch = analysisText.match(/(?:bug|issue|error)[^\n]*(?:\n(?![\n\d]).*)*/) || [];
      if (bugsMatch.length > 0 && bugsMatch[0]) {
        suggestions.push({
          id: `${articleId}-code-${snippetId}-bugs`,
          type: 'code',
          title: 'Potential Bugs',
          description: bugsMatch[0].trim(),
          severity: 'warning',
          section: 'Bugs',
          codeSnippetId: snippetId
        });
      }
    }
    
    // Extract security issues
    if (analysisText.includes('security') || analysisText.includes('vulnerability')) {
      const securityMatch = analysisText.match(/(?:security|vulnerability)[^\n]*(?:\n(?![\n\d]).*)*/) || [];
      if (securityMatch.length > 0 && securityMatch[0]) {
        suggestions.push({
          id: `${articleId}-code-${snippetId}-security`,
          type: 'code',
          title: 'Security Considerations',
          description: securityMatch[0].trim(),
          severity: 'critical',
          section: 'Security',
          codeSnippetId: snippetId
        });
      }
    }
    
    // Extract performance issues
    if (analysisText.includes('performance') || analysisText.includes('efficiency')) {
      const perfMatch = analysisText.match(/(?:performance|efficiency)[^\n]*(?:\n(?![\n\d]).*)*/) || [];
      if (perfMatch.length > 0 && perfMatch[0]) {
        suggestions.push({
          id: `${articleId}-code-${snippetId}-performance`,
          type: 'code',
          title: 'Performance Optimization',
          description: perfMatch[0].trim(),
          severity: 'info',
          section: 'Performance',
          codeSnippetId: snippetId
        });
      }
    }
    
    // If no specific suggestions were found but we have analysis text,
    // create a general code suggestion with the entire analysis
    if (suggestions.length === 0 && analysisText.trim().length > 0) {
      suggestions.push({
        id: `${articleId}-code-${snippetId}-general`,
        type: 'code',
        title: `${language} Code Analysis`,
        description: analysisText.substring(0, 500) + (analysisText.length > 500 ? '...' : ''),
        severity: 'info',
        section: 'Code',
        codeSnippetId: snippetId
      });
    }
  } catch (error) {
    logger.error('Error parsing code analysis', {
      context: { error, articleId, snippetId },
      category: LogCategory.ERROR
    });
    
    // Return a fallback suggestion
    return [{
      id: `${articleId}-code-${snippetId}-error`,
      type: 'code',
      title: 'Code Analysis Error',
      description: 'There was an error processing the AI code analysis. Please try again or proceed with manual review.',
      severity: 'warning',
      section: 'Code',
      codeSnippetId: snippetId
    }];
  }
  
  return suggestions;
}

function determineSeverity(text: string): 'info' | 'warning' | 'critical' {
  if (text.toLowerCase().includes('critical') || 
      text.toLowerCase().includes('significant') ||
      text.toLowerCase().includes('major issue')) {
    return 'critical';
  } else if (text.toLowerCase().includes('should') || 
             text.toLowerCase().includes('consider') ||
             text.toLowerCase().includes('recommend')) {
    return 'warning';
  } else {
    return 'info';
  }
}
