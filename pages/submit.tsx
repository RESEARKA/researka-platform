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
} from '@chakra-ui/react';
import { FiUpload, FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import Layout from '../components/Layout';
import { FiFileText, FiChevronDown } from 'react-icons/fi';
import Head from 'next/head';
import Link from 'next/link';

// Define the steps for the submission process
const steps = [
  { title: 'Basic Info', description: 'Article details' },
  { title: 'Content', description: 'Write or upload' },
  { title: 'Review', description: 'Check your submission' },
  { title: 'Submit', description: 'Finalize submission' },
];

const SubmitPage: React.FC = () => {
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Form state
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user is logged in and profile is complete
  React.useEffect(() => {
    // Client-side only
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      
      if (isLoggedIn !== 'true') {
        // Redirect to homepage if not logged in
        window.location.href = '/';
        return;
      }
      
      // Check if profile is complete
      const profileComplete = localStorage.getItem('profileComplete');
      
      if (profileComplete !== 'true') {
        // Redirect to profile page to complete profile
        window.location.href = '/profile';
        return;
      }
    }
  }, []);
  
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
      case 'content':
        setContent(value);
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
    setContent('');
    setFile(null);
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
                  <Heading size="md">Article Content</Heading>
                  
                  <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                    <Button 
                      leftIcon={<FiFileText />} 
                      colorScheme="green" 
                      variant="outline" 
                      flex="1"
                      py={8}
                    >
                      Write in Editor
                    </Button>
                    
                    <Button 
                      leftIcon={<FiUpload />} 
                      colorScheme="green" 
                      variant="outline" 
                      flex="1"
                      py={8}
                    >
                      Upload Document
                    </Button>
                  </Flex>
                  
                  <Divider my={4} />
                  
                  <FormControl>
                    <FormLabel htmlFor="article-content">Article Content</FormLabel>
                    <Textarea 
                      id="article-content"
                      name="content" 
                      value={content} 
                      onChange={handleInputChange} 
                      placeholder="Write or paste your article content here"
                      rows={12}
                    />
                  </FormControl>
                </VStack>
              )}
              
              {activeStep === 2 && (
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
                      
                      <Text fontWeight="bold">Content Preview:</Text>
                      <Text noOfLines={3}>{content || 'No content added'}</Text>
                    </VStack>
                  </Box>
                </VStack>
              )}
              
              {activeStep === 3 && (
                <VStack spacing={6} align="center">
                  <Heading size="md">Ready to Submit</Heading>
                  
                  <Box 
                    p={6} 
                    bg="green.50" 
                    borderRadius="md" 
                    borderWidth="1px" 
                    borderColor="green.200"
                    width="100%"
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
                  
                  <Button 
                    colorScheme="green" 
                    size="lg" 
                    leftIcon={<FiUpload />}
                    onClick={handleSubmit}
                    mt={4}
                  >
                    Submit Article
                  </Button>
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
                
                {activeStep < 3 ? (
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
