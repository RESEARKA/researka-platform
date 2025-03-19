import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  Flex,
  Image,
  VStack,
  HStack,
  Tag,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Select,
  LinkBox,
  useColorModeValue,
  Badge,
  useToast
} from '@chakra-ui/react';
import { FiSearch, FiCalendar, FiEye, FiRefreshCw } from 'react-icons/fi';
import Layout from '../components/Layout';
import { ALL_ARTICLES, Article } from '../data/articles';
import ArticleSkeleton from '../components/ArticleSkeleton';
import PageTransition from '../components/PageTransition';
import Pagination from '../components/Pagination';
import { getAllMockArticles, getRandomArticles, paginateArticles, getTotalPages } from '../utils/articleUtils';

const ARTICLES_PER_PAGE = 10;

const ArticlesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showRandom, setShowRandom] = useState(true);
  const toast = useToast();
  
  // Image URLs for different article categories
  const imageUrls: Record<string, string> = {
    BIOLOGY: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    PHYSICS: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    'COMPUTER SCIENCE': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    MATHEMATICS: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    DEFAULT: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80'
  };
  
  // Combine all articles from both sources
  const combinedArticles = [...ALL_ARTICLES, ...getAllMockArticles()];
  
  // Get unique categories from all articles
  const allCategories = Array.from(
    new Set(combinedArticles.flatMap(article => 
      Array.isArray(article.categories) ? article.categories : [])
    )
  ).sort();
  
  // Load articles on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showRandom) {
        // Show random articles on initial load
        setArticles(getRandomArticles(combinedArticles, ARTICLES_PER_PAGE));
      } else {
        // Show all articles sorted by date
        setArticles(combinedArticles);
      }
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [showRandom]);
  
  // Handle showing random articles
  const handleShowRandomArticles = () => {
    setIsLoading(true);
    setShowRandom(true);
    setCurrentPage(1);
    
    toast({
      title: "Showing random articles",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Handle showing all articles
  const handleShowAllArticles = () => {
    setIsLoading(true);
    setShowRandom(false);
    setCurrentPage(1);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Filter and sort articles
  const filteredArticles = articles.filter(article => {
    // Filter by search query
    const matchesSearch = 
      searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.authors && article.authors.some(author => 
        author.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    // Filter by category
    const matchesCategory = 
      categoryFilter === '' || 
      (Array.isArray(article.categories) && article.categories.some(category => 
        category.toLowerCase().includes(categoryFilter.toLowerCase())
      ));
    
    return matchesSearch && matchesCategory;
  });
  
  // Sort articles
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'views') {
      return (b.views || 0) - (a.views || 0);
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });
  
  // Paginate articles if not showing random
  const displayedArticles = showRandom 
    ? sortedArticles 
    : paginateArticles(sortedArticles, currentPage, ARTICLES_PER_PAGE);
  
  // Calculate total pages
  const totalPages = getTotalPages(sortedArticles.length, ARTICLES_PER_PAGE);
  
  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const randomBadgeBg = useColorModeValue('purple.100', 'purple.800');
  const randomBadgeColor = useColorModeValue('purple.800', 'purple.100');
  
  return (
    <Layout title="Articles | Researka" description="Browse academic articles on Researka" activePage="articles">
      <PageTransition>
        <Container maxW="container.xl" py={8}>
          <Heading as="h1" size="xl" mb={6} color={headingColor}>
            Research Articles
          </Heading>
          
          <Grid templateColumns={{ base: "1fr", md: "250px 1fr" }} gap={8}>
            {/* Filters sidebar */}
            <GridItem>
              <VStack spacing={6} align="stretch" position="sticky" top="100px">
                <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={cardBg} borderColor={cardBorder}>
                  <Heading as="h3" size="md" mb={4} color={headingColor}>
                    Search
                  </Heading>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FiSearch color="gray.300" />
                    </InputLeftElement>
                    <Input 
                      placeholder="Search articles..." 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Reset to first page on search
                      }}
                      bg={useColorModeValue('white', 'gray.700')}
                      borderColor={useColorModeValue('gray.300', 'gray.600')}
                    />
                  </InputGroup>
                </Box>
                
                <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={cardBg} borderColor={cardBorder}>
                  <Heading as="h3" size="md" mb={4} color={headingColor}>
                    Filter by Category
                  </Heading>
                  <Select 
                    placeholder="All Categories" 
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setCurrentPage(1); // Reset to first page on filter change
                    }}
                    bg={useColorModeValue('white', 'gray.700')}
                    borderColor={useColorModeValue('gray.300', 'gray.600')}
                  >
                    {allCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </Box>
                
                <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={cardBg} borderColor={cardBorder}>
                  <Heading as="h3" size="md" mb={4} color={headingColor}>
                    Sort By
                  </Heading>
                  <Select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    bg={useColorModeValue('white', 'gray.700')}
                    borderColor={useColorModeValue('gray.300', 'gray.600')}
                  >
                    <option value="date">Most Recent</option>
                    <option value="views">Most Viewed</option>
                    <option value="title">Title (A-Z)</option>
                  </Select>
                </Box>
                
                <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={cardBg} borderColor={cardBorder}>
                  <Heading as="h3" size="md" mb={4} color={headingColor}>
                    Display Options
                  </Heading>
                  <VStack spacing={3}>
                    <Button 
                      leftIcon={<FiRefreshCw />} 
                      colorScheme="purple" 
                      variant="outline"
                      onClick={handleShowRandomArticles}
                      width="full"
                    >
                      Show Random Articles
                    </Button>
                    <Button 
                      colorScheme="blue" 
                      variant="outline"
                      onClick={handleShowAllArticles}
                      width="full"
                    >
                      Show All Articles
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            </GridItem>
            
            {/* Articles list */}
            <GridItem>
              <Flex justify="space-between" align="center" mb={4}>
                <Text color={textColor} fontWeight="medium">
                  {sortedArticles.length} articles found
                </Text>
                {showRandom && (
                  <Badge px={2} py={1} borderRadius="md" bg={randomBadgeBg} color={randomBadgeColor}>
                    Showing Random Selection
                  </Badge>
                )}
              </Flex>
              
              <VStack spacing={6} align="stretch">
                {isLoading ? (
                  // Show skeleton loaders while loading
                  Array.from({ length: ARTICLES_PER_PAGE }).map((_, index) => (
                    <ArticleSkeleton key={index} />
                  ))
                ) : displayedArticles.length > 0 ? (
                  displayedArticles.map(article => (
                    <LinkBox 
                      as="article" 
                      key={article.id}
                      p={5} 
                      shadow="md" 
                      borderWidth="1px" 
                      borderRadius="lg" 
                      bg={cardBg}
                      borderColor={cardBorder}
                      _hover={{ 
                        transform: 'translateY(-2px)', 
                        shadow: 'lg',
                        borderColor: useColorModeValue('blue.300', 'blue.500')
                      }}
                      transition="all 0.3s"
                    >
                      <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={4}>
                        <GridItem>
                          <Heading as="h2" size="md" mb={2} color={headingColor}>
                            {article.title}
                          </Heading>
                          
                          <Text fontSize="sm" color={mutedTextColor} mb={3}>
                            {article.authors ? article.authors.join(', ') : 'Unknown Author'}
                          </Text>
                          
                          <Text noOfLines={3} mb={4} color={textColor}>
                            {article.abstract}
                          </Text>
                          
                          <Flex flexWrap="wrap" gap={2}>
                            {Array.isArray(article.categories) && article.categories.map(category => (
                              <Tag key={category} size="sm" colorScheme="blue" variant="subtle">
                                {category}
                              </Tag>
                            ))}
                          </Flex>
                          
                          <Flex mt={4} gap={4} color={mutedTextColor} fontSize="sm">
                            <Flex align="center">
                              <FiCalendar style={{ marginRight: '5px' }} />
                              {article.date}
                            </Flex>
                            <Flex align="center">
                              <FiEye style={{ marginRight: '5px' }} />
                              {article.views || 0} views
                            </Flex>
                          </Flex>
                        </GridItem>
                        
                        <GridItem display={{ base: 'none', md: 'block' }}>
                          <Image
                            src={article.imageUrl || imageUrls[article.categories?.[0]] || imageUrls.DEFAULT}
                            alt={article.title}
                            borderRadius="md"
                            objectFit="cover"
                            height="100%"
                            width="100%"
                          />
                        </GridItem>
                      </Grid>
                    </LinkBox>
                  ))
                ) : (
                  <Box p={5} textAlign="center" borderWidth="1px" borderRadius="lg" bg={cardBg}>
                    <Text>No articles found matching your criteria. Try adjusting your filters.</Text>
                  </Box>
                )}
              </VStack>
              
              {/* Pagination - only show when not in random mode and we have articles */}
              {!showRandom && sortedArticles.length > 0 && (
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </GridItem>
          </Grid>
        </Container>
      </PageTransition>
    </Layout>
  );
};

export default ArticlesPage;
