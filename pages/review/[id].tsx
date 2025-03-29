import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Heading,
  Stack,
  Text,
  Textarea,
  RadioGroup,
  Radio,
  useToast,
  VStack,
  HStack,
  Spinner,
  Divider,
  Image,
  Tag,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Checkbox,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FiArrowLeft } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { useWallet } from '../../frontend/src/contexts/WalletContext';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Review } from '../../services/reviewService';

// Article interface
interface Article {
  id: string;
  title: string;
  abstract: string;
  content: string;
  author: string;
  date: string;
  compensation: string;
  keywords: string[];
}

// Form errors interface
interface FormErrors {
  overallRecommendation?: string;
  originalityRating?: string;
  significanceRating?: string;
  technicalQualityRating?: string;
  clarityRating?: string;
  relevanceRating?: string;
  commentsToAuthor?: string;
  openIdentity?: string;
  noConflictOfInterest?: string;
  agreedToGuidelines?: string;
}

const ReviewArticlePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { account } = useWallet();
  const toast = useToast();
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
  }, [auth]);

  // Form state
  const [overallRecommendation, setOverallRecommendation] = useState('');
  const [originalityRating, setOriginalityRating] = useState('3');
  const [significanceRating, setSignificanceRating] = useState('3');
  const [technicalQualityRating, setTechnicalQualityRating] = useState('3');
  const [clarityRating, setClarityRating] = useState('3');
  const [relevanceRating, setRelevanceRating] = useState('3');
  const [commentsToAuthor, setCommentsToAuthor] = useState('');
  const [confidentialComments, setConfidentialComments] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady && id) {
      setIsLoading(true);
      console.log(`ReviewArticlePage: Loading article with ID: ${id}`);
      
      const loadArticle = async () => {
        try {
          // Get article from Firebase
          const { getArticleById } = await import('../../services/articleService');
          console.log(`ReviewArticlePage: Calling getArticleById with ID: ${id}`);
          
          const firebaseArticle = await getArticleById(id as string);
          
          if (firebaseArticle) {
            console.log(`ReviewArticlePage: Article loaded successfully: ${firebaseArticle.title}`);
            // Ensure the article has all required properties including keywords
            const articleWithDefaults = {
              ...firebaseArticle,
              keywords: firebaseArticle.keywords || []
            };
            setArticle(articleWithDefaults as Article);
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
          setIsLoading(false);
        }
      };
      
      loadArticle();
    }
  }, [id, router.isReady, toast]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
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
    
    // Check if any of the ratings are missing
    if (!originalityRating) {
      missingFields.push('Originality Rating');
      errors.originalityRating = 'Originality rating is required';
    }
    
    if (!significanceRating) {
      missingFields.push('Significance Rating');
      errors.significanceRating = 'Significance rating is required';
    }
    
    if (!technicalQualityRating) {
      missingFields.push('Technical Quality Rating');
      errors.technicalQualityRating = 'Technical quality rating is required';
    }
    
    if (!clarityRating) {
      missingFields.push('Clarity Rating');
      errors.clarityRating = 'Clarity rating is required';
    }
    
    if (!relevanceRating) {
      missingFields.push('Relevance Rating');
      errors.relevanceRating = 'Relevance rating is required';
    }
    
    // Update form errors state regardless of wallet connection
    setFormErrors(errors);
    
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
      
      // Create the review data object with proper typing
      const reviewData: Omit<Review, 'id' | 'createdAt'> = {
        articleId: id as string,
        articleTitle: article?.title || 'Unknown Article',
        reviewerId: currentUser?.uid || 'anonymous', // Use Firebase user ID
        reviewerName: account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Anonymous Reviewer',
        score: parseInt(originalityRating) + parseInt(significanceRating) + parseInt(technicalQualityRating) + parseInt(clarityRating) + parseInt(relevanceRating),
        recommendation: (overallRecommendation === 'Accept' ? 'accept' : 
                      overallRecommendation === 'Minor Revisions' ? 'minor_revisions' : 
                      overallRecommendation === 'Major Revisions' ? 'major_revisions' : 'reject') as 'accept' | 'minor_revisions' | 'major_revisions' | 'reject',
        content: commentsToAuthor,
        date: new Date().toISOString().split('T')[0],
      };
      
      // Submit the review to Firebase
      const submitReviewToFirebase = async () => {
        try {
          // Import the submitReview function
          const { submitReview } = await import('../../services/reviewService');
          
          console.log('ReviewArticlePage: Submitting review to Firebase', reviewData);
          
          // Submit the review
          await submitReview(reviewData);
          
          toast({
            title: 'Review submitted',
            description: `You've earned ${article?.compensation} for your contribution!`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          
          // Navigate back to the review page
          router.push('/review');
        } catch (error) {
          console.error('ReviewArticlePage: Error submitting review:', error);
          toast({
            title: 'Error',
            description: 'Failed to submit review. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setIsSubmitting(false);
        }
      };
      
      submitReviewToFirebase();
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (error) {
    return (
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
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80" 
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
                <FiArrowLeft color="white" style={{ marginRight: '4px' }} />
                <Text color="white">{article?.date}</Text>
              </Flex>
            </HStack>
          </Box>
        </Box>

        {/* Article content */}
        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
          <Box 
            flex="2" 
            bg="white" 
            p={6} 
            borderRadius="lg" 
            boxShadow="sm" 
            borderWidth="1px" 
            borderColor="gray.200"
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
            bg="white" 
            p={6} 
            borderRadius="lg" 
            boxShadow="sm" 
            borderWidth="1px" 
            borderColor="gray.200"
            position="sticky"
            top="20px"
            alignSelf="flex-start"
          >
            <Heading as="h2" size="lg" mb={6}>
              Submit Your Review
            </Heading>
            
            <VStack spacing={6} align="stretch">
              {/* 1. Structured Evaluation Criteria (Top) */}
              <Box p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200" bg="white">
                <Heading as="h3" size="md" mb={4}>
                  Structured Evaluation Criteria
                </Heading>
                
                {formErrors.originalityRating && (
                  <Box mb={4} p={2} bg="red.50" color="red.500" borderRadius="md">
                    <Text>{formErrors.originalityRating}</Text>
                  </Box>
                )}
                
                {formErrors.significanceRating && (
                  <Box mb={4} p={2} bg="red.50" color="red.500" borderRadius="md">
                    <Text>{formErrors.significanceRating}</Text>
                  </Box>
                )}
                
                {formErrors.technicalQualityRating && (
                  <Box mb={4} p={2} bg="red.50" color="red.500" borderRadius="md">
                    <Text>{formErrors.technicalQualityRating}</Text>
                  </Box>
                )}
                
                {formErrors.clarityRating && (
                  <Box mb={4} p={2} bg="red.50" color="red.500" borderRadius="md">
                    <Text>{formErrors.clarityRating}</Text>
                  </Box>
                )}
                
                {formErrors.relevanceRating && (
                  <Box mb={4} p={2} bg="red.50" color="red.500" borderRadius="md">
                    <Text>{formErrors.relevanceRating}</Text>
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
                    isChecked={true} 
                    onChange={(_e: React.ChangeEvent<HTMLInputElement>) => {}}
                  >
                    I agree to have my identity revealed to the authors.
                  </Checkbox>
                  {formErrors.openIdentity && (
                    <FormErrorMessage>{formErrors.openIdentity}</FormErrorMessage>
                  )}
                </FormControl>
                
                <FormControl isInvalid={!!formErrors.noConflictOfInterest} isRequired>
                  <Checkbox 
                    isChecked={true} 
                    onChange={(_e: React.ChangeEvent<HTMLInputElement>) => {}}
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
                  isChecked={true} 
                  onChange={(_e: React.ChangeEvent<HTMLInputElement>) => {}}
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
                    <FiArrowLeft size="24px" color="green" />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xl" fontWeight="bold">{article?.compensation}</Text>
                    <Text fontSize="sm" color="gray.600">will be awarded upon acceptance</Text>
                  </VStack>
                </HStack>
              </Box>
              
              {/* 6. Save Draft / Submit */}
              <Box p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200" bg="white">
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
                      {formErrors.originalityRating && (
                        <ListItem>Originality rating is required</ListItem>
                      )}
                      {formErrors.significanceRating && (
                        <ListItem>Significance rating is required</ListItem>
                      )}
                      {formErrors.technicalQualityRating && (
                        <ListItem>Technical quality rating is required</ListItem>
                      )}
                      {formErrors.clarityRating && (
                        <ListItem>Clarity rating is required</ListItem>
                      )}
                      {formErrors.relevanceRating && (
                        <ListItem>Relevance rating is required</ListItem>
                      )}
                    </UnorderedList>
                  </Box>
                )}
                
                <HStack spacing={4}>
                  <Button 
                    colorScheme="gray" 
                    size="lg" 
                    leftIcon={<FiArrowLeft />}
                    isLoading={false}
                    loadingText="Saving..."
                    onClick={() => {}}
                    flex="1"
                  >
                    Save Draft
                  </Button>
                  
                  <Button 
                    colorScheme="green" 
                    size="lg" 
                    leftIcon={<FiArrowLeft />}
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
