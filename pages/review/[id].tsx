import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Tag,
  Divider,
  Image,
  Flex,
  Button,
  Textarea,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  useToast,
  useColorModeValue,
  Skeleton,
  Link,
  Select,
  Checkbox,
  FormErrorMessage,
  Tooltip,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  FormHelperText,
  UnorderedList,
  ListItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { FiArrowLeft, FiCalendar, FiStar, FiCheck, FiInfo, FiSave } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { useWallet } from '../../frontend/src/contexts/WalletContext';

// Article interface
interface Article {
  id?: string | number;
  title: string;
  abstract: string;
  category: string;
  keywords: string[];
  author: string;
  date: string;
  compensation: string;
  status: string;
  createdAt?: any; // For Firebase Timestamp
  // Additional fields for the full article view
  introduction?: string;
  methods?: string;
  results?: string;
  discussion?: string;
  references?: string;
  funding?: string;
  ethicalApprovals?: string;
  dataAvailability?: string;
  conflicts?: string;
  license?: string;
  content?: string;
}

const ReviewArticlePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { account } = useWallet();
  const toast = useToast();

  // Form state
  const [overallRecommendation, setOverallRecommendation] = useState('');
  const [commentsToAuthor, setCommentsToAuthor] = useState('');
  const [confidentialComments, setConfidentialComments] = useState('');
  const [noConflictOfInterest, setNoConflictOfInterest] = useState(false);
  const [openIdentity, setOpenIdentity] = useState(false);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);
  
  // Structured evaluation criteria
  const [originalityRating, setOriginalityRating] = useState('3');
  const [originalityComments, setOriginalityComments] = useState('');
  const [significanceRating, setSignificanceRating] = useState('3');
  const [significanceComments, setSignificanceComments] = useState('');
  const [technicalQualityRating, setTechnicalQualityRating] = useState('3');
  const [technicalQualityComments, setTechnicalQualityComments] = useState('');
  const [clarityRating, setClarityRating] = useState('3');
  const [clarityComments, setClarityComments] = useState('');
  const [relevanceRating, setRelevanceRating] = useState('3');
  const [relevanceComments, setRelevanceComments] = useState('');

  // Form validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Image URLs for different article categories
  const imageUrls = {
    'Blockchain': 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    'Academic Publishing': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    'Research Funding': 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    'Bibliometrics': 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
    'DEFAULT': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80'
  };

  // Check if user is logged in and profile is complete
  React.useEffect(() => {
    // Client-side only
    if (typeof window !== 'undefined') {
      console.log('ReviewArticlePage: Checking authentication');
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      console.log('ReviewArticlePage: isLoggedIn =', isLoggedIn);
      
      // Temporarily disable the login check for debugging
      // if (isLoggedIn !== 'true') {
      //   // Redirect to homepage if not logged in
      //   console.log('ReviewArticlePage: Not logged in, redirecting to homepage');
      //   router.push('/');
      //   return;
      // }
      
      // // Check if profile is complete
      // const profileComplete = localStorage.getItem('profileComplete');
      // console.log('ReviewArticlePage: profileComplete =', profileComplete);
      
      // if (profileComplete !== 'true') {
      //   // Redirect to profile page to complete profile
      //   console.log('ReviewArticlePage: Profile not complete, redirecting to profile page');
      //   router.push('/profile');
      //   return;
      // }
      
      console.log('ReviewArticlePage: Authentication check passed');
    }
  }, [router]);

  useEffect(() => {
    if (router.isReady && id) {
      setLoading(true);
      console.log(`ReviewArticlePage: Loading article with ID: ${id}`);
      
      const loadArticle = async () => {
        try {
          // Get article from Firebase
          const { getArticleById } = await import('../../services/articleService');
          console.log(`ReviewArticlePage: Calling getArticleById with ID: ${id}`);
          
          const firebaseArticle = await getArticleById(id as string);
          
          if (firebaseArticle) {
            console.log(`ReviewArticlePage: Article loaded successfully: ${firebaseArticle.title}`);
            setArticle(firebaseArticle);
            setError(null);
          } else {
            console.error(`ReviewArticlePage: Article not found with ID: ${id}`);
            setError('Article not found');
            toast({
              title: 'Error',
              description: `Article with ID ${id} not found`,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
        } catch (error) {
          console.error('ReviewArticlePage: Error loading article:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setError(`Error loading article: ${errorMessage}`);
          toast({
            title: 'Error',
            description: `Failed to load article: ${errorMessage}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      };
      
      loadArticle();
    }
  }, [id, router.isReady, toast]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const missingFields: string[] = [];
    
    // Check for all required fields regardless of wallet connection
    if (!overallRecommendation) {
      errors.overallRecommendation = 'Overall recommendation is required';
      missingFields.push('Overall Recommendation');
    }
    
    if (!commentsToAuthor.trim()) {
      errors.commentsToAuthor = 'Comments to author are required';
      missingFields.push('Comments to Author');
    }
    
    if (!noConflictOfInterest) {
      errors.noConflictOfInterest = 'You must declare no conflict of interest';
      missingFields.push('Conflict of Interest Declaration');
    }
    
    if (!openIdentity) {
      errors.openIdentity = 'You must agree to open identity';
      missingFields.push('Identity Disclosure');
    }
    
    if (!agreedToGuidelines) {
      errors.agreedToGuidelines = 'You must agree to the review guidelines';
      missingFields.push('Guidelines Agreement');
    }
    
    // Check if any of the ratings are missing
    if (!originalityRating) {
      missingFields.push('Originality Rating');
      errors.ratings = 'All ratings are required';
    }
    
    if (!significanceRating) {
      missingFields.push('Significance Rating');
      errors.ratings = 'All ratings are required';
    }
    
    if (!technicalQualityRating) {
      missingFields.push('Technical Quality Rating');
      errors.ratings = 'All ratings are required';
    }
    
    if (!clarityRating) {
      missingFields.push('Clarity Rating');
      errors.ratings = 'All ratings are required';
    }
    
    if (!relevanceRating) {
      missingFields.push('Relevance Rating');
      errors.ratings = 'All ratings are required';
    }
    
    // Update form errors state regardless of wallet connection
    setFormErrors(errors);
    
    // Temporarily disable wallet check
    // if (!account) {
    //   // Show wallet connection error along with any form errors
    //   toast({
    //     title: 'Authentication required',
    //     description: 'Please connect your wallet to submit a review. Also ensure all required fields are completed.',
    //     status: 'warning',
    //     duration: 7000,
    //     isClosable: true,
    //   });
    //   return false;
    // }
    
    // If there are errors, show them and stop submission
    if (Object.keys(errors).length > 0) {
      // Create a summary of missing fields
      const missingFieldsText = missingFields.length > 0 
        ? `Missing fields: ${missingFields.join(', ')}`
        : 'Please fill in all required fields';
      
      toast({
        title: 'Form validation failed',
        description: missingFieldsText,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
      return false;
    }
    
    // Clear any previous errors
    setFormErrors({});
    return true;
  };

  const handleSubmitReview = () => {
    if (validateForm()) {
      setIsSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        toast({
          title: 'Review submitted',
          description: `You've earned ${article?.compensation} for your contribution!`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setIsSubmitting(false);
        router.push('/review');
      }, 2000);
    }
  };

  const handleSaveDraft = () => {
    setIsSavingDraft(true);
    
    // Simulate saving draft
    setTimeout(() => {
      toast({
        title: 'Draft saved',
        description: 'Your review draft has been saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsSavingDraft(false);
    }, 1000);
  };

  if (loading) {
    return (
      <Layout>
        <Container maxW="container.xl" py={8}>
          <Skeleton height="400px" mb={6} />
          <Skeleton height="20px" mb={2} />
          <Skeleton height="20px" mb={2} />
          <Skeleton height="20px" mb={6} />
          <Skeleton height="200px" />
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container maxW="container.xl" py={8}>
          <Box textAlign="center" py={10}>
            <Heading as="h2" size="xl" mb={4}>
              {error}
            </Heading>
            <Text mb={6}>The article you're looking for could not be found.</Text>
            <Button 
              leftIcon={<FiArrowLeft />} 
              colorScheme="green" 
              onClick={() => router.push('/review')}
            >
              Back to Review Page
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        {/* Back button */}
        <Button 
          leftIcon={<FiArrowLeft />} 
          variant="ghost" 
          mb={6} 
          onClick={() => router.push('/review')}
        >
          Back to Review Page
        </Button>

        {/* Article header */}
        <Box 
          position="relative" 
          height="400px" 
          mb={6} 
          borderRadius="lg" 
          overflow="hidden"
        >
          <Image 
            src={imageUrls[article?.category as keyof typeof imageUrls] || imageUrls.DEFAULT} 
            alt={article?.title} 
            objectFit="cover" 
            width="100%" 
            height="100%" 
          />
          <Box 
            position="absolute" 
            bottom={0} 
            left={0} 
            right={0} 
            bg="rgba(0,0,0,0.7)" 
            p={6}
          >
            <Heading as="h1" size="xl" color="white">
              {article?.title}
            </Heading>
            <HStack mt={2} spacing={4}>
              <Text color="white">{article?.author}</Text>
              <Flex align="center">
                <FiCalendar color="white" style={{ marginRight: '4px' }} />
                <Text color="white">{article?.date}</Text>
              </Flex>
            </HStack>
          </Box>
        </Box>

        {/* Article content */}
        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
          <Box 
            flex="2" 
            bg={bgColor} 
            p={6} 
            borderRadius="lg" 
            boxShadow="sm" 
            borderWidth="1px" 
            borderColor={borderColor}
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Abstract
            </Text>
            <Text mb={6}>{article?.abstract}</Text>
            
            <Divider my={6} />
            
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Full Paper
            </Text>
            <Box 
              sx={{
                'h1': { fontSize: '2xl', fontWeight: 'bold', my: 4 },
                'h2': { fontSize: 'xl', fontWeight: 'bold', my: 3 },
                'p': { my: 2 },
                'ul, ol': { pl: 6, my: 2 },
                'li': { my: 1 },
              }}
            >
              {article?.content ? (
                article.content.split('\n').map((line: string, index: number) => (
                  <Text key={index} whiteSpace="pre-wrap">
                    {line}
                  </Text>
                ))
              ) : (
                <Text>No content available for this article.</Text>
              )}
            </Box>
            
            <Flex mt={6} gap={2} flexWrap="wrap">
              {article?.keywords.map((keyword: string, index: number) => (
                <Tag key={index} size="md" colorScheme="green" variant="subtle">
                  {keyword}
                </Tag>
              ))}
            </Flex>
          </Box>
          
          {/* Review submission form */}
          <Box 
            flex="1" 
            bg={bgColor} 
            p={6} 
            borderRadius="lg" 
            boxShadow="sm" 
            borderWidth="1px" 
            borderColor={borderColor}
            position="sticky"
            top="20px"
            alignSelf="flex-start"
          >
            <Heading as="h2" size="lg" mb={6}>
              Submit Your Review
            </Heading>
            
            <VStack spacing={6} align="stretch">
              {/* 1. Structured Evaluation Criteria (Top) */}
              <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} bg={bgColor}>
                <Heading as="h3" size="md" mb={4}>
                  Structured Evaluation Criteria
                </Heading>
                
                {formErrors.ratings && (
                  <Box mb={4} p={2} bg="red.50" color="red.500" borderRadius="md">
                    <Text>{formErrors.ratings}</Text>
                  </Box>
                )}
                
                <Tabs variant="enclosed" colorScheme="green">
                  <TabList>
                    <Tab>Originality</Tab>
                    <Tab>Significance</Tab>
                    <Tab>Technical Quality</Tab>
                    <Tab>Clarity</Tab>
                    <Tab>Relevance</Tab>
                  </TabList>
                  
                  <TabPanels>
                    <TabPanel>
                      <FormControl isRequired>
                        <FormLabel>Originality Rating (1-5)</FormLabel>
                        <HStack spacing={2}>
                          <Text fontSize="sm" color="gray.500">Poor</Text>
                          <RadioGroup value={originalityRating} onChange={setOriginalityRating}>
                            <Stack direction="row" spacing={4}>
                              <Radio value="1">1</Radio>
                              <Radio value="2">2</Radio>
                              <Radio value="3">3</Radio>
                              <Radio value="4">4</Radio>
                              <Radio value="5">5</Radio>
                            </Stack>
                          </RadioGroup>
                          <Text fontSize="sm" color="gray.500">Excellent</Text>
                        </HStack>
                        <FormHelperText>
                          Rate how original and innovative the research is
                        </FormHelperText>
                      </FormControl>
                      
                      <FormControl mt={4}>
                        <FormLabel>Originality Comments (Optional)</FormLabel>
                        <Textarea 
                          placeholder="Provide your comments on the originality of the article..." 
                          value={originalityComments}
                          onChange={(e) => setOriginalityComments(e.target.value)}
                          minHeight="100px"
                        />
                      </FormControl>
                    </TabPanel>
                    
                    <TabPanel>
                      <FormControl isRequired>
                        <FormLabel>Significance Rating (1-5)</FormLabel>
                        <HStack spacing={2}>
                          <Text fontSize="sm" color="gray.500">Poor</Text>
                          <RadioGroup value={significanceRating} onChange={setSignificanceRating}>
                            <Stack direction="row" spacing={4}>
                              <Radio value="1">1</Radio>
                              <Radio value="2">2</Radio>
                              <Radio value="3">3</Radio>
                              <Radio value="4">4</Radio>
                              <Radio value="5">5</Radio>
                            </Stack>
                          </RadioGroup>
                          <Text fontSize="sm" color="gray.500">Excellent</Text>
                        </HStack>
                        <FormHelperText>
                          Rate the importance and impact of the research
                        </FormHelperText>
                      </FormControl>
                      
                      <FormControl mt={4}>
                        <FormLabel>Significance Comments (Optional)</FormLabel>
                        <Textarea 
                          placeholder="Provide your comments on the significance of the article..." 
                          value={significanceComments}
                          onChange={(e) => setSignificanceComments(e.target.value)}
                          minHeight="100px"
                        />
                      </FormControl>
                    </TabPanel>
                    
                    <TabPanel>
                      <FormControl isRequired>
                        <FormLabel>Technical Quality Rating (1-5)</FormLabel>
                        <HStack spacing={2}>
                          <Text fontSize="sm" color="gray.500">Poor</Text>
                          <RadioGroup value={technicalQualityRating} onChange={setTechnicalQualityRating}>
                            <Stack direction="row" spacing={4}>
                              <Radio value="1">1</Radio>
                              <Radio value="2">2</Radio>
                              <Radio value="3">3</Radio>
                              <Radio value="4">4</Radio>
                              <Radio value="5">5</Radio>
                            </Stack>
                          </RadioGroup>
                          <Text fontSize="sm" color="gray.500">Excellent</Text>
                        </HStack>
                        <FormHelperText>
                          Rate the methodological rigor and technical execution
                        </FormHelperText>
                      </FormControl>
                      
                      <FormControl mt={4}>
                        <FormLabel>Technical Quality Comments (Optional)</FormLabel>
                        <Textarea 
                          placeholder="Provide your comments on the technical quality of the article..." 
                          value={technicalQualityComments}
                          onChange={(e) => setTechnicalQualityComments(e.target.value)}
                          minHeight="100px"
                        />
                      </FormControl>
                    </TabPanel>
                    
                    <TabPanel>
                      <FormControl isRequired>
                        <FormLabel>Clarity Rating (1-5)</FormLabel>
                        <HStack spacing={2}>
                          <Text fontSize="sm" color="gray.500">Poor</Text>
                          <RadioGroup value={clarityRating} onChange={setClarityRating}>
                            <Stack direction="row" spacing={4}>
                              <Radio value="1">1</Radio>
                              <Radio value="2">2</Radio>
                              <Radio value="3">3</Radio>
                              <Radio value="4">4</Radio>
                              <Radio value="5">5</Radio>
                            </Stack>
                          </RadioGroup>
                          <Text fontSize="sm" color="gray.500">Excellent</Text>
                        </HStack>
                        <FormHelperText>
                          Rate how well-written and clearly presented the research is
                        </FormHelperText>
                      </FormControl>
                      
                      <FormControl mt={4}>
                        <FormLabel>Clarity Comments (Optional)</FormLabel>
                        <Textarea 
                          placeholder="Provide your comments on the clarity of the article..." 
                          value={clarityComments}
                          onChange={(e) => setClarityComments(e.target.value)}
                          minHeight="100px"
                        />
                      </FormControl>
                    </TabPanel>
                    
                    <TabPanel>
                      <FormControl isRequired>
                        <FormLabel>Relevance Rating (1-5)</FormLabel>
                        <HStack spacing={2}>
                          <Text fontSize="sm" color="gray.500">Poor</Text>
                          <RadioGroup value={relevanceRating} onChange={setRelevanceRating}>
                            <Stack direction="row" spacing={4}>
                              <Radio value="1">1</Radio>
                              <Radio value="2">2</Radio>
                              <Radio value="3">3</Radio>
                              <Radio value="4">4</Radio>
                              <Radio value="5">5</Radio>
                            </Stack>
                          </RadioGroup>
                          <Text fontSize="sm" color="gray.500">Excellent</Text>
                        </HStack>
                        <FormHelperText>
                          Rate how relevant the research is to the field
                        </FormHelperText>
                      </FormControl>
                      
                      <FormControl mt={4}>
                        <FormLabel>Relevance Comments (Optional)</FormLabel>
                        <Textarea 
                          placeholder="Provide your comments on the relevance of the article..." 
                          value={relevanceComments}
                          onChange={(e) => setRelevanceComments(e.target.value)}
                          minHeight="100px"
                        />
                      </FormControl>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
              
              {/* 2. Comments to Author */}
              <FormControl isInvalid={!!formErrors.commentsToAuthor} isRequired>
                <FormLabel>Comments to Author</FormLabel>
                <Textarea 
                  placeholder="Provide your comments to the author here..." 
                  value={commentsToAuthor}
                  onChange={(e) => setCommentsToAuthor(e.target.value)}
                  minHeight="200px"
                />
                <FormHelperText>
                  Address originality, methodology, clarity, and relevance in your feedback.
                </FormHelperText>
                {formErrors.commentsToAuthor && (
                  <FormErrorMessage>{formErrors.commentsToAuthor}</FormErrorMessage>
                )}
              </FormControl>
              
              {/* 3. Confidential Comments to Editor */}
              <FormControl>
                <FormLabel>Confidential Comments to Editor</FormLabel>
                <Textarea 
                  placeholder="Provide any confidential comments here..." 
                  value={confidentialComments}
                  onChange={(e) => setConfidentialComments(e.target.value)}
                  minHeight="150px"
                />
                <FormHelperText>
                  These comments will not be shared with the author.
                </FormHelperText>
              </FormControl>
              
              {/* 4. Overall Recommendation */}
              <FormControl isInvalid={!!formErrors.overallRecommendation} isRequired>
                <FormLabel>Overall Recommendation</FormLabel>
                <RadioGroup value={overallRecommendation} onChange={setOverallRecommendation}>
                  <Stack direction="row">
                    <Radio value="Accept">Accept</Radio>
                    <Radio value="Minor Revisions">Minor Revisions</Radio>
                    <Radio value="Major Revisions">Major Revisions</Radio>
                    <Radio value="Reject">Reject</Radio>
                  </Stack>
                </RadioGroup>
                {formErrors.overallRecommendation && (
                  <FormErrorMessage>{formErrors.overallRecommendation}</FormErrorMessage>
                )}
              </FormControl>
              
              {/* 5. Reviewer Identity & Disclaimers */}
              <Box p={4} bg="gray.50" borderRadius="md">
                <Heading as="h3" size="md" mb={4}>
                  Reviewer Identity
                </Heading>
                
                <Text mb={4}>
                  Reviewed by: {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Anonymous (Wallet connection optional)'}
                </Text>
                
                <FormControl isInvalid={!!formErrors.openIdentity} isRequired mb={4}>
                  <Checkbox 
                    isChecked={openIdentity} 
                    onChange={(e) => setOpenIdentity(e.target.checked)}
                  >
                    I agree to have my identity revealed to the authors.
                  </Checkbox>
                  {formErrors.openIdentity && (
                    <FormErrorMessage>{formErrors.openIdentity}</FormErrorMessage>
                  )}
                </FormControl>
                
                <FormControl isInvalid={!!formErrors.noConflictOfInterest} isRequired>
                  <Checkbox 
                    isChecked={noConflictOfInterest} 
                    onChange={(e) => setNoConflictOfInterest(e.target.checked)}
                  >
                    I declare that I have no conflict of interest with the authors or the research presented in this article.
                  </Checkbox>
                  {formErrors.noConflictOfInterest && (
                    <FormErrorMessage>{formErrors.noConflictOfInterest}</FormErrorMessage>
                  )}
                </FormControl>
              </Box>
              
              <FormControl isInvalid={!!formErrors.agreedToGuidelines} isRequired>
                <Checkbox 
                  isChecked={agreedToGuidelines} 
                  onChange={(e) => setAgreedToGuidelines(e.target.checked)}
                >
                  I have read and agreed to the review guidelines and ethical standards.
                </Checkbox>
                {formErrors.agreedToGuidelines && (
                  <FormErrorMessage>{formErrors.agreedToGuidelines}</FormErrorMessage>
                )}
              </FormControl>
              
              {/* Review Compensation */}
              <Box p={4} borderWidth="1px" borderRadius="md" borderColor="green.200" bg="green.50">
                <Heading as="h3" size="md" mb={4} color="green.700">
                  Review Compensation
                </Heading>
                <HStack spacing={3} align="center">
                  <Box p={3} borderRadius="full" bg="green.100">
                    <FiStar size="24px" color="green" />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xl" fontWeight="bold">{article?.compensation}</Text>
                    <Text fontSize="sm" color="gray.600">will be awarded upon acceptance</Text>
                  </VStack>
                </HStack>
                {!account && (
                  <Alert status="info" mt={3} borderRadius="md" fontSize="sm">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Wallet connection will be required in the future</AlertTitle>
                      <AlertDescription>
                        To receive RESKA tokens, you'll need to connect a wallet in the future. This requirement is temporarily disabled during development.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </Box>
              
              {/* 6. Save Draft / Submit */}
              <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} bg={bgColor}>
                <Heading as="h3" size="md" mb={4}>
                  Final Review Submission
                </Heading>
                
                <Text mb={4}>
                  Please ensure you have completed all required sections before submitting your review.
                  All fields marked with * are mandatory.
                </Text>
                
                {Object.keys(formErrors).length > 0 && (
                  <Box mb={4} p={3} bg="red.50" color="red.500" borderRadius="md" borderWidth="1px" borderColor="red.200">
                    <Heading as="h4" size="sm" color="red.600" mb={2}>
                      Please correct the following errors:
                    </Heading>
                    <UnorderedList color="red.600" pl={4}>
                      {formErrors.overallRecommendation && (
                        <ListItem>Overall recommendation is required</ListItem>
                      )}
                      {formErrors.commentsToAuthor && (
                        <ListItem>Comments to author are required</ListItem>
                      )}
                      {formErrors.ratings && (
                        <ListItem>All ratings are required</ListItem>
                      )}
                      {formErrors.noConflictOfInterest && (
                        <ListItem>Conflict of interest declaration is required</ListItem>
                      )}
                      {formErrors.openIdentity && (
                        <ListItem>Identity disclosure agreement is required</ListItem>
                      )}
                      {formErrors.agreedToGuidelines && (
                        <ListItem>Guidelines agreement is required</ListItem>
                      )}
                    </UnorderedList>
                  </Box>
                )}
                
                <HStack spacing={4}>
                  <Button 
                    colorScheme="gray" 
                    size="lg" 
                    leftIcon={<FiSave />}
                    isLoading={isSavingDraft}
                    loadingText="Saving..."
                    onClick={handleSaveDraft}
                    flex="1"
                  >
                    Save Draft
                  </Button>
                  
                  <Button 
                    colorScheme="green" 
                    size="lg" 
                    leftIcon={<FiCheck />}
                    isLoading={isSubmitting}
                    loadingText="Submitting..."
                    onClick={handleSubmitReview}
                    flex="1"
                  >
                    Submit Review
                  </Button>
                </HStack>
                
                <Text fontSize="sm" color="gray.500" mt={4}>
                  By submitting your review, you agree to our review guidelines and terms of service.
                </Text>
              </Box>
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Layout>
  );
};

export default ReviewArticlePage;
