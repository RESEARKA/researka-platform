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
import { downloadArticlePdf } from '../../../utils/pdfGenerator';
import { Article } from '../../../utils/recommendationEngine';
import { AuthorDisplay } from '../AuthorDisplay';
import { AuthorInfo } from '../../../utils/citationHelper';

interface ArticleHeaderProps {
  article: Article | null;
  isLoading: boolean;
  authors?: AuthorInfo[];
}

/**
 * ArticleHeader component displays the title, authors, publication date, 
 * and action buttons for an article
 */
const ArticleHeader: React.FC<ArticleHeaderProps> = ({ 
  article,
  isLoading,
  authors = []
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

  // Get the publication date from the article
  const getPublicationDate = () => {
    if (article?.publishedDate) {
      return formatPublicationDate(article.publishedDate);
    }
    return 'Publication date unavailable';
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
      
      <Box mb={4}>
        {authors && authors.length > 0 ? (
          <Flex direction="column">
            {authors.map((author, index) => (
              <Box key={`author-${index}`} mb={2}>
                <AuthorDisplay
                  authorId={author.userId || `author-${index}`}
                  displayName={author.displayName}
                  name={author.name}
                  affiliation={author.affiliation}
                  orcid={author.orcid}
                />
              </Box>
            ))}
          </Flex>
        ) : (
          <Text color="gray.500" mb={4}>No author information available</Text>
        )}
      </Box>
      
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
        <HStack spacing={6} wrap="wrap">
          {/* Publication date */}
          <HStack spacing={2} align="center">
            <Icon as={FiCalendar} color="blue.500" />
            <Text>{getPublicationDate()}</Text>
          </HStack>
          
          {/* PDF Download button */}
          {article && (
            <Button
              leftIcon={<Icon as={FiDownload} />}
              size="sm"
              variant="outline"
              colorScheme="blue"
              onClick={() => article && downloadArticlePdf(article)}
            >
              Download PDF
            </Button>
          )}
          
          {/* DOI link */}
          {false && (
            <Button
              as="a"
              href="#"
              target="_blank"
              leftIcon={<Icon as={FiFileText} />}
              size="sm"
              variant="outline"
            >
              View DOI
            </Button>
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
