"use client";

import React, { useState, useCallback, Suspense, lazy } from 'react';
import {
  Box,
  Container,
  Flex,
  Input,
  Text,
  Button,
  Heading,
  HStack,
  VStack,
  Tag,
  TagLabel,
  Link as ChakraLink,
  InputGroup,
  InputLeftElement,
  Skeleton,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FiSearch, FiCalendar, FiEye, FiChevronDown } from 'react-icons/fi';

// Dynamically import components for better performance
const FeaturedArticle = dynamic(
  () => import('../frontend/src/components/articles/FeaturedArticle'),
  { 
    ssr: false, 
    loading: () => <Skeleton height="300px" width="100%" borderRadius="md" />
  }
);

// Categories data
const CATEGORIES = {
  MAIN: [
    { id: 'all', name: 'ALL', color: 'blue' },
    { id: 'life-sciences', name: 'LIFE SCIENCES & BIOMEDICINE', color: 'green' },
    { id: 'physical-sciences', name: 'PHYSICAL SCIENCES', color: 'teal' },
    { id: 'multidisciplinary', name: 'MULTIDISCIPLINARY', color: 'cyan' },
    { id: 'technology', name: 'TECHNOLOGY & ENGINEERING', color: 'green' },
    { id: 'social-sciences', name: 'SOCIAL SCIENCES', color: 'teal' },
    { id: 'arts', name: 'ARTS & HUMANITIES', color: 'green' },
  ],
  SUBCATEGORIES: [
    { id: 'biology', name: 'BIOLOGY', color: 'gray' },
    { id: 'chemistry', name: 'CHEMISTRY', color: 'gray' },
    { id: 'data-science', name: 'DATA SCIENCE', color: 'gray' },
    { id: 'physics', name: 'PHYSICS', color: 'gray' },
    { id: 'mathematics', name: 'MATHEMATICS', color: 'gray' },
    { id: 'earth-environmental', name: 'EARTH & ENVIRONMENTAL SCIENCES', color: 'gray' },
    { id: 'astronomy', name: 'ASTRONOMY & ASTROPHYSICS', color: 'gray' },
    { id: 'medicine', name: 'MEDICINE & HEALTH SCIENCES', color: 'gray' },
    { id: 'neuroscience', name: 'NEUROSCIENCE', color: 'gray' },
    { id: 'genetics', name: 'GENETICS', color: 'gray' },
    { id: 'ecology', name: 'ECOLOGY & CONSERVATION', color: 'gray' },
    { id: 'computer-science', name: 'COMPUTER SCIENCE', color: 'gray' },
    { id: 'electrical', name: 'ELECTRICAL & ELECTRONIC ENGINEERING', color: 'gray' },
    { id: 'mechanical', name: 'MECHANICAL ENGINEERING', color: 'gray' },
    { id: 'materials', name: 'MATERIALS SCIENCE', color: 'gray' },
    { id: 'ai', name: 'ARTIFICIAL INTELLIGENCE', color: 'gray' },
    { id: 'blockchain', name: 'BLOCKCHAIN & DISTRIBUTED SYSTEMS', color: 'gray' },
    { id: 'economics', name: 'ECONOMICS', color: 'gray' },
    { id: 'psychology', name: 'PSYCHOLOGY', color: 'gray' },
    { id: 'sociology', name: 'SOCIOLOGY', color: 'gray' },
    { id: 'political', name: 'POLITICAL SCIENCE', color: 'gray' },
    { id: 'education', name: 'EDUCATION', color: 'gray' },
    { id: 'business', name: 'BUSINESS & MANAGEMENT', color: 'gray' },
    { id: 'philosophy', name: 'PHILOSOPHY', color: 'gray' },
    { id: 'literature', name: 'LITERATURE', color: 'gray' },
    { id: 'history', name: 'HISTORY', color: 'gray' },
    { id: 'cultural', name: 'CULTURAL STUDIES', color: 'gray' },
    { id: 'linguistics', name: 'LINGUISTICS', color: 'gray' },
    { id: 'visual', name: 'VISUAL & PERFORMING ARTS', color: 'gray' },
    { id: 'sustainability', name: 'SUSTAINABILITY', color: 'gray' },
    { id: 'cognitive', name: 'COGNITIVE SCIENCE', color: 'gray' },
    { id: 'public-policy', name: 'PUBLIC POLICY', color: 'gray' },
    { id: 'ethics', name: 'ETHICS', color: 'gray' },
  ]
};

