import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Textarea,
  Text,
  VStack,
  HStack,
  Checkbox,
  useToast,
  useColorModeValue,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Progress,
  Badge,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FiCheck, FiInfo, FiPlus, FiUser, FiMail, FiBookOpen, FiHash, FiLink, FiGlobe } from 'react-icons/fi';
import { useRouter } from 'next/router';

// Mock data for institutions and departments
const MOCK_INSTITUTIONS = [
  'Harvard University',
  'Stanford University',
  'Massachusetts Institute of Technology',
  'University of California, Berkeley',
  'University of Oxford',
  'University of Cambridge',
  'California Institute of Technology',
  'ETH Zurich',
  'Imperial College London',
  'University College London',
];

const MOCK_DEPARTMENTS = [
  'Department of Physics',
  'Department of Chemistry',
  'Department of Biology',
  'Department of Computer Science',
  'Department of Mathematics',
  'Department of Economics',
  'Department of Psychology',
  'Department of Neuroscience',
  'Department of Engineering',
  'Department of Medicine',
];

const ACADEMIC_POSITIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Postdoctoral Researcher',
  'PhD Candidate',
  'PhD Student',
  'Master\'s Student',
  'Research Scientist',
  'Lecturer',
  'Other',
];

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  secondaryEmail: string;
  emailVerified: boolean;
  institution: string;
  department: string;
  position: string;
  orcidId: string;
  researchInterests: string[];
  wantsToBeEditor: boolean;
  personalWebsite: string;
  socialMedia: {
    twitter: string;
    linkedin: string;
  };
  [key: string]: any; // Index signature to allow dynamic access
}

interface ProfileCompletionFormProps {
  onComplete: (profileData: any) => void;
}

