import React from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Tag,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCalendar, FiEye } from 'react-icons/fi';

interface FeaturedArticleProps {
  article: {
    id: number;
    title: string;
    authors: string;
    abstract: string;
    date: string;
    views: number;
    categories: string[];
  };
}

const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.700', 'white');

  return (
    <Box 
      bg={bgColor} 
      p={6} 
      borderRadius="md" 
      boxShadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
      transition="all 0.2s"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
    >
      <HStack spacing={2} mb={2}>
        {article.categories.map((category, index) => (
          <Tag 
            key={index} 
            size="sm" 
            colorScheme={index === 0 ? "blue" : "green"} 
            borderRadius="full"
          >
            {category}
          </Tag>
        ))}
      </HStack>
      
      <Heading as="h2" size="lg" mb={2} color={headingColor}>
        {article.title}
      </Heading>
      
      <Text fontSize="sm" color={textColor} mb={3}>
        {article.authors}
      </Text>
      
      <Text color={textColor} mb={4}>
        {article.abstract}
      </Text>
      
      <Flex justify="space-between" align="center" color="gray.500" fontSize="sm">
        <Flex align="center">
          <FiCalendar style={{ marginRight: '5px' }} />
          <Text>{article.date}</Text>
        </Flex>
        <Flex align="center">
          <FiEye style={{ marginRight: '5px' }} />
          <Text>{article.views}</Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default FeaturedArticle;
