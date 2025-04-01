/**
 * DeepSeekReviewAssistant Component
 * 
 * A React component that integrates DeepSeek-V3-0324 AI capabilities
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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { CheckIcon, InfoIcon, WarningIcon } from '@chakra-ui/icons';
import { createDeepSeekAI } from '../../utils/deepseekAI';
import { generatePrompt } from '../../utils/geminiPrompts';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger for this component
const logger = createLogger('DeepSeekReviewAssistant');

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
interface DeepSeekReviewAssistantProps {
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
 * DeepSeekReviewAssistant component for providing AI-assisted review suggestions
 */
export default function DeepSeekReviewAssistant({
  article,
  onSuggestionsGenerated,
  autoAnalyze = false,
}: DeepSeekReviewAssistantProps) {
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
  
  // Analyze the article with DeepSeek AI
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
      // Create the DeepSeek AI client
      const deepseekAI = createDeepSeekAI();
      
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
          
          const codeResponse = await deepseekAI.generateContent(codePrompt);
          
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
      
      // Show a success toast
      toast({
        title: 'Analysis complete',
        description: `Generated ${allSuggestions.length} review suggestions`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      logger.error('Error analyzing article', { 
        context: { error: err },
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
  
  // Run analysis automatically if autoAnalyze is true
  useEffect(() => {
    if (autoAnalyze && article && article.id && !analysisComplete && !isAnalyzing) {
      analyzeArticle();
    }
  }, [autoAnalyze, article, analysisComplete, isAnalyzing, analyzeArticle]);
  
  // Handle suggestion selection for the modal
  const handleSuggestionSelect = useCallback((suggestion: ReviewSuggestion) => {
    setSelectedSuggestion(suggestion);
    onOpen();
  }, [onOpen]);
  
  // Get the icon for a suggestion based on its severity
  const getSuggestionIcon = useCallback((severity: string) => {
    switch (severity) {
      case 'critical':
        return <WarningIcon color="red.500" />;
      case 'warning':
        return <WarningIcon color="orange.500" />;
      case 'info':
      default:
        return <InfoIcon color="blue.500" />;
    }
  }, []);
  
  // Get the color for a suggestion badge based on its type
  const getSuggestionColor = useCallback((type: string) => {
    switch (type) {
      case 'logic':
        return 'purple';
      case 'structure':
        return 'blue';
      case 'code':
        return 'green';
      case 'citations':
        return 'orange';
      case 'general':
      default:
        return 'gray';
    }
  }, []);
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" width="100%">
      <HStack justifyContent="space-between" mb={4}>
        <Heading size="md">DeepSeek Review Assistant</Heading>
        <Tooltip label="Analyze this article to get AI-assisted review suggestions">
          <Button
            colorScheme="blue"
            onClick={analyzeArticle}
            isLoading={isAnalyzing}
            loadingText="Analyzing..."
            leftIcon={isAnalyzing ? <Spinner size="sm" /> : undefined}
            disabled={isAnalyzing || !article || !article.title || !article.abstract}
          >
            Analyze Article
          </Button>
        </Tooltip>
      </HStack>
      
      {error && (
        <Box mb={4} p={3} bg="red.50" color="red.800" borderRadius="md">
          <HStack>
            <WarningIcon />
            <Text fontWeight="medium">{error}</Text>
          </HStack>
        </Box>
      )}
      
      {isAnalyzing && (
        <Box textAlign="center" my={8} p={6} borderWidth="1px" borderRadius="md" bg="gray.50">
          <Spinner size="xl" mb={4} />
          <Text>Analyzing article with DeepSeek AI...</Text>
          <Text fontSize="sm" color="gray.600" mt={2}>This may take a minute or two.</Text>
        </Box>
      )}
      
      {!isAnalyzing && suggestions.length > 0 && (
        <Box mt={4}>
          <Heading size="sm" mb={2}>
            Review Suggestions ({suggestions.length})
          </Heading>
          
          <Accordion allowMultiple>
            {suggestions.map((suggestion) => (
              <AccordionItem key={suggestion.id}>
                <AccordionButton>
                  <HStack flex="1" textAlign="left" spacing={2}>
                    {getSuggestionIcon(suggestion.severity)}
                    <Text fontWeight="medium">{suggestion.title}</Text>
                    <Badge colorScheme={getSuggestionColor(suggestion.type)}>
                      {suggestion.type}
                    </Badge>
                    {suggestion.section && (
                      <Badge variant="outline">
                        {suggestion.section}
                      </Badge>
                    )}
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>
                <Box p={4} borderTopWidth="1px">
                  <Text mb={3}>{suggestion.description}</Text>
                  <HStack justifyContent="flex-end">
                    <Button
                      size="sm"
                      leftIcon={<InfoIcon />}
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      Details
                    </Button>
                  </HStack>
                </Box>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>
      )}
      
      {!isAnalyzing && analysisComplete && suggestions.length === 0 && (
        <Box textAlign="center" my={6} p={6} borderWidth="1px" borderRadius="md" bg="green.50">
          <CheckIcon w={8} h={8} color="green.500" mb={2} />
          <Heading size="sm" mb={2} color="green.700">No Issues Found</Heading>
          <Text color="green.700">
            The DeepSeek AI analysis did not find any significant issues with this article.
          </Text>
        </Box>
      )}
      
      {/* Modal for suggestion details */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              {selectedSuggestion && getSuggestionIcon(selectedSuggestion.severity)}
              <Text>{selectedSuggestion?.title}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSuggestion && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Heading size="xs" mb={1}>Type</Heading>
                  <Badge colorScheme={getSuggestionColor(selectedSuggestion.type)}>
                    {selectedSuggestion.type}
                  </Badge>
                </Box>
                
                <Box>
                  <Heading size="xs" mb={1}>Severity</Heading>
                  <Badge colorScheme={
                    selectedSuggestion.severity === 'critical' ? 'red' :
                    selectedSuggestion.severity === 'warning' ? 'orange' : 'blue'
                  }>
                    {selectedSuggestion.severity}
                  </Badge>
                </Box>
                
                {selectedSuggestion.section && (
                  <Box>
                    <Heading size="xs" mb={1}>Section</Heading>
                    <Text>{selectedSuggestion.section}</Text>
                  </Box>
                )}
                
                <Box>
                  <Heading size="xs" mb={1}>Description</Heading>
                  <Text whiteSpace="pre-wrap">{selectedSuggestion.description}</Text>
                </Box>
                
                {selectedSuggestion.lineNumbers && selectedSuggestion.lineNumbers.length > 0 && (
                  <Box>
                    <Heading size="xs" mb={1}>Line Numbers</Heading>
                    <HStack>
                      {selectedSuggestion.lineNumbers.map((line, i) => (
                        <Badge key={i}>{line}</Badge>
                      ))}
                    </HStack>
                  </Box>
                )}
              </VStack>
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
 * Parse article analysis from DeepSeek into structured suggestions
 */
function parseArticleAnalysis(
  analysisText: string,
  articleId: string
): ReviewSuggestion[] {
  const suggestions: ReviewSuggestion[] = [];
  
  try {
    // Try to extract structured sections from the analysis text
    const logicIssuesRegex = /(?:Logic|Reasoning)(?:\s+Issues|\s+Problems)?:(.*?)(?=Structure|Organization|Citations|References|General|$)/i;
    const structureIssuesRegex = /(?:Structure|Organization)(?:\s+Issues|\s+Problems)?:(.*?)(?=Logic|Reasoning|Citations|References|General|$)/i;
    const citationIssuesRegex = /(?:Citations?|References)(?:\s+Issues|\s+Problems)?:(.*?)(?=Logic|Reasoning|Structure|Organization|General|$)/i;
    const generalIssuesRegex = /(?:General|Other)(?:\s+Issues|\s+Problems|Comments|Feedback)?:(.*?)(?=Logic|Reasoning|Structure|Organization|Citations|References|$)/i;
    
    // Extract issues by category
    const logicMatch = analysisText.match(logicIssuesRegex);
    const structureMatch = analysisText.match(structureIssuesRegex);
    const citationMatch = analysisText.match(citationIssuesRegex);
    const generalMatch = analysisText.match(generalIssuesRegex);
    
    // Helper function to extract bullet points
    const extractBulletPoints = (text: string): string[] => {
      if (!text) return [];
      
      // Look for bullet points, numbered lists, or paragraphs
      const bulletPointRegex = /(?:^|\n)[-*•](.+?)(?=\n[-*•]|\n\n|$)/g;
      const numberedPointRegex = /(?:^|\n)\d+\.(.+?)(?=\n\d+\.|\n\n|$)/g;
      
      const bulletPoints: string[] = [];
      
      // Extract bullet points
      let match;
      while ((match = bulletPointRegex.exec(text)) !== null) {
        bulletPoints.push(match[1].trim());
      }
      
      // Extract numbered points
      while ((match = numberedPointRegex.exec(text)) !== null) {
        bulletPoints.push(match[1].trim());
      }
      
      // If no bullet points found, split by paragraphs
      if (bulletPoints.length === 0) {
        return text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
      }
      
      return bulletPoints;
    };
    
    // Process logic issues
    if (logicMatch && logicMatch[1]) {
      const logicPoints = extractBulletPoints(logicMatch[1]);
      
      logicPoints.forEach((point, index) => {
        suggestions.push({
          id: `${articleId}-logic-${index}`,
          type: 'logic',
          title: `Logic Issue ${index + 1}`,
          description: point,
          severity: determineSeverity(point),
        });
      });
    }
    
    // Process structure issues
    if (structureMatch && structureMatch[1]) {
      const structurePoints = extractBulletPoints(structureMatch[1]);
      
      structurePoints.forEach((point, index) => {
        suggestions.push({
          id: `${articleId}-structure-${index}`,
          type: 'structure',
          title: `Structure Issue ${index + 1}`,
          description: point,
          severity: determineSeverity(point),
        });
      });
    }
    
    // Process citation issues
    if (citationMatch && citationMatch[1]) {
      const citationPoints = extractBulletPoints(citationMatch[1]);
      
      citationPoints.forEach((point, index) => {
        suggestions.push({
          id: `${articleId}-citation-${index}`,
          type: 'citations',
          title: `Citation Issue ${index + 1}`,
          description: point,
          severity: determineSeverity(point),
        });
      });
    }
    
    // Process general issues
    if (generalMatch && generalMatch[1]) {
      const generalPoints = extractBulletPoints(generalMatch[1]);
      
      generalPoints.forEach((point, index) => {
        suggestions.push({
          id: `${articleId}-general-${index}`,
          type: 'general',
          title: `General Issue ${index + 1}`,
          description: point,
          severity: determineSeverity(point),
        });
      });
    }
    
    // If we couldn't extract structured sections, try to extract any bullet points
    if (suggestions.length === 0) {
      const allPoints = extractBulletPoints(analysisText);
      
      allPoints.forEach((point, index) => {
        suggestions.push({
          id: `${articleId}-general-${index}`,
          type: 'general',
          title: `Review Point ${index + 1}`,
          description: point,
          severity: determineSeverity(point),
        });
      });
    }
  } catch (error) {
    logger.error('Error parsing article analysis', { 
      context: { error },
      category: LogCategory.ERROR
    });
  }
  
  return suggestions;
}

/**
 * Parse code analysis from DeepSeek into structured suggestions
 */
function parseCodeAnalysis(
  analysisText: string,
  articleId: string,
  snippetId: string,
  language: string
): ReviewSuggestion[] {
  const suggestions: ReviewSuggestion[] = [];
  
  try {
    // Try to extract structured sections from the analysis text
    const bugsRegex = /(?:Bugs|Errors|Issues):(.*?)(?=Performance|Security|Readability|Maintainability|Suggestions|$)/i;
    const performanceRegex = /Performance:(.*?)(?=Bugs|Errors|Issues|Security|Readability|Maintainability|Suggestions|$)/i;
    const securityRegex = /Security:(.*?)(?=Bugs|Errors|Issues|Performance|Readability|Maintainability|Suggestions|$)/i;
    const readabilityRegex = /(?:Readability|Maintainability):(.*?)(?=Bugs|Errors|Issues|Performance|Security|Suggestions|$)/i;
    const suggestionsRegex = /(?:Suggestions|Improvements|Recommendations):(.*?)(?=Bugs|Errors|Issues|Performance|Security|Readability|Maintainability|$)/i;
    
    // Extract issues by category
    const bugsMatch = analysisText.match(bugsRegex);
    const performanceMatch = analysisText.match(performanceRegex);
    const securityMatch = analysisText.match(securityRegex);
    const readabilityMatch = analysisText.match(readabilityRegex);
    const suggestionsMatch = analysisText.match(suggestionsRegex);
    
    // Helper function to extract bullet points
    const extractBulletPoints = (text: string): string[] => {
      if (!text) return [];
      
      // Look for bullet points, numbered lists, or paragraphs
      const bulletPointRegex = /(?:^|\n)[-*•](.+?)(?=\n[-*•]|\n\n|$)/g;
      const numberedPointRegex = /(?:^|\n)\d+\.(.+?)(?=\n\d+\.|\n\n|$)/g;
      
      const bulletPoints: string[] = [];
      
      // Extract bullet points
      let match;
      while ((match = bulletPointRegex.exec(text)) !== null) {
        bulletPoints.push(match[1].trim());
      }
      
      // Extract numbered points
      while ((match = numberedPointRegex.exec(text)) !== null) {
        bulletPoints.push(match[1].trim());
      }
      
      // If no bullet points found, split by paragraphs
      if (bulletPoints.length === 0) {
        return text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
      }
      
      return bulletPoints;
    };
    
    // Extract line numbers from a point
    const extractLineNumbers = (point: string): number[] => {
      const lineNumberRegex = /(?:line|lines?)\s+(\d+(?:\s*[-,]\s*\d+)?)/gi;
      const numbers: number[] = [];
      
      let match;
      while ((match = lineNumberRegex.exec(point)) !== null) {
        const lineRef = match[1];
        
        if (lineRef.includes('-')) {
          // Handle ranges like "lines 10-15"
          const [start, end] = lineRef.split('-').map(n => parseInt(n.trim(), 10));
          for (let i = start; i <= end; i++) {
            numbers.push(i);
          }
        } else if (lineRef.includes(',')) {
          // Handle lists like "lines 10, 12, 15"
          lineRef.split(',').forEach(n => {
            numbers.push(parseInt(n.trim(), 10));
          });
        } else {
          // Handle single lines like "line 10"
          numbers.push(parseInt(lineRef, 10));
        }
      }
      
      return numbers;
    };
    
    // Process bugs
    if (bugsMatch && bugsMatch[1]) {
      const bugPoints = extractBulletPoints(bugsMatch[1]);
      
      bugPoints.forEach((point, index) => {
        suggestions.push({
          id: `${articleId}-code-${snippetId}-bug-${index}`,
          type: 'code',
          title: `${language} Bug ${index + 1}`,
          description: point,
          severity: 'critical',
          codeSnippetId: snippetId,
          lineNumbers: extractLineNumbers(point),
        });
      });
    }
    
    // Process performance issues
    if (performanceMatch && performanceMatch[1]) {
      const perfPoints = extractBulletPoints(performanceMatch[1]);
      
      perfPoints.forEach((point, index) => {
        suggestions.push({
          id: `${articleId}-code-${snippetId}-perf-${index}`,
          type: 'code',
          title: `${language} Performance Issue ${index + 1}`,
          description: point,
          severity: 'warning',
          codeSnippetId: snippetId,
          lineNumbers: extractLineNumbers(point),
        });
      });
    }
    
    // Process security issues
    if (securityMatch && securityMatch[1]) {
      const secPoints = extractBulletPoints(securityMatch[1]);
      
      secPoints.forEach((point, index) => {
        suggestions.push({
          id: `${articleId}-code-${snippetId}-sec-${index}`,
          type: 'code',
          title: `${language} Security Issue ${index + 1}`,
          description: point,
          severity: 'critical',
          codeSnippetId: snippetId,
          lineNumbers: extractLineNumbers(point),
        });
      });
    }
    
    // Process readability issues
    if (readabilityMatch && readabilityMatch[1]) {
      const readPoints = extractBulletPoints(readabilityMatch[1]);
      
      readPoints.forEach((point, index) => {
        suggestions.push({
          id: `${articleId}-code-${snippetId}-read-${index}`,
          type: 'code',
          title: `${language} Readability Issue ${index + 1}`,
          description: point,
          severity: 'info',
          codeSnippetId: snippetId,
          lineNumbers: extractLineNumbers(point),
        });
      });
    }
    
    // Process general suggestions
    if (suggestionsMatch && suggestionsMatch[1]) {
      const suggPoints = extractBulletPoints(suggestionsMatch[1]);
      
      suggPoints.forEach((point, index) => {
        suggestions.push({
          id: `${articleId}-code-${snippetId}-sugg-${index}`,
          type: 'code',
          title: `${language} Suggestion ${index + 1}`,
          description: point,
          severity: 'info',
          codeSnippetId: snippetId,
          lineNumbers: extractLineNumbers(point),
        });
      });
    }
    
    // If we couldn't extract structured sections, try to extract any bullet points
    if (suggestions.length === 0) {
      const allPoints = extractBulletPoints(analysisText);
      
      allPoints.forEach((point, index) => {
        suggestions.push({
          id: `${articleId}-code-${snippetId}-general-${index}`,
          type: 'code',
          title: `${language} Review Point ${index + 1}`,
          description: point,
          severity: determineSeverity(point),
          codeSnippetId: snippetId,
          lineNumbers: extractLineNumbers(point),
        });
      });
    }
  } catch (error) {
    logger.error('Error parsing code analysis', { 
      context: { error },
      category: LogCategory.ERROR
    });
  }
  
  return suggestions;
}

/**
 * Determine the severity of a suggestion based on its content
 */
function determineSeverity(text: string): 'info' | 'warning' | 'critical' {
  const criticalTerms = ['critical', 'severe', 'serious', 'major', 'dangerous', 'security', 'vulnerability', 'crash', 'error', 'bug', 'incorrect', 'wrong'];
  const warningTerms = ['warning', 'caution', 'careful', 'consider', 'improve', 'enhancement', 'suggestion', 'recommend', 'could', 'might', 'may', 'should'];
  
  const lowerText = text.toLowerCase();
  
  if (criticalTerms.some(term => lowerText.includes(term))) {
    return 'critical';
  }
  
  if (warningTerms.some(term => lowerText.includes(term))) {
    return 'warning';
  }
  
  return 'info';
}
