import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Button, Spinner, Flex, Text, Heading, Grid, useToast, Select, Input, InputGroup, InputLeftElement, VStack, Image, Link, HStack } from '@chakra-ui/react';
import { FiSearch, FiRefreshCw, FiShuffle } from 'react-icons/fi';
import NextLink from 'next/link';
import Layout from '../components/Layout';
import PageTransition from '../components/PageTransition';
import ArticleSkeleton from '../components/ArticleSkeleton';
import SimplePagination from '../components/SimplePagination';
import { fetchPaginatedArticles } from '../services/articleService';
import { Router, useRouter } from 'next/router';
import { Article } from '../types/article';

const ARTICLES_PER_PAGE = 5;

export default function ArticlesPage() {
  // Use a ref to track if component is mounted (to prevent hydration issues)
  const [isMounted, setIsMounted] = useState(false);
  
  // State
  const [articles, setArticles] = useState<Article[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [renderCount, setRenderCount] = useState(0); // For debugging re-renders
  
  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Router and toast
  const router = useRouter();
  const toast = useToast();

  // Setup client-side detection to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Clear search terms
  const refreshArticles = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
    setLastVisible(null);
    loadArticles(1);
  };

  // Load random articles
  const handleRandomArticles = () => {
    // For now, just refresh and let the server return whatever comes first
    refreshArticles();
    toast({
      title: 'Random Articles',
      description: 'Showing a random selection of articles',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Load articles using the new standardized function
  const loadArticles = useCallback(async (page: number = 1) => {
    // Prevent loading if already loading
    if (isLoading) {
      console.log('Skip loading as already in progress');
      return;
    }
    
    console.log(`Loading articles for page ${page}, category: ${categoryFilter}, sort: ${sortBy}`);
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert sort option to Firestore field and direction
      const sortField = sortBy === 'newest' || sortBy === 'oldest' ? 'createdAt' : 'views';
      const sortDirection = sortBy === 'oldest' ? 'asc' : 'desc';
      
      // Only pass lastVisible if we're not on the first page
      const startAfterDoc = page > 1 ? lastVisible : null;

      console.log('Fetching articles with params:', {
        category: categoryFilter,
        lastVisible: startAfterDoc ? 'exists' : 'null',
        pageSize: ARTICLES_PER_PAGE,
        sortField,
        sortDirection,
        searchQuery
      });
      
      const result = await fetchPaginatedArticles(
        categoryFilter,
        startAfterDoc,
        ARTICLES_PER_PAGE,
        sortField,
        sortDirection,
        searchQuery
      );
      
      console.log(`Loaded ${result.articles.length} articles, hasMore: ${result.hasMore}`);
      
      // Add this check to see if component is still mounted before setting state
      if (isMounted) {
        if (page === 1) {
          // Replace articles
          setArticles(result.articles);
        } else {
          // Append to existing articles
          setArticles(prev => [...prev, ...result.articles]);
        }
        
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
        
        // Estimate total pages
        if (page === 1 && !result.hasMore) {
          setTotalPages(1);
        } else if (page === 1 && result.hasMore) {
          // If we have more, but don't know how many, set to a reasonable number
          setTotalPages(10); 
        } else if (page > 1 && !result.hasMore) {
          setTotalPages(page);
        }
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      if (isMounted) {
        setArticles([]);
        setError('Failed to load articles. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load articles',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      // Always set loading to false, but only if component is still mounted
      if (isMounted) {
        setIsLoading(false);
      }
    }
  }, [categoryFilter, searchQuery, sortBy, lastVisible, isLoading, toast, isMounted]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (newPage > totalPages && !hasMore)) return;
    
    setCurrentPage(newPage);
    loadArticles(newPage);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle category filter change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategoryFilter(newCategory);
    setCurrentPage(1);
    setLastVisible(null);
  };
  
  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setLastVisible(null);
    loadArticles(1);
  };
  
  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
    setLastVisible(null);
  };
  
  // Load initial articles - use a ref to prevent multiple loads
  const initialLoadDone = React.useRef(false);
  
  // Debugging re-renders
  useEffect(() => {
    setRenderCount(prevCount => prevCount + 1);
    console.log(`ArticlesPage rendered ${renderCount + 1} times`);
  }, [renderCount]);
  
  // Detailed state logging for debugging
  useEffect(() => {
    console.log('ArticlesPage state:', {
      isMounted,
      isLoading,
      currentPage,
      articleCount: articles.length,
      hasError: !!error,
      hasMore,
      categoryFilter,
      sortBy,
      searchQuery
    });
  }, [isMounted, isLoading, currentPage, articles.length, error, hasMore, categoryFilter, sortBy, searchQuery]);
  
  // Initial load effect - runs only once
  useEffect(() => {
    if (isMounted && !initialLoadDone.current) {
      console.log('Initial articles load triggered');
      initialLoadDone.current = true;
      loadArticles(1);
    }
    // Only depend on isMounted and loadArticles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);
  
  // Effect for filter/sort changes - separated from initial load
  useEffect(() => {
    if (isMounted && initialLoadDone.current) {
      console.log('Filter/sort change detected - resetting pagination and reloading');
      setCurrentPage(1);
      setLastVisible(null);
      loadArticles(1);
    }
    // Explicitly listing dependencies that should trigger a reload
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, sortBy, isMounted]);
  
  // Effect for search query - debounced
  useEffect(() => {
    if (!isMounted || !initialLoadDone.current) return;
    
    console.log(`Search query changed to "${searchQuery}" - debouncing...`);
    const timer = setTimeout(() => {
      if (searchQuery) {
        console.log('Search debounce complete - reloading with search query');
        setCurrentPage(1);
        setLastVisible(null);
        loadArticles(1);
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isMounted]);
  
  return (
    <Layout 
      title="Articles | Researka" 
      description="Browse and search for academic articles on Researka" 
      activePage="articles"
    >
      <PageTransition>
        <Box 
          maxW="6xl" 
          mx="auto" 
          px={{ base: 4, md: 8 }}
          py={8}
        >
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between"
            align={{ base: 'stretch', md: 'center' }}
            mb={6}
          >
            <Heading as="h1" size="xl" mb={{ base: 4, md: 0 }}>
              Articles
            </Heading>
            
            {/* Only render interactive elements after client-side hydration */}
            {isMounted && (
              <HStack spacing={2}>
                <Button 
                  leftIcon={<FiRefreshCw />} 
                  variant="outline"
                  onClick={refreshArticles}
                  isLoading={isLoading}
                  size="sm"
                >
                  Refresh
                </Button>
                
                <Button
                  leftIcon={<FiShuffle />}
                  variant="outline"
                  onClick={handleRandomArticles}
                  isLoading={isLoading}
                  size="sm"
                >
                  Random
                </Button>
              </HStack>
            )}
          </Flex>
          
          <Box mb={8}>
            <Grid 
              templateColumns={{ base: '1fr', md: '2fr 1fr 1fr' }}
              gap={4}
              mb={6}
            >
              {/* Only render interactive elements after client-side hydration */}
              {isMounted ? (
                <>
                  <form onSubmit={handleSearchSubmit}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FiSearch color="gray.300" />
                      </InputLeftElement>
                      <Input 
                        placeholder="Search by title, abstract, or category" 
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </InputGroup>
                  </form>
                  
                  <Select 
                    value={categoryFilter}
                    onChange={handleCategoryChange}
                  >
                    <option value="all">All Categories</option>
                    <option value="biology">Biology</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="physics">Physics</option>
                    <option value="medicine">Medicine</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="psychology">Psychology</option>
                    <option value="economics">Economics</option>
                  </Select>
                  
                  <Select 
                    value={sortBy}
                    onChange={handleSortChange}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="views">Most Views</option>
                  </Select>
                </>
              ) : (
                <>
                  {/* Static placeholders for SSR */}
                  <Box height="40px" width="100%" bg="gray.100" borderRadius="md"></Box>
                  <Box height="40px" width="100%" bg="gray.100" borderRadius="md"></Box>
                  <Box height="40px" width="100%" bg="gray.100" borderRadius="md"></Box>
                </>
              )}
            </Grid>
          </Box>
          
          {/* Loading state */}
          {isLoading && (
            <Flex justify="center" py={10}>
              <Spinner size="xl" />
            </Flex>
          )}
          
          {/* Error state */}
          {!isLoading && error && (
            <Box 
              p={6} 
              borderWidth="1px" 
              borderRadius="lg" 
              bg="red.50" 
              borderColor="red.200"
            >
              <Text color="red.500">{error}</Text>
              <Button 
                mt={4} 
                colorScheme="red" 
                size="sm" 
                onClick={() => loadArticles(currentPage)}
              >
                Retry
              </Button>
            </Box>
          )}
          
          {/* Empty state */}
          {!isLoading && !error && articles.length === 0 && (
            <Box 
              p={6} 
              borderWidth="1px" 
              borderRadius="lg" 
              textAlign="center"
            >
              <Text fontSize="lg" mb={4}>No articles found</Text>
              <Text mb={4} color="gray.500">
                Try changing your search criteria or check back later.
              </Text>
              <Button 
                colorScheme="blue" 
                onClick={refreshArticles}
              >
                Clear Filters
              </Button>
            </Box>
          )}
          
          {/* Articles list */}
          {!isLoading && !error && articles.length > 0 && (
            <>
              <VStack spacing={6} align="stretch">
                {articles.map((article) => (
                  <Box
                    key={article.id}
                    p={6}
                    borderWidth="1px"
                    borderRadius="lg"
                    bg="white"
                    boxShadow="sm"
                    transition="all 0.2s"
                    _hover={{
                      boxShadow: 'md',
                      transform: 'translateY(-2px)'
                    }}
                  >
                    <Heading
                      as="h2"
                      size="lg"
                      mb={2}
                      cursor="pointer"
                      onClick={() => router.push(`/article/${article.id}`)}
                      _hover={{ color: 'blue.500' }}
                    >
                      {article.title}
                    </Heading>

                    <Flex
                      mb={3}
                      color="gray.600"
                      fontSize="sm"
                      align="center"
                      flexWrap="wrap"
                      gap={2}
                    >
                      <Text>
                        {new Date(article.date || article.createdAt?.toDate() || new Date()).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Text>
                      
                      {article.views !== undefined && (
                        <>
                          <Text mx={2}>•</Text>
                          <Text>{article.views} views</Text>
                        </>
                      )}
                    </Flex>

                    <Text
                      noOfLines={3}
                      mb={4}
                      color="gray.600"
                    >
                      {article.abstract || 'No description available'}
                    </Text>

                    {article.category && (
                      <HStack spacing={2} mb={4}>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          variant="outline"
                          borderRadius="full"
                          onClick={() => setCategoryFilter(typeof article.category === 'string' ? article.category : 'all')}
                        >
                          {typeof article.category === 'string' ? article.category : 
                           Array.isArray(article.category) ? article.category[0] : 'Unknown'}
                        </Button>
                      </HStack>
                    )}

                    <Button
                      colorScheme="blue"
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/article/${article.id}`)}
                    >
                      Read Article
                    </Button>
                  </Box>
                ))}
              </VStack>
              
              {/* Pagination */}
              {isMounted && (
                <Box mt={8} display="flex" justifyContent="center">
                  <SimplePagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    hasNextPage={hasMore}
                    hasPrevPage={currentPage > 1}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </PageTransition>
    </Layout>
  );
}
