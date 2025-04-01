/**
 * DeepSeekAcademicReview Component
 * 
 * A React component that uses DeepSeek-V3-0324 to analyze and provide
 * suggestions for academic content in research papers.
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { createDeepSeekAI } from '../../utils/deepseekAI';
import { generatePrompt, academicPrompts } from '../../utils/geminiPrompts';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger for this component
const logger = createLogger('DeepSeekAcademicReview');

// Define component props
interface DeepSeekAcademicReviewProps {
  title?: string;
  abstract?: string;
  content?: string;
  field?: string;
}

/**
 * DeepSeekAcademicReview component for analyzing academic content with DeepSeek AI
 */
export default function DeepSeekAcademicReview({
  title = '',
  abstract = '',
  content = '',
  field = 'general academic'
}: DeepSeekAcademicReviewProps) {
  // State for the component
  const [articleTitle, setArticleTitle] = useState(title);
  const [articleAbstract, setArticleAbstract] = useState(abstract);
  const [articleContent, setArticleContent] = useState(content);
  const [articleField, setArticleField] = useState(field);
  const [reviewType, setReviewType] = useState('reviewArticle');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toast for notifications
  const toast = useToast();
  
  // Handle academic review submission
  const handleReviewContent = useCallback(async () => {
    if (!articleTitle.trim() || !articleAbstract.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide at least a title and abstract',
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
      // Create the DeepSeek AI client
      const deepseekAI = createDeepSeekAI();
      
      // Generate the prompt using our template system
      const prompt = generatePrompt(reviewType, {
        title: articleTitle,
        abstract: articleAbstract,
        content: articleContent,
        field: articleField,
      });
      
      logger.debug('Sending academic content for review', { 
        context: { 
          titleLength: articleTitle.length, 
          abstractLength: articleAbstract.length,
          contentLength: articleContent.length,
          field: articleField,
          reviewType 
        },
        category: LogCategory.SYSTEM
      });
      
      // Send the request to DeepSeek
      const response = await deepseekAI.generateContent(prompt);
      
      if (response.success) {
        setResult(response.text);
        logger.debug('Academic review completed successfully', { 
          context: { model: response.model },
          category: LogCategory.SYSTEM
        });
      } else {
        throw new Error(response.error?.message || 'Failed to generate review');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      logger.error('Error reviewing academic content', { 
        context: { error: err },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error reviewing content',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [articleTitle, articleAbstract, articleContent, articleField, reviewType, toast]);
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" width="100%">
      <Heading size="md" mb={4}>DeepSeek Academic Review</Heading>
      
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Review Type</FormLabel>
          <Select 
            value={reviewType} 
            onChange={(e) => setReviewType(e.target.value)}
            disabled={isLoading}
          >
            {Object.entries(academicPrompts).map(([key, prompt]) => (
              <option key={key} value={key}>
                {prompt.name}
              </option>
            ))}
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Academic Field</FormLabel>
          <Select 
            value={articleField} 
            onChange={(e) => setArticleField(e.target.value)}
            disabled={isLoading}
          >
            <option value="general academic">General Academic</option>
            <option value="computer science">Computer Science</option>
            <option value="biology">Biology</option>
            <option value="chemistry">Chemistry</option>
            <option value="physics">Physics</option>
            <option value="mathematics">Mathematics</option>
            <option value="medicine">Medicine</option>
            <option value="psychology">Psychology</option>
            <option value="sociology">Sociology</option>
            <option value="economics">Economics</option>
            <option value="business">Business</option>
            <option value="engineering">Engineering</option>
            <option value="education">Education</option>
            <option value="humanities">Humanities</option>
            <option value="arts">Arts</option>
            <option value="law">Law</option>
            <option value="environmental science">Environmental Science</option>
            <option value="blockchain">Blockchain & Cryptocurrency</option>
          </Select>
        </FormControl>
        
        <Tabs variant="enclosed">
          <TabList>
            <Tab>Basic Information</Tab>
            <Tab>Full Content</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Article Title</FormLabel>
                  <Textarea
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    placeholder="Enter the article title..."
                    disabled={isLoading}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Abstract</FormLabel>
                  <Textarea
                    value={articleAbstract}
                    onChange={(e) => setArticleAbstract(e.target.value)}
                    placeholder="Enter the article abstract..."
                    minHeight="150px"
                    disabled={isLoading}
                  />
                </FormControl>
              </VStack>
            </TabPanel>
            <TabPanel>
              <FormControl>
                <FormLabel>Full Article Content</FormLabel>
                <Textarea
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  placeholder="Enter the full article content (optional)..."
                  minHeight="300px"
                  disabled={isLoading}
                />
              </FormControl>
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        <Button
          colorScheme="blue"
          onClick={handleReviewContent}
          isLoading={isLoading}
          loadingText="Analyzing..."
          leftIcon={isLoading ? <Spinner size="sm" /> : undefined}
          disabled={isLoading || !articleTitle.trim() || !articleAbstract.trim()}
        >
          Analyze Academic Content
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
