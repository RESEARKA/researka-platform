import React, { useState, useCallback, Suspense, lazy, useEffect } from 'react';
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
  LinkOverlay,
  useToast,
  Center,
  Spinner
} from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';
import NextLink from 'next/link';
import dynamic from 'next/dynamic';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import { useModal } from '../contexts/ModalContext';
import { Article } from '../services/articleService'; 
import FirebaseClientOnly from '../components/FirebaseClientOnly';

// Using dynamic import with ssr: false for components with client-side dependencies
const LoginModal = dynamic(() => import('../components/LoginModal'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

const SignupModal = dynamic(() => import('../components/SignupModal'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

const NavBar = dynamic(() => import('../components/NavBar'), {
  ssr: true
});

const MobileNav = dynamic(() => import('../components/MobileNav'), {
  ssr: false
});

// Using dynamic import with ssr: false for ClientOnlyArticles to prevent hydration issues
const ClientOnlyArticlesComponent = dynamic(() => import('../components/ClientOnlyArticles'), {
  ssr: false,
  loading: () => <div>Loading articles...</div>
});

// Using dynamic import for RecommendedArticles to improve code splitting
const DynamicRecommendedArticles = dynamic(
  () => import('../components/RecommendedArticles'),
  {
    ssr: true,
    loading: () => <Skeleton height="400px" width="100%" borderRadius="md" />
  }
);

// Using ssr: false for featured article to prevent hydration mismatch
const FeaturedArticle = dynamic(
  () => import('../frontend/src/components/articles/FeaturedArticle').then(mod => mod),
  { 
    ssr: false, 
    loading: () => <Skeleton height="300px" width="100%" borderRadius="md" />
  }
);

// Using dynamic to avoid hydration mismatch
const MainCategories = dynamic(() => Promise.resolve({
  default: ({ onSelect }: { onSelect: (id: string) => void }) => {
    const categories = [
      { id: 'all', name: 'ALL', color: 'blue.500' },
      { id: 'trending', name: 'TRENDING', color: 'red.500' },
      { id: 'recent', name: 'RECENT', color: 'green.500' },
      { id: 'popular', name: 'POPULAR', color: 'purple.500' },
      { id: 'reviewed', name: 'PEER REVIEWED', color: 'orange.500' },
      { id: 'open-access', name: 'OPEN ACCESS', color: 'teal.500' },
    ];
    
    return (
      <Flex wrap="wrap" gap={2} mb={4}>
        {categories.map(category => (
          <Tag 
            key={category.id}
            size="md" 
            variant="solid" 
            cursor="pointer"
            onClick={() => onSelect(category.id)}
            mb={2}
            color="white"
            bg={category.color}
          >
            <TagLabel>{category.name}</TagLabel>
          </Tag>
        ))}
      </Flex>
    );
  }
}), { ssr: false });

// Using dynamic to avoid hydration mismatch
const SubCategories = dynamic(() => Promise.resolve({
  default({ onSelect }: { onSelect: (id: string) => void }) {
    const subCategories = [
      { id: 'all', name: 'ALL', color: 'blue.500' },
      { id: 'biology', name: 'BIOLOGY', color: 'green.500' },
      { id: 'physics', name: 'PHYSICS', color: 'purple.500' },
      { id: 'chemistry', name: 'CHEMISTRY', color: 'orange.500' },
      { id: 'computer-science', name: 'COMPUTER SCIENCE', color: 'red.500' },
      { id: 'mathematics', name: 'MATHEMATICS', color: 'yellow.500' },
      { id: 'medicine', name: 'MEDICINE', color: 'teal.500' },
      { id: 'psychology', name: 'PSYCHOLOGY', color: 'pink.500' },
      { id: 'economics', name: 'ECONOMICS', color: 'cyan.500' },
      { id: 'sociology', name: 'SOCIOLOGY', color: 'blue.300' },
      { id: 'ethics', name: 'ETHICS', color: 'gray.700' },
    ];
    return (
      <Flex wrap="wrap" gap={2} mb={4}>
        {subCategories.map(cat => (
          <Tag 
            key={cat.id}
            size="md" 
            variant="outline" 
            colorScheme="blue"
            cursor="pointer"
            onClick={() => onSelect(cat.id)}
            _hover={{ bg: 'blue.50', color: 'blue.600' }}
          >
            <TagLabel>{cat.name}</TagLabel>
          </Tag>
        ))}
      </Flex>
    );
  }
}), { ssr: false });

// Create a client-only wrapper component for content that should only render on the client
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  return <>{children}</>;
};

const Home: React.FC = () => {
  const { isOpen, onOpen, onClose, setRedirectPath, isSignupModalOpen, closeSignupModal, openSignupModal } = useModal();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const toast = useToast();
  
  // Use useRef for values that shouldn't trigger re-renders
  const searchCacheRef = React.useRef(new Map());
  
  // Handle articles loaded from ClientOnlyArticles component
  const handleArticlesLoaded = useCallback((
    loadedArticles: Article[], 
    loadedFeaturedArticle: Article | null, 
    loadedRecentArticles: Article[]
  ) => {
    console.log('Home: Articles loaded from ClientOnlyArticles:', 
      loadedArticles.length, 
      loadedFeaturedArticle ? 'Featured: Yes' : 'Featured: No', 
      'Recent:', loadedRecentArticles.length
    );
    
    setArticles(loadedArticles);
    setFeaturedArticle(loadedFeaturedArticle);
    setRecentArticles(loadedRecentArticles);
  }, []);
  
  // Handle loading state changes from ClientOnlyArticles component
  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);
  
  // Handle errors from ClientOnlyArticles component
  const handleError = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
    
    if (errorMessage) {
      console.error('Home: Error from ClientOnlyArticles:', errorMessage);
    }
  }, []);
  
  // Handle login click
  const handleLoginClick = useCallback((redirectPath?: string) => {
    if (redirectPath) {
      setRedirectPath(redirectPath);
    } else {
      setRedirectPath('/profile');
    }
    onOpen();
  }, [onOpen, setRedirectPath]);

  // Handle signup click
  const handleSignupClick = useCallback(() => {
    openSignupModal();
  }, [openSignupModal]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    const cacheKey = `${searchQuery}-${selectedCategory}`;
    if (searchCacheRef.current.has(cacheKey)) {
      console.log('Using cached search results for:', cacheKey);
      setIsSearching(false);
      return;
    }
    
    console.log('Searching for:', searchQuery, 'in category:', selectedCategory);
    
    setTimeout(() => {
      searchCacheRef.current.set(cacheKey, { 
        query: searchQuery, 
        category: selectedCategory, 
        timestamp: Date.now() 
      });
      setIsSearching(false);
    }, 500);
  }, [searchQuery, selectedCategory]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    console.log('Selected category:', categoryId);
  }, []);

  return (
    <>
      <Head>
        <title>RESEARKA - Decentralized Academic Publishing</title>
        <meta name="description" content="A decentralized academic publishing platform powered by blockchain technology" />
        <link rel="preconnect" href="https://mainnet.infura.io" />
        <link rel="preconnect" href="https://rpc.zksync.io" />
        <link rel="dns-prefetch" href="https://rpc.zksync.io" />
        <link rel="prefetch" href="/api/articles/featured" />
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/images/researka-logo.svg" as="image" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#3182CE" />
      </Head>

      <Box as="header" bg={useColorModeValue('white', 'gray.800')} position="sticky" top={0} zIndex={10} boxShadow="sm">
        <Container maxW="container.xl">
          <Suspense fallback={<Box py={4}>Loading navigation...</Box>}>
            <Box display={{ base: "none", md: "block" }}>
              <NavBar 
                activePage="home"
                isLoggedIn={false}
                onLoginClick={handleLoginClick}
                onSignupClick={handleSignupClick}
              />
            </Box>
          </Suspense>
        </Container>
      </Box>
      
      <Suspense fallback={<Box py={4}>Loading navigation...</Box>}>
        <MobileNav
          activePage="home"
          isLoggedIn={false}
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
        />
      </Suspense>

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

      <Box py={8} bg="white">
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            <Heading as="h2" size="lg" mb={4}>
              Featured Research
            </Heading>
            
            {isLoading ? (
              <Skeleton height="300px" width="100%" borderRadius="md" />
            ) : error ? (
              <Box p={5} borderWidth="1px" borderRadius="lg" textAlign="center">
                <Text color="red.500">{error}</Text>
                <Button mt={4} colorScheme="blue" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </Box>
            ) : featuredArticle ? (
              <ClientOnly>
                <Suspense fallback={<Skeleton height="300px" width="100%" borderRadius="md" />}>
                  <FeaturedArticle 
                    title={featuredArticle.title}
                    abstract={featuredArticle.abstract || ""}
                    authors={Array.isArray(featuredArticle.author) 
                      ? featuredArticle.author 
                      : featuredArticle.author ? [featuredArticle.author] : []}
                    categories={Array.isArray(featuredArticle.category) 
                      ? featuredArticle.category 
                      : [featuredArticle.category]}
                    date={featuredArticle.date || new Date().toISOString()}
                    views={featuredArticle.views || 0}
                    articleId={featuredArticle.id?.toString() || ""}
                  />
                </Suspense>
              </ClientOnly>
            ) : (
              <Box p={5} borderWidth="1px" borderRadius="lg" textAlign="center">
                <Text>No featured article available</Text>
              </Box>
            )}
            
            <Heading as="h2" size="lg" mb={4} mt={10}>
              Recent Research
            </Heading>
            
            {isLoading ? (
              <Grid 
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                gap={6}
                mt={8}
              >
                {[...Array(3)].map((_, i) => (
                  <GridItem key={i}>
                    <Skeleton height="200px" width="100%" borderRadius="md" />
                  </GridItem>
                ))}
              </Grid>
            ) : recentArticles.length > 0 ? (
              <ClientOnly>
                <Grid 
                  templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                  gap={6}
                  mt={8}
                >
                  {recentArticles.map((article, i) => (
                    <GridItem key={article.id || i}>
                      <LinkBox 
                        as="article" 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="lg" 
                        _hover={{ 
                          shadow: "md", 
                          transform: "translateY(-2px)", 
                          transition: "all 0.2s ease-in-out" 
                        }}
                        h="100%"
                        display="flex"
                        flexDirection="column"
                      >
                        <Box as="h3">
                          <LinkOverlay 
                            as={NextLink} 
                            href={`/article/${article.id}`}
                          >
                            <Heading size="md" my={2}>
                              {article.title}
                            </Heading>
                          </LinkOverlay>
                        </Box>
                        <Text fontSize="sm" color="gray.700" mb={2}>
                          {typeof article.author === 'string' 
                            ? article.author 
                            : Array.isArray(article.author) 
                              ? (article.author as string[]).join(', ') 
                              : typeof article.author === 'object' && article.author !== null
                                ? String(article.author)
                                : ''}
                        </Text>
                        <Text fontSize="sm" mb={4} flex="1">
                          {article.abstract?.substring(0, 120)}
                          {article.abstract && article.abstract.length > 120 ? '...' : ''}
                        </Text>
                        <Flex justify="space-between" align="center" mt="auto">
                          <Text fontSize="xs" color="gray.500">
                            {new Date(article.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Text>
                          <Flex>
                            {Array.isArray(article.category) 
                              ? (article.category as string[]).slice(0, 2).map((cat: string, i: number) => (
                                  <Tag 
                                    key={i} 
                                    size="sm" 
                                    colorScheme="blue" 
                                    ml={1}
                                    borderRadius="full"
                                    variant="subtle"
                                  >
                                    <TagLabel>{cat}</TagLabel>
                                  </Tag>
                                ))
                              : typeof article.category === 'string' && (
                                  <Tag 
                                    size="sm" 
                                    colorScheme="blue" 
                                    ml={1}
                                    borderRadius="full"
                                    variant="subtle"
                                  >
                                    <TagLabel>{article.category}</TagLabel>
                                  </Tag>
                                )
                            }
                          </Flex>
                        </Flex>
                      </LinkBox>
                    </GridItem>
                  ))}
                </Grid>
              </ClientOnly>
            ) : (
              <Box p={5} borderWidth="1px" borderRadius="lg" textAlign="center">
                <Text>No recent articles available</Text>
                <Box mt={4}>
                  <Button 
                    as="a" 
                    href="/submit" 
                    colorScheme="blue"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = '/submit';
                    }}
                  >
                    Submit Your Research
                  </Button>
                </Box>
              </Box>
            )}
            
            <Box textAlign="center" mt={8}>
              <Button
                as="a"
                href="/articles"
                colorScheme="blue"
                size="lg"
                fontWeight="bold"
                _hover={{ 
                  transform: "translateY(-2px)", 
                  boxShadow: "lg" 
                }}
                transition="all 0.2s"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/articles';
                }}
              >
                View All Research
              </Button>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Use ClientOnlyArticles component to handle articles loading */}
      <ClientOnlyArticlesComponent
        onArticlesLoaded={handleArticlesLoaded}
        onLoadingChange={handleLoadingChange}
        onError={handleError}
      />

      {/* Login Modal */}
      {isOpen && (
        <Suspense fallback={<Box>Loading login modal...</Box>}>
          <LoginModal isOpen={isOpen} onClose={onClose} redirectPath={redirectPath} />
        </Suspense>
      )}

      {/* Signup Modal */}
      {isSignupModalOpen && (
        <Suspense fallback={<Box>Loading signup modal...</Box>}>
          <SignupModal 
            isOpen={isSignupModalOpen} 
            onClose={closeSignupModal} 
            redirectPath="/profile" 
          />
        </Suspense>
      )}
    </>
  );
};

// Wrap the Home component with FirebaseClientOnly to ensure Firebase is initialized
const HomeWithFirebase: React.FC = () => {
  return (
    <FirebaseClientOnly fallback={
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    }>
      <Home />
    </FirebaseClientOnly>
  );
};

export default HomeWithFirebase;
