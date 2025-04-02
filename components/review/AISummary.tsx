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
  List,
  ListItem,
  ListIcon,
  SimpleGrid,
  Tag,
} from '@chakra-ui/react';
import { InfoIcon, WarningIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { ReviewSuggestion, Review } from '../../types/review';

// Constants for configuration
const MAX_SUMMARY_SUGGESTIONS = 2;
const MAX_ERROR_MESSAGE_LENGTH = 100;

interface AISummaryProps {
  suggestions: ReviewSuggestion[];
  aiRatings: Review['ratings'] | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * AISummary Component
 * 
 * Displays a condensed summary of AI-generated review suggestions
 * with an expandable section for detailed analysis.
 */
export function AISummary({ suggestions, aiRatings, isLoading, error }: AISummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }
  
  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }
  
  // Empty state
  if (suggestions.length === 0) {
    return <EmptyState />;
  }
  
  // Consolidate suggestions into a concise summary
  const prioritySuggestions = suggestions
    .filter(s => s.priority === 'high')
    .slice(0, MAX_SUMMARY_SUGGESTIONS);
  
  const hasPrioritySuggestions = prioritySuggestions.length > 0;
  const summaryText = hasPrioritySuggestions 
    ? consolidateSuggestions(prioritySuggestions)
    : consolidateSuggestions(suggestions.slice(0, MAX_SUMMARY_SUGGESTIONS));
  
  // Map decision to Chakra UI color scheme
  const ratingColorMap: { [key: number]: string } = {
    1: 'red',
    2: 'orange',
    3: 'yellow',
    4: 'teal',
    5: 'green',
  };

  // Map rating keys to user-friendly labels
  const ratingLabelMap: Record<keyof Review['ratings'], string> = {
    originality: 'Originality',
    methodology: 'Methodology',
    clarity: 'Clarity',
    significance: 'Significance',
    references: 'References',
  };

  const hasRatings = aiRatings && Object.keys(aiRatings).length > 0;

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="blue.50" mb={4}>
      <Box display="flex" alignItems="center" mb={2}>
        <Heading size="sm" mr={2}>AI Review Summary</Heading>
        <Tooltip label="AI-generated insights to help with your review">
          <Icon as={InfoIcon} color="blue.500" />
        </Tooltip>
      </Box>
      
      <Text mb={3}>{cleanFormatting(summaryText)}</Text>
      
      {hasRatings ? (
        <Box mb={4}>
          <Text fontWeight="bold" mb={2}>AI Suggested Ratings:</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
            {Object.entries(aiRatings).map(([key, value]) => (
              <Tag key={key} size="md" variant='subtle' colorScheme={ratingColorMap[value] || 'gray'} borderRadius='full'>
                {ratingLabelMap[key as keyof Review['ratings']] || key}: {value}
              </Tag>
            ))}
          </SimpleGrid>
        </Box>
      ) : (
        <Text>AI ratings are not available.</Text>
      )}
      
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
            <List spacing={3}>
              {suggestions.map((suggestion) => (
                <SuggestionItem key={suggestion.id} suggestion={suggestion} />
              ))}
            </List>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
}

/**
 * LoadingState Component
 */
function LoadingState() {
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
      <Text>AI is analyzing the content...</Text>
    </Box>
  );
}

/**
 * ErrorState Component
 */
function ErrorState({ error }: { error: Error }) {
  // Sanitize error message to avoid exposing sensitive information
  const sanitizedErrorMessage = error.message
    ? error.message.substring(0, MAX_ERROR_MESSAGE_LENGTH)
    : 'Unknown error';
    
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="red.50">
      <Text color="red.500">
        Error generating AI insights: {sanitizedErrorMessage}
        {error.message && error.message.length > MAX_ERROR_MESSAGE_LENGTH ? '...' : ''}
      </Text>
    </Box>
  );
}

/**
 * EmptyState Component
 */
function EmptyState() {
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
      <Text>No AI insights available. Click "Analyze Article" to generate suggestions.</Text>
    </Box>
  );
}

/**
 * SuggestionItem Component
 */
function SuggestionItem({ suggestion }: { suggestion: ReviewSuggestion }) {
  const iconColor = getPriorityColor(suggestion.priority);
  const icon = suggestion.priority === 'high' ? WarningIcon : CheckCircleIcon;
  
  return (
    <ListItem display="flex" alignItems="flex-start">
      <ListIcon as={icon} color={`${iconColor}.500`} mt={1} />
      <Box>
        <Box display="flex" alignItems="center" mb={1}>
          <Text fontWeight="bold" mr={2}>{suggestion.category}</Text>
          <Badge colorScheme={getPriorityColor(suggestion.priority)}>{suggestion.priority}</Badge>
        </Box>
        <Text>{cleanFormatting(suggestion.content)}</Text>
      </Box>
    </ListItem>
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
  
  // Safely access the second suggestion
  const secondSuggestionText = suggestions.length > 1 
    ? suggestions[1].content.toLowerCase()
    : '';
  
  return `This article would benefit from improvements in ${categoryText}. ${suggestions[0].content} ${secondSuggestionText ? `Additionally, ${secondSuggestionText}` : ''}`;
}

/**
 * Returns the appropriate color scheme based on suggestion priority
 */
function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
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

/**
 * Cleans up formatting issues in AI-generated text
 * - Removes excessive asterisks
 * - Removes placeholder markers
 * - Formats numbered lists properly
 */
function cleanFormatting(text: string): string {
  if (!text) return '';
  
  return text
    // Remove excessive asterisks used for emphasis
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove placeholder markers
    .replace(/\*\*Placeholder Text Dominates\*\*/g, 'Placeholder Text Dominates')
    .replace(/\*\*Missing Critical Elements\*\*/g, 'Missing Critical Elements')
    .replace(/\*\*Structural Issues\*\*/g, 'Structural Issues')
    // Clean up section references
    .replace(/\*\*Introduction\*\*/g, 'Introduction')
    .replace(/\*\*Methods\*\*/g, 'Methods')
    .replace(/\*\*Results\*\*/g, 'Results')
    .replace(/\*\*Discussion\*\*/g, 'Discussion')
    .replace(/\*\*References\*\*/g, 'References')
    // Format numbered points more cleanly
    .replace(/(\d+)\.\s*\*\*(.*?)\*\*:/g, '$1. $2:')
    .replace(/(\d+)\.\s*\*\*(.*?)\*\*/g, '$1. $2')
    // General cleanup
    .trim();
}
