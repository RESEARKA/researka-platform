import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  Text,
  VStack,
  HStack,
  List,
  ListItem,
  Divider,
  useOutsideClick,
  useColorModeValue,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { getResearchFieldsForSelect } from '../utils/researchTaxonomy';

interface ResearchInterestSelectorProps {
  selectedInterests: string[];
  onChange: (interests: string[]) => void;
  maxInterests?: number;
  isRequired?: boolean;
  error?: string;
  isReadOnly?: boolean;
}

const ResearchInterestSelector: React.FC<ResearchInterestSelectorProps> = ({
  selectedInterests,
  onChange,
  maxInterests = 10,
  isRequired = false,
  error,
  isReadOnly = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<{ value: string; label: string; group: string }[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const allOptions = getResearchFieldsForSelect();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  
  // Close dropdown when clicking outside
  useOutsideClick({
    ref: dropdownRef,
    handler: () => setIsDropdownOpen(false),
  });
  
  // Filter options based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions([]);
      return;
    }
    
    const filtered = allOptions.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
      option.group.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Group the filtered options by their group
    const sortedFiltered = [...filtered].sort((a, b) => a.group.localeCompare(b.group));
    
    setFilteredOptions(sortedFiltered);
  }, [searchTerm]);
  
  // Handle adding a new interest
  const handleAddInterest = (option: { value: string; label: string }) => {
    if (selectedInterests.includes(option.value)) {
      return; // Already selected
    }
    
    if (selectedInterests.length >= maxInterests) {
      return; // Max reached
    }
    
    const newInterests = [...selectedInterests, option.value];
    onChange(newInterests);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };
  
  // Handle removing an interest
  const handleRemoveInterest = (interest: string) => {
    const newInterests = selectedInterests.filter(i => i !== interest);
    onChange(newInterests);
  };
  
  // Get label for a value
  const getLabelForValue = (value: string) => {
    const option = allOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };
  
  // Group options by category
  const groupedOptions: Record<string, { value: string; label: string }[]> = {};
  filteredOptions.forEach(option => {
    if (!groupedOptions[option.group]) {
      groupedOptions[option.group] = [];
    }
    groupedOptions[option.group].push({ value: option.value, label: option.label });
  });
  
  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      <FormLabel>Research Interests / Keywords</FormLabel>
      
      <Box position="relative" ref={dropdownRef}>
        {/* Selected interests */}
        <Flex flexWrap="wrap" mb={2} gap={2}>
          {selectedInterests.map(interest => (
            <Tag 
              key={interest} 
              size="md" 
              borderRadius="full" 
              variant="solid" 
              colorScheme="blue"
            >
              <TagLabel>{getLabelForValue(interest)}</TagLabel>
              {!isReadOnly && (
                <TagCloseButton onClick={() => handleRemoveInterest(interest)} />
              )}
            </Tag>
          ))}
        </Flex>
        
        {/* Search input */}
        {!isReadOnly && (
          <InputGroup>
            <Input
              ref={inputRef}
              placeholder={selectedInterests.length >= maxInterests 
                ? `Maximum of ${maxInterests} interests reached` 
                : "Add a research interest"}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.trim() !== '') {
                  setIsDropdownOpen(true);
                } else {
                  setIsDropdownOpen(false);
                }
              }}
              onFocus={() => {
                if (searchTerm.trim() !== '') {
                  setIsDropdownOpen(true);
                }
              }}
              isDisabled={selectedInterests.length >= maxInterests}
            />
            <InputRightElement>
              <FiSearch color="gray.300" />
            </InputRightElement>
          </InputGroup>
        )}
        
        {/* Dropdown */}
        {isDropdownOpen && filteredOptions.length > 0 && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            zIndex={10}
            mt={1}
            maxH="300px"
            overflowY="auto"
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            boxShadow="md"
          >
            <List spacing={0}>
              {Object.entries(groupedOptions).map(([group, options], groupIndex) => (
                <Box key={group}>
                  {groupIndex > 0 && <Divider />}
                  <Text px={4} py={2} fontWeight="bold" fontSize="sm" color="gray.500">
                    {group}
                  </Text>
                  {options.map(option => (
                    <ListItem 
                      key={option.value}
                      px={4}
                      py={2}
                      cursor="pointer"
                      _hover={{ bg: hoverBgColor }}
                      onClick={() => handleAddInterest(option)}
                    >
                      <Flex align="center">
                        <Text flex={1}>{option.label}</Text>
                        <FiPlus />
                      </Flex>
                    </ListItem>
                  ))}
                </Box>
              ))}
            </List>
          </Box>
        )}
      </Box>
      
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
      {!error && (
        <FormHelperText>
          Select up to {maxInterests} research interests. These help match you with relevant articles and reviews.
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default ResearchInterestSelector;
