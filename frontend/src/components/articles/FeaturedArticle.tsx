import React from 'react';
import { Box, Heading, Text, Flex, Badge, Image, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link';

interface FeaturedArticleProps {
  title: string;
  abstract: string;
  authors: string[];
  categories: string[];
  date: string;
  views: number;
  imageUrl?: string;
  articleId: string;
}

const FeaturedArticle: React.FC<FeaturedArticleProps> = ({
  title,
  abstract,
  authors,
  categories,
  date,
  views,
  imageUrl = '/images/article-placeholder.jpg',
  articleId,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Link href={`/article/${articleId}`} passHref>
      <Box
        as="article"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        bg={bgColor}
        borderColor={borderColor}
        transition="all 0.3s"
        _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
        cursor="pointer"
        height="100%"
        display="flex"
        flexDirection="column"
      >
        <Image
          src={imageUrl}
          alt={title}
          objectFit="cover"
          height="200px"
          width="100%"
        />
        
        <Flex direction="column" p={6} flex="1">
          <Flex mb={2} wrap="wrap" gap={2}>
            {categories.map((category) => (
              <Badge 
                key={category} 
                colorScheme="teal" 
                fontSize="xs"
                borderRadius="full"
                px={2}
                py={1}
              >
                {category}
              </Badge>
            ))}
          </Flex>
          
          <Heading as="h3" size="md" mb={2} lineHeight="tight">
            {title}
          </Heading>
          
          <Text fontSize="sm" color="gray.500" mb={2}>
            By {authors.join(', ')}
          </Text>
          
          <Text noOfLines={3} mb={4} flex="1">
            {abstract}
          </Text>
          
          <Flex justify="space-between" fontSize="sm" color="gray.500" mt="auto">
            <Flex align="center">
              <Box as="span" mr={1}>
                <Box as="span" fontSize="md" mr={1}>
                  📅
                </Box>
                {date}
              </Box>
            </Flex>
            <Flex align="center">
              <Box as="span" mr={1}>
                <Box as="span" fontSize="md" mr={1}>
                  👁️
                </Box>
                {views} views
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Link>
  );
};

export default FeaturedArticle;
