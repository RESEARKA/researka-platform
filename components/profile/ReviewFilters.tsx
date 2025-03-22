import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Select,
  FormControl,
  FormLabel,
  Button,
  IconButton,
  Collapse,
  useDisclosure,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiFilter, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import { SortOption, FilterOptions } from '../../hooks/useReviews';

interface ReviewFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  onSortChange: (sortOption: SortOption) => void;
  currentSort: SortOption;
  currentFilters: FilterOptions;
}

const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  onFilterChange,
  onSortChange,
  currentSort,
  currentFilters,
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters);
  const [scoreRange, setScoreRange] = useState<[number, number]>([
    currentFilters.minScore || 1,
    currentFilters.maxScore || 5,
  ]);
  
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.700');
  
  // Count active filters
  const activeFilterCount = Object.values(currentFilters).filter(value => value !== undefined).length;
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value as SortOption);
  };
  
  const handleRecommendationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = {
      ...localFilters,
      recommendation: e.target.value || undefined,
    };
    setLocalFilters(newFilters);
  };
  
  const handleScoreRangeChange = (values: number[]) => {
    setScoreRange([values[0], values[1]]);
    
    const newFilters = {
      ...localFilters,
      minScore: values[0],
      maxScore: values[1],
    };
    setLocalFilters(newFilters);
  };
  
  const applyFilters = () => {
    onFilterChange(localFilters);
  };
  
  const clearFilters = () => {
    const emptyFilters: FilterOptions = {};
    setLocalFilters(emptyFilters);
    setScoreRange([1, 5]);
    onFilterChange(emptyFilters);
  };
  
  return (
    <Box 
      mb={4} 
      borderWidth="1px" 
      borderRadius="md" 
      borderColor={borderColor}
      bg={bgColor}
      p={3}
    >
      <Flex justify="space-between" align="center">
        <HStack>
          <IconButton
            aria-label="Toggle filters"
            icon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
            size="sm"
            variant="ghost"
            onClick={onToggle}
          />
          <Text fontWeight="medium">Filters & Sorting</Text>
          {activeFilterCount > 0 && (
            <Badge colorScheme="purple" borderRadius="full">
              {activeFilterCount} active
            </Badge>
          )}
        </HStack>
        
        <Select
          value={currentSort}
          onChange={handleSortChange}
          size="sm"
          width="auto"
          ml={2}
        >
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="score_desc">Highest Score</option>
          <option value="score_asc">Lowest Score</option>
        </Select>
      </Flex>
      
      <Collapse in={isOpen} animateOpacity>
        <VStack spacing={4} mt={4} align="stretch">
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            gap={4}
          >
            <FormControl>
              <FormLabel fontSize="sm">Recommendation</FormLabel>
              <Select
                value={localFilters.recommendation || ''}
                onChange={handleRecommendationChange}
                size="sm"
                placeholder="All recommendations"
              >
                <option value="accept">Accept</option>
                <option value="minor_revisions">Minor Revisions</option>
                <option value="major_revisions">Major Revisions</option>
                <option value="reject">Reject</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm">Score Range</FormLabel>
              <Box px={2}>
                <RangeSlider
                  min={1}
                  max={5}
                  step={1}
                  value={scoreRange}
                  onChange={handleScoreRangeChange}
                  colorScheme="purple"
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} boxSize={6}>
                    <Text fontSize="xs">{scoreRange[0]}</Text>
                  </RangeSliderThumb>
                  <RangeSliderThumb index={1} boxSize={6}>
                    <Text fontSize="xs">{scoreRange[1]}</Text>
                  </RangeSliderThumb>
                </RangeSlider>
              </Box>
            </FormControl>
          </Flex>
          
          <Flex justify="flex-end" gap={2}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FiX />}
              onClick={clearFilters}
            >
              Clear
            </Button>
            <Button
              size="sm"
              colorScheme="purple"
              leftIcon={<FiFilter />}
              onClick={applyFilters}
            >
              Apply Filters
            </Button>
          </Flex>
        </VStack>
      </Collapse>
    </Box>
  );
};

export default ReviewFilters;
