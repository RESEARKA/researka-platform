import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Text,
  useToast,
  VStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Layout from '../components/Layout';
import { ALL_ARTICLES, Article } from '../data/articles';
import ArticleSkeleton from '../components/ArticleSkeleton';
import PageTransition from '../components/PageTransition';
import { getAllMockArticles } from '../utils/articleUtils';
import { getArticlesByPageNumber, PaginationCursor } from '../utils/cursorPagination';

// Number of articles per page
const ARTICLES_PER_PAGE = 5;

// Image URLs for different categories
const imageUrls: Record<string, string> = {
  'Physics': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa',
  'Chemistry': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6',
  'Biology': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8',
  'Computer Science': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
  'Mathematics': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
  'DEFAULT': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
};

export default function ArticlesPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [renderKey, setRenderKey] = useState(Date.now());
  const toast = useToast();

  // Load articles on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Combine articles from both sources
      const combinedArticles = [...ALL_ARTICLES, ...getAllMockArticles()];
      setAllArticles(combinedArticles);
      setIsLoading(false);
      
      // Log initial load
      console.log('Articles loaded:', combinedArticles.length);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Get unique categories from all articles
  const allCategories = useMemo(() => {
    return Array.from(
      new Set(allArticles.flatMap(article => 
        Array.isArray(article.categories) ? article.categories : [])
      )
    ).sort();
  }, [allArticles]);

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    console.log('Filtering articles...');
    
    // Create a defensive copy
    let result = [...allArticles];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.abstract?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      result = result.filter(article => 
        article.categories?.includes(categoryFilter)
      );
    }
    
    // Apply sorting
    if (sortBy === 'date') {
      result.sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return dateB - dateA; // Newest first
      });
    } else if (sortBy === 'views') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'citations') {
      result.sort((a, b) => (b.citations || 0) - (a.citations || 0));
    }
    
    console.log('Filtered articles:', result.length);
    return result;
  }, [allArticles, searchQuery, categoryFilter, sortBy]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      console.log('Filters changed, resetting to page 1');
      setCurrentPage(1);
    }
  }, [filteredArticles.length]);

  // Get paginated articles using cursor-based pagination
  const paginationResult = useMemo(() => {
    console.log('Getting page', currentPage);
    return getArticlesByPageNumber(filteredArticles, currentPage, ARTICLES_PER_PAGE);
  }, [filteredArticles, currentPage, ARTICLES_PER_PAGE, renderKey]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    console.log(`Changing to page ${newPage}`);
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Update state
    setCurrentPage(newPage);
    setRenderKey(Date.now()); // Force re-render
  };

  return (
    <Layout>
      <PageTransition>
        <Container maxW="container.xl" py={8}>
          <Grid templateColumns={{ base: '1fr', md: '250px 1fr' }} gap={8}>
            {/* Sidebar */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading as="h3" size="md" mb={4}>Search</Heading>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input 
                      placeholder="Search articles..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                </Box>

                <Box>
                  <Heading as="h3" size="md" mb={4}>Categories</Heading>
                  <Select 
                    placeholder="All Categories" 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {allCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Heading as="h3" size="md" mb={4}>Sort By</Heading>
                  <Select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date">Most Recent</option>
                    <option value="views">Most Viewed</option>
                    <option value="citations">Most Cited</option>
                  </Select>
                </Box>
              </VStack>
            </GridItem>

            {/* Main Content */}
            <GridItem>
              <Box mb={6}>
                <Heading as="h1" size="xl" mb={2}>Research Articles</Heading>
                <Text color="gray.600">
                  Discover the latest research articles from our community
                </Text>
              </Box>

              {/* Debug Info */}
              <Box 
                mb={4} 
                p={2} 
                borderRadius="md" 
                bg="blue.50" 
                color="blue.800"
                key={`debug-info-${currentPage}-${renderKey}`}
              >
                <Text fontFamily="monospace" fontSize="sm">
                  <strong>Page {paginationResult.currentPage} of {paginationResult.totalPages}</strong> | 
                  Showing {paginationResult.items.length} of {filteredArticles.length} articles |
                  Articles per page: {ARTICLES_PER_PAGE}
                </Text>
              </Box>

              {/* Articles List */}
              <VStack spacing={4} align="stretch">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: ARTICLES_PER_PAGE }).map((_, idx) => (
                    <ArticleSkeleton key={`skeleton-${idx}`} />
                  ))
                ) : paginationResult.items.length > 0 ? (
                  // Articles from the current page
                  <React.Fragment key={`articles-page-${currentPage}-${renderKey}`}>
                    {paginationResult.items.map((article: Article) => (
                      <Box 
                        key={`article-${article.id}-page-${currentPage}`}
                        as="article"
                        borderWidth="1px"
                        borderRadius="lg"
                        overflow="hidden"
                        p={4}
                        bg="white"
                        shadow="sm"
                        transition="all 0.2s"
                        _hover={{ shadow: "md" }}
                      >
                        <Grid templateColumns={{ base: '1fr', md: '3fr 1fr' }} gap={4}>
                          <GridItem>
                            <Heading as="h2" size="md" mb={2}>
                              {article.title}
                            </Heading>
                            
                            <HStack spacing={2} mb={2}>
                              <Text fontSize="sm" color="gray.500">
                                {new Date(article.publishedAt || article.createdAt || Date.now()).toLocaleDateString()}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                • {article.views || 0} views
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                • {article.citations || 0} citations
                              </Text>
                            </HStack>
                            
                            <Text noOfLines={3} mb={3} color="gray.700">
                              {article.abstract || article.content?.substring(0, 200) || "No abstract available"}
                            </Text>
                            
                            <HStack spacing={2} mt={2}>
                              {article.categories?.map(category => (
                                <Box
                                  key={`${article.id}-${category}`}
                                  px={2}
                                  py={1}
                                  bg="blue.50"
                                  color="blue.800"
                                  fontSize="xs"
                                  fontWeight="medium"
                                  rounded="md"
                                >
                                  {category}
                                </Box>
                              ))}
                            </HStack>
                          </GridItem>
                          
                          <GridItem display={{ base: 'none', md: 'block' }}>
                            <Box position="relative" width="100%" height="100px">
                              <img
                                src={article.imageUrl || imageUrls[article.categories?.[0]] || imageUrls.DEFAULT}
                                alt={article.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '4px'
                                }}
                              />
                            </Box>
                          </GridItem>
                        </Grid>
                      </Box>
                    ))}
                  </React.Fragment>
                ) : (
                  // No articles found
                  <Alert status="info">
                    <AlertIcon />
                    No articles found matching your criteria. Try adjusting your filters.
                  </Alert>
                )}
              </VStack>

              {/* Pagination Controls */}
              {filteredArticles.length > 0 && (
                <Box mt={8} display="flex" flexDirection="column" alignItems="center">
                  {/* Pagination Info */}
                  <Box 
                    className="pagination-info" 
                    mb={4} 
                    p={2} 
                    borderRadius="md" 
                    bg="gray.50" 
                    color="gray.700"
                    key={`pagination-info-${currentPage}-${renderKey}`}
                  >
                    <Text fontSize="sm" fontWeight="medium">
                      Page {paginationResult.currentPage} of {paginationResult.totalPages} | 
                      Showing {paginationResult.items.length} of {filteredArticles.length} articles
                    </Text>
                  </Box>
                  
                  {/* Custom Pagination Component */}
                  <Flex className="pagination" justifyContent="center" alignItems="center" wrap="wrap" gap={2}>
                    {/* Previous Button */}
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      isDisabled={!paginationResult.hasPreviousPage}
                      variant="outline"
                      colorScheme="blue"
                      size="md"
                      leftIcon={<FiChevronLeft />}
                    >
                      Prev
                    </Button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: paginationResult.totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={`page-${page}-${renderKey}`}
                        onClick={() => handlePageChange(page)}
                        variant={paginationResult.currentPage === page ? "solid" : "outline"}
                        colorScheme="blue"
                        size="md"
                      >
                        {page}
                      </Button>
                    ))}
                    
                    {/* Next Button */}
                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      isDisabled={!paginationResult.hasNextPage}
                      variant="outline"
                      colorScheme="blue"
                      size="md"
                      rightIcon={<FiChevronRight />}
                    >
                      Next
                    </Button>
                  </Flex>
                </Box>
              )}
            </GridItem>
          </Grid>
        </Container>
      </PageTransition>
    </Layout>
  );
}