// Sample featured article
const FEATURED_ARTICLE = {
  id: 1,
  title: "Epigenetic Regulation of Neural Stem Cell Differentiation in Alzheimer's Disease Models",
  authors: "Dr. Eliza J. Thornfield, Prof. Hiroshi Nakamura, Dr. Sophia Menendez Rodriguez",
  abstract: "Recent advances in understanding epigenetic mechanisms have revealed their crucial role in neural stem cell fate determination. This study investigates how DNA methylation patterns and histone modifications influence neural stem cell differentiation in transgenic mouse models of Alzheimer's disease, providing insights into potential therapeutic targets for neurodegenerative disorders.",
  date: "Jan 15, 2025",
  views: 842,
  categories: ["BIOLOGY", "LIFE SCIENCES & BIOMEDICINE"]
};

// Cache for search results
const searchCache = new Map();

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  
  // Memoized search handler with debounce
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Check cache first (StaleWhileRevalidate strategy)
    const cacheKey = `${searchQuery}-${selectedCategory}`;
    if (searchCache.has(cacheKey)) {
      console.log('Using cached search results for:', cacheKey);
      // In a real app, you would update state with cached results here
      setIsSearching(false);
      return;
    }
    
    // Simulate search API call
    console.log('Searching for:', searchQuery, 'in category:', selectedCategory);
    
    // In a real app, you would make an API call here
    setTimeout(() => {
      // Cache the results
      searchCache.set(cacheKey, { query: searchQuery, category: selectedCategory, timestamp: Date.now() });
      setIsSearching(false);
    }, 500);
  }, [searchQuery, selectedCategory]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    console.log('Selected category:', categoryId);
    // In a real app, you would filter results based on the category
  }, []);

  return (
    <>
      <Head>
        <title>RESEARKA - Decentralized Academic Publishing</title>
        <meta name="description" content="A decentralized academic publishing platform powered by blockchain technology" />
        {/* Resource hints for performance */}
        <link rel="preconnect" href="https://mainnet.infura.io" />
        <link rel="preconnect" href="https://rpc.zksync.io" />
        <link rel="dns-prefetch" href="https://rpc.zksync.io" />
        <link rel="prefetch" href="/api/articles/featured" />
      </Head>

      {/* Header/Navigation */}
      <Box borderBottom="1px" borderColor="gray.200" py={2}>
        <Container maxW="container.xl">
          <Flex 
            justify="space-between" 
            align="center"
            direction={{ base: "column", md: "row" }}
            gap={{ base: 4, md: 0 }}
          >
            <ChakraLink href="/" _hover={{ textDecoration: 'none' }}>
              <Heading as="h1" size="lg" color="green.400">RESEARKA</Heading>
            </ChakraLink>
            
            <HStack 
              spacing={{ base: 2, md: 4 }}
              flexWrap={{ base: "wrap", md: "nowrap" }}
              justifyContent={{ base: "center", md: "flex-end" }}
              fontSize="2xs"
            >
              <Button as="a" href="/" variant="ghost" colorScheme="blue" isActive={true} size={{ base: "sm", md: "md" }}>HOME</Button>
              <Button as="a" href="/search" variant="ghost" size={{ base: "sm", md: "md" }}>SEARCH</Button>
              <Button as="a" href="/submit" variant="ghost" size={{ base: "sm", md: "md" }}>SUBMIT</Button>
              <Button as="a" href="/review" variant="ghost" size={{ base: "sm", md: "md" }}>REVIEW</Button>
              
              {/* INFO Dropdown */}
              <Menu>
                <MenuButton 
                  as={Button} 
                  rightIcon={<FiChevronDown />}
                  variant="ghost"
                  size={{ base: "sm", md: "md" }}
                >
                  INFO
                </MenuButton>
                <MenuList minWidth="180px" fontSize="sm"> {/* Making submenu text 10% bigger */}
                  <MenuItem as="a" href="/info/roles">ROLES</MenuItem>
                  <MenuItem as="a" href="/info/about">ABOUT</MenuItem>
                  <MenuItem as="a" href="/info/team">TEAM</MenuItem>
                  <MenuItem as="a" href="/info/whitepaper">WHITEPAPER</MenuItem>
                  <MenuItem as="a" href="/info/contact">CONTACT</MenuItem>
                </MenuList>
              </Menu>
              
              {/* GOVERNANCE Dropdown */}
              <Menu>
                <MenuButton 
                  as={Button} 
                  rightIcon={<FiChevronDown />}
                  variant="ghost"
                  size={{ base: "sm", md: "md" }}
                >
                  GOVERNANCE
                </MenuButton>
                <MenuList minWidth="180px" fontSize="sm"> {/* Making submenu text 10% bigger */}
                  <MenuItem as="a" href="/governance/legal">LEGAL</MenuItem>
                  <MenuItem as="a" href="/governance/privacy-policy">PRIVACY POLICY</MenuItem>
                  <MenuItem as="a" href="/governance/cookie-policy">COOKIE POLICY</MenuItem>
                  <MenuItem as="a" href="/governance/privacy-center">PRIVACY CENTER</MenuItem>
                </MenuList>
              </Menu>
              
              <Button as="a" href="/login" colorScheme="blue" size={{ base: "sm", md: "md" }}>LOGIN</Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Search Section */}
      <Box py={6} bg="white">
        <Container maxW="container.xl">
          <VStack spacing={6}>
            <Heading 
              as="h2" 
              size="md" 
              color="gray.600" 
              textAlign="center"
              fontSize="1.44rem"
            >
              DECENTRALIZING ACADEMIC RESEARCH
            </Heading>
            
            <form onSubmit={handleSearch} style={{ width: '100%' }}>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Search by title, abstract, or author..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderRadius="md"
                  focusBorderColor="blue.400"
                  isDisabled={isSearching}
                  aria-label="Search articles"
                />
              </InputGroup>
            </form>
            
            {/* Main Categories - Horizontally scrollable on mobile */}
            <Box w="100%" overflowX="auto" py={2} css={{
              '&::-webkit-scrollbar': { height: '8px' },
              '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
              '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '4px' },
              '&::-webkit-scrollbar-thumb:hover': { background: '#555' }
            }}>
              <HStack spacing={2} wrap="nowrap" minWidth="max-content">
                {CATEGORIES.MAIN.map((category) => (
                  <Tag 
                    key={category.id}
                    size="md" 
                    borderRadius="full" 
                    variant={selectedCategory === category.id ? "solid" : "subtle"}
                    colorScheme={category.color}
                    cursor="pointer"
                    onClick={() => handleCategorySelect(category.id)}
                    px={3}
                    py={2}
                    whiteSpace="nowrap"
                  >
                    <TagLabel>{category.name}</TagLabel>
                  </Tag>
                ))}
              </HStack>
            </Box>
            
            {/* Subcategories - Responsive grid layout */}
            <Box w="100%" py={2}>
              <Flex 
                flexWrap="wrap" 
                gap={2} 
                justifyContent={{ base: "center", md: "flex-start" }}
              >
                {CATEGORIES.SUBCATEGORIES.map((category) => (
                  <Tag 
                    key={category.id}
                    size="md" 
                    borderRadius="full" 
                    variant="subtle"
                    colorScheme={category.color}
                    cursor="pointer"
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <TagLabel>{category.name}</TagLabel>
                  </Tag>
                ))}
              </Flex>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Featured Articles */}
      <Box py={6} bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            {/* Featured Article - Using Suspense for better loading experience */}
            <Suspense fallback={<Skeleton height="300px" width="100%" borderRadius="md" />}>
              <FeaturedArticle 
                title={FEATURED_ARTICLE.title}
                abstract={FEATURED_ARTICLE.abstract}
                authors={FEATURED_ARTICLE.authors.split(', ')}
                categories={FEATURED_ARTICLE.categories}
                date={FEATURED_ARTICLE.date}
                views={FEATURED_ARTICLE.views}
                articleId={FEATURED_ARTICLE.id.toString()}
              />
            </Suspense>
            
            {/* More articles would go here */}
          </VStack>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box py={6} bg="white" borderTop="1px" borderColor="gray.200">
        <Container maxW="container.xl">
          <Flex justify="center" align="center" direction="column">
            <Text fontSize="sm" color="gray.500">
              &copy; {new Date().getFullYear()} Researka Platform. All rights reserved.
            </Text>
            <Text fontSize="xs" color="gray.400" mt={1}>
              A decentralized academic publishing solution built on zkSync
            </Text>
            <ChakraLink 
              href="/token-dashboard" 
              color="blue.500" 
              fontSize="xs" 
              mt={2}
              _hover={{ textDecoration: 'underline' }}
            >
              Token Dashboard
            </ChakraLink>
          </Flex>
        </Container>
      </Box>
    </>
  );
};

export default Home;
