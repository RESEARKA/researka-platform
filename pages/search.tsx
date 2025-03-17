"use client";

import React, { useState } from 'react';
import {
  Box,
  Container,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Heading,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Stack,
  Divider,
  CardFooter,
  ButtonGroup,
  Image,
  Tag,
  Skeleton,
  useColorModeValue
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import Layout from '../components/Layout';
import { getRandomArticles, Article } from '../data/articles';

// Sample search results
const SAMPLE_RESULTS: Article[] = getRandomArticles(6);

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(SAMPLE_RESULTS);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      // In a real app, this would call an API
      const filteredResults = SAMPLE_RESULTS.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.abstract.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(filteredResults.length > 0 ? filteredResults : SAMPLE_RESULTS);
      setIsSearching(false);
    }, 800);
  };

  return (
    <Layout title="Search | Researka" description="Search for research papers on Researka" activePage="search">
      <Container maxW="container.xl" py={8}>
        <Heading as="h1" size="xl" mb={6}>Search</Heading>
        
        <Box as="form" onSubmit={handleSearch} mb={10}>
          <InputGroup size="lg" maxW="container.md" mx="auto">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search for research papers, authors, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="md"
              bg={useColorModeValue('white', 'gray.700')}
              border="1px"
              borderColor="gray.300"
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
            />
            <Button
              ml={2}
              colorScheme="blue"
              isLoading={isSearching}
              type="submit"
            >
              Search
            </Button>
          </InputGroup>
        </Box>
        
        {searchResults.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Heading as="h3" size="md" color="gray.500">No results found</Heading>
            <Text mt={2}>Try different keywords or browse our featured articles</Text>
          </Box>
        ) : (
          <>
            <Text mb={4} fontSize="lg" fontWeight="medium">
              {isSearching ? 'Searching...' : `Showing ${searchResults.length} results`}
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {searchResults.map((article, index) => (
                <Card key={index} maxW="100%" borderRadius="lg" overflow="hidden" boxShadow="md">
                  <CardBody>
                    <Image
                      src={article.imageUrl || 'https://via.placeholder.com/400x200?text=Research+Paper'}
                      alt={article.title}
                      borderRadius="md"
                      mb={4}
                      objectFit="cover"
                      height="200px"
                      width="100%"
                    />
                    <Stack spacing={2}>
                      <Heading size="md">{article.title}</Heading>
                      <Text color="gray.500" fontSize="sm">
                        {article.authors} • {article.date}
                      </Text>
                      <Text noOfLines={3}>{article.abstract}</Text>
                      <Flex mt={2} flexWrap="wrap" gap={2}>
                        {article.categories.map((category: string, idx: number) => (
                          <Tag key={idx} size="sm" colorScheme="blue" borderRadius="full">
                            {category}
                          </Tag>
                        ))}
                      </Flex>
                    </Stack>
                  </CardBody>
                  <Divider />
                  <CardFooter>
                    <ButtonGroup spacing={2}>
                      <Button
                        variant="solid"
                        colorScheme="blue"
                        size="sm"
                        onClick={() => window.location.href = `/article/${article.id}`}
                      >
                        Read Paper
                      </Button>
                      <Button
                        variant="ghost"
                        colorScheme="gray"
                        size="sm"
                      >
                        Save
                      </Button>
                    </ButtonGroup>
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default Search;
