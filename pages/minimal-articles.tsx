import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Container, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Layout from '../components/Layout';
import { ALL_ARTICLES, Article } from '../data/articles';
import { getAllMockArticles } from '../utils/articleUtils';

// IMPORTANT: This is a completely fresh implementation with no dependencies on previous pagination code
export default function MinimalArticlesPage() {
  console.log('Rendering MinimalArticlesPage');
  
  // 1. CORE STATE - Keep this minimal
  const [currentPage, setCurrentPage] = useState(1);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 2. CONSTANTS
  const ARTICLES_PER_PAGE = 5;
  
  // 3. LOAD ARTICLES - Only once on mount
  useEffect(() => {
    console.log('Loading articles...');
    const loadArticles = () => {
      const combined = [...ALL_ARTICLES, ...getAllMockArticles()];
      console.log(`Loaded ${combined.length} articles`);
      setAllArticles(combined);
      setIsLoading(false);
    };
    
    // Simulate loading delay
    const timer = setTimeout(loadArticles, 500);
    return () => clearTimeout(timer);
  }, []); // Empty dependency array = run once on mount
  
  // 4. CALCULATE PAGINATION VALUES
  const totalPages = useMemo(() => {
    const count = Math.ceil(allArticles.length / ARTICLES_PER_PAGE);
    console.log(`Calculated totalPages = ${count}`);
    return Math.max(1, count); // Minimum 1 page
  }, [allArticles.length]);
  
  // 5. GET CURRENT PAGE ARTICLES
  const displayedArticles = useMemo(() => {
    console.log(`Calculating displayed articles for page ${currentPage}`);
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = Math.min(startIndex + ARTICLES_PER_PAGE, allArticles.length);
    
    console.log(`Slicing from ${startIndex} to ${endIndex}`);
    return allArticles.slice(startIndex, endIndex);
  }, [allArticles, currentPage, ARTICLES_PER_PAGE]);
  
  // 6. PAGE CHANGE HANDLER - Simple and direct
  const handlePageChange = (newPage: number) => {
    console.log(`handlePageChange called with newPage = ${newPage}`);
    
    // Validate page number
    if (newPage < 1 || newPage > totalPages) {
      console.log(`Invalid page ${newPage}, not changing`);
      return;
    }
    
    // Update state directly
    console.log(`Setting currentPage to ${newPage}`);
    setCurrentPage(newPage);
    
    // Scroll to top
    window.scrollTo(0, 0);
  };
  
  // Log on every render for debugging
  console.log(`Rendering with currentPage = ${currentPage}, totalPages = ${totalPages}`);
  
  return (
    <Layout>
      <Container maxW="container.lg" py={8}>
        <Heading as="h1" mb={6}>Minimal Articles Page</Heading>
        
        {/* Debug Info */}
        <Box 
          p={4} 
          mb={6} 
          bg="blue.50" 
          color="blue.800" 
          borderRadius="md"
        >
          <Text fontWeight="bold">
            Page {currentPage} of {totalPages} | 
            Showing {displayedArticles.length} of {allArticles.length} articles |
            Articles per page: {ARTICLES_PER_PAGE}
          </Text>
        </Box>
        
        {/* Articles List */}
        <VStack spacing={4} align="stretch" mb={8}>
          {isLoading ? (
            <Text>Loading articles...</Text>
          ) : displayedArticles.length > 0 ? (
            displayedArticles.map((article, index) => (
              <Box 
                key={`${article.id}-${index}-${currentPage}`}
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                shadow="sm"
              >
                <Heading as="h3" size="md" mb={2}>{article.title}</Heading>
                <Text color="gray.500" mb={2}>
                  {new Date(article.publishedAt || article.createdAt || Date.now()).toLocaleDateString()}
                </Text>
                <Text noOfLines={2}>
                  {article.abstract || article.content?.substring(0, 150) || "No content available"}
                </Text>
              </Box>
            ))
          ) : (
            <Text>No articles found.</Text>
          )}
        </VStack>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Flex justify="center" wrap="wrap" gap={2}>
            {/* Previous Button */}
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
              leftIcon={<FiChevronLeft />}
              colorScheme="blue"
              variant="outline"
            >
              Previous
            </Button>
            
            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={`page-button-${page}`}
                onClick={() => handlePageChange(page)}
                colorScheme="blue"
                variant={currentPage === page ? "solid" : "outline"}
              >
                {page}
              </Button>
            ))}
            
            {/* Next Button */}
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              rightIcon={<FiChevronRight />}
              colorScheme="blue"
              variant="outline"
            >
              Next
            </Button>
          </Flex>
        )}
      </Container>
    </Layout>
  );
}
