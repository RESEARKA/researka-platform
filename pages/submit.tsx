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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  FormHelperText,
  useSteps,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useToast,
  Divider,
  useColorModeValue,
  Badge,
  Checkbox,
} from '@chakra-ui/react';
import { FiUpload, FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import Layout from '../components/Layout';
import { FiFileText, FiChevronDown } from 'react-icons/fi';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

// Define the steps for the submission process
const steps = [
  { title: 'Basic Info', description: 'Article details' },
  { title: 'Authors', description: 'Author information' },
  { title: 'Content', description: 'Manuscript content' },
  { title: 'Metadata', description: 'Additional information' },
  { title: 'Review', description: 'Check your submission' },
];

const SubmitPage: React.FC = () => {
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const router = useRouter();
  const { currentUser, getUserProfile, updateUserData } = useAuth();
  
  // Basic information state
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState('');
  
  // Author details state
  const [orcidId, setOrcidId] = useState('');
  const [isCorrespondingAuthor, setIsCorrespondingAuthor] = useState(true);
  const [coAuthors, setCoAuthors] = useState<Array<{name: string, affiliation: string, email: string, orcid: string}>>([]);
  
  // Manuscript content state
  const [introduction, setIntroduction] = useState('');
  const [methods, setMethods] = useState('');
  const [results, setResults] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [references, setReferences] = useState('');
  const [supplementaryMaterials, setSupplementaryMaterials] = useState<File[]>([]);
  
  // Additional metadata state
  const [funding, setFunding] = useState('');
  const [ethicalApprovals, setEthicalApprovals] = useState('');
  const [dataAvailability, setDataAvailability] = useState('');
  const [conflictsOfInterest, setConflictsOfInterest] = useState('');
  const [license, setLicense] = useState('CC BY');
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authorDeclarations, setAuthorDeclarations] = useState({
    isOriginal: false,
    allAuthorsApproved: false,
    agreeToTerms: false
  });
  
  // Check if user is logged in and profile is complete
  useEffect(() => {
    const checkAuth = async () => {
      if (!currentUser) {
        // Redirect to homepage if not logged in
        router.push('/');
        return;
      }
      
      try {
        // Get user profile from Firestore
        const profile = await getUserProfile();
        
        // If profile exists, set it
        if (profile) {
          setUserProfile(profile);
          
          // Check if profile is complete
          if (!profile.profileComplete) {
            // Redirect to profile page to complete profile
            router.push('/profile');
          }
        } else {
          // If no profile exists, create a default one
          const defaultProfile = {
            name: currentUser.displayName || '',
            email: currentUser.email || '',
            role: 'Researcher',
            institution: '',
            department: '',
            position: '',
            researchInterests: [],
            articles: 0,
            reviews: 0,
            reputation: 0,
            profileComplete: false,
            createdAt: new Date().toISOString()
          };
          
          // Update user profile in Firestore
          const updateSuccess = await updateUserData(defaultProfile);
          setUserProfile(defaultProfile);
          
          // Show warning if update failed
          if (!updateSuccess) {
            if (!toast.isActive('profile-update-error')) {
              toast({
                id: 'profile-update-error',
                title: 'Warning',
                description: 'Could not save profile to database. Changes may not persist.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'top-right'
              });
            }
          }
          
          // Redirect to profile page to complete profile
          router.push('/profile');
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        // Only show toast once to avoid multiple popups
        if (!toast.isActive('profile-error')) {
          toast({
            id: 'profile-error',
            title: 'Error',
            description: 'Failed to load user profile',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right'
          });
        }
      }
    };
    
    // Only run if currentUser is available and after a short delay
    // to ensure Firebase auth is fully initialized
    if (currentUser) {
      const timer = setTimeout(() => {
        checkAuth();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, getUserProfile, updateUserData, router, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'title':
        setTitle(value);
        break;
      case 'abstract':
        setAbstract(value);
        break;
      case 'category':
        setCategory(value);
        break;
      case 'keywords':
        setKeywords(value);
        break;
      case 'orcidId':
        setOrcidId(value);
        break;
      case 'isCorrespondingAuthor':
        setIsCorrespondingAuthor(value === 'true');
        break;
      case 'introduction':
        setIntroduction(value);
        break;
      case 'methods':
        setMethods(value);
        break;
      case 'results':
        setResults(value);
        break;
      case 'discussion':
        setDiscussion(value);
        break;
      case 'references':
        setReferences(value);
        break;
      case 'funding':
        setFunding(value);
        break;
      case 'ethicalApprovals':
        setEthicalApprovals(value);
        break;
      case 'dataAvailability':
        setDataAvailability(value);
        break;
      case 'conflictsOfInterest':
        setConflictsOfInterest(value);
        break;
      case 'license':
        setLicense(value);
        break;
      default:
        break;
    }
  };
  
  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };
  
  const handlePrevious = () => {
    setActiveStep(activeStep - 1);
  };
  
  const handleSubmit = () => {
    // In a real app, you would send the data to your API
    toast({
      title: 'Submission successful!',
      description: 'Your article has been submitted for review.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    
    // Reset form and go back to first step
    setTitle('');
    setAbstract('');
    setCategory('');
    setKeywords('');
    setOrcidId('');
    setIsCorrespondingAuthor(true);
    setCoAuthors([]);
    setIntroduction('');
    setMethods('');
    setResults('');
    setDiscussion('');
    setReferences('');
    setSupplementaryMaterials([]);
    setFunding('');
    setEthicalApprovals('');
    setDataAvailability('');
    setConflictsOfInterest('');
    setLicense('CC BY');
    setActiveStep(0);
  };
  
  return (
    <Layout title="Submit Your Article | Researka" description="Submit your research article to Researka" activePage="submit">
      <Box py={6} bg={bgColor}>
        <Container maxW="container.lg">
          <VStack spacing={8}>
            <Heading as="h1" size="xl">Submit Your Article</Heading>
            <Text color="gray.600" textAlign="center" maxW="container.md">
              Share your research with the academic community. All submissions undergo peer review before publication.
            </Text>
            
            <Box w="100%" py={4}>
              <Stepper index={activeStep} colorScheme="green">
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepIndicator>
                      <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                      />
                    </StepIndicator>
                    
                    <Box flexShrink={0}>
                      <StepTitle>{step.title}</StepTitle>
                      <StepDescription>{step.description}</StepDescription>
                    </Box>
                    
                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>
            </Box>
            
            <Box 
              w="100%" 
              bg={bgColor} 
              p={8} 
              borderRadius="lg" 
              boxShadow="sm"
              borderWidth="1px"
              borderColor={borderColor}
            >
              {activeStep === 0 && (
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Basic Information</Heading>
                  
                  <FormControl isRequired>
                    <FormLabel htmlFor="article-title">Article Title</FormLabel>
                    <Input 
                      id="article-title"
                      name="title" 
                      value={title} 
                      onChange={handleInputChange} 
                      placeholder="Enter the title of your article"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel htmlFor="article-abstract">Abstract</FormLabel>
                    <Textarea 
                      id="article-abstract"
                      name="abstract" 
                      value={abstract} 
                      onChange={handleInputChange} 
                      placeholder="Provide a brief summary of your article"
                      rows={5}
                    />
                    <FormHelperText>Maximum 300 words</FormHelperText>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel htmlFor="category-select">Category</FormLabel>
                    <Select 
                      id="category-select"
                      name="category" 
                      value={category} 
                      onChange={handleInputChange} 
                      placeholder="Select category"
                      aria-label="Select article category"
                    >
                      <option value="blockchain">Blockchain & Cryptocurrency</option>
                      <option value="ai">Artificial Intelligence</option>
                      <option value="computer-science">Computer Science</option>
                      <option value="economics">Economics</option>
                      <option value="medicine">Medicine & Healthcare</option>
                      <option value="physics">Physics</option>
                      <option value="biology">Biology</option>
                      <option value="social-science">Social Sciences</option>
                      <option value="other">Other</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel htmlFor="article-keywords">Keywords</FormLabel>
                    <Input 
                      id="article-keywords"
                      name="keywords" 
                      value={keywords} 
                      onChange={handleInputChange} 
                      placeholder="Enter keywords separated by commas"
                    />
                    <FormHelperText>e.g., blockchain, academic publishing, decentralization</FormHelperText>
                  </FormControl>
                </VStack>
              )}
              
              {activeStep === 1 && (
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Authors</Heading>
                  
                  <FormControl isRequired>
                    <FormLabel htmlFor="orcid-id">ORCID ID</FormLabel>
                    <Input 
                      id="orcid-id"
                      name="orcidId" 
                      value={orcidId} 
                      onChange={handleInputChange} 
                      placeholder="Enter your ORCID ID"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel htmlFor="is-corresponding-author">Corresponding Author</FormLabel>
                    <Select 
                      id="is-corresponding-author"
                      name="isCorrespondingAuthor" 
                      value={isCorrespondingAuthor ? 'true' : 'false'} 
                      onChange={handleInputChange} 
                      placeholder="Select"
                      aria-label="Select corresponding author"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel htmlFor="co-authors">Co-Authors</FormLabel>
                    <Textarea 
                      id="co-authors"
                      name="coAuthors" 
                      value={JSON.stringify(coAuthors)} 
                      onChange={handleInputChange} 
                      placeholder="Enter co-authors in JSON format"
                      rows={5}
                    />
                    <FormHelperText>{`Example: [{"name": "John Doe", "affiliation": "University of Example", "email": "john@example.com", "orcid": "1234-5678-9012-3456"}]`}</FormHelperText>
                  </FormControl>
                </VStack>
              )}
              
              {activeStep === 2 && (
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Manuscript Content</Heading>
                  
                  <FormControl isRequired>
                    <FormLabel htmlFor="introduction">Introduction</FormLabel>
                    <Textarea 
                      id="introduction"
                      name="introduction" 
                      value={introduction} 
                      onChange={handleInputChange} 
                      placeholder="Enter the introduction of your article"
                      rows={5}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel htmlFor="methods">Methods</FormLabel>
                    <Textarea 
                      id="methods"
                      name="methods" 
                      value={methods} 
                      onChange={handleInputChange} 
                      placeholder="Enter the methods of your article"
                      rows={5}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel htmlFor="results">Results</FormLabel>
                    <Textarea 
                      id="results"
                      name="results" 
                      value={results} 
                      onChange={handleInputChange} 
                      placeholder="Enter the results of your article"
                      rows={5}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel htmlFor="discussion">Discussion</FormLabel>
                    <Textarea 
                      id="discussion"
                      name="discussion" 
                      value={discussion} 
                      onChange={handleInputChange} 
                      placeholder="Enter the discussion of your article"
                      rows={5}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel htmlFor="references">References</FormLabel>
                    <Textarea 
                      id="references"
                      name="references" 
                      value={references} 
                      onChange={handleInputChange} 
                      placeholder="Enter the references of your article"
                      rows={5}
                    />
                  </FormControl>
                </VStack>
              )}
              
              {activeStep === 3 && (
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Metadata</Heading>
                  
                  <FormControl>
                    <FormLabel htmlFor="funding">Funding</FormLabel>
                    <Input 
                      id="funding"
                      name="funding" 
                      value={funding} 
                      onChange={handleInputChange} 
                      placeholder="Enter funding information"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel htmlFor="ethical-approvals">Ethical Approvals</FormLabel>
                    <Input 
                      id="ethical-approvals"
                      name="ethicalApprovals" 
                      value={ethicalApprovals} 
                      onChange={handleInputChange} 
                      placeholder="Enter ethical approvals"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel htmlFor="data-availability">Data Availability</FormLabel>
                    <Input 
                      id="data-availability"
                      name="dataAvailability" 
                      value={dataAvailability} 
                      onChange={handleInputChange} 
                      placeholder="Enter data availability"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel htmlFor="conflicts-of-interest">Conflicts of Interest</FormLabel>
                    <Input 
                      id="conflicts-of-interest"
                      name="conflictsOfInterest" 
                      value={conflictsOfInterest} 
                      onChange={handleInputChange} 
                      placeholder="Enter conflicts of interest"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel htmlFor="license">License</FormLabel>
                    <Select 
                      id="license"
                      name="license" 
                      value={license} 
                      onChange={handleInputChange} 
                      placeholder="Select license"
                      aria-label="Select license"
                    >
                      <option value="CC BY">CC BY</option>
                      <option value="CC BY-SA">CC BY-SA</option>
                      <option value="CC BY-NC">CC BY-NC</option>
                      <option value="CC BY-NC-SA">CC BY-NC-SA</option>
                    </Select>
                  </FormControl>
                </VStack>
              )}
              
              {activeStep === 4 && (
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Review Your Submission</Heading>
                  
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <VStack align="stretch" spacing={4}>
                      <Flex justify="space-between">
                        <Text fontWeight="bold">Title:</Text>
                        <Text>{title || 'Not provided'}</Text>
                      </Flex>
                      
                      <Flex justify="space-between">
                        <Text fontWeight="bold">Category:</Text>
                        <Badge colorScheme="green">{category || 'Not selected'}</Badge>
                      </Flex>
                      
                      <Divider />
                      
                      <Text fontWeight="bold">Abstract:</Text>
                      <Text>{abstract || 'Not provided'}</Text>
                      
                      <Divider />
                      
                      <Text fontWeight="bold">Keywords:</Text>
                      <Text>{keywords || 'None'}</Text>
                      
                      <Divider />
                      
                      <Text fontWeight="bold">ORCID ID:</Text>
                      <Text>{orcidId || 'Not provided'}</Text>
                      
                      <Divider />
                      
                      <Text fontWeight="bold">Corresponding Author:</Text>
                      <Text>{isCorrespondingAuthor ? 'Yes' : 'No'}</Text>
                      
                      <Divider />
                      
                      <Text fontWeight="bold">Co-Authors:</Text>
                      <Text>{JSON.stringify(coAuthors) || 'None'}</Text>
                      
                      <Divider />
                      
                      <Text fontWeight="bold">Introduction:</Text>
                      <Text noOfLines={3}>{introduction || 'Not provided'}</Text>
                      
                      <Divider />
                      
                      <Text fontWeight="bold">Methods:</Text>
                      <Text noOfLines={3}>{methods || 'Not provided'}</Text>
                      
                      <Divider />
                      
                      <Text fontWeight="bold">Results:</Text>
                      <Text noOfLines={3}>{results || 'Not provided'}</Text>
                      
                      <Divider />
                      
                      <Text fontWeight="bold">Discussion:</Text>
                      <Text noOfLines={3}>{discussion || 'Not provided'}</Text>
                      
                      <Divider />
                      
                      <Text fontWeight="bold">References:</Text>
                      <Text noOfLines={3}>{references || 'Not provided'}</Text>
                      
                      <Divider />
                      
                      <Text fontWeight="bold">Funding:</Text>
                      <Text>{funding || 'Not provided'}</Text>
                      
                      <Divider />
                      
                      <Text fontWeight="bold">Ethical Approvals:</Text>
                      <Text>{ethicalApprovals || 'Not provided'}</Text>
                      
                      <Divider />
                      
                      <Text fontWeight="bold">Data Availability:</Text>
                      <Text>{dataAvailability || 'Not provided'}</Text>
                      
                      <Divider />
                      
                      <Text fontWeight="bold">Conflicts of Interest:</Text>
                      <Text>{conflictsOfInterest || 'Not provided'}</Text>
                      
                      <Divider />
                      
                      <Text fontWeight="bold">License:</Text>
                      <Text>{license}</Text>
                    </VStack>
                  </Box>
                  
                  <Divider my={4} />
                  
                  <Heading size="sm" mb={4}>Author Declarations</Heading>
                  
                  <VStack align="start" spacing={3}>
                    <FormControl isRequired>
                      <Flex>
                        <Checkbox 
                          id="is-original" 
                          isChecked={authorDeclarations.isOriginal}
                          onChange={(e) => setAuthorDeclarations({...authorDeclarations, isOriginal: e.target.checked})}
                          mr={2}
                        />
                        <FormLabel htmlFor="is-original" mb={0}>
                          This work is original and not under review elsewhere.
                        </FormLabel>
                      </Flex>
                    </FormControl>
                    
                    <FormControl isRequired>
                      <Flex>
                        <Checkbox 
                          id="all-authors-approved" 
                          isChecked={authorDeclarations.allAuthorsApproved}
                          onChange={(e) => setAuthorDeclarations({...authorDeclarations, allAuthorsApproved: e.target.checked})}
                          mr={2}
                        />
                        <FormLabel htmlFor="all-authors-approved" mb={0}>
                          All authors have approved the final manuscript.
                        </FormLabel>
                      </Flex>
                    </FormControl>
                    
                    <FormControl isRequired>
                      <Flex>
                        <Checkbox 
                          id="agree-to-terms" 
                          isChecked={authorDeclarations.agreeToTerms}
                          onChange={(e) => setAuthorDeclarations({...authorDeclarations, agreeToTerms: e.target.checked})}
                          mr={2}
                        />
                        <FormLabel htmlFor="agree-to-terms" mb={0}>
                          I agree to the platform's terms and policies.
                        </FormLabel>
                      </Flex>
                    </FormControl>
                  </VStack>
                  
                  <Box 
                    p={6} 
                    bg="green.50" 
                    borderRadius="md" 
                    borderWidth="1px" 
                    borderColor="green.200"
                    width="100%"
                    mt={6}
                  >
                    <VStack spacing={4}>
                      <FiCheck size={48} color="var(--chakra-colors-green-500)" />
                      <Text fontWeight="medium" textAlign="center">
                        Your article is ready for submission. Once submitted, it will enter our peer review process.
                      </Text>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        You will be notified of any updates or when reviews are completed.
                      </Text>
                    </VStack>
                  </Box>
                  
                  <Flex justify="center" mt={6}>
                    <Button 
                      colorScheme="green" 
                      size="lg" 
                      leftIcon={<FiUpload />}
                      onClick={handleSubmit}
                      isDisabled={!authorDeclarations.isOriginal || !authorDeclarations.allAuthorsApproved || !authorDeclarations.agreeToTerms}
                    >
                      Submit Article
                    </Button>
                  </Flex>
                </VStack>
              )}
              
              <Flex justify="space-between" mt={8}>
                <Button 
                  leftIcon={<FiArrowLeft />} 
                  onClick={handlePrevious}
                  isDisabled={activeStep === 0}
                  variant="ghost"
                >
                  Previous
                </Button>
                
                {activeStep < 4 ? (
                  <Button 
                    rightIcon={<FiArrowRight />} 
                    onClick={handleNext}
                    colorScheme="green"
                  >
                    Next
                  </Button>
                ) : null}
              </Flex>
            </Box>
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

export default SubmitPage;
