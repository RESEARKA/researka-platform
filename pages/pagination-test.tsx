import { useState, useEffect } from 'react';
import { Box, Button, Container, Heading, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import Layout from '../components/Layout';
import { paginateArticles, getTotalPages, getAllMockArticles } from '../utils/articleUtils';
import { Article } from '../data/articles';

const PaginationTestPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const ARTICLES_PER_PAGE = 10;
  
  // Load articles on mount
  useEffect(() => {
    const allArticles = getAllMockArticles();
    setArticles(allArticles);
    setTotalPages(getTotalPages(allArticles.length, ARTICLES_PER_PAGE));
    setIsLoading(false);
  }, []);
  
  // Update displayed articles when page changes
  useEffect(() => {
    if (articles.length === 0) return;
    
    console.log('============= PAGINATION TEST =============');
    console.log('Current page:', currentPage);
    console.log('Total articles:', articles.length);
    console.log('Articles per page:', ARTICLES_PER_PAGE);
    
    const paginatedArticles = paginateArticles(articles, currentPage, ARTICLES_PER_PAGE);
    
    console.log('Paginated articles count:', paginatedArticles.length);
    console.log('First article ID:', paginatedArticles[0]?.id);
    console.log('Last article ID:', paginatedArticles[paginatedArticles.length - 1]?.id);
    console.log('============= END PAGINATION TEST =============');
    
    setDisplayedArticles(paginatedArticles);
  }, [articles, currentPage, ARTICLES_PER_PAGE]);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    console.log('Changing to page:', newPage);
    setCurrentPage(newPage);
  };
  
  return (
    <Layout title="Pagination Test" description="Test page for pagination" activePage="home">
      <Container maxW="container.lg" py={8}>
        <Heading as="h1" mb={6}>Pagination Test Page</Heading>
        
        <Box mb={6}>
          <Text fontSize="lg" fontWeight="bold">
            Page {currentPage} of {totalPages} | 
            Showing {displayedArticles.length} of {articles.length} articles
          </Text>
        </Box>
        
        <HStack spacing={2} mb={8}>
          <Button 
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            isDisabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button 
              key={page}
              onClick={() => handlePageChange(page)}
              colorScheme={page === currentPage ? 'blue' : 'gray'}
            >
              {page}
            </Button>
          ))}
          
          <Button 
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            isDisabled={currentPage === totalPages}
          >
            Next
          </Button>
        </HStack>
        
        <VStack spacing={4} align="stretch">
          {isLoading ? (
            <Text>Loading articles...</Text>
          ) : (
            displayedArticles.map((article, index) => (
              <Box 
                key={article.id} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md"
                boxShadow="sm"
              >
                <HStack justify="space-between">
                  <Heading size="md">{article.title}</Heading>
                  <Badge colorScheme="blue">ID: {article.id}</Badge>
                </HStack>
                <Text mt={2} noOfLines={2}>{article.abstract}</Text>
                <Text mt={2} fontSize="sm" color="gray.500">
                  Page {currentPage}, Item {index + 1}, Global Index {(currentPage - 1) * ARTICLES_PER_PAGE + index + 1}
                </Text>
              </Box>
            ))
          )}
        </VStack>
      </Container>
    </Layout>
  );
};

export default PaginationTestPage;
