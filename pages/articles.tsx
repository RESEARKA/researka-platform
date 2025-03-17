import React, { useState } from 'react';
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

const ArticlesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  
  // Image URLs for different article categories
  const imageUrls = {
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
  
  // Filter and sort articles
  const filteredArticles = ALL_ARTICLES.filter(article => {
    // Filter by search query
    const matchesSearch = 
      searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.authors.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = 
      categoryFilter === '' || 
      article.categories.includes(categoryFilter);
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Sort by selected criteria
    if (sortBy === 'date') {
      // Assuming date is in format "MMM DD, YYYY"
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'views') {
      return b.views - a.views;
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });
  
  // Get the appropriate image URL based on the article's first category
  const getImageUrl = (article: Article) => {
    if (!article.categories || article.categories.length === 0) {
      return imageUrls.DEFAULT;
    }
    
    const category = article.categories[0];
    
    if (category.includes('BIOLOGY')) return imageUrls.BIOLOGY;
    if (category.includes('PHYSICS')) return imageUrls.PHYSICS;
    if (category.includes('COMPUTER')) return imageUrls['COMPUTER SCIENCE'];
    if (category.includes('MATH')) return imageUrls.MATHEMATICS;
    
    return imageUrls.DEFAULT;
  };
  
  return (
    <Layout title="All Research | Researka" description="Browse all research papers on Researka" activePage="articles">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl">All Research</Heading>
          
          {/* Filters and Search */}
          <Box>
            <Grid templateColumns={{ base: "1fr", md: "3fr 1fr 1fr" }} gap={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Search by title, abstract, or author..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              
              <Select 
                placeholder="Filter by category" 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
              
              <Select 
                placeholder="Sort by" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Most Recent</option>
                <option value="views">Most Viewed</option>
                <option value="title">Title (A-Z)</option>
              </Select>
            </Grid>
          </Box>
          
          {/* Results Count */}
          <Text>Showing {filteredArticles.length} of {ALL_ARTICLES.length} articles</Text>
          
          {/* Articles Grid */}
          <Grid 
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
            gap={6}
          >
            {filteredArticles.map((article, index) => (
              <GridItem key={index}>
                <LinkBox
                  as="article" 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  overflow="hidden"
                  _hover={{ 
                    transform: 'translateY(-4px)', 
                    boxShadow: 'md',
                    borderColor: 'blue.200' 
                  }}
                  transition="all 0.2s"
                  height="100%"
                  display="flex"
                  flexDirection="column"
                  onClick={() => window.location.href = `/article/${article.id}`}
                  cursor="pointer"
                  bg={useColorModeValue('white', 'gray.800')}
                >
                  <Image
                    src={article.imageUrl || getImageUrl(article)}
                    alt={article.title}
                    height="200px"
                    width="100%"
                    objectFit="cover"
                    fallbackSrc={imageUrls.DEFAULT}
                  />
                  
                  <Box p={5} flex="1" display="flex" flexDirection="column">
                    <Heading as="h2" size="md" mb={2}>
                      {article.title}
                    </Heading>
                    
                    <Text fontSize="sm" color="gray.500" mb={2}>
                      {article.authors}
                    </Text>
                    
                    <Text fontSize="sm" mb={4} noOfLines={3} flex="1">
                      {article.abstract}
                    </Text>
                    
                    <HStack spacing={2} wrap="wrap" mb={3}>
                      {article.categories.slice(0, 2).map((category, idx) => (
                        <Tag key={idx} size="sm" colorScheme="blue">
                          {category}
                        </Tag>
                      ))}
                      {article.categories.length > 2 && (
                        <Tag size="sm" colorScheme="gray">
                          +{article.categories.length - 2}
                        </Tag>
                      )}
                    </HStack>
                    
                    <Flex justify="space-between" align="center" mt="auto">
                      <Flex align="center">
                        <FiCalendar size={14} style={{ marginRight: '4px' }} />
                        <Text fontSize="xs">{article.date}</Text>
                      </Flex>
                      <Flex align="center">
                        <FiEye size={14} style={{ marginRight: '4px' }} />
                        <Text fontSize="xs">{article.views} views</Text>
                      </Flex>
                    </Flex>
                  </Box>
                </LinkBox>
              </GridItem>
            ))}
          </Grid>
          
          {/* No Results */}
          {filteredArticles.length === 0 && (
            <Box textAlign="center" py={10}>
              <Heading as="h3" size="md" mb={4}>No articles found</Heading>
              <Text>Try adjusting your search or filter criteria</Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Layout>
  );
};

export default ArticlesPage;
