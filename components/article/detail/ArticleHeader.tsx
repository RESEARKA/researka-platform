import React from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Badge,
  Button,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiArrowLeft, FiCalendar, FiDownload, FiFileText } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { ArticleAuthors } from '../ArticleAuthors';
import { downloadArticlePdf } from '../../../utils/pdfGenerator';
import { Article } from '../../../utils/recommendationEngine';

interface ArticleHeaderProps {
  article: Article | null;
  isLoading: boolean;
}

/**
 * ArticleHeader component displays the title, authors, publication date, 
 * and action buttons for an article
 */
const ArticleHeader: React.FC<ArticleHeaderProps> = ({ 
  article,
  isLoading 
}) => {
  const router = useRouter();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Format publication date
  const formatPublicationDate = (timestamp: any) => {
    if (!timestamp) return 'Publication date unavailable';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date format';
    }
  };

  return (
    <Box mb={6}>
      {/* Back button */}
      <Button
        leftIcon={<Icon as={FiArrowLeft} />}
        variant="ghost"
        size="sm"
        mb={4}
        onClick={() => router.push('/articles')}
      >
        Back to Articles
      </Button>
      
      {/* Title and authors */}
      <Heading as="h1" size="xl" mb={4}>
        {article?.title || (isLoading ? 'Loading...' : 'Article Not Found')}
      </Heading>
      
      {article && article.authors && (
        <Box mb={4}>
          <ArticleAuthors authors={article.authors} />
        </Box>
      )}
      
      {/* Publication date and categories */}
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        mb={6}
        pb={4}
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <HStack spacing={4} mb={{ base: 3, md: 0 }} wrap="wrap">
          {article?.publicationDate && (
            <HStack>
              <Icon as={FiCalendar} />
              <Text fontSize="sm">
                {formatPublicationDate(article.publicationDate)}
              </Text>
            </HStack>
          )}
          
          {article?.pdfUrl && (
            <Button
              size="sm"
              leftIcon={<Icon as={FiDownload} />}
              variant="outline"
              onClick={() => article && downloadArticlePdf(article)}
            >
              Download PDF
            </Button>
          )}
          
          {article?.doi && (
            <HStack>
              <Icon as={FiFileText} />
              <Text fontSize="sm">DOI: {article.doi}</Text>
            </HStack>
          )}
        </HStack>
        
        {/* Categories */}
        <HStack spacing={2} wrap="wrap">
          {article?.categories?.map((category) => (
            <Badge key={category} colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="md">
              {category}
            </Badge>
          ))}
        </HStack>
      </Flex>
    </Box>
  );
};

export default ArticleHeader;
