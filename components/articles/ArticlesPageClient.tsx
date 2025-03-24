import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Button, Center, Container, Flex, Grid, GridItem, Heading, HStack, Icon, Input, InputGroup, InputLeftElement, Select, Skeleton, Spinner, Text, useToast, VStack } from '@chakra-ui/react';
import { FiFilter, FiRefreshCw, FiSearch } from 'react-icons/fi';
import Head from 'next/head';
import SimplePagination from '../SimplePagination';
import { fetchPaginatedArticles } from '../../services/articleService';
import { useRouter } from 'next/router';
import { Article } from '../../types/article';

const ARTICLES_PER_PAGE = 5;

export default function ArticlesPageClient() {
  // Use a ref to track if component is mounted (to prevent hydration issues)
  const isMountedRef = useRef(false);
  
  // State
  const [articles, setArticles] = useState<Article[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Layout
  const router = useRouter();
  const toast = useToast();
  
  // Set mounted ref
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Handle search input
  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
    setLastVisible(null);
  };
  
  // Handle category change
  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(event.target.value);
    setCurrentPage(1);
    setLastVisible(null);
  };
  
  // Debug log array to capture console output
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // Override console.log to capture output for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      
      console.log = (...args) => {
        originalConsoleLog(...args);
        const logString = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        setDebugLogs(prev => [...prev.slice(-50), `LOG: ${logString}`]);
      };
      
      console.error = (...args) => {
        originalConsoleError(...args);
        const logString = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        setDebugLogs(prev => [...prev.slice(-50), `ERROR: ${logString}`]);
      };
      
      console.warn = (...args) => {
        originalConsoleWarn(...args);
        const logString = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        setDebugLogs(prev => [...prev.slice(-50), `WARN: ${logString}`]);
      };
      
      return () => {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
      };
    }
  }, []);

  const resetFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
    setLastVisible(null);
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
      if (isMountedRef.current) {
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
      if (isMountedRef.current) {
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
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [categoryFilter, searchQuery, sortBy, lastVisible, isLoading, toast]);

  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage) return;
    
    // Update current page
    setCurrentPage(newPage);
    
    // Load articles for the new page
    if (newPage > currentPage) {
      // Next page - pass last visible
      loadArticles(newPage);
    } else {
      // Previous page - reset and load from beginning
      setLastVisible(null);
      loadArticles(1);
    }
  };
  
  // Refresh articles (reset all filters and reload)
  const refreshArticles = () => {
    setCategoryFilter('all');
    setSortBy('newest');
    setSearchQuery('');
    setCurrentPage(1);
    setLastVisible(null);
  };
  
  // Load initial articles - use a ref to prevent multiple loads
  const initialLoadDone = useRef(false);
  
  // Detailed state logging for debugging  
  useEffect(() => {
    console.log('ArticlesPage state:', {
      isLoading,
      currentPage,
      articleCount: articles.length,
      hasError: !!error,
      hasMore,
      categoryFilter,
      sortBy,
      searchQuery
    });
  }, [isLoading, currentPage, articles.length, error, hasMore, categoryFilter, sortBy, searchQuery]);
  
  // Initial load effect - runs only once
  useEffect(() => {
    if (!initialLoadDone.current) {
      console.log('Initial articles load triggered');
      initialLoadDone.current = true;
      loadArticles(1);
    }
  }, [loadArticles]);
  
  // Effect for filter/sort changes - separated from initial load
  useEffect(() => {
    if (initialLoadDone.current) {
      console.log('Filter/sort change detected - resetting pagination and reloading');
      setCurrentPage(1);
      setLastVisible(null);
      loadArticles(1);
    }
  }, [categoryFilter, sortBy, loadArticles]);
  
  // Effect for search query - debounced
  useEffect(() => {
    if (!initialLoadDone.current) return;
    
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
  }, [searchQuery, loadArticles]);
  
  return (
    <Box as="main" px={4} py={6} maxW="container.xl" mx="auto">
      <Box mb={10}>
        <Heading as="h1" size="xl" mb={4}>
          Research Articles
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Discover scientific articles shared by researchers worldwide.
        </Text>
      </Box>
      
      {/* Filters and search */}
      <Grid 
        templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "2fr 1fr 1fr" }}
        gap={4}
        mb={8}
        bg="white"
        p={4}
        borderRadius="md"
        boxShadow="sm"
      >
        {/* Search */}
        <GridItem>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input 
              placeholder="Search articles..."
              value={searchQuery}
              onChange={handleSearchInput}
            />
          </InputGroup>
        </GridItem>
        
        {/* Category filter */}
        <GridItem>
          <Flex align="center">
            <Icon as={FiFilter} mr={2} color="gray.500" />
            <Select 
              value={categoryFilter}
              onChange={handleCategoryChange}
            >
              <option value="all">All Categories</option>
              <option value="biology">Biology</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="medicine">Medicine</option>
              <option value="astronomy">Astronomy</option>
              <option value="computer science">Computer Science</option>
              <option value="mathematics">Mathematics</option>
              <option value="environmental science">Environmental Science</option>
              <option value="psychology">Psychology</option>
              <option value="social science">Social Science</option>
              <option value="engineering">Engineering</option>
              <option value="economics">Economics</option>
              <option value="other">Other</option>
            </Select>
          </Flex>
        </GridItem>
        
        {/* Sort filter */}
        <GridItem>
          <Flex align="center">
            <Box mr={2} color="gray.500" fontSize="sm">Sort by:</Box>
            <Select 
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Viewed</option>
            </Select>
          </Flex>
        </GridItem>
      </Grid>
      
      {/* Refresh button */}
      <Flex justify="flex-end" mb={4}>
        <Button
          leftIcon={<Icon as={FiRefreshCw} />}
          colorScheme="blue"
          variant="outline"
          size="sm"
          onClick={resetFilters}
        >
          Reset Filters
        </Button>
      </Flex>
      
      {/* Articles display */}
      <Box
        bg="white"
        p={6}
        borderRadius="md"
        boxShadow="sm"
        minH="500px"
      >
        {/* Loading skeleton */}
        {isLoading && (
          <VStack spacing={6} align="stretch">
            {[...Array(3)].map((_, i) => (
              <Box key={i} p={6} borderWidth="1px" borderRadius="lg">
                <Skeleton height="30px" width="70%" mb={4} />
                <Skeleton height="15px" width="40%" mb={2} />
                <Skeleton height="15px" width="30%" mb={4} />
                <Skeleton height="100px" mb={4} />
                <Skeleton height="30px" width="120px" />
              </Box>
            ))}
          </VStack>
        )}
        
        {/* Error state */}
        {!isLoading && error && (
          <Center p={10}>
            <VStack spacing={4}>
              <Heading size="md">Error Loading Articles</Heading>
              <Text>{error}</Text>
              <Button
                colorScheme="blue" 
                onClick={resetFilters}
              >
                Clear Filters
              </Button>
            </VStack>
          </Center>
        )}
        
        {/* No articles found */}
        {!isLoading && !error && articles.length === 0 && (
          <Center p={10}>
            <VStack spacing={4}>
              <Heading size="md">No articles found</Heading>
              <Text>Try changing your filters or search query.</Text>
              <Button
                leftIcon={<Icon as={FiRefreshCw} />}
                colorScheme="blue"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </VStack>
          </Center>
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
            {articles.length > 0 && (
              <Box mt={8}>
                <SimplePagination 
                  currentPage={currentPage}
                  totalPages={hasMore ? totalPages : currentPage}
                  onPageChange={handlePageChange}
                  hasNextPage={hasMore}
                />
              </Box>
            )}
          </>
        )}
        
        {/* Debug console - only visible in development */}
        {process.env.NODE_ENV !== 'production' && (
          <Box 
            mt={10} 
            p={4} 
            bg="gray.800" 
            color="white" 
            borderRadius="md" 
            overflowY="auto" 
            maxH="400px"
            fontSize="xs"
            fontFamily="monospace"
          >
            <Heading size="sm" mb={2} color="gray.300">Debug Console</Heading>
            <Button 
              size="xs" 
              mb={2} 
              onClick={() => setDebugLogs([])}
              colorScheme="red"
            >
              Clear Logs
            </Button>
            {debugLogs.map((log, i) => (
              <Box 
                key={i} 
                p={1} 
                whiteSpace="pre-wrap" 
                borderBottom="1px solid" 
                borderColor="gray.700"
                color={
                  log.startsWith('ERROR') ? 'red.300' : 
                  log.startsWith('WARN') ? 'yellow.300' : 'green.300'
                }
              >
                {log}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
