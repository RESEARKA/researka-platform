import React, { useMemo } from 'react';
import {
  Box,
  Text,
  Divider,
  Flex,
  Tag,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { Article } from '../../types/review';

interface ArticleContentProps {
  article: Article;
  isLoading: boolean;
}

/**
 * ArticleContent Component
 * 
 * Displays the full content of an article for review purposes.
 * Shows abstract, full text, and keywords.
 */
const ArticleContent: React.FC<ArticleContentProps> = ({ article, isLoading }) => {
  // Handle loading state
  if (isLoading) {
    return (
      <Box>
        <Skeleton height="50px" width="80%" mb={4} aria-label="Loading article title" />
        <SkeletonText mt={2} noOfLines={4} spacing={4} aria-label="Loading article abstract" />
        <Divider my={6} aria-hidden="true" />
        <Skeleton height="200px" mb={8} aria-label="Loading article content" />
        <SkeletonText mt={4} noOfLines={10} spacing={4} aria-label="Loading article content" />
      </Box>
    );
  }

  // Handle missing article data
  if (!article) {
    return (
      <Box p={4} bg="red.50" borderRadius="md">
        <Text color="red.500">Article content could not be loaded</Text>
      </Box>
    );
  }

  // Extract and process keywords from category if available
  const keywords = useMemo(() => 
    article.category?.split(',')
      .map(k => k.trim())
      .filter(Boolean) || [], 
    [article.category]
  );

  // Process content lines for rendering
  const contentLines = useMemo(() => 
    article.content?.split('\n') || [], 
    [article.content]
  );

  return (
    <Box as="article">
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Abstract
      </Text>
      <Text mb={6}>{article.abstract || 'No abstract available'}</Text>
      
      <Divider my={6} aria-hidden="true" />
      
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Full Paper
      </Text>
      <Box 
        sx={{
          'h1': { fontSize: '2xl', fontWeight: 'bold', my: 4 },
          'h2': { fontSize: 'xl', fontWeight: 'bold', my: 3 },
          'p': { my: 2 },
          'ul, ol': { pl: 6, my: 2 },
          'li': { my: 1 },
        }}
      >
        {contentLines.length > 0 ? (
          contentLines.map((line: string, index: number) => (
            <Text key={`line-${index}`} whiteSpace="pre-wrap">
              {line}
            </Text>
          ))
        ) : (
          <Text>No content available for this article.</Text>
        )}
      </Box>
      
      {keywords.length > 0 && (
        <Flex mt={6} gap={2} flexWrap="wrap">
          <Text fontWeight="bold" mr={2}>Keywords:</Text>
          {keywords.map((keyword: string, index: number) => (
            <Tag key={`keyword-${index}`} size="md" colorScheme="green" variant="subtle">
              {keyword}
            </Tag>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default React.memo(ArticleContent);
