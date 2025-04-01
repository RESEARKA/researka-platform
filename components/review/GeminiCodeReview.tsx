/**
 * GeminiCodeReview Component
 * 
 * A React component that uses Gemini 2.5 Pro to analyze and provide
 * suggestions for code snippets in academic papers.
 */

'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  Heading,
  Text,
  VStack,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { createGeminiAI } from '../../utils/geminiAI';
import { generatePrompt, codePrompts } from '../../utils/geminiPrompts';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger for this component
const logger = createLogger('GeminiCodeReview');

// Define component props
interface GeminiCodeReviewProps {
  initialCode?: string;
  language?: string;
}

/**
 * GeminiCodeReview component for analyzing code with Gemini AI
 */
export default function GeminiCodeReview({ 
  initialCode = '', 
  language = 'typescript' 
}: GeminiCodeReviewProps) {
  // State for the component
  const [code, setCode] = useState(initialCode);
  const [codeLanguage, setCodeLanguage] = useState(language);
  const [reviewType, setReviewType] = useState('codeReview');
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toast for notifications
  const toast = useToast();
  
  // Handle code review submission
  const handleReviewCode = useCallback(async () => {
    if (!code.trim()) {
      toast({
        title: 'No code provided',
        description: 'Please enter some code to review',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult('');
    
    try {
      // Create the Gemini AI client
      const geminiAI = createGeminiAI();
      
      // Generate the prompt using our template system
      const prompt = generatePrompt(reviewType, {
        code,
        language: codeLanguage,
        context: context || undefined,
      });
      
      logger.debug('Sending code for review', { 
        context: { codeLength: code.length, language: codeLanguage, reviewType },
        category: LogCategory.SYSTEM
      });
      
      // Send the request to Gemini
      const response = await geminiAI.generateContent(prompt);
      
      if (response.success) {
        setResult(response.text);
        logger.debug('Code review completed successfully', { 
          context: { model: response.model },
          category: LogCategory.SYSTEM
        });
      } else {
        throw new Error(response.error?.message || 'Failed to generate review');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      logger.error('Error reviewing code', { 
        context: { error: err },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error reviewing code',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [code, codeLanguage, reviewType, context, toast]);
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" width="100%">
      <Heading size="md" mb={4}>Gemini Code Review</Heading>
      
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Review Type</FormLabel>
          <Select 
            value={reviewType} 
            onChange={(e) => setReviewType(e.target.value)}
            disabled={isLoading}
          >
            {Object.entries(codePrompts).map(([key, prompt]) => (
              <option key={key} value={key}>
                {prompt.name}
              </option>
            ))}
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Language</FormLabel>
          <Select 
            value={codeLanguage} 
            onChange={(e) => setCodeLanguage(e.target.value)}
            disabled={isLoading}
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c++">C++</option>
            <option value="rust">Rust</option>
            <option value="go">Go</option>
            <option value="ruby">Ruby</option>
            <option value="php">PHP</option>
            <option value="swift">Swift</option>
            <option value="kotlin">Kotlin</option>
            <option value="csharp">C#</option>
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Code to Review</FormLabel>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            minHeight="200px"
            fontFamily="monospace"
            disabled={isLoading}
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>Additional Context (Optional)</FormLabel>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Provide additional context about this code..."
            minHeight="100px"
            disabled={isLoading}
          />
        </FormControl>
        
        <Button
          colorScheme="blue"
          onClick={handleReviewCode}
          isLoading={isLoading}
          loadingText="Analyzing..."
          leftIcon={isLoading ? <Spinner size="sm" /> : undefined}
          disabled={isLoading || !code.trim()}
        >
          Analyze Code
        </Button>
        
        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <Box 
            p={4} 
            borderWidth="1px" 
            borderRadius="md" 
            bg="gray.50"
            whiteSpace="pre-wrap"
          >
            <Heading size="sm" mb={2}>Analysis Results</Heading>
            <Text>{result}</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
