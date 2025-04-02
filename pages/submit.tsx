import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Divider,
  Badge,
  Checkbox,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  FormHelperText,
  Select,
  FormErrorMessage,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useProfileData, UserProfile } from '../hooks/useProfileData';
import { submitArticle } from '../services/articleService';
import { getUserAccessLevel, UserAccessLevel } from '../utils/accessLevels';
import { createLogger, LogCategory } from '../utils/logger';

const logger = createLogger('SubmitPage');

// Utility function to count words in a text string
const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Validation functions for word count limits
const validateWordCount = (text: string, min: number, max: number): { valid: boolean; message?: string; count: number } => {
  const count = countWords(text);
  if (count < min) {
    return { valid: false, message: `Too short (${count} words). Minimum ${min} words required.`, count };
  }
  if (count > max) {
    return { valid: false, message: `Too long (${count} words). Maximum ${max} words allowed.`, count };
  }
  return { valid: true, count };
};

// Validation function for references
const validateReferences = (text: string): { valid: boolean; message?: string; count: number } => {
  // Simple reference count based on line breaks
  const count = text.split('\n').filter(line => line.trim().length > 0).length;
  
  if (count < 6) {
    return { valid: false, message: `At least 6 references required. Currently: ${count}`, count };
  }
  if (count > 40) {
    return { valid: false, message: `Maximum 40 references allowed. Currently: ${count}`, count };
  }
  return { valid: true, count };
};