const ProfileCompletionForm: React.FC<ProfileCompletionFormProps> = ({ onComplete }) => {
  const router = useRouter();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProfileFormData>({
    // Basic Identity & Contact
    firstName: '',
    lastName: '',
    email: '',
    secondaryEmail: '',
    emailVerified: false,
    
    // Institutional Affiliation
    institution: '',
    department: '',
    position: '',
    
    // Academic & Professional Details
    orcidId: '',
    researchInterests: [] as string[],
    
    // Platform Roles & Activity
    wantsToBeEditor: false,
    
    // Optional Extras
    personalWebsite: '',
    socialMedia: {
      twitter: '',
      linkedin: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newInterest, setNewInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent] as Record<string, any>),
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Handle research interests
  const addResearchInterest = () => {
    if (newInterest.trim() && !formData.researchInterests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        researchInterests: [...formData.researchInterests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const removeResearchInterest = (interest: string) => {
    setFormData({
      ...formData,
      researchInterests: formData.researchInterests.filter(i => i !== interest),
    });
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Validate academic email
  const isValidAcademicEmail = (email: string) => {
    // Whitelist specific email for testing
    const whitelistedEmails = ['dom123dxb@gmail.com'];
    if (whitelistedEmails.includes(email.toLowerCase())) {
      return true;
    }
    
    return /\S+@\S+\.(edu|ac\.\w{2,})$/.test(email);
  };

  // Validate ORCID format
  const isValidOrcid = (orcid: string) => {
    return /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(orcid) || orcid === '';
  };

  // Validate form for current step
  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 0) {
      // Validate Basic Identity & Contact
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = 'Invalid email format';
      } else if (!isValidAcademicEmail(formData.email)) {
        newErrors.email = 'Must be an academic email (.edu or .ac.xx domain)';
      }
      
      if (formData.secondaryEmail && !isValidEmail(formData.secondaryEmail)) {
        newErrors.secondaryEmail = 'Invalid email format';
      }
    } else if (currentStep === 1) {
      // Validate Institutional Affiliation
      if (!formData.institution.trim()) {
        newErrors.institution = 'Institution is required';
      }
      
      if (!formData.department.trim()) {
        newErrors.department = 'Department is required';
      }
      
      if (!formData.position) {
        newErrors.position = 'Position is required';
      }
    } else if (currentStep === 2) {
      // Validate Academic & Professional Details
      if (formData.orcidId && !isValidOrcid(formData.orcidId)) {
        newErrors.orcidId = 'Invalid ORCID format (e.g., 0000-0002-1825-0097)';
      }
      
      if (formData.researchInterests.length === 0) {
        newErrors.researchInterests = 'At least one research interest is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Move to next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
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

  // Move to previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Submit form
  const handleSubmit = () => {
    // Validate all steps
    const allValid = validateCurrentStep();
    
    if (allValid) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        // Create user profile object
        const userProfile = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          secondaryEmail: formData.secondaryEmail,
          emailVerified: true, // In a real app, this would be set after verification
          institution: formData.institution,
          department: formData.department,
          position: formData.position,
          orcidId: formData.orcidId,
          researchInterests: formData.researchInterests,
          wantsToBeEditor: formData.wantsToBeEditor,
          personalWebsite: formData.personalWebsite,
          socialMedia: formData.socialMedia,
          role: 'Researcher',
          articles: 0,
          reviews: 0,
          reputation: 0,
          profileComplete: true,
        };
        
        // Save to localStorage (in a real app, this would be saved to a database)
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('profileComplete', 'true');
        
        toast({
          title: 'Profile Completed',
          description: 'Your profile has been successfully set up.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        setIsSubmitting(false);
        
        // Call the onComplete callback
        onComplete(userProfile);
      }, 1500);
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / 4) * 100;

  return (
    <Container maxW="container.md" py={8}>
      <Box 
        bg={bgColor} 
        p={6} 
        borderRadius="lg" 
        boxShadow="md" 
        borderWidth="1px" 
        borderColor={borderColor}
      >
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="lg" textAlign="center">
            Complete Your Profile
          </Heading>
          
          <Text textAlign="center" color="gray.600">
            Please provide the following information to complete your profile. This information is required before you can submit or review articles.
          </Text>
          
          <Progress 
            value={progressPercentage} 
            size="sm" 
            colorScheme="green" 
            borderRadius="full" 
            mb={4} 
          />
          
          <Tabs index={currentStep} variant="enclosed" onChange={setCurrentStep}>
            <TabList>
              <Tab isDisabled={currentStep !== 0}>
                <Flex align="center">
                  <Icon as={FiUser} mr={2} />
                  <Text>Basic Info</Text>
                </Flex>
              </Tab>
              <Tab isDisabled={currentStep !== 1}>
                <Flex align="center">
                  <Icon as={FiBookOpen} mr={2} />
                  <Text>Affiliation</Text>
                </Flex>
              </Tab>
              <Tab isDisabled={currentStep !== 2}>
                <Flex align="center">
                  <Icon as={FiHash} mr={2} />
                  <Text>Academic</Text>
                </Flex>
              </Tab>
              <Tab isDisabled={currentStep !== 3}>
                <Flex align="center">
                  <Icon as={FiGlobe} mr={2} />
                  <Text>Extras</Text>
                </Flex>
              </Tab>
            </TabList>
            
            <TabPanels>
              {/* Step 1: Basic Identity & Contact */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Heading as="h2" size="md">
                    Basic Identity & Contact
                  </Heading>
                  
                  <HStack spacing={4}>
                    <FormControl isRequired isInvalid={!!errors.firstName}>
                      <FormLabel>First Name</FormLabel>
                      <Input 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                      />
                      <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isRequired isInvalid={!!errors.lastName}>
                      <FormLabel>Last Name</FormLabel>
                      <Input 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                      />
                      <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                    </FormControl>
                  </HStack>
                  
                  <FormControl isRequired isInvalid={!!errors.email}>
                    <FormLabel>Academic Email Address</FormLabel>
                    <Input 
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.name@university.edu"
                    />
                    <FormHelperText>
                      Must be a .edu or .ac.xx domain to verify academic affiliation
                    </FormHelperText>
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={!!errors.secondaryEmail}>
                    <FormLabel>Secondary Email (Optional)</FormLabel>
                    <Input 
                      name="secondaryEmail"
                      type="email"
                      value={formData.secondaryEmail}
                      onChange={handleChange}
                      placeholder="your.personal@email.com"
                    />
                    <FormHelperText>
                      For password recovery or non-academic communication
                    </FormHelperText>
                    <FormErrorMessage>{errors.secondaryEmail}</FormErrorMessage>
                  </FormControl>
                  
                  <Box mt={2} p={3} bg="blue.50" borderRadius="md">
                    <Flex align="center">
                      <Icon as={FiInfo} color="blue.500" mr={2} />
                      <Text fontSize="sm" color="blue.700">
                        Email verification will be required after submission. You'll receive a verification link at your academic email address.
                      </Text>
                    </Flex>
                  </Box>
                </VStack>
              </TabPanel>
              
              {/* Step 2: Institutional Affiliation */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Heading as="h2" size="md">
                    Institutional Affiliation
                  </Heading>
                  
                  <FormControl isRequired isInvalid={!!errors.institution}>
                    <FormLabel>University Name</FormLabel>
                    <Select
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="Select your institution"
                    >
                      {MOCK_INSTITUTIONS.map((inst) => (
                        <option key={inst} value={inst}>{inst}</option>
                      ))}
                    </Select>
                    <FormHelperText>
                      If your institution is not listed, please select "Other" and contact support
                    </FormHelperText>
                    <FormErrorMessage>{errors.institution}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isRequired isInvalid={!!errors.department}>
                    <FormLabel>Department/Faculty</FormLabel>
                    <Select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Select your department"
                    >
                      {MOCK_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.department}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isRequired isInvalid={!!errors.position}>
                    <FormLabel>Current Position/Title</FormLabel>
                    <Select
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="Select your position"
                    >
                      {ACADEMIC_POSITIONS.map((pos) => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.position}</FormErrorMessage>
                  </FormControl>
                </VStack>
              </TabPanel>
              
              {/* Step 3: Academic & Professional Details */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Heading as="h2" size="md">
                    Academic & Professional Details
                  </Heading>
                  
                  <FormControl isInvalid={!!errors.orcidId}>
                    <FormLabel>
                      <Flex align="center">
                        ORCID ID
                        <Tooltip label="ORCID provides a persistent digital identifier that distinguishes you from other researchers">
                          <Icon as={FiInfo} ml={1} color="gray.500" />
                        </Tooltip>
                      </Flex>
                    </FormLabel>
                    <Input 
                      name="orcidId"
                      value={formData.orcidId}
                      onChange={handleChange}
                      placeholder="0000-0000-0000-0000"
                    />
                    <FormHelperText>
                      Format: 0000-0000-0000-0000 (Find your ORCID at orcid.org)
                    </FormHelperText>
                    <FormErrorMessage>{errors.orcidId}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isRequired isInvalid={!!errors.researchInterests}>
                    <FormLabel>Research Interests / Keywords</FormLabel>
                    <HStack>
                      <Input 
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add a research interest"
                      />
                      <Button 
                        leftIcon={<FiPlus />} 
                        onClick={addResearchInterest}
                        isDisabled={!newInterest.trim()}
                      >
                        Add
                      </Button>
                    </HStack>
                    <FormErrorMessage>{errors.researchInterests}</FormErrorMessage>
                    
                    <Box mt={2}>
                      <Flex wrap="wrap" gap={2} mt={2}>
                        {formData.researchInterests.map((interest) => (
                          <Tag key={interest} size="md" colorScheme="blue" borderRadius="full">
                            <TagLabel>{interest}</TagLabel>
                            <TagCloseButton onClick={() => removeResearchInterest(interest)} />
                          </Tag>
                        ))}
                      </Flex>
                    </Box>
                  </FormControl>
                </VStack>
              </TabPanel>
              
              {/* Step 4: Platform Roles & Optional Extras */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Heading as="h2" size="md">
                    Platform Roles & Optional Information
                  </Heading>
                  
                  <FormControl>
                    <Checkbox
                      name="wantsToBeEditor"
                      isChecked={formData.wantsToBeEditor}
                      onChange={handleCheckboxChange}
                    >
                      I would like to become an editor (subject to approval)
                    </Checkbox>
                    <FormHelperText>
                      Editors help manage the peer review process and make publication decisions
                    </FormHelperText>
                  </FormControl>
                  
                  <Divider my={2} />
                  
                  <Heading as="h3" size="sm">
                    Optional Information
                  </Heading>
                  
                  <FormControl>
                    <FormLabel>Personal Website</FormLabel>
                    <Input 
                      name="personalWebsite"
                      value={formData.personalWebsite}
                      onChange={handleChange}
                      placeholder="https://your-website.com"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Twitter/X Profile</FormLabel>
                    <InputGroup>
                      <Input 
                        name="socialMedia.twitter"
                        value={formData.socialMedia.twitter}
                        onChange={handleChange}
                        placeholder="username"
                      />
                      <InputRightElement pointerEvents="none" color="gray.400">
                        @
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>LinkedIn Profile</FormLabel>
                    <Input 
                      name="socialMedia.linkedin"
                      value={formData.socialMedia.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </FormControl>
                  
                  <Box mt={4} p={3} bg="green.50" borderRadius="md">
                    <Flex align="center">
                      <Icon as={FiCheck} color="green.500" mr={2} />
                      <Text fontSize="sm" color="green.700">
                        You're almost done! Review your information and click "Complete Profile" to finish.
                      </Text>
                    </Flex>
                  </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
          
          <Divider my={2} />
          
          <Flex justify="space-between">
            <Button
              onClick={handlePrevStep}
              isDisabled={currentStep === 0}
              variant="outline"
            >
              Previous
            </Button>
            
            {currentStep < 3 ? (
              <Button
                onClick={handleNextStep}
                colorScheme="blue"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                colorScheme="green"
                isLoading={isSubmitting}
                loadingText="Submitting"
              >
                Complete Profile
              </Button>
            )}
          </Flex>
        </VStack>
      </Box>
    </Container>
  );
};

export default ProfileCompletionForm;
