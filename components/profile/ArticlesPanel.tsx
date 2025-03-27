import React from 'react';
import {
  VStack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Flex,
  Box,
  Text,
  Button,
  Heading,
  HStack,
  Divider,
  useColorModeValue,
  Link as ChakraLink,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { FiCalendar, FiFileText, FiExternalLink } from 'react-icons/fi';
import ResponsiveText from '../ResponsiveText';
import { Article, ArticlesResponse } from '../../hooks/useArticles';
import Link from 'next/link';

// Define default empty state component
const DefaultEmptyState: React.FC<{ type: string }> = ({ type }) => (
  <Box textAlign="center" py={10}>
    <Text fontSize="lg" fontWeight="medium" mb={2}>No {type} Found</Text>
    <Text color="gray.500">You haven't created any {type.toLowerCase()} yet.</Text>
  </Box>
);

// Define default pagination component
const DefaultPaginationControl: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  return (
    <Flex justify="center" mt={6}>
      <Button 
        size="sm" 
        onClick={() => onPageChange(currentPage - 1)} 
        isDisabled={currentPage === 1}
        mr={2}
      >
        Previous
      </Button>
      <Text alignSelf="center" mx={2}>
        Page {currentPage} of {totalPages}
      </Text>
      <Button 
        size="sm" 
        onClick={() => onPageChange(currentPage + 1)} 
        isDisabled={currentPage === totalPages}
        ml={2}
      >
        Next
      </Button>
    </Flex>
  );
};

interface ArticlesPanelProps {
  userId?: string;
  articlesData?: ArticlesResponse;
  currentPage: number;
  onPageChange: (page: number) => void;
  EmptyState?: React.FC<{ type: string }>;
  PaginationControl?: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }>;
  isLoading?: boolean;
}

const ArticlesPanel: React.FC<ArticlesPanelProps> = ({
  userId,
  articlesData,
  currentPage,
  onPageChange,
  EmptyState = DefaultEmptyState,
  PaginationControl = DefaultPaginationControl,
  isLoading = false,
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Show loading state
  if (isLoading) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading articles...</Text>
        </VStack>
      </Center>
    );
  }
  
  return (
    <VStack spacing={4} align="stretch">
      {articlesData && articlesData.articles && articlesData.articles.length > 0 ? (
        <>
          {articlesData.articles.map((article: Article) => (
            <Card 
              key={article.id} 
              borderWidth="1px" 
              borderColor={borderColor}
              bg={cardBg} 
              boxShadow="sm"
              transition="all 0.2s"
              _hover={{ boxShadow: 'md', borderColor: 'blue.300' }}
            >
              <CardHeader pb={2}>
                <Flex justify="space-between" align="center">
                  <Heading as="h3" size="md" fontWeight="600">
                    {article.title}
                  </Heading>
                  <Badge colorScheme={
                    article.status === 'published' ? 'green' : 
                    article.status === 'pending' ? 'yellow' : 
                    article.status === 'rejected' ? 'red' : 'gray'
                  }>
                    {article.status}
                  </Badge>
                </Flex>
              </CardHeader>
              
              <CardBody py={2}>
                <Text noOfLines={2} color="gray.600">
                  {article.abstract}
                </Text>
              </CardBody>
              
              <Divider borderColor={borderColor} />
              
              <CardFooter pt={2}>
                <Flex justify="space-between" width="100%" align="center">
                  <HStack spacing={2} color="gray.500">
                    <FiCalendar size={14} />
                    <Text fontSize="sm">{article.date}</Text>
                  </HStack>
                  
                  <Button
                    as={Link}
                    href={`/articles/${article.id}`}
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    leftIcon={<FiExternalLink size={14} />}
                  >
                    View Article
                  </Button>
                </Flex>
              </CardFooter>
            </Card>
          ))}
          
          {articlesData.totalPages > 1 && (
            <Box mt={4}>
              <PaginationControl
                currentPage={currentPage}
                totalPages={articlesData.totalPages}
                onPageChange={onPageChange}
              />
            </Box>
          )}
        </>
      ) : (
        <EmptyState type="articles" />
      )}
    </VStack>
  );
};

export default ArticlesPanel;
