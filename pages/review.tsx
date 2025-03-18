import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Flex,
  Heading,
  Text,
  VStack,
  Button,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  useColorModeValue,
  Tag,
  Avatar,
  Tooltip,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiStar, FiClock, FiCalendar, FiUser, FiBookmark, FiChevronDown } from 'react-icons/fi';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

// Mock data for articles awaiting review
const mockArticles = [
  {
    id: 1,
    title: 'Blockchain-Based Framework for Academic Credential Verification',
    abstract: 'This paper proposes a novel blockchain-based framework for verifying academic credentials, addressing issues of fraud and inefficiency in traditional verification systems.',
    author: 'Sarah Chen',
    category: 'Blockchain',
    date: 'March 15, 2025',
    keywords: ['blockchain', 'academic credentials', 'verification'],
    compensation: '50 RKA TOKENS',
  },
  {
    id: 2,
    title: 'Decentralized Peer Review: A New Paradigm for Scientific Publishing',
    abstract: 'We present a decentralized approach to peer review that leverages blockchain technology to create transparent, immutable records of the review process.',
    author: 'Michael Rodriguez',
    category: 'Academic Publishing',
    date: 'March 14, 2025',
    keywords: ['peer review', 'decentralization', 'scientific publishing'],
    compensation: '50 RKA TOKENS',
  },
  {
    id: 3,
    title: 'Smart Contracts for Research Funding Distribution',
    abstract: 'This study examines how smart contracts can automate and improve the distribution of research funding, ensuring transparency and reducing administrative overhead.',
    author: 'Emma Johnson',
    category: 'Research Funding',
    date: 'March 12, 2025',
    keywords: ['smart contracts', 'research funding', 'automation'],
    compensation: '50 RKA TOKENS',
  },
  {
    id: 4,
    title: 'Tokenized Citation Impact: A New Metric for Academic Influence',
    abstract: 'We propose a tokenized citation impact system that quantifies academic influence through a combination of traditional citation metrics and token-based incentives.',
    author: 'David Kim',
    category: 'Bibliometrics',
    date: 'March 10, 2025',
    keywords: ['citation impact', 'tokenization', 'academic metrics'],
    compensation: '50 RKA TOKENS',
  },
];

const ReviewPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Check if user is logged in
  React.useEffect(() => {
    // Client-side only
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      
      if (isLoggedIn !== 'true') {
        // Redirect to homepage if not logged in
        window.location.href = '/';
        return;
      }
    }
  }, []);
  
  // Filter and sort articles based on user selections
  const filteredArticles = mockArticles
    .filter(article => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          article.title.toLowerCase().includes(query) ||
          article.abstract.toLowerCase().includes(query) ||
          article.author.toLowerCase().includes(query) ||
          article.keywords.some(keyword => keyword.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter(article => {
      // Apply category filter
      if (categoryFilter !== 'all') {
        return article.category.toLowerCase() === categoryFilter.toLowerCase();
      }
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'compensation':
          return parseInt(b.compensation) - parseInt(a.compensation);
        default:
          return 0;
      }
    });
  
  return (
    <Layout title="Review Articles | Researka" description="Review academic articles on Researka" activePage="review">
      <Box py={8} bg="gray.50" minH="calc(100vh - 64px)">
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <Box>
              <Heading as="h1" size="xl">Review Articles</Heading>
              <Text color="gray.600" mt={2}>
                Contribute to academic quality by reviewing articles in your area of expertise.
                Earn tokens and reputation for each completed review.
              </Text>
            </Box>
            
            {/* Search and Filter Section */}
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              gap={4}
              bg={bgColor}
              p={6}
              borderRadius="lg"
              boxShadow="sm"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <InputGroup flex="2">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Search by title, author, or keywords" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              
              <Select 
                placeholder="Filter by category" 
                flex="1"
                icon={<FiFilter />}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="blockchain">Blockchain</option>
                <option value="academic publishing">Academic Publishing</option>
                <option value="research funding">Research Funding</option>
                <option value="bibliometrics">Bibliometrics</option>
              </Select>
              
              <Select 
                placeholder="Sort by" 
                flex="1"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Most Recent</option>
                <option value="compensation">Highest Compensation</option>
              </Select>
            </Flex>
            
            {/* Articles Grid */}
            {filteredArticles.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {filteredArticles.map(article => (
                  <Card 
                    key={article.id} 
                    bg={bgColor}
                    borderRadius="lg"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor={borderColor}
                    transition="transform 0.2s, box-shadow 0.2s"
                    _hover={{ transform: 'translateY(-4px)', boxShadow: 'md' }}
                  >
                    <CardHeader pb={0}>
                      <Flex justify="space-between" align="start">
                        <Heading size="md" noOfLines={2}>{article.title}</Heading>
                        <Tooltip label="Save for later">
                          <IconButton
                            aria-label="Save article"
                            icon={<FiBookmark />}
                            variant="ghost"
                            size="sm"
                          />
                        </Tooltip>
                      </Flex>
                    </CardHeader>
                    
                    <CardBody>
                      <Text noOfLines={3} fontSize="sm" color="gray.600">
                        {article.abstract}
                      </Text>
                      
                      <Flex mt={4} gap={2} flexWrap="wrap">
                        {article.keywords.map((keyword, index) => (
                          <Tag key={index} size="sm" colorScheme="green" variant="subtle">
                            {keyword}
                          </Tag>
                        ))}
                      </Flex>
                      
                      <Divider my={4} />
                      
                      <Flex align="center" mt={2}>
                        <Avatar size="xs" name={article.author} mr={2} />
                        <Text fontSize="sm">{article.author}</Text>
                      </Flex>
                      
                      <Flex mt={3} gap={4} fontSize="xs" color="gray.500">
                        <Flex align="center">
                          <FiCalendar size={12} style={{ marginRight: '4px' }} />
                          <Text>{article.date}</Text>
                        </Flex>
                      </Flex>
                    </CardBody>
                    
                    <CardFooter pt={0}>
                      <VStack spacing={2} align="stretch" width="100%">
                        <Flex justify="space-between" align="center">
                          <Badge colorScheme="green">{article.compensation}</Badge>
                          <Badge colorScheme="blue">{article.category}</Badge>
                        </Flex>
                        
                        <Button 
                          colorScheme="green" 
                          leftIcon={<FiStar />} 
                          size="sm" 
                          width="100%"
                          as={Link}
                          href={`/review/${article.id}`}
                        >
                          Review This Article
                        </Button>
                      </VStack>
                    </CardFooter>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Box 
                textAlign="center" 
                py={10} 
                bg={bgColor}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Text fontSize="lg">No articles match your search criteria.</Text>
                <Button 
                  mt={4} 
                  colorScheme="green" 
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </Box>
            )}
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
          </Flex>
        </Container>
      </Box>
    </Layout>
  );
};

export default ReviewPage;