const SubmitPage: React.FC = () => {
  const toast = useToast();
  const { currentUser, authIsInitialized } = useAuth();
  const { profile, loadingState: profileLoadingState, isProfileComplete } = useProfileData();

  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [license, setLicense] = useState('CC BY 4.0');
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [userAccess, setUserAccess] = useState(UserAccessLevel.BASIC);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [introduction, setIntroduction] = useState('');
  const [methods, setMethods] = useState('');
  const [results, setResults] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [references, setReferences] = useState('');
  
  // Add validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [wordCounts, setWordCounts] = useState<Record<string, number>>({
    abstract: 0,
    introduction: 0,
    methods: 0,
    results: 0,
    discussion: 0,
    references: 0
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    logger.debug('Checking profile status', {
      context: { userId: currentUser?.uid, profileLoadingState, isProfileComplete, hasProfile: !!profile },
      category: LogCategory.AUTH,
    });

    if (!authIsInitialized || profileLoadingState === 'loading' || profileLoadingState === 'initializing') {
      logger.debug('Profile check deferred: Auth or profile still loading', {
        context: { authIsInitialized, profileLoadingState },
        category: LogCategory.LIFECYCLE,
      });
      setIsLoadingProfile(true);
      return;
    }

    setIsLoadingProfile(false);

    if (!currentUser) {
      logger.warn('Profile check skipped: No authenticated user.', { category: LogCategory.AUTH });
      setUserAccess(UserAccessLevel.BASIC);
      return;
    }

    if (profileLoadingState === 'error' || !profile) {
      logger.error('Profile check failed: Error loading profile or profile is null', {
        context: { profileLoadingState, hasProfile: !!profile },
        category: LogCategory.ERROR,
      });
      if (profileLoadingState === 'error') {
        toast({
          title: 'Profile Error',
          description: 'Could not load your profile data. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
      setUserAccess(UserAccessLevel.BASIC);
      return;
    }

    const access = getUserAccessLevel(profile as UserProfile);
    setUserAccess(access);

    logger.info('Profile check complete', {
      context: { userId: currentUser.uid, accessLevel: access, isComplete: isProfileComplete },
      category: LogCategory.AUTH,
    });

    if (access === UserAccessLevel.BASIC) {
      logger.warn('User lacks required profile completion for submission', {
        context: { userAccessLevel: access, profileComplete: isProfileComplete },
        category: LogCategory.AUTH,
      });
      
      // Redirect to the simplified profile completion page
      toast({
        title: 'Complete your profile',
        description: 'Please complete your profile to access article submission',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      
      // Navigate to the simplified profile page with return URL
      window.location.href = `/simple-profile?returnUrl=${encodeURIComponent('/submit')}`;
    }
  }, [currentUser, profile, profileLoadingState, isProfileComplete, authIsInitialized, toast]);

  // Add validation for the current step
  const validateStep = (step: number): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    
    switch(step) {
      case 1:
        // Validate title, abstract, keywords
        if (!title.trim()) {
          newErrors.title = 'Title is required';
          newTouched.title = true;
          isValid = false;
        }
        
        const abstractValidation = validateWordCount(abstract, 150, 500);
        if (!abstractValidation.valid) {
          newErrors.abstract = abstractValidation.message || '';
          newTouched.abstract = true;
          isValid = false;
        }
        setWordCounts(prev => ({ ...prev, abstract: abstractValidation.count }));
        
        if (keywords.length < 3) {
          newErrors.keywords = 'At least 3 keywords are required';
          newTouched.keywords = true;
          isValid = false;
        }
        
        if (!category) {
          newErrors.category = 'Please select a category';
          newTouched.category = true;
          isValid = false;
        }
        break;
        
      case 3:
        // Validate introduction, methods, results, discussion, references
        const introValidation = validateWordCount(introduction, 500, 2000);
        if (!introValidation.valid) {
          newErrors.introduction = introValidation.message || '';
          newTouched.introduction = true;
          isValid = false;
        }
        setWordCounts(prev => ({ ...prev, introduction: introValidation.count }));
        
        // Combine methods, results, and discussion for main body word count (2,000-15,000)
        const mainBody = `${methods} ${results} ${discussion}`;
        const mainBodyValidation = validateWordCount(mainBody, 2000, 15000);
        if (!mainBodyValidation.valid) {
          newErrors.mainBody = mainBodyValidation.message || '';
          newTouched.mainBody = true;
          isValid = false;
        }
        
        // Individual section validations for word counts
        const methodsValidation = validateWordCount(methods, 0, 5000);
        setWordCounts(prev => ({ ...prev, methods: methodsValidation.count }));
        
        const resultsValidation = validateWordCount(results, 0, 5000);
        setWordCounts(prev => ({ ...prev, results: resultsValidation.count }));
        
        const discussionValidation = validateWordCount(discussion, 300, 2000);
        if (!discussionValidation.valid) {
          newErrors.discussion = discussionValidation.message || '';
          newTouched.discussion = true;
          isValid = false;
        }
        setWordCounts(prev => ({ ...prev, discussion: discussionValidation.count }));
        
        // Validate references
        const referencesValidation = validateReferences(references);
        if (!referencesValidation.valid) {
          newErrors.references = referencesValidation.message || '';
          newTouched.references = true;
          isValid = false;
        }
        setWordCounts(prev => ({ ...prev, references: referencesValidation.count }));
        break;
    }
    
    setErrors(newErrors);
    setTouched(prev => ({ ...prev, ...newTouched }));
    return isValid;
  };
  
  // Update navigation functions to include validation
  const handleNextStep = () => {
    // Validate current step before proceeding
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before proceeding.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    try {
      logger.debug('Submitting article', { category: LogCategory.UI });
      
      // Validate all sections before submission
      const isStep1Valid = validateStep(1);
      const isStep3Valid = validateStep(3);
      
      if (!isStep1Valid || !isStep3Valid) {
        toast({
          title: 'Validation Error',
          description: 'Please fix the errors in your submission before proceeding.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        
        // Navigate to the step with errors
        if (!isStep1Valid) {
          setCurrentStep(1);
        } else if (!isStep3Valid) {
          setCurrentStep(3);
        }
        
        return;
      }
      
      // Submission payload
      const newArticle = {
        title,
        abstract,
        keywords,
        category,
        authors: [
          {
            name: profile?.name || currentUser?.displayName || 'N/A',
            email: currentUser?.email || 'N/A',
            affiliation: profile?.institution || 'N/A',
            isCorresponding: true,
          },
        ],
        userId: currentUser?.uid,
        author: profile?.name || currentUser?.displayName || 'Anonymous Author',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        compensation: 'Pending',
        status: 'pending',
        views: 0,
        content: 'Placeholder content - upload/editor needed',
        introduction: introduction,
        methods: methods,
        results: results,
        discussion: discussion,
        references: references,
        funding: '',
        ethicalApprovals: '',
        dataAvailability: '',
        conflicts: '',
        license: license || 'CC BY 4.0',
      };

      logger.info('Submitting article', {
        context: { article: newArticle },
        category: LogCategory.DATA,
      });

      const savedArticle = await submitArticle(newArticle);
      logger.info('Article saved to Firebase', {
        context: { articleId: savedArticle.id },
        category: LogCategory.DATA,
      });

      toast({
        title: 'Article Submitted',
        description: 'Your article has been submitted successfully and is pending review.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setSubmissionComplete(true);
    } catch (error) {
      console.error('Error submitting article:', error);
      toast({
        title: 'Submission Error',
        description: 'There was an error submitting your article. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (submissionComplete) {
    return (
      <Layout title="Submission Successful" description="Your article has been submitted.">
        <Container maxW="container.md" py={10}>
          <VStack spacing={6} align="center">
            <Alert
              status="success"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              borderRadius="md"
              p={6}
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Submission Successful!
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                Your article "{title}" has been successfully submitted for review.
              </AlertDescription>
            </Alert>

            <Button onClick={() => window.location.href = '/'} colorScheme="blue">
              Go to Homepage
            </Button>
          </VStack>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Submit Your Article | Researka" description="Submit your research article to Researka" activePage="submit">
      <Head>
        <title>Submit Article | Researka</title>
      </Head>

      {isLoadingProfile ? (
        <Container maxW="container.xl" py={10}>
          <VStack spacing={4}>
            <Text>Checking your profile...</Text>
          </VStack>
        </Container>
      ) : userAccess === UserAccessLevel.BASIC ? (
        <Container maxW="container.xl" py={10}>
          <VStack spacing={4}>
            <Text>Please complete your profile fully to submit articles.</Text>
            <Button
              colorScheme="blue"
              onClick={() => window.location.href = '/profile'}
            >
              Go to Profile
            </Button>
          </VStack>
        </Container>
      ) : (
        <Box py={6}>
          <Container maxW="container.lg">
            <VStack spacing={8}>
              <Heading as="h1" size="xl">Submit Your Article</Heading>
              <Text color="gray.600" textAlign="center" maxW="container.md">
                Share your research with the academic community. All submissions undergo peer review before publication.
              </Text>

              <Box w="100%" py={4}>
                <Flex justify="space-between" align="center">
                  <Text>Step {currentStep} of {totalSteps}</Text>
                  <Progress value={progress} size="xs" colorScheme="green" />
                </Flex>
              </Box>

              <Box w="100%" bg="white" borderRadius="md" boxShadow="md" p={6}>
                {currentStep === 1 && (
                  <VStack spacing={6} align="stretch">
                    <Heading size="md">Basic Information</Heading>
                    <FormControl isRequired>
                      <FormLabel>Article Title</FormLabel>
                      <Input
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter the full title of your article"
                      />
                      {errors.title && touched.title && (
                        <FormErrorMessage>{errors.title}</FormErrorMessage>
                      )}
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Abstract</FormLabel>
                      <Textarea
                        value={abstract}
                        onChange={(e) => {
                          setAbstract(e.target.value);
                          const count = countWords(e.target.value);
                          setWordCounts(prev => ({ ...prev, abstract: count }));
                          // Mark as touched when user interacts
                          setTouched(prev => ({ ...prev, abstract: true }));
                          // Validate on change
                          const validation = validateWordCount(e.target.value, 150, 500);
                          if (!validation.valid) {
                            setErrors(prev => ({ ...prev, abstract: validation.message || '' }));
                          } else {
                            setErrors(prev => ({ ...prev, abstract: '' }));
                          }
                        }}
                        placeholder="Provide a concise summary of your research"
                        rows={6}
                      />
                      {errors.abstract && touched.abstract && (
                        <FormErrorMessage>{errors.abstract}</FormErrorMessage>
                      )}
                      <FormHelperText>
                        {wordCounts.abstract} words | Required: 150-500 words
                      </FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Keywords</FormLabel>
                      <Input
                        name="keywords"
                        value={keywords.join(', ')}
                        onChange={(e) => setKeywords(e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                        placeholder="Enter keywords separated by commas"
                      />
                      {errors.keywords && touched.keywords && (
                        <FormErrorMessage>{errors.keywords}</FormErrorMessage>
                      )}
                      <FormHelperText>5-8 keywords that describe your research</FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Category</FormLabel>
                      <Select
                        name="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Select a category"
                      >
                        <option value="computer-science">Computer Science</option>
                        <option value="biology">Biology</option>
                        <option value="physics">Physics</option>
                        <option value="chemistry">Chemistry</option>
                        <option value="mathematics">Mathematics</option>
                        <option value="medicine">Medicine</option>
                        <option value="psychology">Psychology</option>
                        <option value="economics">Economics</option>
                        <option value="social-sciences">Social Sciences</option>
                        <option value="humanities">Humanities</option>
                        <option value="engineering">Engineering</option>
                        <option value="environmental-science">Environmental Science</option>
                        <option value="other">Other</option>
                      </Select>
                      {errors.category && touched.category && (
                        <FormErrorMessage>{errors.category}</FormErrorMessage>
                      )}
                    </FormControl>
                  </VStack>
                )}

                {currentStep === 2 && (
                  <VStack spacing={6} align="stretch">
                    <Heading size="md">Authors</Heading>
                    <Text>Author information will be pulled from your profile</Text>
                  </VStack>
                )}

                {currentStep === 3 && (
                  <VStack spacing={6} align="stretch">
                    <Heading size="md">Content</Heading>

                    <FormControl isRequired>
                      <FormLabel>Introduction</FormLabel>
                      <Textarea
                        value={introduction}
                        onChange={(e) => {
                          setIntroduction(e.target.value);
                          const count = countWords(e.target.value);
                          setWordCounts(prev => ({ ...prev, introduction: count }));
                          // Mark as touched when user interacts
                          setTouched(prev => ({ ...prev, introduction: true }));
                          // Validate on change
                          const validation = validateWordCount(e.target.value, 500, 2000);
                          if (!validation.valid) {
                            setErrors(prev => ({ ...prev, introduction: validation.message || '' }));
                          } else {
                            setErrors(prev => ({ ...prev, introduction: '' }));
                          }
                        }}
                        placeholder="Provide background information and state the purpose of your research"
                        rows={6}
                      />
                      {errors.introduction && touched.introduction && (
                        <FormErrorMessage>{errors.introduction}</FormErrorMessage>
                      )}
                      <FormHelperText>
                        {wordCounts.introduction} words | Required: 500-2,000 words
                      </FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Methods</FormLabel>
                      <Textarea
                        value={methods}
                        onChange={(e) => {
                          setMethods(e.target.value);
                          const count = countWords(e.target.value);
                          setWordCounts(prev => ({ ...prev, methods: count }));
                          
                          // Validate main body on change
                          const mainBody = `${e.target.value} ${results} ${discussion}`;
                          const mainBodyValidation = validateWordCount(mainBody, 2000, 15000);
                          if (!mainBodyValidation.valid) {
                            setErrors(prev => ({ ...prev, mainBody: mainBodyValidation.message || '' }));
                          } else {
                            setErrors(prev => ({ ...prev, mainBody: '' }));
                          }
                        }}
                        placeholder="Describe your research methodology"
                        rows={6}
                      />
                      {errors.mainBody && (
                        <Alert status="error" mt={4} mb={4}>
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Main Body Word Count Error</AlertTitle>
                            <AlertDescription>
                              {errors.mainBody} The main body (Methods, Results, and Discussion combined) must be between 2,000 and 15,000 words.
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                      <FormHelperText>
                        {wordCounts.methods} words | Part of main body (2,000-15,000 words total)
                      </FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Results</FormLabel>
                      <Textarea
                        value={results}
                        onChange={(e) => {
                          setResults(e.target.value);
                          const count = countWords(e.target.value);
                          setWordCounts(prev => ({ ...prev, results: count }));
                          
                          // Validate main body on change
                          const mainBody = `${methods} ${e.target.value} ${discussion}`;
                          const mainBodyValidation = validateWordCount(mainBody, 2000, 15000);
                          if (!mainBodyValidation.valid) {
                            setErrors(prev => ({ ...prev, mainBody: mainBodyValidation.message || '' }));
                          } else {
                            setErrors(prev => ({ ...prev, mainBody: '' }));
                          }
                        }}
                        placeholder="Present your findings"
                        rows={6}
                      />
                      <FormHelperText>
                        {wordCounts.results} words | Part of main body (2,000-15,000 words total)
                      </FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Discussion</FormLabel>
                      <Textarea
                        value={discussion}
                        onChange={(e) => {
                          setDiscussion(e.target.value);
                          const count = countWords(e.target.value);
                          setWordCounts(prev => ({ ...prev, discussion: count }));
                          // Mark as touched when user interacts
                          setTouched(prev => ({ ...prev, discussion: true }));
                          
                          // Validate discussion
                          const validation = validateWordCount(e.target.value, 300, 2000);
                          if (!validation.valid) {
                            setErrors(prev => ({ ...prev, discussion: validation.message || '' }));
                          } else {
                            setErrors(prev => ({ ...prev, discussion: '' }));
                          }
                          
                          // Validate main body on change
                          const mainBody = `${methods} ${results} ${e.target.value}`;
                          const mainBodyValidation = validateWordCount(mainBody, 2000, 15000);
                          if (!mainBodyValidation.valid) {
                            setErrors(prev => ({ ...prev, mainBody: mainBodyValidation.message || '' }));
                          } else {
                            setErrors(prev => ({ ...prev, mainBody: '' }));
                          }
                        }}
                        placeholder="Interpret your results and discuss their implications"
                        rows={6}
                      />
                      {errors.discussion && touched.discussion && (
                        <FormErrorMessage>{errors.discussion}</FormErrorMessage>
                      )}
                      <FormHelperText>
                        {wordCounts.discussion} words | Required: 300-2,000 words
                      </FormHelperText>
                    </FormControl>

                    <FormControl>
                      <FormLabel>References</FormLabel>
                      <Textarea
                        value={references}
                        onChange={(e) => {
                          setReferences(e.target.value);
                          // Count references (one per line)
                          const count = e.target.value.split('\n').filter(line => line.trim().length > 0).length;
                          setWordCounts(prev => ({ ...prev, references: count }));
                          // Mark as touched when user interacts
                          setTouched(prev => ({ ...prev, references: true }));
                          // Validate on change
                          const validation = validateReferences(e.target.value);
                          if (!validation.valid) {
                            setErrors(prev => ({ ...prev, references: validation.message || '' }));
                          } else {
                            setErrors(prev => ({ ...prev, references: '' }));
                          }
                        }}
                        placeholder="List all references cited in your article"
                        rows={6}
                      />
                      {errors.references && touched.references && (
                        <FormErrorMessage>{errors.references}</FormErrorMessage>
                      )}
                      <FormHelperText>
                        {wordCounts.references} references | Required: 6-40 references (one per line)
                      </FormHelperText>
                    </FormControl>
                  </VStack>
                )}

                {currentStep === 4 && (
                  <VStack spacing={6} align="stretch">
                    <Heading size="md">Review Your Submission</Heading>
                    <Text>Please review your article details before submitting.</Text>

                    <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50">
                      <VStack align="stretch" spacing={4}>
                        <Heading size="sm">Title</Heading>
                        <Text>{title || 'Not provided'}</Text>

                        <Divider />

                        <Heading size="sm" mt={2}>Abstract</Heading>
                        <Text>{abstract || 'Not provided'}</Text>

                        <Divider />

                        <Heading size="sm" mt={2}>Keywords</Heading>
                        <Flex wrap="wrap" gap={2}>
                          {keywords.map((keyword, index) => (
                            keyword && (
                              <Badge key={index} colorScheme="green" py={1} px={2} borderRadius="full">
                                {keyword}
                              </Badge>
                            )
                          ))}
                        </Flex>

                        <Divider />

                        <Heading size="sm" mt={2}>Category</Heading>
                        <Text>{category || 'Not selected'}</Text>

                        <Divider />

                        <Heading size="sm" mt={2}>License</Heading>
                        <Select
                            name="license"
                            value={license}
                            onChange={(e) => setLicense(e.target.value)}
                            size="sm"
                          >
                            <option value="CC BY 4.0">Creative Commons Attribution (CC BY 4.0)</option>
                            <option value="CC BY-SA 4.0">Creative Commons Attribution-ShareAlike (CC BY-SA 4.0)</option>
                            <option value="CC BY-NC 4.0">Creative Commons Attribution-NonCommercial (CC BY-NC 4.0)</option>
                            <option value="CC BY-NC-SA 4.0">Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA 4.0)</option>
                        </Select>

                        <Divider />

                        <Checkbox isChecked={true} isReadOnly>
                          I confirm that this submission is original and has not been published elsewhere
                        </Checkbox>

                        <Checkbox isChecked={true} isReadOnly mt={2}>
                          I agree to the terms and conditions of submission
                        </Checkbox>
                      </VStack>
                    </Box>

                    <Button
                      colorScheme="green"
                      size="lg"
                      onClick={handleSubmit}
                      isLoading={false}
                      loadingText="Submitting"
                      w="full"
                    >
                      Submit Article
                    </Button>
                  </VStack>
                )}
              </Box>

              <Flex justify="space-between" mt={8}>
                {currentStep > 1 ? (
                  <Button
                    leftIcon={<FiChevronLeft />}
                    onClick={handlePrevStep}
                    variant="outline"
                  >
                    Previous
                  </Button>
                ) : (
                  <Box />
                )}

                {currentStep < totalSteps ? (
                  <Button
                    rightIcon={<FiChevronRight />}
                    onClick={handleNextStep}
                    colorScheme="green"
                  >
                    Next
                  </Button>
                ) : null}
              </Flex>
            </VStack>
          </Container>
        </Box>
      )}
    </Layout>
  );
};

export default SubmitPage;
