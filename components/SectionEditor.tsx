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
  useColorModeValue,
  Switch,
  Select
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
  
  // States for author information
  const [authorName, setAuthorName] = useState<string>('');
  const [authorEmail, setAuthorEmail] = useState<string>('');
  const [authorAffiliation, setAuthorAffiliation] = useState<string>('');
  const [isCorrespondingAuthor, setIsCorrespondingAuthor] = useState<boolean>(true);
  
  // States for category and license
  const [category, setCategory] = useState<string>('');
  const [license, setLicense] = useState<string>('');
  
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
    if (section === 'authorInfo') {
      // Parse author information from content
      try {
        const authorData = JSON.parse(content as string || '{}');
        setAuthorName(authorData.name || '');
        setAuthorEmail(authorData.email || '');
        setAuthorAffiliation(authorData.affiliation || '');
        setIsCorrespondingAuthor(authorData.isCorresponding !== false);
      } catch (e) {
        // Fallback if parsing fails
        setAuthorName('');
        setAuthorEmail('');
        setAuthorAffiliation('');
        setIsCorrespondingAuthor(true);
      }
    } else if (section === 'metadata') {
      // Parse metadata from content
      try {
        const metaData = JSON.parse(content as string || '{}');
        setCategory(metaData.category || '');
        setLicense(metaData.license || '');
      } catch (e) {
        // Fallback if parsing fails
        setCategory('');
        setLicense('');
      }
    } else {
      // Regular content handling
      if (typeof content === 'string') {
        setEditedContent(content || '');
      } else if (Array.isArray(content)) {
        setEditedContent(content.join('\n'));
      } else {
        setEditedContent('');
      }
    }
  }, [content, section]);
  
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
    if (section === 'authorInfo') {
      // Serialize author information
      const authorData = JSON.stringify({
        name: authorName.trim(),
        email: authorEmail.trim(),
        affiliation: authorAffiliation.trim(),
        isCorresponding: isCorrespondingAuthor
      });
      
      // Log the data being saved for debugging
      console.log('Saving author information:', {
        name: authorName.trim(),
        email: authorEmail.trim(),
        affiliation: authorAffiliation.trim(),
        isCorresponding: isCorrespondingAuthor
      });
      
      onSave(section, authorData);
    } else if (section === 'metadata') {
      // Serialize metadata
      const metaData = JSON.stringify({
        category: category,
        license: license
      });
      onSave(section, metaData);
    } else {
      // Regular content saving
      onSave(section, editedContent);
    }
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
  
  // Check if author information is valid
  const isAuthorInfoValid = () => {
    return authorName.trim() !== '' && 
           authorEmail.trim() !== '' && 
           authorAffiliation.trim() !== '';
  };
  
  // Check if metadata is valid
  const isMetadataValid = () => {
    return category.trim() !== '' && license.trim() !== '';
  };
  
  // Render author information form
  const renderAuthorInfoForm = () => (
    <VStack spacing={4} align="stretch">
      <FormControl isRequired>
        <FormLabel>Author Name</FormLabel>
        <Input 
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Enter your full name"
        />
      </FormControl>
      
      <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <Input 
          value={authorEmail}
          onChange={(e) => setAuthorEmail(e.target.value)}
          placeholder="Enter your email address"
          type="email"
        />
      </FormControl>
      
      <FormControl isRequired>
        <FormLabel>Affiliation</FormLabel>
        <Input 
          value={authorAffiliation}
          onChange={(e) => setAuthorAffiliation(e.target.value)}
          placeholder="Enter your institutional affiliation"
        />
      </FormControl>
      
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="is-corresponding" mb="0">
          Corresponding Author
        </FormLabel>
        <Switch 
          id="is-corresponding"
          isChecked={isCorrespondingAuthor}
          onChange={(e) => setIsCorrespondingAuthor(e.target.checked)}
        />
      </FormControl>
    </VStack>
  );
  
  // Render metadata form
  const renderMetadataForm = () => (
    <VStack spacing={4} align="stretch">
      <FormControl isRequired>
        <FormLabel>Category</FormLabel>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Select category"
        >
          <option value="Computer Science">Computer Science</option>
          <option value="Biology">Biology</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Physics">Physics</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Medicine">Medicine</option>
          <option value="Economics">Economics</option>
          <option value="Psychology">Psychology</option>
          <option value="Sociology">Sociology</option>
          <option value="Other">Other</option>
        </Select>
      </FormControl>
      
      <FormControl isRequired>
        <FormLabel>License</FormLabel>
        <Select
          value={license}
          onChange={(e) => setLicense(e.target.value)}
          placeholder="Select license"
        >
          <option value="cc-by-4.0">CC BY 4.0 - Attribution</option>
          <option value="cc-by-sa-4.0">CC BY-SA 4.0 - Attribution-ShareAlike</option>
          <option value="cc-by-nc-4.0">CC BY-NC 4.0 - Attribution-NonCommercial</option>
          <option value="cc-by-nc-sa-4.0">CC BY-NC-SA 4.0 - Attribution-NonCommercial-ShareAlike</option>
        </Select>
      </FormControl>
    </VStack>
  );
  
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
      
      {section === 'authorInfo' ? (
        renderAuthorInfoForm()
      ) : section === 'metadata' ? (
        renderMetadataForm()
      ) : (
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
      )}
      
      <HStack spacing={4} mt={4} justifyContent="flex-end">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button 
          colorScheme="blue" 
          onClick={handleSave}
          isDisabled={
            (section === 'authorInfo' && !isAuthorInfoValid()) ||
            (section === 'metadata' && !isMetadataValid()) ||
            (!['authorInfo', 'metadata'].includes(section) && !wordLimitStatus.isValid && section !== 'title')
          }
        >
          Save Changes
        </Button>
      </HStack>
    </Box>
  );
};
