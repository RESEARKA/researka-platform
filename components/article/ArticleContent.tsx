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
      <Box p={4} bg="red.50" borderRadius="md" role="alert">
        <Text color="red.500">Article content could not be loaded</Text>
      </Box>
    );
  }

  // For debugging
  console.log('ArticleContent rendering with data:', article);

  // Extract and process keywords from category if available
  const keywords = useMemo(() => 
    article.category?.split(',')
      .map(k => k.trim())
      .filter(Boolean) || [], 
    [article.category]
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
      {/* Debug information - only visible when explicitly enabled */}
      {process.env.NEXT_PUBLIC_SHOW_DEBUG === 'true' && (
        <Box p={2} mb={4} bg="gray.100" borderRadius="md" fontSize="sm">
          <Text fontWeight="bold">Debug Info:</Text>
          <Text>Content present: {article.content ? 'Yes' : 'No'}</Text>
          <Text>Content length: {article.content?.length || 0} chars</Text>
          <Text>Content preview: {article.content?.substring(0, 50)}...</Text>
          <Text>Has introduction: {article.introduction ? 'Yes' : 'No'}</Text>
          <Text>Has methods: {article.methods ? 'Yes' : 'No'}</Text>
          <Text>Has results: {article.results ? 'Yes' : 'No'}</Text>
          <Text>Has discussion: {article.discussion ? 'Yes' : 'No'}</Text>
        </Box>
      )}
      <Box 
        sx={{
          'h1': { fontSize: '2xl', fontWeight: 'bold', my: 4 },
          'h2': { fontSize: 'xl', fontWeight: 'bold', my: 3 },
          'p': { my: 2 },
          'ul, ol': { pl: 6, my: 2 },
          'li': { my: 1 },
        }}
      >
        {article.content && article.content !== 'Placeholder content - upload/editor needed' ? (
          <Text whiteSpace="pre-wrap">{article.content}</Text>
        ) : (
          <Box>
            {article.introduction && (
              <>
                <Text fontSize="md" fontWeight="bold" mt={4} mb={2}>Introduction</Text>
                <Text mb={4}>{article.introduction}</Text>
              </>
            )}
            
            {article.methods && (
              <>
                <Text fontSize="md" fontWeight="bold" mt={4} mb={2}>Methods</Text>
                <Text mb={4}>{article.methods}</Text>
              </>
            )}
            
            {article.results && (
              <>
                <Text fontSize="md" fontWeight="bold" mt={4} mb={2}>Results</Text>
                <Text mb={4}>{article.results}</Text>
              </>
            )}
            
            {article.discussion && (
              <>
                <Text fontSize="md" fontWeight="bold" mt={4} mb={2}>Discussion</Text>
                <Text mb={4}>{article.discussion}</Text>
              </>
            )}
            
            {article.references && (
              <>
                <Text fontSize="md" fontWeight="bold" mt={4} mb={2}>References</Text>
                <Text mb={4}>{article.references}</Text>
              </>
            )}
            
            {!article.introduction && !article.methods && !article.results && 
             !article.discussion && !article.references && 
             (!article.content || article.content === 'Placeholder content - upload/editor needed') && (
              <Text>No content available for this article.</Text>
            )}
          </Box>
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
