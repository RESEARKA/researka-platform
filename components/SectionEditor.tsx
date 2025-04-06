import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Textarea,
  Input,
  VStack,
  HStack,
  Heading,
  Text,
  Flex,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';

interface SectionEditorProps {
  section: string;
  content: string | string[] | undefined;
  onSave: (section: string, content: string) => void;
  onCancel: () => void;
}

/**
 * Component for editing a specific section of the article
 */
export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  content,
  onSave,
  onCancel
}) => {
  // State for the edited content
  const [editedContent, setEditedContent] = useState<string>('');
  const [wordCount, setWordCount] = useState<number>(0);
  
  // Background color for the editor
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  
  // Get section label based on section key
  const getSectionLabel = (sectionKey: string): string => {
    const sectionLabels: Record<string, string> = {
      'title': 'Title',
      'abstract': 'Abstract',
      'introduction': 'Introduction',
      'literatureReview': 'Literature Review/Background',
      'methods': 'Methods',
      'results': 'Results',
      'discussion': 'Discussion',
      'conclusion': 'Conclusion',
      'acknowledgments': 'Acknowledgments',
      'declarations.ethics': 'Ethics Statement',
      'declarations.conflictOfInterest': 'Conflict of Interest Statement',
      'declarations.funding': 'Funding Statement',
      'appendices': 'Appendices',
      'supplementaryMaterial': 'Supplementary Material',
      'authorInfo': 'Author Information',
      'metadata': 'Category & License'
    };
    
    return sectionLabels[sectionKey] || sectionKey;
  };
  
  // Get word count limits based on section
  const getWordLimits = (sectionKey: string): { min: number; max: number } | null => {
    const wordLimits: Record<string, { min: number; max: number }> = {
      'title': { min: 5, max: 20 },
      'abstract': { min: 150, max: 350 },
      'introduction': { min: 400, max: 750 },
      'literatureReview': { min: 500, max: 1500 },
      'methods': { min: 700, max: 2000 },
      'results': { min: 500, max: 1500 },
      'discussion': { min: 1000, max: 2500 },
      'conclusion': { min: 100, max: 400 },
      'acknowledgments': { min: 50, max: 200 },
      'declarations.ethics': { min: 20, max: 200 },
      'declarations.conflictOfInterest': { min: 20, max: 200 },
      'declarations.funding': { min: 20, max: 200 },
      'appendices': { min: 100, max: 2500 },
      'supplementaryMaterial': { min: 100, max: 2500 }
    };
    
    return wordLimits[sectionKey] || null;
  };
  
  // Initialize edited content
  useEffect(() => {
    if (typeof content === 'string') {
      setEditedContent(content || '');
    } else if (Array.isArray(content)) {
      setEditedContent(content.join('\n'));
    } else {
      setEditedContent('');
    }
  }, [content]);
  
  // Update word count when content changes
  useEffect(() => {
    if (editedContent) {
      setWordCount(editedContent.split(/\s+/).filter(Boolean).length);
    } else {
      setWordCount(0);
    }
  }, [editedContent]);
  
  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setEditedContent(e.target.value);
  };
  
  // Handle save
  const handleSave = () => {
    onSave(section, editedContent);
  };
  
  // Get word limit status
  const getWordLimitStatus = (): { isValid: boolean; message: string } => {
    const limits = getWordLimits(section);
    
    if (!limits) {
      return { isValid: true, message: '' };
    }
    
    if (wordCount < limits.min) {
      return {
        isValid: false,
        message: `This section requires at least ${limits.min} words (currently ${wordCount})`
      };
    }
    
    if (wordCount > limits.max) {
      return {
        isValid: false,
        message: `This section should not exceed ${limits.max} words (currently ${wordCount})`
      };
    }
    
    return {
      isValid: true,
      message: `Word count: ${wordCount} (recommended: ${limits.min}-${limits.max})`
    };
  };
  
  const wordLimitStatus = getWordLimitStatus();
  
  return (
    <Box p={4} borderWidth={1} borderRadius="md" bg={bgColor}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">
          Editing {getSectionLabel(section)}
          {section === 'literatureReview' || 
           section === 'conclusion' || 
           section === 'acknowledgments' || 
           section === 'appendices' || 
           section === 'supplementaryMaterial' ? (
            <Badge ml={2} colorScheme="gray">Optional</Badge>
          ) : null}
        </Heading>
      </Flex>
      
      <FormControl>
        {section === 'title' ? (
          <Input
            value={editedContent}
            onChange={handleContentChange}
            placeholder="Enter title"
            size="lg"
            mb={2}
          />
        ) : (
          <Textarea
            value={editedContent}
            onChange={handleContentChange}
            placeholder={`Enter ${getSectionLabel(section)} content`}
            size="lg"
            minH="200px"
            mb={2}
          />
        )}
        
        <FormHelperText color={wordLimitStatus.isValid ? 'gray.500' : 'red.500'}>
          {wordLimitStatus.message}
        </FormHelperText>
      </FormControl>
      
      <HStack spacing={4} mt={4} justifyContent="flex-end">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button 
          colorScheme="blue" 
          onClick={handleSave}
          isDisabled={!wordLimitStatus.isValid && section !== 'title'}
        >
          Save Changes
        </Button>
      </HStack>
    </Box>
  );
};
