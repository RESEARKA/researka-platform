import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
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
  Tag,
  Avatar,
  Tooltip,
  IconButton,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiStar, FiCalendar, FiBookmark } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAccessLevel, UserAccessLevel } from '../../utils/accessLevels';
import { ReviewContentProps } from './types';

const ReviewContent: React.FC<ReviewContentProps> = ({
  loading,
  error,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  filteredArticles,
  bgColor = 'white',
  borderColor = 'gray.200',
}) => {
  const router = useRouter();
  const { currentUser, getUserProfile } = useAuth();
  const [profileChecked, setProfileChecked] = React.useState(false);
  const [accessLevel, setAccessLevel] = React.useState<UserAccessLevel>(UserAccessLevel.BASIC);

  // Check user's access level
  React.useEffect(() => {
    const checkAccess = async () => {
      if (currentUser) {
        try {
          // Get the user's profile
          const userProfile = await getUserProfile(currentUser.uid);
          const level = getUserAccessLevel(userProfile);
          setAccessLevel(level);
        } catch (error) {
          console.error('Error checking user access level:', error);
        }
      }
      setProfileChecked(true);
    };

    checkAccess();
  }, [currentUser, getUserProfile]);

  return (
    <Box py={8} bg="gray.50" minH="calc(100vh - 64px)">
      <VStack spacing={8} align="stretch">
        <Box mb={6}>
          <Heading as="h1" size="xl" mb={2}>Review Articles</Heading>
          <Text color="gray.600" mt={2}>
            Contribute to academic quality by reviewing articles in your area of expertise.
            Earn tokens and reputation for each completed review.
          </Text>
        </Box>
        
        {/* Show loading or profile completion message if needed */}
        {!profileChecked ? (
          <VStack spacing={4} py={10}>
            <Text>Checking your profile...</Text>
            <Spinner />
          </VStack>
        ) : accessLevel === UserAccessLevel.BASIC ? (
          <VStack spacing={4} py={10}>
            <Text>Please complete your profile to access the review page.</Text>
            <Button 
              colorScheme="blue" 
              onClick={() => router.push('/simple-profile?returnUrl=/review')}
            >
              Go to Profile
            </Button>
          </VStack>
        ) : (
          <>
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
            {loading ? (
              <Box 
                textAlign="center" 
                py={10} 
                bg={bgColor}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Text fontSize="lg">Loading articles...</Text>
              </Box>
            ) : error ? (
              <Box 
                textAlign="center" 
                py={10} 
                bg={bgColor}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Text fontSize="lg">{error}</Text>
              </Box>
            ) : filteredArticles.length > 0 ? (
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
                          onClick={() => {
                            console.log(`Navigating to article review page: /articles/${article.id}/review`);
                            router.push(`/articles/${article.id}/review`);
                          }}
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
          </>
        )}
      </VStack>
    </Box>
  );
};

export default ReviewContent;
