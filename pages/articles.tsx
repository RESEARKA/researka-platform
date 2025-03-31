import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Grid, 
  GridItem, 
  VStack, 
  HStack, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  Select, 
  Button, 
  useColorModeValue, 
  useToast, 
  Tag,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import { 
  FiSearch, FiCalendar, FiEye, FiRefreshCw, FiShuffle 
} from 'react-icons/fi';
import Layout from '../components/Layout';
import ArticleSkeleton from '../components/ArticleSkeleton';
import PageTransition from '../components/PageTransition';
import SimplePagination from '../components/SimplePagination';
import { PageArticle, convertToPageArticles } from '../utils/articleAdapterV2';
import { useRouter } from 'next/router';
import { isClientSide } from '../utils/imageOptimizer';

export default function ArticlesPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showRandom, setShowRandom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState<PageArticle[]>([]);
  // We need this error state for catching errors, even if not referenced directly in JSX
  const [, setError] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();
  const itemsPerPage = 9;

  // Load articles from Firebase
  useEffect(() => {
    const loadArticles = async () => {
      if (!isClientSide()) {
        console.log('Article load skipped: Not on client side.');
        setIsLoading(false); 
        return; 
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('⏳ Starting to load articles from Firebase...');
        
        const { getAllArticles } = await import('../services/articleServiceV2');
        
        try {
          const { isFirebaseInitialized } = await import('../config/firebase');
          console.log(`🔥 Firebase initialized: ${isFirebaseInitialized()}`);
          
          const firebaseArticles = await getAllArticles();
          console.log(`✅ Articles loaded from Firebase (${firebaseArticles.length}):`);
          
          if (firebaseArticles.length === 0) {
            console.warn('⚠️ No articles returned from getAllArticles');
          } else {
            firebaseArticles.forEach(article => {
              console.log(`📄 Article: ${article.id} - "${article.title}" by ${article.author} - Reviews: ${article.reviewCount}`);
            });
          }
          
          const convertedArticles = convertToPageArticles(firebaseArticles);
          console.log(`🔄 Converted ${convertedArticles.length} articles for display`);
          setArticles(convertedArticles);
        } catch (error) {
          console.error('❌ Error in article loading:', error);
          setError('Failed to load articles: ' + (error instanceof Error ? error.message : String(error)));
          toast({
            title: 'Error',
            description: 'Failed to load articles. See console for details.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          if (isClientSide()) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ Error loading articles from Firebase:', error);
        setError('Failed to load articles');
        toast({
          title: 'Error',
          description: 'Failed to load articles',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        if (isClientSide()) {
          setIsLoading(false);
        }
      }
    };
    
    loadArticles();
  }, [toast]);

  // Function to refresh articles
  const refreshArticles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { getAllArticles } = await import('../services/articleServiceV2');
      
      try {
        const firebaseArticles = await getAllArticles();
        console.log(`Articles loaded from Firebase (${firebaseArticles.length}):`);
        
        if (firebaseArticles.length === 0) {
          console.warn('⚠️ No articles returned from getAllArticles');
        } else {
          firebaseArticles.forEach(article => {
            console.log(`Article: ${article.id} - "${article.title}" by ${article.author}`);
          });
        }
        
        const convertedArticles = convertToPageArticles(firebaseArticles);
        console.log(`Converted ${convertedArticles.length} articles for display`);
        setArticles(convertedArticles);
        
        toast({
          title: 'Refreshed',
          description: `Loaded ${firebaseArticles.length} articles`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error in article loading:', error);
        setError('Failed to load articles: ' + (error instanceof Error ? error.message : String(error)));
        toast({
          title: 'Error',
          description: 'Failed to load articles. See console for details.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error refreshing articles from Firebase:', error);
      setError('Failed to load articles');
      toast({
        title: 'Error',
        description: 'Failed to refresh articles',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort articles
  const filteredSortedArticles = useMemo(() => {
    console.log('Filtering and sorting articles');
    
    let result = [...articles];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(article => 
        article.title?.toLowerCase().includes(query) || 
        article.abstract?.toLowerCase().includes(query) ||
        article.category?.toLowerCase().includes(query)
      );
    }
    
    if (categoryFilter !== 'all') {
      result = result.filter(article => 
        article.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    if (showRandom) {
      result = [...result].sort(() => Math.random() - 0.5);
    }
    
    console.log(`Found ${result.length} articles after filtering`);
    return result;
  }, [searchQuery, categoryFilter, sortBy, showRandom, articles]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredSortedArticles.length / itemsPerPage);
  }, [filteredSortedArticles.length, itemsPerPage]);

  // Calculate displayed articles based on current page
  const displayedArticles = useMemo(() => {
    console.log('Calculating displayed articles');
    console.log(`Current page: ${currentPage}, Total pages: ${totalPages}`);
    
    if (filteredSortedArticles.length === 0) {
      console.log('No articles to display');
      return [];
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    console.log(`Start index: ${startIndex}, End index: ${endIndex}`);
    
    const paginatedArticles = filteredSortedArticles.slice(startIndex, endIndex);
    
    console.log(`Displaying ${paginatedArticles.length} articles`);
    
    return paginatedArticles;
  }, [filteredSortedArticles, currentPage, itemsPerPage, totalPages]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    console.log(`Changing to page ${newPage} (total pages: ${totalPages})`);
    
    if (newPage < 1) {
      console.log('Invalid page: less than 1');
      return;
    }
    
    if (newPage > totalPages) {
      console.log('Invalid page: greater than total pages');
      return;
    }
    
    setCurrentPage(newPage);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log(`Page changed to ${newPage}`);
  }, [totalPages]);

  // Ensure current page is valid (between 1 and totalPages)
  useEffect(() => {
    if (filteredSortedArticles.length === 0) {
      if (currentPage !== 1) {
        console.log('No articles, resetting to page 1');
        setCurrentPage(1);
      }
      return;
    }
    
    if (currentPage > totalPages) {
      console.log(`Current page (${currentPage}) is greater than total pages (${totalPages}), resetting to page 1`);
      setCurrentPage(1);
    }
  }, [filteredSortedArticles.length, totalPages, currentPage]);

  // Add a separate effect to log the current page whenever it changes
  useEffect(() => {
    console.log(`Current page is now: ${currentPage}`);
  }, [currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      console.log('Filters changed, resetting to page 1');
      setCurrentPage(1);
    }
  }, [searchQuery, categoryFilter, sortBy, showRandom]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle category filter change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  // Toggle random display
  const toggleRandom = () => {
    setShowRandom(!showRandom);
    
    if (!showRandom) {
      toast({
        title: "Random mode enabled",
        description: "Articles are now displayed in random order",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Get unique categories from all articles
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    articles.forEach(article => {
      article.category && categories.add(article.category.toLowerCase());
    });
    return Array.from(categories).sort();
  }, [articles]);

  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Layout title="Articles | Researka">
      <PageTransition>
        <Box maxW="1400px" mx="auto" px={4} py={8}>
          <Heading as="h1" size="2xl" mb={8} textAlign="center">
            Articles
          </Heading>
          
          <Grid templateColumns={{ base: "1fr", md: "250px 1fr" }} gap={8}>
            {/* Sidebar / Filters */}
            <GridItem>
              <VStack align="stretch" spacing={6} position="sticky" top="100px">
                <Box p={4} bg={bgColor} borderRadius="md" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
                  <Heading as="h3" size="md" mb={4}>Search</Heading>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FiSearch color="gray.300" />
                    </InputLeftElement>
                    <Input 
                      placeholder="Search articles..." 
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </InputGroup>
                </Box>
                
                <Box p={4} bg={bgColor} borderRadius="md" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
                  <Heading as="h3" size="md" mb={4}>Categories</Heading>
                  <Select value={categoryFilter} onChange={handleCategoryChange}>
                    <option value="all">All Categories</option>
                    {allCategories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </Select>
                </Box>
                
                <Box p={4} bg={bgColor} borderRadius="md" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
                  <Heading as="h3" size="md" mb={4}>Sort By</Heading>
                  <Select value={sortBy} onChange={handleSortChange}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="alphabetical">Alphabetical</option>
                  </Select>
                </Box>
                
                <Button 
                  leftIcon={<FiRefreshCw />} 
                  size="sm" 
                  colorScheme="blue" 
                  variant="ghost"
                  isLoading={isLoading}
                  onClick={refreshArticles}
                  aria-label="Refresh articles"
                >
                  Refresh
                </Button>
                
                <Button 
                  leftIcon={showRandom ? <FiRefreshCw /> : <FiShuffle />} 
                  colorScheme={showRandom ? "purple" : "gray"}
                  onClick={toggleRandom}
                  size="md"
                  width="full"
                >
                  {showRandom ? "Randomizing" : "Randomize Order"}
                </Button>
              </VStack>
            </GridItem>
            
            {/* Main Content / Articles */}
            <GridItem>
              {/* Pagination Debug Info (Top) */}
              <Box 
                mb={4} 
                p={2} 
                borderRadius="md" 
                bg="blue.50" 
                color="blue.800"
              >
                <Text fontFamily="monospace" fontSize="sm">
                  <strong>Current Page: {currentPage}</strong> | Total Pages: {totalPages} | 
                  Articles: {filteredSortedArticles.length} | 
                  Displayed: {displayedArticles.length}
                </Text>
              </Box>
              
              {/* Articles List */}
              <VStack align="stretch" spacing={6}>
                {isLoading ? (
                  Array.from({ length: itemsPerPage }).map((_, i) => (
                    <ArticleSkeleton key={i} />
                  ))
                ) : filteredSortedArticles.length === 0 ? (
                  <Box 
                    p={8} 
                    textAlign="center" 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    borderColor={borderColor}
                  >
                    <Heading as="h3" size="md" mb={2}>No Articles Found</Heading>
                    <Text color={mutedColor}>
                      Try adjusting your search or filters to find what you're looking for.
                    </Text>
                    <Button 
                      mt={4} 
                      onClick={() => {
                        setSearchQuery('');
                        setCategoryFilter('all');
                        setSortBy('newest');
                        setShowRandom(false);
                      }}
                    >
                      Reset Filters
                    </Button>
                  </Box>
                ) : (
                  displayedArticles.map(article => (
                    <Box 
                      key={article.id} 
                      p={{ base: 4, md: 6 }}
                      borderWidth="1px" 
                      borderRadius="lg" 
                      boxShadow="sm"
                      bg={bgColor}
                      transition="all 0.2s"
                      _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                    >
                      <Grid templateColumns={{ base: "1fr", md: "200px 1fr" }} gap={5}>
                        <Box>
                          {/* Optional Image Placeholder - Remove or replace if PageArticle lacks image */}
                          {/* {article.imageUrl && (
                            <img
                              src={article.imageUrl} 
                              alt={article.title} 
                              style={{ 
                                borderRadius: "8px", 
                                width: "100%", 
                                height: "150px", 
                                objectFit: "cover" 
                              }}
                            />
                          )} */}
                        </Box>
                        <Box>
                          <Heading as="h2" size="md" mb={2}>
                            {article.title}
                          </Heading>
                          
                          <HStack spacing={4} mb={3}>
                            <HStack color={mutedColor} fontSize="sm">
                              <FiCalendar />
                              <Text>{article.date}</Text>
                            </HStack>
                            <HStack color={mutedColor} fontSize="sm">
                              <FiEye />
                              <Text>{article.views} views</Text>
                            </HStack>
                          </HStack>
                          
                          <Text color={textColor} noOfLines={3} mb={3}>
                            {article.abstract}
                          </Text>
                          
                          <Wrap spacing={2} mb={2}>
                            {article.category && (
                              <WrapItem key={article.category}>
                                <Tag 
                                  size="sm" 
                                  colorScheme="blue" 
                                  borderRadius="full"
                                  cursor="pointer"
                                  onClick={() => setCategoryFilter(article.category.toLowerCase())}
                                >
                                  {article.category}
                                </Tag>
                              </WrapItem>
                            )}
                          </Wrap>
                          
                          <Button 
                            size="sm" 
                            colorScheme="blue" 
                            variant="outline"
                            mt={2}
                            onClick={() => router.push(`/articles/${article.id}`)}
                          >
                            Read More
                          </Button>
                        </Box>
                      </Grid>
                    </Box>
                  ))
                )}
              </VStack>
              
              {/* Pagination Controls */}
              {filteredSortedArticles.length > 0 && (
                <Box mt={8} display="flex" flexDirection="column" alignItems="center">
                  {/* Pagination Debug Info */}
                  <Box 
                    className="pagination-debug" 
                    mb={4} 
                    p={2} 
                    borderRadius="md" 
                    bg="gray.50" 
                    color="gray.700"
                  >
                    <Text fontSize="sm" fontWeight="medium">
                      Page {currentPage} of {totalPages} | 
                      Showing {displayedArticles.length} of {filteredSortedArticles.length} articles
                    </Text>
                  </Box>
                  
                  {/* Simple Pagination Component */}
                  <SimplePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </Box>
              )}
            </GridItem>
          </Grid>
        </Box>
      </PageTransition>
    </Layout>
  );
}
