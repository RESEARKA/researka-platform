"use client";

import React, { useState, useCallback, Suspense, lazy } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Flex,
  Input,
  Text,
  Button,
  Heading,
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
  useColorModeValue,
  LinkBox,
  LinkOverlay
} from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';
import NextLink from 'next/link';
import dynamic from 'next/dynamic';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import { useModal } from '../contexts/ModalContext';
import { ALL_ARTICLES, getRandomArticles } from '../data/articles';
import { FEATURED_ARTICLE as FEATURED_ARTICLE_DATA } from '../data/articles';

// Dynamically import components that aren't needed for initial render
const LoginModal = dynamic(() => import('../components/LoginModal'), {
  ssr: false,
  loading: () => null
});

const NavBar = dynamic(() => import('../components/NavBar'), {
  ssr: true
});

const MobileNav = dynamic(() => import('../components/MobileNav'), {
  ssr: true
});

// Dynamically import components for better performance
const FeaturedArticle = dynamic(
  () => import('../frontend/src/components/articles/FeaturedArticle').then(mod => mod),
  { 
    ssr: true, 
    loading: () => <Skeleton height="300px" width="100%" borderRadius="md" />
  }
);

// Categories data
const CATEGORIES = {
  MAIN: [
    { id: 'all', name: 'ALL', color: 'blue.700' },
    { id: 'life-sciences', name: 'LIFE SCIENCES & BIOMEDICINE', color: 'green.700' },
    { id: 'physical-sciences', name: 'PHYSICAL SCIENCES', color: 'teal.700' },
    { id: 'multidisciplinary', name: 'MULTIDISCIPLINARY', color: 'blue.700' },
    { id: 'technology', name: 'TECHNOLOGY & ENGINEERING', color: 'green.700' },
    { id: 'social-sciences', name: 'SOCIAL SCIENCES', color: 'teal.700' },
    { id: 'arts', name: 'ARTS & HUMANITIES', color: 'green.700' },
  ],
  SUBCATEGORIES: [
    { id: 'biology', name: 'BIOLOGY', color: 'gray.700' },
    { id: 'chemistry', name: 'CHEMISTRY', color: 'gray.700' },
    { id: 'data-science', name: 'DATA SCIENCE', color: 'gray.700' },
    { id: 'physics', name: 'PHYSICS', color: 'gray.700' },
    { id: 'mathematics', name: 'MATHEMATICS', color: 'gray.700' },
    { id: 'earth-environmental', name: 'EARTH & ENVIRONMENTAL SCIENCES', color: 'gray.700' },
    { id: 'astronomy', name: 'ASTRONOMY & ASTROPHYSICS', color: 'gray.700' },
    { id: 'medicine', name: 'MEDICINE & HEALTH SCIENCES', color: 'gray.700' },
    { id: 'neuroscience', name: 'NEUROSCIENCE', color: 'gray.700' },
    { id: 'genetics', name: 'GENETICS', color: 'gray.700' },
    { id: 'ecology', name: 'ECOLOGY & CONSERVATION', color: 'gray.700' },
    { id: 'computer-science', name: 'COMPUTER SCIENCE', color: 'gray.700' },
    { id: 'electrical', name: 'ELECTRICAL & ELECTRONIC ENGINEERING', color: 'gray.700' },
    { id: 'mechanical', name: 'MECHANICAL ENGINEERING', color: 'gray.700' },
    { id: 'materials', name: 'MATERIALS SCIENCE', color: 'gray.700' },
    { id: 'ai', name: 'ARTIFICIAL INTELLIGENCE', color: 'gray.700' },
    { id: 'blockchain', name: 'BLOCKCHAIN & DISTRIBUTED SYSTEMS', color: 'gray.700' },
    { id: 'economics', name: 'ECONOMICS', color: 'gray.700' },
    { id: 'psychology', name: 'PSYCHOLOGY', color: 'gray.700' },
    { id: 'sociology', name: 'SOCIOLOGY', color: 'gray.700' },
    { id: 'political', name: 'POLITICAL SCIENCE', color: 'gray.700' },
    { id: 'education', name: 'EDUCATION', color: 'gray.700' },
    { id: 'business', name: 'BUSINESS & MANAGEMENT', color: 'gray.700' },
    { id: 'philosophy', name: 'PHILOSOPHY', color: 'gray.700' },
    { id: 'literature', name: 'LITERATURE', color: 'gray.700' },
    { id: 'history', name: 'HISTORY', color: 'gray.700' },
    { id: 'cultural', name: 'CULTURAL STUDIES', color: 'gray.700' },
    { id: 'linguistics', name: 'LINGUISTICS', color: 'gray.700' },
    { id: 'visual', name: 'VISUAL & PERFORMING ARTS', color: 'gray.700' },
    { id: 'sustainability', name: 'SUSTAINABILITY', color: 'gray.700' },
    { id: 'cognitive', name: 'COGNITIVE SCIENCE', color: 'gray.700' },
    { id: 'public-policy', name: 'PUBLIC POLICY', color: 'gray.700' },
    { id: 'ethics', name: 'ETHICS', color: 'gray.700' },
  ]
};

