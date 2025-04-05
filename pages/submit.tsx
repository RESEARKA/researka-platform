import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Progress,
  Select,
  Text,
  Textarea,
  useToast,
  VStack,
  Badge,
  Spinner,
  FormHelperText,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Checkbox,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Layout from '../components/Layout';
import KeywordsAutocomplete from '../components/KeywordsAutocomplete';
import DocumentUploader from '../components/DocumentUploader';
import { useAuth } from '../contexts/AuthContext';
import { getUserAccessLevel, UserAccessLevel } from '../utils/accessLevels';
import { createLogger, LogCategory } from '../utils/logger';
import { ParsedDocument } from '../utils/documentParser';
import { submitArticle } from '../services/articleService';

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

interface Article {
  title: string;
  abstract: string;
  keywords: string[];
  category: string;
  license: string;
  authors: {
    name: string;
    email: string;
    affiliation: string;
    isCorresponding: boolean;
  }[];
  userId: string;
  author: string;
  introduction: string;
  methods: string;
  results: string;
  discussion: string;
  references: string;
  referenceCount: number;
  status: string;
  submittedBy: string;
  submitterName: string;
  submitterEmail: string;
  submitterInstitution: string;
  ethicalApprovals: string;
  dataAvailability: string;
  conflicts: string;
  date: string;
  compensation: string;
}

