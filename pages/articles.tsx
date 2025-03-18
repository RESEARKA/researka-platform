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
  useColorModeValue
} from '@chakra-ui/react';
import { FiSearch, FiCalendar, FiEye } from 'react-icons/fi';
import Layout from '../components/Layout';
import { ALL_ARTICLES, Article } from '../data/articles';
import ArticleSkeleton from '../components/ArticleSkeleton';
import PageTransition from '../components/PageTransition';

const ArticlesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  
  // Image URLs for different article categories
  const imageUrls: Record<string, string> = {
    BIOLOGY: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    PHYSICS: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    'COMPUTER SCIENCE': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    MATHEMATICS: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    DEFAULT: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80'
  };
  
  // Get unique categories from all articles
  const allCategories = Array.from(
    new Set(ALL_ARTICLES.flatMap(article => article.categories))
  ).sort();
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setArticles(ALL_ARTICLES);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter and sort articles
  const filteredArticles = articles.filter(article => {
    // Filter by search query
    const matchesSearch = 
      searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.authors.some(author => 
        author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    // Filter by category
    const matchesCategory = 
      categoryFilter === '' || 
      article.categories.includes(categoryFilter);
    
    return matchesSearch && matchesCategory;
  });
  
  // Sort articles
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'views') {
      return b.views - a.views;
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });
  
  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  
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
                      onChange={(e) => setSearchQuery(e.target.value)}
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
                    onChange={(e) => setCategoryFilter(e.target.value)}
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
              </VStack>
            </GridItem>
            
            {/* Articles list */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                {isLoading ? (
                  // Show skeleton loaders while loading
                  Array.from({ length: 5 }).map((_, index) => (
                    <ArticleSkeleton key={index} />
                  ))
                ) : sortedArticles.length > 0 ? (
                  sortedArticles.map(article => (
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
                            {article.authors.join(', ')}
                          </Text>
                          
                          <Text noOfLines={3} mb={4} color={textColor}>
                            {article.abstract}
                          </Text>
                          
                          <HStack spacing={2} mb={3}>
                            {article.categories.map(category => (
                              <Tag 
                                key={category} 
                                size="sm" 
                                colorScheme={
                                  category === 'BIOLOGY' ? 'green' :
                                  category === 'PHYSICS' ? 'purple' :
                                  category === 'COMPUTER SCIENCE' ? 'blue' :
                                  category === 'MATHEMATICS' ? 'orange' : 'gray'
                                }
                              >
                                {category}
                              </Tag>
                            ))}
                          </HStack>
                          
                          <Flex align="center" fontSize="sm" color={mutedTextColor}>
                            <Flex align="center" mr={4}>
                              <FiCalendar style={{ marginRight: '5px' }} />
                              {new Date(article.date).toLocaleDateString()}
                            </Flex>
                            <Flex align="center">
                              <FiEye style={{ marginRight: '5px' }} />
                              {article.views} views
                            </Flex>
                          </Flex>
                        </GridItem>
                        
                        <GridItem>
                          <Image 
                            src={imageUrls[article.categories[0]] || imageUrls.DEFAULT} 
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
                  <Box 
                    p={8} 
                    textAlign="center" 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    bg={cardBg}
                    borderColor={cardBorder}
                  >
                    <Heading as="h3" size="md" mb={2} color={headingColor}>
                      No articles found
                    </Heading>
                    <Text color={textColor}>
                      Try adjusting your search or filter criteria
                    </Text>
                  </Box>
                )}
              </VStack>
            </GridItem>
          </Grid>
        </Container>
      </PageTransition>
    </Layout>
  );
};

export default ArticlesPage;
