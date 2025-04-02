'use client';

import { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { ReviewSuggestion } from '../../types/review';

interface AISummaryProps {
  suggestions: ReviewSuggestion[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * AISummary Component
 * 
 * Displays a condensed summary of AI-generated review suggestions
 * with an expandable section for detailed analysis.
 */
export function AISummary({ suggestions, isLoading, error }: AISummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // If there are no suggestions yet, show a placeholder
  if (suggestions.length === 0) {
    if (isLoading) {
      return (
        <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
          <Text>AI is analyzing the content...</Text>
        </Box>
      );
    }
    
    if (error) {
      return (
        <Box p={4} borderWidth="1px" borderRadius="md" bg="red.50">
          <Text color="red.500">Error generating AI insights: {error.message}</Text>
        </Box>
      );
    }
    
    return (
      <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
        <Text>No AI insights available. Click "Analyze Article" to generate suggestions.</Text>
      </Box>
    );
  }
  
  // Consolidate suggestions into a concise summary
  const prioritySuggestions = suggestions
    .filter(s => s.priority === 'high')
    .slice(0, 2);
  
  const hasPrioritySuggestions = prioritySuggestions.length > 0;
  const summaryText = hasPrioritySuggestions 
    ? consolidateSuggestions(prioritySuggestions)
    : consolidateSuggestions(suggestions.slice(0, 2));
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="blue.50" mb={4}>
      <Box display="flex" alignItems="center" mb={2}>
        <Heading size="sm" mr={2}>AI Review Summary</Heading>
        <Tooltip label="AI-generated insights to help with your review">
          <Icon as={InfoIcon} color="blue.500" />
        </Tooltip>
      </Box>
      
      <Text mb={3}>{summaryText}</Text>
      
      <Accordion allowToggle>
        <AccordionItem border="none">
          <AccordionButton 
            p={0} 
            color="blue.600" 
            onClick={() => setIsExpanded(!isExpanded)}
            _hover={{ bg: 'transparent', textDecoration: 'underline' }}
          >
            <Text fontSize="sm">
              {isExpanded ? 'Hide detailed analysis' : 'View detailed analysis'}
            </Text>
            <AccordionIcon />
          </AccordionButton>
          
          <AccordionPanel pb={4} pt={2}>
            {suggestions.map((suggestion, index) => (
              <Box key={suggestion.id || index} mb={3} p={2} borderWidth="1px" borderRadius="md" bg="white">
                <Box display="flex" alignItems="center" mb={1}>
                  <Text fontWeight="bold" mr={2}>Point {index + 1}</Text>
                  <Badge colorScheme={getPriorityColor(suggestion.priority)}>{suggestion.category}</Badge>
                </Box>
                <Text>{suggestion.content}</Text>
              </Box>
            ))}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
}

/**
 * Consolidates multiple suggestions into a concise summary
 */
function consolidateSuggestions(suggestions: ReviewSuggestion[]): string {
  if (suggestions.length === 0) {
    return "No significant issues found in this article.";
  }
  
  if (suggestions.length === 1) {
    return suggestions[0].content;
  }
  
  // For multiple suggestions, create a consolidated summary
  const categories = new Set(suggestions.map(s => s.category));
  const categoryText = Array.from(categories).join(", ");
  
  return `This article would benefit from improvements in ${categoryText}. ${suggestions[0].content} Additionally, ${suggestions[1].content.toLowerCase()}`;
}

/**
 * Returns the appropriate color scheme based on suggestion priority
 */
function getPriorityColor(priority?: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    case 'low':
      return 'blue';
    default:
      return 'gray';
  }
}