const SubmitPage: React.FC = () => {
  const toast = useToast();
  const { currentUser, authIsInitialized, getUserProfile } = useAuth();
  const [profileChecked, setProfileChecked] = useState(false);
  const [userAccess, setUserAccess] = useState<UserAccessLevel>(UserAccessLevel.BASIC);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [license, setLicense] = useState('CC BY 4.0');
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [introduction, setIntroduction] = useState('');
  const [methods, setMethods] = useState('');
  const [results, setResults] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [references, setReferences] = useState('');
  const [referenceCount, setReferenceCount] = useState(0);
  
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

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    let isMounted = true;
    
    logger.debug('Checking profile status', {
      context: { userId: currentUser?.uid },
      category: LogCategory.AUTH,
    });

    // Skip if auth is not initialized yet
    if (!authIsInitialized) {
      logger.debug('Profile check deferred: Auth not initialized', {
        context: { authIsInitialized },
        category: LogCategory.LIFECYCLE,
      });
      return () => {
        isMounted = false;
      };
    }

    // If user is not authenticated, don't try to load profile
    if (!currentUser) {
      logger.warn('Profile check skipped: No authenticated user.', { category: LogCategory.AUTH });
      setUserAccess(UserAccessLevel.BASIC);
      setIsProfileLoading(false);
      setProfileChecked(true);
      return () => {
        isMounted = false;
      };
    }

    const checkAccess = async () => {
      if (!currentUser) return;
      
      setIsProfileLoading(true);
      
      try {
        // Get the user's profile directly using getUserProfile
        const userProfile = await getUserProfile(currentUser.uid);
        
        if (!isMounted) return;
        
        if (userProfile) {
          const access = getUserAccessLevel(userProfile);
          setUserAccess(access);
          
          logger.info('Profile check complete', {
            context: { userId: currentUser.uid, accessLevel: access },
            category: LogCategory.AUTH,
          });
          
          // Check if user needs to complete their profile
          if (access === UserAccessLevel.BASIC) {
            logger.warn('User lacks required profile completion for submission', {
              context: { userAccessLevel: access },
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
        } else {
          // No profile found
          setUserAccess(UserAccessLevel.BASIC);
          logger.warn('No profile found for user', {
            context: { userId: currentUser.uid },
            category: LogCategory.AUTH,
          });
          
          // Redirect to create profile
          toast({
            title: 'Profile Required',
            description: 'Please create your profile to access article submission',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
          
          window.location.href = `/simple-profile?returnUrl=${encodeURIComponent('/submit')}`;
        }
      } catch (error) {
        if (!isMounted) return;
        
        logger.error('Error checking user access level:', {
          context: { error },
          category: LogCategory.ERROR,
        });
        setUserAccess(UserAccessLevel.BASIC);
        
        toast({
          title: 'Error',
          description: 'Could not load your profile. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
          setProfileChecked(true);
        }
      }
    };

    checkAccess();
    
    return () => {
      isMounted = false;
    };
  }, [authIsInitialized, currentUser, getUserProfile, toast]);

  // Constants for validation
  const MIN_KEYWORDS = 3;
  const MAX_KEYWORDS = 8;

  // Add validation for the current step
  const validateStep = (step: number): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    
    switch(step) {
      case 1:
        // Validate title, abstract, category
        if (!title.trim()) {
          newErrors.title = 'Title is required';
          newTouched.title = true;
          isValid = false;
        }
        
        const abstractValidation = validateWordCount(abstract, 150, 500);
        setWordCounts(prev => ({ ...prev, abstract: abstractValidation.count }));
        if (!abstractValidation.valid) {
          newErrors.abstract = abstractValidation.message || '';
          newTouched.abstract = true;
          isValid = false;
        }
        
        if (!introduction.trim()) {
          newErrors.introduction = 'Introduction is required';
          newTouched.introduction = true;
          isValid = false;
        }
        
        const introductionValidation = validateWordCount(introduction, 500, 2000);
        setWordCounts(prev => ({ ...prev, introduction: introductionValidation.count }));
        if (!introductionValidation.valid) {
          newErrors.introduction = introductionValidation.message || '';
          newTouched.introduction = true;
          isValid = false;
        }
        
        if (!methods.trim()) {
          newErrors.methods = 'Methods is required';
          newTouched.methods = true;
          isValid = false;
        }
        
        const methodsValidation = validateWordCount(methods, 0, 5000);
        setWordCounts(prev => ({ ...prev, methods: methodsValidation.count }));
        
        if (!results.trim()) {
          newErrors.results = 'Results is required';
          newTouched.results = true;
          isValid = false;
        }
        
        const resultsValidation = validateWordCount(results, 0, 5000);
        setWordCounts(prev => ({ ...prev, results: resultsValidation.count }));
        
        if (!discussion.trim()) {
          newErrors.discussion = 'Discussion is required';
          newTouched.discussion = true;
          isValid = false;
        }
        
        const discussionValidation = validateWordCount(discussion, 300, 2000);
        setWordCounts(prev => ({ ...prev, discussion: discussionValidation.count }));
        if (!discussionValidation.valid) {
          newErrors.discussion = discussionValidation.message || '';
          newTouched.discussion = true;
          isValid = false;
        }
        
        if (!references.trim()) {
          newErrors.references = 'References is required';
          newTouched.references = true;
          isValid = false;
        }
        
        const referencesValidation = validateReferences(references);
        setWordCounts(prev => ({ ...prev, references: referencesValidation.count }));
        if (!referencesValidation.valid) {
          newErrors.references = referencesValidation.message || '';
          newTouched.references = true;
          isValid = false;
        }
        break;
        
      case 2:
        // Validate keywords
        if (keywords.length < MIN_KEYWORDS) {
          newErrors.keywords = `At least ${MIN_KEYWORDS} keywords required. Currently: ${keywords.length}`;
          newTouched.keywords = true;
          isValid = false;
        }
        break;
        
      case 3:
        // No validation for this step
        break;
    }
    
    setErrors(newErrors);
    setTouched(prev => ({ ...prev, ...newTouched }));
    return isValid;
  };
  
  // Update navigation functions to include validation
  const handleNextStep = () => {
    // Validate current step before proceeding
    logger.debug(`Validating step ${currentStep}`, { category: LogCategory.UI });
    
    const isValid = validateStep(currentStep);
    logger.debug(`Step ${currentStep} validation result: ${isValid}`, { 
      category: LogCategory.UI,
      context: {
        hasErrors: Object.values(errors).some(Boolean),
        currentStep
      }
    });
    
    if (isValid) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
        logger.debug(`Moving to step ${currentStep + 1}`, { category: LogCategory.UI });
      }
    } else {
      // Create a more specific error message based on the validation errors
      const errorFields = [
        { key: 'title', label: 'Title' },
        { key: 'abstract', label: 'Abstract' },
        { key: 'keywords', label: 'Keywords' },
        { key: 'introduction', label: 'Introduction' },
        { key: 'methods', label: 'Methods' },
        { key: 'results', label: 'Results' },
        { key: 'discussion', label: 'Discussion' },
        { key: 'references', label: 'References' }
      ];
      
      const errorDescription = errorFields.reduce((msg, { key, label }) => {
        return errors[key] ? `${msg}\n• ${label}: ${errors[key]}` : msg;
      }, 'Please fix the following errors:');
      
      toast({
        title: 'Validation Error',
        description: errorDescription,
        status: 'error',
        duration: 7000,
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
      
      const newArticle = prepareArticleData();
      if (!newArticle) {
        return;
      }
      
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

  const prepareArticleData = () => {
    try {
      // Validate all sections before submission
      const isStep1Valid = validateStep(1);
      const isStep2Valid = validateStep(2);
      
      if (!isStep1Valid || !isStep2Valid) {
        toast({
          title: 'Validation Error',
          description: 'Please fix the errors in your submission before proceeding.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        
        if (!isStep1Valid) {
          setCurrentStep(1);
        } else if (!isStep2Valid) {
          setCurrentStep(2);
        }
        
        return null;
      }
      
      const newArticle: Article = {
        title,
        abstract,
        keywords,
        category: 'computer-science', // Default category
        license,
        authors: [
          {
            name: currentUser?.displayName || 'N/A',
            email: currentUser?.email || 'N/A',
            affiliation: 'N/A',
            isCorresponding: true,
          }
        ],
        userId: currentUser?.uid || 'anonymous',
        author: currentUser?.displayName || 'N/A',
        introduction,
        methods,
        results,
        discussion,
        references,
        referenceCount,
        status: 'draft',
        submittedBy: currentUser?.uid || 'anonymous',
        submitterName: currentUser?.displayName || 'N/A',
        submitterEmail: currentUser?.email || 'N/A',
        submitterInstitution: 'N/A',
        ethicalApprovals: '',
        dataAvailability: '',
        conflicts: '',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        compensation: 'Pending',
      };

      logger.info('Submitting article', {
        context: { 
          title: newArticle.title,
          wordCounts
        },
        category: LogCategory.DATA
      });
      
      return newArticle;
    } catch (error) {
      logger.error('Error preparing article data', {
        context: { error },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: 'An error occurred while preparing your submission. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return null;
    }
  };

  // Handle document parsing
  const handleDocumentParsed = (parsedDocument: ParsedDocument) => {
    if (parsedDocument.title) {
      setTitle(parsedDocument.title);
    }
    
    if (parsedDocument.abstract) {
      setAbstract(parsedDocument.abstract);
    }
    
    if (parsedDocument.keywords && parsedDocument.keywords.length > 0) {
      // Ensure keywords is treated as a string array
      setKeywords(parsedDocument.keywords);
    }
    
    if (parsedDocument.introduction) {
      setIntroduction(parsedDocument.introduction);
    }
    
    if (parsedDocument.methods) {
      setMethods(parsedDocument.methods);
    }
    
    if (parsedDocument.results) {
      setResults(parsedDocument.results);
    }
    
    if (parsedDocument.discussion) {
      setDiscussion(parsedDocument.discussion);
    }
    
    // Handle references safely with proper type checking
    if (parsedDocument.references && Array.isArray(parsedDocument.references)) {
      // Join the array of references into a single string
      const refsText = parsedDocument.references.join('\n');
      setReferences(refsText);
      setReferenceCount(parsedDocument.references.length);
    }
    
    toast({
      title: 'Document Parsed',
      description: 'Your document has been successfully parsed and the form has been populated.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <VStack spacing={6} align="stretch">
            <DocumentUploader onDocumentParsed={handleDocumentParsed} />
            
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
        );
      case 2:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="md">Keywords & Authors</Heading>
            
            {/* Keywords Section */}
            <FormControl isRequired isInvalid={!!errors.keywords && touched.keywords}>
              <FormLabel>Keywords</FormLabel>
              <KeywordsAutocomplete
                keywords={keywords}
                setKeywords={setKeywords}
                errors={errors}
                setErrors={setErrors}
                touched={touched}
                setTouched={setTouched}
                MIN_KEYWORDS={MIN_KEYWORDS}
                MAX_KEYWORDS={MAX_KEYWORDS}
              />
              <FormHelperText>
                Please add {MIN_KEYWORDS}-{MAX_KEYWORDS} keywords
              </FormHelperText>
            </FormControl>
            
            {/* Authors Section */}
            <Box mt={6}>
              <Heading size="sm" mb={3}>Authors</Heading>
              <Text>Author information will be pulled from your profile</Text>
            </Box>
          </VStack>
        );
      case 3:
        return (
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
        );
      default:
        return null;
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
    <Layout title="Submit Article | Researka" description="Submit your article for review" activePage="submit">
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl">Submit Article</Heading>
          
          {/* Show loading or profile completion message if needed */}
          {!profileChecked || isProfileLoading ? (
            <VStack spacing={4} py={10}>
              <Text>Checking your profile...</Text>
              <Spinner />
            </VStack>
          ) : userAccess === UserAccessLevel.BASIC ? (
            <VStack spacing={4} py={10}>
              <Text>Please complete your profile to access the submission page.</Text>
              <Button 
                colorScheme="blue" 
                onClick={() => window.location.href = `/simple-profile?returnUrl=${encodeURIComponent('/submit')}`}
              >
                Go to Profile
              </Button>
            </VStack>
          ) : (
            <>
              {/* Progress bar */}
              <Box>
                <Text mb={2}>Step {currentStep} of {totalSteps}</Text>
                <Progress value={progress} size="sm" colorScheme="blue" borderRadius="md" />
              </Box>
              
              {/* Form content */}
              <Box 
                p={6} 
                borderWidth="1px" 
                borderRadius="lg" 
                bg="white"
                boxShadow="md"
              >
                {renderCurrentStep()}
              </Box>
              
              {/* Navigation buttons */}
              <Flex justify="space-between" mt={4}>
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
            </>
          )}
        </VStack>
      </Container>
    </Layout>
  );
};

export default SubmitPage;
