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
} from '@chakra-ui/react';
import { FiCalendar, FiFileText, FiExternalLink } from 'react-icons/fi';
import ResponsiveText from '../ResponsiveText';
import { Article, ArticlesResponse } from '../../hooks/useArticles';
import Link from 'next/link';

interface ArticlesPanelProps {
  articlesData: ArticlesResponse | undefined;
  currentPage: number;
  onPageChange: (page: number) => void;
  EmptyState: React.FC<{ type: string }>;
  PaginationControl: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }>;
}

const ArticlesPanel: React.FC<ArticlesPanelProps> = ({
  articlesData,
  currentPage,
  onPageChange,
  EmptyState,
  PaginationControl,
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
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
