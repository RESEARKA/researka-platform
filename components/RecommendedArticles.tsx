import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Heading,
  Text,
  Flex,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Button,
  Link,
  Divider,
  HStack,
  VStack,
  Tag,
  TagLabel,
  TagLeftIcon,
  Progress,
  Icon,
  Tooltip,
  useColorModeValue,
  Skeleton,
  SkeletonText,
  LinkProps
} from '@chakra-ui/react';
import { FiStar, FiUserCheck, FiClock, FiTrendingUp, FiFileText, FiEye, FiInfo } from 'react-icons/fi';
import { IconType } from 'react-icons';

// Create a forwarded ref component for FiInfo
const ForwardedFiInfo = React.forwardRef((props, ref) => {
  // Simple wrapper that doesn't actually use the ref
  // This is a workaround for the React warning
  return <FiInfo {...props} />;
});
ForwardedFiInfo.displayName = 'ForwardedFiInfo';

// Custom NextChakraLink component to properly integrate Next.js and Chakra UI
const NextChakraLink = React.forwardRef<HTMLAnchorElement, LinkProps & { href: string }>(
  ({ href, children, ...props }, ref) => {
    return (
      <NextLink href={href} passHref>
        <Link ref={ref} {...props}>
          {children}
        </Link>
      </NextLink>
    );
  }
);
NextChakraLink.displayName = 'NextChakraLink';

// Types
interface User {
  id: string;
  researchInterests: string[];
}

interface Article {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  categories: string[];
  authorId: string;
  publishedDate: string;
  views: number;
  citations: number;
  reviewCount: number;
  status: string;
}

interface EnhancedRecommendationResult {
  article: Article;
  matchType: string;
  score?: number;
}

// Mock data for demonstration
const MOCK_ARTICLES: Article[] = [
  {
    id: 'article1',
    title: 'Quantum Computing: A New Paradigm for Information Processing',
    abstract: 'This paper explores the potential of quantum computing to revolutionize information processing, focusing on recent advances in quantum algorithms and their applications in cryptography and optimization problems.',
    keywords: ['quantum-computing', 'quantum-algorithms', 'information-theory', 'cryptography'],
    categories: ['computer-science', 'quantum-physics'],
    authorId: 'author1',
    publishedDate: '2023-01-15',
    views: 1245,
    citations: 18,
    reviewCount: 1,
    status: 'under_review',
  },
  {
    id: 'article2',
    title: 'Climate Change Impacts on Marine Ecosystems: A Global Assessment',
    abstract: 'This comprehensive review examines the effects of climate change on marine ecosystems worldwide, synthesizing data from long-term studies and proposing adaptation strategies for conservation.',
    keywords: ['climate-change', 'marine-biology', 'conservation', 'ocean-acidification'],
    categories: ['environmental-science', 'marine-biology'],
    authorId: 'author2',
    publishedDate: '2023-02-20',
    views: 2130,
    citations: 27,
    reviewCount: 2,
    status: 'accepted',
  },
  {
    id: 'article3',
    title: 'Blockchain Technology in Academic Publishing: Opportunities and Challenges',
    abstract: 'This paper analyzes the potential applications of blockchain technology in academic publishing, addressing issues of peer review transparency, intellectual property rights, and citation tracking.',
    keywords: ['blockchain', 'academic-publishing', 'peer-review', 'decentralization'],
    categories: ['information-systems', 'scholarly-communication'],
    authorId: 'author3',
    publishedDate: '2023-03-10',
    views: 987,
    citations: 9,
    reviewCount: 0,
    status: 'pending',
  },
  {
    id: 'article4',
    title: 'Neural Networks for Natural Language Processing: Recent Advances',
    abstract: 'This survey paper examines recent developments in neural network architectures for natural language processing tasks, with a focus on transformer models and their applications in machine translation and text generation.',
    keywords: ['neural-networks', 'natural-language-processing', 'deep-learning', 'transformers'],
    categories: ['artificial-intelligence', 'computational-linguistics'],
    authorId: 'author4',
    publishedDate: '2023-04-05',
    views: 3450,
    citations: 42,
    reviewCount: 1,
    status: 'under_review',
  },
  {
    id: 'article5',
    title: 'Genetic Factors in Longevity: A Multi-generational Study',
    abstract: 'This longitudinal study investigates genetic markers associated with exceptional longevity across multiple generations, identifying key gene variants and their interactions with lifestyle factors.',
    keywords: ['genetics', 'longevity', 'aging', 'genomics'],
    categories: ['molecular-biology', 'genetics'],
    authorId: 'author5',
    publishedDate: '2023-05-12',
    views: 1876,
    citations: 23,
    reviewCount: 0,
    status: 'pending',
  },
  {
    id: 'article6',
    title: 'Sustainable Urban Planning: Integrating Green Infrastructure',
    abstract: 'This paper presents a framework for integrating green infrastructure into urban planning processes, with case studies from cities that have successfully implemented sustainable development practices.',
    keywords: ['urban-planning', 'sustainability', 'green-infrastructure', 'climate-resilience'],
    categories: ['urban-studies', 'environmental-planning'],
    authorId: 'author6',
    publishedDate: '2023-06-18',
    views: 1543,
    citations: 15,
    reviewCount: 1,
    status: 'under_review',
  },
  {
    id: 'article7',
    title: 'Artificial Intelligence Ethics: Addressing Algorithmic Bias',
    abstract: 'This paper examines the ethical challenges posed by algorithmic bias in artificial intelligence systems, proposing methodological approaches to detect and mitigate bias in machine learning models.',
    keywords: ['artificial-intelligence', 'ethics', 'algorithmic-bias', 'fairness'],
    categories: ['computer-ethics', 'artificial-intelligence'],
    authorId: 'author7',
    publishedDate: '2023-07-22',
    views: 2789,
    citations: 31,
    reviewCount: 2,
    status: 'accepted',
  },
  {
    id: 'article8',
    title: 'Advances in CRISPR Gene Editing for Genetic Disease Treatment',
    abstract: 'This review summarizes recent advances in CRISPR-Cas9 gene editing technologies and their applications in treating genetic diseases, discussing both clinical successes and remaining challenges.',
    keywords: ['crispr', 'gene-editing', 'genetic-diseases', 'molecular-medicine'],
    categories: ['genetics', 'biotechnology'],
    authorId: 'author8',
    publishedDate: '2023-08-30',
    views: 3210,
    citations: 38,
    reviewCount: 0,
    status: 'pending',
  },
  {
    id: 'article9',
    title: 'The Role of Microbiome in Mental Health: A Systematic Review',
    abstract: 'This systematic review explores the growing body of evidence linking gut microbiome composition to mental health outcomes, synthesizing findings from clinical and experimental studies.',
    keywords: ['microbiome', 'mental-health', 'gut-brain-axis', 'psychiatry'],
    categories: ['neuroscience', 'microbiology'],
    authorId: 'author9',
    publishedDate: '2023-09-15',
    views: 1876,
    citations: 19,
    reviewCount: 1,
    status: 'under_review',
  },
  {
    id: 'article10',
    title: 'Renewable Energy Integration: Challenges and Solutions',
    abstract: 'This paper addresses the technical, economic, and policy challenges of integrating high percentages of renewable energy into existing power grids, presenting case studies and potential solutions.',
    keywords: ['renewable-energy', 'energy-policy', 'grid-integration', 'sustainability'],
    categories: ['energy-systems', 'environmental-engineering'],
    authorId: 'author10',
    publishedDate: '2023-10-05',
    views: 1432,
    citations: 12,
    reviewCount: 0,
    status: 'pending',
  }
];

