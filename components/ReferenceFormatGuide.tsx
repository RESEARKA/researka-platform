import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Code,
  Divider,
  List,
  ListItem,
  ListIcon,
  useColorModeValue
} from '@chakra-ui/react';
import { FiCheckCircle, FiInfo } from 'react-icons/fi';

/**
 * Component that displays IEEE reference format guidelines
 */
export const ReferenceFormatGuide: React.FC = () => {
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('blue.200', 'blue.700');
  
  return (
    <Box 
      p={4} 
      borderWidth={1} 
      borderRadius="md" 
      borderColor={borderColor}
      bg={bgColor}
      mb={6}
    >
      <Heading size="md" mb={3}>IEEE Numeric Reference Format</Heading>
      
      <Text mb={3}>
        DecentraJournal requires all references to follow the IEEE numeric format. This format is:
      </Text>
      
      <List spacing={2} mb={4}>
        <ListItem>
          <ListIcon as={FiCheckCircle} color="green.500" />
          Clean and easy for automated parsing
        </ListItem>
        <ListItem>
          <ListIcon as={FiCheckCircle} color="green.500" />
          Numbered references in square brackets [1]
        </ListItem>
        <ListItem>
          <ListIcon as={FiCheckCircle} color="green.500" />
          Compact and widely used in scientific and technical fields
        </ListItem>
        <ListItem>
          <ListIcon as={FiCheckCircle} color="green.500" />
          Includes optional DOI or URLs for immediate accessibility
        </ListItem>
      </List>
      
      <Divider my={4} />
      
      <Heading size="sm" mb={2}>Example References:</Heading>
      
      <VStack align="start" spacing={3} mb={4}>
        <Code p={2} width="100%" borderRadius="md" fontSize="sm" whiteSpace="pre-wrap">
          [1] J. A. Smith and M. Doe, "Title of the article," Journal Name, vol. 12, no. 3, pp. 45–67, 2023. doi: xx.xxx/yyyyy.
        </Code>
        <Code p={2} width="100%" borderRadius="md" fontSize="sm" whiteSpace="pre-wrap">
          [2] A. Johnson, Book Title: Subtitle. City, State, Country: Publisher, Year, pp. 15–37.
        </Code>
        <Code p={2} width="100%" borderRadius="md" fontSize="sm" whiteSpace="pre-wrap">
          [3] L. Brown, "Conference Paper Title," in Proceedings of the Conference Name, City, Country, Year, pp. 12–17. doi: zz.zzz/xxxxx.
        </Code>
      </VStack>
      
      <Box p={3} borderRadius="md" borderLeftWidth={4} borderLeftColor="blue.500" bg={useColorModeValue('blue.100', 'blue.800')}>
        <Text fontSize="sm" display="flex" alignItems="center">
          <Box as={FiInfo} mr={2} />
          References should be numbered sequentially in the order they appear in your text.
        </Text>
      </Box>
    </Box>
  );
};

export default ReferenceFormatGuide;