// Lazy load the main categories and subcategories
const MainCategories = lazy(() => Promise.resolve({
  default: ({ onSelect }: { onSelect: (id: string) => void }) => (
    <Flex wrap="wrap" gap={2} justify="center">
      {CATEGORIES.MAIN.map(category => (
        <Tag 
          key={category.id}
          size="md"
          borderRadius="full"
          variant="solid"
          colorScheme={category.color.split('.')[0]}
          cursor="pointer"
          onClick={() => onSelect(category.id)}
          _hover={{ opacity: 0.8 }}
          mb={2}
          color="white"
          bg={category.color}
        >
          <TagLabel>{category.name}</TagLabel>
        </Tag>
      ))}
    </Flex>
  )
}));

const SubCategories = lazy(() => Promise.resolve({
  default: ({ onSelect }: { onSelect: (id: string) => void }) => (
    <Flex wrap="wrap" gap={2} justify="center">
      {CATEGORIES.SUBCATEGORIES.map(category => (
        <Tag 
          key={category.id}
          size="sm"
          borderRadius="full"
          variant="outline"
          colorScheme={category.color.split('.')[0]}
          cursor="pointer"
          onClick={() => onSelect(category.id)}
          _hover={{ opacity: 0.8 }}
          mb={2}
          color={category.color}
        >
          <TagLabel>{category.name}</TagLabel>
        </Tag>
      ))}
    </Flex>
  )
}));

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
  const { isOpen, onOpen, onClose, setRedirectPath, redirectPath } = useModal();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [recentArticles] = useState(getRandomArticles(3));
  
  const handleLoginClick = (redirectPath?: string) => {
    if (redirectPath) {
      setRedirectPath(redirectPath);
    } else {
      setRedirectPath('/profile');
    }
    onOpen();
  };

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
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/images/researka-logo.svg" as="image" />
        
        {/* Add meta for mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#3182CE" />
      </Head>

      {/* Header/Navigation */}
      <Box as="header" bg={useColorModeValue('white', 'gray.800')} position="sticky" top={0} zIndex={10} boxShadow="sm">
        <Container maxW="container.xl">
          <Suspense fallback={<Box py={4}>Loading navigation...</Box>}>
            {/* Desktop Navigation - only visible on md screens and larger */}
            <Box display={{ base: "none", md: "block" }}>
              <NavBar 
                activePage="home"
                isLoggedIn={false}
                onLoginClick={handleLoginClick}
              />
            </Box>
          </Suspense>
        </Container>
      </Box>
      
      {/* Mobile Navigation - only visible on small screens */}
      <Suspense fallback={<Box py={4}>Loading navigation...</Box>}>
        <MobileNav
          activePage="home"
          isLoggedIn={false}
          onLoginClick={handleLoginClick}
        />
      </Suspense>

      {/* Search Section */}
      <Box py={6} bg="white" overflow="visible">
        <Container maxW="container.xl" overflow="visible">
          <VStack spacing={6} overflow="visible">
            <Heading 
              as="h2" 
              size="md" 
              color="gray.600" 
              textAlign="center"
              fontSize={{ base: "sm", sm: "lg", md: "3xl" }}
              px={{ base: 2, sm: 4 }}
              whiteSpace="normal"
              wordBreak="break-word"
              overflow="visible"
              width="100%"
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
          </VStack>
        </Container>
      </Box>

      {/* Categories Section */}
      <Box py={4} bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={4}>
            <Suspense fallback={<Skeleton height="40px" width="100%" />}>
              <MainCategories onSelect={handleCategorySelect} />
            </Suspense>
            
            <Suspense fallback={<Skeleton height="100px" width="100%" />}>
              <SubCategories onSelect={handleCategorySelect} />
            </Suspense>
          </VStack>
        </Container>
      </Box>

      {/* Featured Article Section */}
      <Box py={8} bg="white">
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            <Heading as="h2" size="lg" mb={4}>
              Featured Research
            </Heading>
            
            <Suspense fallback={<Skeleton height="300px" width="100%" borderRadius="md" />}>
              <FeaturedArticle 
                title={FEATURED_ARTICLE_DATA.title}
                abstract={FEATURED_ARTICLE_DATA.abstract}
                authors={FEATURED_ARTICLE_DATA.authors}
                categories={FEATURED_ARTICLE_DATA.categories}
                date={FEATURED_ARTICLE_DATA.date}
                views={FEATURED_ARTICLE_DATA.views}
                articleId={FEATURED_ARTICLE_DATA.id.toString()}
              />
            </Suspense>
            
            <Heading as="h2" size="lg" mb={4} mt={10}>
              Recent Research
            </Heading>
            
            <Grid 
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
              gap={6}
              mt={8}
            >
              {recentArticles.map((article, i) => (
                <GridItem key={i}>
                  <Box
                    as="a" 
                    href={`/article/${article.id}`}
                    p={5} 
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
                    textDecoration="none"
                    color="inherit"
                  >
                    <Heading as="h3" size="md" mb={2}>
                      {article.title}
                    </Heading>
                    <Text fontSize="sm" color="gray.700" mb={2}>
                      {article.authors}
                    </Text>
                    <Text fontSize="sm" mb={4} flex="1">
                      {article.abstract}
                    </Text>
                    <Flex justify="space-between" align="center">
                      <Flex align="center">
                        <Text fontSize="xs" color="gray.700">{article.date}</Text>
                      </Flex>
                      <Flex align="center">
                        <Text fontSize="xs" color="gray.700">{article.views} views</Text>
                      </Flex>
                    </Flex>
                  </Box>
                </GridItem>
              ))}
            </Grid>
            
            <Flex justify="center" mt={6}>
              <Button 
                as="a"
                href="/articles"
                colorScheme="blue" 
                variant="outline"
                size="md"
                _hover={{
                  bg: 'blue.50'
                }}
              >
                View All Research
              </Button>
            </Flex>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={10} bg="gray.50" borderTop="1px" borderColor="gray.200">
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={8}>
            <GridItem>
              <Heading as="h3" size="sm" mb={4}>
                RESEARKA
              </Heading>
              <Text fontSize="sm" color="gray.600">
                A decentralized academic publishing platform powered by blockchain technology.
              </Text>
            </GridItem>
            
            <GridItem>
              <Heading as="h3" size="sm" mb={4}>
                QUICK LINKS
              </Heading>
              <VStack align="start" spacing={2}>
                <ChakraLink as={Link} href="/about" fontSize="sm">About</ChakraLink>
                <ChakraLink as={Link} href="/articles" fontSize="sm">Articles</ChakraLink>
                <ChakraLink as={Link} href="/submit" fontSize="sm">Submit Research</ChakraLink>
                <ChakraLink as={Link} href="/review" fontSize="sm">Become a Reviewer</ChakraLink>
              </VStack>
            </GridItem>
            
            <GridItem>
              <Heading as="h3" size="sm" mb={4}>
                RESOURCES
              </Heading>
              <VStack align="start" spacing={2}>
                <ChakraLink as={Link} href="/faq" fontSize="sm">FAQ</ChakraLink>
                <ChakraLink as={Link} href="/guidelines" fontSize="sm">Author Guidelines</ChakraLink>
                <ChakraLink as={Link} href="/token" fontSize="sm">RSKA Token</ChakraLink>
                <ChakraLink as={Link} href="/docs" fontSize="sm">Documentation</ChakraLink>
              </VStack>
            </GridItem>
            
            <GridItem>
              <Heading as="h3" size="sm" mb={4}>
                CONNECT
              </Heading>
              <VStack align="start" spacing={2}>
                <ChakraLink href="https://twitter.com/researka" isExternal fontSize="sm">Twitter</ChakraLink>
                <ChakraLink href="https://github.com/researka" isExternal fontSize="sm">GitHub</ChakraLink>
                <ChakraLink href="https://discord.gg/researka" isExternal fontSize="sm">Discord</ChakraLink>
                <ChakraLink href="mailto:info@researka.io" fontSize="sm">Contact Us</ChakraLink>
              </VStack>
            </GridItem>
          </Grid>
          
          <Text fontSize="xs" color="gray.500" mt={10} textAlign="center">
            &copy; {new Date().getFullYear()} RESEARKA. All rights reserved.
          </Text>
        </Container>
      </Box>

      {/* Login Modal - Dynamically loaded */}
      <Suspense fallback={<Box>Loading login modal...</Box>}>
        {isOpen && <LoginModal isOpen={isOpen} onClose={onClose} redirectPath={redirectPath} />}
      </Suspense>
    </>
  );
};

export default Home;
