import React from 'react';
import {
  Box,
  Text,
  Heading,
  Divider,
  Flex,
  Tag,
  Skeleton,
  SkeletonText,
  Image,
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
  if (isLoading) {
    return (
      <Box>
        <Skeleton height="50px" width="80%" mb={4} />
        <SkeletonText mt={2} noOfLines={4} spacing={4} />
        <Divider my={6} />
        <Skeleton height="200px" mb={8} />
        <SkeletonText mt={4} noOfLines={10} spacing={4} />
      </Box>
    );
  }

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Abstract
      </Text>
      <Text mb={6}>{article?.abstract}</Text>
      
      <Divider my={6} />
      
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
        {article?.content ? (
          article.content.split('\n').map((line: string, index: number) => (
            <Text key={index} whiteSpace="pre-wrap">
              {line}
            </Text>
          ))
        ) : (
          <Text>No content available for this article.</Text>
        )}
      </Box>
      
      {article?.keywords && article.keywords.length > 0 && (
        <Flex mt={6} gap={2} flexWrap="wrap">
          <Text fontWeight="bold" mr={2}>Keywords:</Text>
          {article.keywords.map((keyword: string, index: number) => (
            <Tag key={index} size="md" colorScheme="green" variant="subtle">
              {keyword}
            </Tag>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default React.memo(ArticleContent);