interface RecommendedArticlesProps {
  userId: string;
  userInterests: string[];
  limit?: number;
}

const RecommendedArticles: React.FC<RecommendedArticlesProps> = ({
  userId,
  userInterests,
  limit = 5
}) => {
  const [recommendations, setRecommendations] = useState<EnhancedRecommendationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allFields, setAllFields] = useState<Record<string, string>>({});
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    // In a real application, you would fetch articles from an API
    // For now, we'll use mock data
    
    // Create a map of field IDs to their names for display
    const fields = [
      { id: 'quantum-computing', name: 'Quantum Computing' },
      { id: 'quantum-algorithms', name: 'Quantum Algorithms' },
      { id: 'information-theory', name: 'Information Theory' },
      { id: 'cryptography', name: 'Cryptography' },
      { id: 'computer-science', name: 'Computer Science' },
      { id: 'quantum-physics', name: 'Quantum Physics' },
      { id: 'machine-learning', name: 'Machine Learning' },
      { id: 'neural-networks', name: 'Neural Networks' },
      { id: 'deep-learning', name: 'Deep Learning' },
      { id: 'artificial-intelligence', name: 'Artificial Intelligence' }
    ];
    
    const fieldMap = fields.reduce((acc: Record<string, string>, field: { id: string, name: string }) => {
      acc[field.id] = field.name;
      return acc;
    }, {} as Record<string, string>);
    setAllFields(fieldMap);
    
    // Create a user object from the props
    const user: User = {
      id: userId,
      researchInterests: userInterests
    };
    
    // Generate recommendations (simplified for this fix)
    const articleRecommendations: EnhancedRecommendationResult[] = MOCK_ARTICLES.slice(0, limit).map(article => ({
      article,
      matchType: 'interest',
      score: Math.random()
    }));
    
    // Simulate API delay
    setTimeout(() => {
      setRecommendations(articleRecommendations);
      setIsLoading(false);
    }, 1000);
  }, [userId, userInterests, limit]);
  
  // Get readable name for a field ID
  const getFieldName = (fieldId: string) => {
    return allFields[fieldId] || fieldId;
  };
  
  // Get icon and color for recommendation type
  const getRecommendationTypeInfo = (type: string) => {
    switch (type) {
      case 'interest':
        return { 
          icon: FiStar, 
          color: 'blue',
          label: 'Matches your interests'
        };
      case 'needs_reviews':
        return { 
          icon: FiUserCheck, 
          color: 'green',
          label: 'Needs reviewers'
        };
      case 'oldest':
        return { 
          icon: FiClock, 
          color: 'orange',
          label: 'Oldest pending'
        };
      case 'trending':
        return { 
          icon: FiTrendingUp, 
          color: 'purple',
          label: 'Trending'
        };
      default:
        return { 
          icon: FiFileText, 
          color: 'gray',
          label: 'Recommended'
        };
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h2" size="md">
          Recommended Articles
        </Heading>
        <Tooltip label="Articles are recommended based on your research interests and other factors">
          <Flex align="center">
            <Icon as={ForwardedFiInfo} mr={1} />
            <Text fontSize="sm" color="gray.500">How are these selected?</Text>
          </Flex>
        </Tooltip>
      </Flex>
      
      {isLoading ? (
        <VStack spacing={4} align="stretch">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="sm">
              <CardHeader pb={2}>
                <SkeletonText noOfLines={1} width="70%" skeletonHeight="6" />
              </CardHeader>
              <CardBody pt={0}>
                <SkeletonText mt={2} noOfLines={2} spacing={2} />
                <Flex mt={4} justify="space-between">
                  <Skeleton height="20px" width="40%" />
                  <Skeleton height="20px" width="20%" />
                </Flex>
              </CardBody>
            </Card>
          ))}
        </VStack>
      ) : recommendations.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {recommendations.map((recommendation) => {
            const typeInfo = getRecommendationTypeInfo(recommendation.matchType);
            
            return (
              <Card key={recommendation.article.id} bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="sm">
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="flex-start">
                    <Heading as="h3" size="sm" mb={1}>
                      <NextChakraLink 
                        href={`/articles/${recommendation.article.id}`}
                        color="blue.600" 
                        _hover={{ textDecoration: 'underline' }}
                      >
                        {recommendation.article.title}
                      </NextChakraLink>
                    </Heading>
                    
                    <Tag size="sm" colorScheme={typeInfo.color} ml={2} mt={1}>
                      <TagLeftIcon as={typeInfo.icon} />
                      <TagLabel>{typeInfo.label}</TagLabel>
                    </Tag>
                  </Flex>
                  
                  <Flex gap={2} flexWrap="wrap">
                    {recommendation.article.keywords.slice(0, 3).map((keyword: string) => (
                      <Badge key={keyword} colorScheme="blue" variant="subtle" fontSize="xs">
                        {getFieldName(keyword)}
                      </Badge>
                    ))}
                    {recommendation.article.keywords.length > 3 && (
                      <Badge colorScheme="gray" variant="outline" fontSize="xs">
                        +{recommendation.article.keywords.length - 3} more
                      </Badge>
                    )}
                  </Flex>
                </CardHeader>
                <CardBody pt={0}>
                  <Text fontSize="sm" noOfLines={2} mb={3} color="gray.600">
                    {recommendation.article.abstract}
                  </Text>
                  
                  <Divider my={2} />
                  
                  <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                    <HStack spacing={3}>
                      <Flex align="center">
                        <Icon as={FiEye} mr={1} color="gray.500" />
                        <Text fontSize="xs" color="gray.500">{recommendation.article.views} views</Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FiFileText} mr={1} color="gray.500" />
                        <Text fontSize="xs" color="gray.500">{recommendation.article.citations} citations</Text>
                      </Flex>
                    </HStack>
                    
                    <Flex align="center" gap={2}>
                      {recommendation.matchType === 'needs_reviews' && (
                        <Badge colorScheme="green" variant="solid" fontSize="xs">
                          {recommendation.article.reviewCount}/2 reviews
                        </Badge>
                      )}
                      
                      <NextLink href={`/articles/${recommendation.article.id}`} passHref>
                        <Button 
                          as={Link}
                          size="xs" 
                          colorScheme="blue"
                        >
                          View Details
                        </Button>
                      </NextLink>
                    </Flex>
                  </Flex>
                </CardBody>
              </Card>
            );
          })}
        </VStack>
      ) : (
        <Box textAlign="center" py={8}>
          <Text color="gray.500">No recommended articles available. Try adding more research interests to your profile.</Text>
        </Box>
      )}
    </Box>
  );
};

export default RecommendedArticles;
