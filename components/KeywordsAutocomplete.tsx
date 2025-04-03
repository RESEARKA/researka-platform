import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Box,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  List,
  ListItem,
  useTheme,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { keywordData } from '../data/keywords';

// Constants
const SUGGESTION_LIMIT = 5; // Maximum number of suggestions to show
const BLUR_DELAY_MS = 200; // Delay before hiding suggestions on blur

interface KeywordsAutocompleteProps {
  keywords: string[];
  setKeywords: (keywords: string[]) => void;
  errors: { keywords?: string };
  setErrors: (errors: { keywords?: string }) => void;
  touched: { keywords?: boolean };
  setTouched: (touched: { keywords?: boolean }) => void;
  MIN_KEYWORDS: number;
  MAX_KEYWORDS: number;
}

const KeywordsAutocomplete: React.FC<KeywordsAutocompleteProps> = ({
  keywords,
  setKeywords,
  errors,
  setErrors,
  touched,
  setTouched,
  MIN_KEYWORDS,
  MAX_KEYWORDS,
}) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const suggestionsId = "keywords-suggestions";
  
  // Colors for better UI
  const tagBg = useColorModeValue('blue.100', 'blue.800');
  const tagText = useColorModeValue('blue.800', 'blue.100');
  const newTagBg = useColorModeValue('green.100', 'green.800');
  const newTagText = useColorModeValue('green.800', 'green.100');
  const suggestionBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.600');
  const activeBg = useColorModeValue('gray.200', 'gray.500');
  
  // Filter suggestions based on input (memoized)
  const filteredSuggestions = useMemo(() => {
    if (inputValue.trim() === '') return [];
    
    return keywordData
      .filter(option => 
        option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
        !keywords.includes(option.value)
      )
      .slice(0, SUGGESTION_LIMIT);
  }, [inputValue, keywords]);
  
  // Reset active suggestion index when filtered suggestions change
  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [filteredSuggestions]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Validate keywords and update errors
  const validateKeywords = useCallback((keywordsToValidate: string[]) => {
    if (keywordsToValidate.length < MIN_KEYWORDS) {
      setErrors({
        ...errors,
        keywords: `At least ${MIN_KEYWORDS} keywords required. Currently: ${keywordsToValidate.length}`
      });
    } else if (keywordsToValidate.length > MAX_KEYWORDS) {
      setErrors({
        ...errors,
        keywords: `Maximum ${MAX_KEYWORDS} keywords allowed. Currently: ${keywordsToValidate.length}`
      });
    } else {
      setErrors({ ...errors, keywords: '' });
    }
  }, [errors, setErrors, MIN_KEYWORDS, MAX_KEYWORDS]);
  
  // Debounced input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.trim() !== '') {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  // Handle adding a keyword
  const addKeyword = useCallback((keyword: string) => {
    // Check if keyword already exists
    if (keywords.length < MAX_KEYWORDS && !keywords.includes(keyword)) {
      const newKeywords = [...keywords, keyword];
      setKeywords(newKeywords);
      
      if (touched.keywords) {
        validateKeywords(newKeywords);
      }
    }
    
    setInputValue('');
    setShowSuggestions(false);
  }, [keywords, MAX_KEYWORDS, setKeywords, touched.keywords, validateKeywords]);
  
  // Handle selecting a suggestion
  const handleSelectSuggestion = (value: string) => {
    addKeyword(value);
  };
  
  // Handle creating a new keyword
  const handleCreateKeyword = () => {
    const trimmedValue = inputValue.trim().toLowerCase();
    if (trimmedValue !== '' && !keywords.includes(trimmedValue)) {
      addKeyword(trimmedValue);
    }
  };
  
  // Handle removing a keyword
  const handleRemoveKeyword = (keyword: string) => {
    const newKeywords = keywords.filter(k => k !== keyword);
    setKeywords(newKeywords);
    
    if (touched.keywords) {
      validateKeywords(newKeywords);
    }
  };
  
  // Handle key press events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle arrow navigation
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          Math.min(prev + 1, filteredSuggestions.length - 1)
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => Math.max(prev - 1, -1));
      }
    }
    
    // Handle selection
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < filteredSuggestions.length) {
        // Select the active suggestion
        handleSelectSuggestion(filteredSuggestions[activeSuggestionIndex].value);
      } else if (inputValue.trim() !== '') {
        // Check if the input matches an existing option
        const matchingOption = keywordData.find(
          option => option.label.toLowerCase() === inputValue.toLowerCase()
        );
        
        if (matchingOption) {
          handleSelectSuggestion(matchingOption.value);
        } else {
          handleCreateKeyword();
        }
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };
  
  // Handle focus and blur events
  const handleFocus = () => {
    if (inputValue.trim() !== '') {
      setShowSuggestions(true);
    }
  };
  
  const handleBlur = () => {
    // Use setTimeout to allow click events on suggestions to fire first
    // Store timeout reference to clear it if component unmounts
    timeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
      
      // Mark as touched
      if (!touched.keywords) {
        setTouched({ ...touched, keywords: true });
        validateKeywords(keywords);
      }
    }, BLUR_DELAY_MS);
  };
  
  // Helper text based on current state
  const getHelperText = () => {
    if (keywords.length === 0) {
      return `Please add ${MIN_KEYWORDS}-${MAX_KEYWORDS} keywords`;
    }
    
    const remaining = MAX_KEYWORDS - keywords.length;
    if (remaining > 0) {
      return `${keywords.length} keywords | Required: ${MIN_KEYWORDS}-${MAX_KEYWORDS} keywords`;
    }
    
    return `${keywords.length} keywords | Maximum reached`;
  };
  
  // Check if a keyword is custom (not in predefined list)
  const isCustomKeyword = useCallback((keyword: string) => {
    return !keywordData.some(option => option.value === keyword);
  }, []);
  
  return (
    <FormControl 
      isRequired 
      isInvalid={!!errors.keywords && touched.keywords} 
      role="group" 
      aria-labelledby="keywords-label"
    >
      <FormLabel id="keywords-label">Keywords</FormLabel>
      
      {/* Selected keywords display */}
      <Flex wrap="wrap" mb={2} gap={2}>
        {keywords.map((keyword) => {
          const isCustom = isCustomKeyword(keyword);
          return (
            <Tag 
              key={keyword}
              size="md"
              borderRadius="full"
              variant="solid"
              colorScheme={isCustom ? "green" : "blue"}
              bg={isCustom ? newTagBg : tagBg}
              color={isCustom ? newTagText : tagText}
            >
              <TagLabel>{keyword}</TagLabel>
              <TagCloseButton onClick={() => handleRemoveKeyword(keyword)} />
            </Tag>
          );
        })}
      </Flex>
      
      {/* Input field with suggestions */}
      <Box position="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Type to search or create keywords..."
          aria-describedby="keywords-help"
          aria-errormessage={errors.keywords ? "keywords-error" : undefined}
          aria-invalid={!!errors.keywords && touched.keywords}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={showSuggestions}
          aria-controls={suggestionsId}
          aria-activedescendant={
            activeSuggestionIndex >= 0 
              ? `suggestion-${activeSuggestionIndex}` 
              : undefined
          }
          isDisabled={keywords.length >= MAX_KEYWORDS}
        />
        
        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <Box
            position="absolute"
            zIndex={2}
            width="100%"
            maxH="200px"
            overflowY="auto"
            mt={1}
            borderRadius="md"
            boxShadow="md"
            bg={suggestionBg}
            border="1px solid"
            borderColor="gray.200"
            role="listbox"
            id={suggestionsId}
            aria-label="Keyword suggestions"
          >
            <List spacing={0}>
              {filteredSuggestions.map((option, index) => (
                <ListItem
                  key={option.value}
                  id={`suggestion-${index}`}
                  px={4}
                  py={2}
                  cursor="pointer"
                  bg={index === activeSuggestionIndex ? activeBg : undefined}
                  _hover={{ bg: hoverBg }}
                  onClick={() => handleSelectSuggestion(option.value)}
                  role="option"
                  aria-selected={index === activeSuggestionIndex}
                >
                  {option.label}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {/* Create new keyword option */}
        {showSuggestions && inputValue.trim() !== '' && filteredSuggestions.length === 0 && (
          <Box
            position="absolute"
            zIndex={2}
            width="100%"
            mt={1}
            borderRadius="md"
            boxShadow="md"
            bg={suggestionBg}
            border="1px solid"
            borderColor="gray.200"
            role="listbox"
            id="create-keyword-option"
            aria-label="Create new keyword"
          >
            <List spacing={0}>
              <ListItem
                id="create-keyword"
                px={4}
                py={2}
                cursor="pointer"
                _hover={{ bg: hoverBg }}
                onClick={handleCreateKeyword}
                role="option"
                aria-selected={false}
              >
                <Text color="green.500">Add "{inputValue}"</Text>
              </ListItem>
            </List>
          </Box>
        )}
      </Box>
      
      {/* Error message */}
      {errors.keywords && touched.keywords && (
        <FormErrorMessage 
          id="keywords-error"
          role="alert"
        >
          {errors.keywords}
        </FormErrorMessage>
      )}
      
      {/* Helper text */}
      <FormHelperText id="keywords-help">
        {getHelperText()}
        {keywords.some(isCustomKeyword) && (
          <span style={{ display: 'inline-block', marginLeft: '8px' }}>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: theme.colors.green[400],
              marginRight: '4px'
            }}></span>
            <span style={{ color: theme.colors.green[600], fontSize: '0.8em' }}>
              New keywords will be reviewed
            </span>
          </span>
        )}
      </FormHelperText>
    </FormControl>
  );
};

export default KeywordsAutocomplete;
