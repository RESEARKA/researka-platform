import React from 'react';
import {
  Box,
  Text,
  VStack,
  Skeleton,
  SkeletonText,
  useColorModeValue,
} from '@chakra-ui/react';
import { Article } from '../../../utils/recommendationEngine';

interface ArticleContentProps {
  article: Article | null;
  isLoading: boolean;
}

/**
 * ArticleContent component renders the main content of the article
 * including abstract, introduction, and main body
 */
const ArticleContent: React.FC<ArticleContentProps> = ({ 
  article,
  isLoading 
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (isLoading) {
    return (
      <Box 
        bg={bgColor} 
        p={6} 
        borderRadius="md" 
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Skeleton height="30px" width="150px" mb={6} />
        <SkeletonText mt="4" noOfLines={10} spacing="4" />
      </Box>
    );
  }

  if (!article) {
    return null;
  }

  // Helper function to render article content sections
  const renderContentSection = (title: string, content: string | undefined, isMainContent = false) => {
    if (!content) return null;
    
    return (
      <Box mb={isMainContent ? 0 : 8}>
        {!isMainContent && (
          <Text fontSize="xl" fontWeight="bold" mb={3}>
            {title}
          </Text>
        )}
        <Text 
          whiteSpace="pre-wrap" 
          lineHeight="1.7" 
          fontSize={isMainContent ? "md" : "lg"}
        >
          {content}
        </Text>
      </Box>
    );
  };

  return (
    <Box 
      bg={bgColor} 
      p={6} 
      borderRadius="md" 
      boxShadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack align="stretch" spacing={6}>
        {/* Abstract */}
        {renderContentSection('Abstract', article.abstract)}
        
        {/* Introduction */}
        {article.introduction && renderContentSection('Introduction', article.introduction)}
        
        {/* Main content */}
        {renderContentSection('', article.content, true)}
      </VStack>
    </Box>
  );
};

export default ArticleContent;
