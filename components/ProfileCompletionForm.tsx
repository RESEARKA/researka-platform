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
  SimpleGrid,
} from '@chakra-ui/react';
import { FiCheck, FiInfo, FiPlus, FiUser, FiMail, FiBookOpen, FiHash, FiLink, FiGlobe, FiArrowLeft, FiX, FiArrowRight } from 'react-icons/fi';
import { useRouter } from 'next/router';
import ResearchInterestSelector from './ResearchInterestSelector';
import useAppToast from '../hooks/useAppToast';

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
  initialData?: any;
  isEditMode?: boolean;
  onCancel?: () => void;
}

const ProfileCompletionForm: React.FC<ProfileCompletionFormProps> = ({ 
  onComplete, 
  initialData, 
  isEditMode = false, 
  onCancel,
}) => {
  const router = useRouter();
  const showToast = useAppToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Define steps for the form
  const steps = [
    { title: 'Basic Identity & Contact', description: 'Your personal information' },
    { title: 'Institutional Affiliation', description: 'Your academic institution' },
    { title: 'Academic & Professional Details', description: 'Your research profile' },
    { title: 'Platform Roles & Optional Details', description: 'Additional information' }
  ];

  // Ensure initialData has the required fields with default values
  const safeInitialData = initialData ? {
    ...initialData,
    hasChangedName: initialData?.hasChangedName === true,
    hasChangedInstitution: initialData?.hasChangedInstitution === true
  } : {
    hasChangedName: false,
    hasChangedInstitution: false
  };

  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProfileFormData>({
    // Basic Identity & Contact
    firstName: safeInitialData?.firstName || '',
    lastName: safeInitialData?.lastName || '',
    email: safeInitialData?.email || '',
    secondaryEmail: safeInitialData?.secondaryEmail || '',
    emailVerified: safeInitialData?.emailVerified || false,
    
    // Institutional Affiliation
    institution: safeInitialData?.institution || '',
    department: safeInitialData?.department || '',
    position: safeInitialData?.position || '',
    
    // Academic & Professional Details
    orcidId: safeInitialData?.orcidId || '',
    researchInterests: safeInitialData?.researchInterests || [] as string[],
    
    // Platform Roles & Activity
    wantsToBeEditor: safeInitialData?.wantsToBeEditor || false,
    
    // Optional Extras
    personalWebsite: safeInitialData?.personalWebsite || '',
    socialMedia: {
      twitter: safeInitialData?.socialMedia?.twitter || '',
      linkedin: safeInitialData?.socialMedia?.linkedin || '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
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
    
    // Allow .edu domains, .ac domains, and .ac.xx domains
    return /\S+@\S+\.(edu|ac(\.\w{2})?)$/.test(email);
  };

  // Validate form for current step
  const validateStep = (step: number) => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    
    // Validate based on current step
    if (step === 0) {
      // Basic Identity & Contact validation
      if (!isEditMode) {
        // Only validate first name, last name, and email if not in edit mode
        if (!formData.firstName) {
          newErrors.firstName = 'First name is required';
          isValid = false;
        }
        
        if (!formData.lastName) {
          newErrors.lastName = 'Last name is required';
          isValid = false;
        }
        
        if (!formData.email) {
          newErrors.email = 'Email is required';
          isValid = false;
        } else if (!isValidEmail(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
          isValid = false;
        } else if (!isValidAcademicEmail(formData.email)) {
          newErrors.email = 'Please use an academic email (.edu or .ac.xx domain)';
          isValid = false;
        }
      }
      
      // Always validate secondary email if provided
      if (formData.secondaryEmail && !isValidEmail(formData.secondaryEmail)) {
        newErrors.secondaryEmail = 'Please enter a valid email address';
        isValid = false;
      }
    } else if (step === 1) {
      // Institutional Affiliation validation
      if (!isEditMode) {
        // Only validate institution if not in edit mode
        if (!formData.institution) {
          newErrors.institution = 'Institution is required';
          isValid = false;
        }
      }
      
      // Always validate department and position
      if (!formData.department) {
        newErrors.department = 'Department is required';
        isValid = false;
      }
      
      if (!formData.position) {
        newErrors.position = 'Position is required';
        isValid = false;
      }
    } else if (step === 2) {
      // Academic & Professional Details validation
      if (formData.orcidId && !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(formData.orcidId)) {
        newErrors.orcidId = 'Please enter a valid ORCID ID (format: 0000-0000-0000-0000)';
        isValid = false;
      }
      
      if (formData.researchInterests.length === 0) {
        newErrors.researchInterests = 'At least one research interest is required';
        isValid = false;
      }
    }
    
    // Update errors state
    setErrors(newErrors);
    
    return isValid;
  };

  // Move to next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      showToast({
        id: 'validation-error',
        title: "Validation Error",
        description: "Please fix the errors before proceeding",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Move to previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Submit form
  const handleSubmit = async () => {
    // Validate all steps
    const allValid = validateStep(currentStep);
    
    if (!allValid) {
      showToast({
        id: 'validation-error',
        title: 'Validation Error',
        description: 'Please fix the errors before submitting.',
        status: 'error',
        duration: 5000,
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
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
      
      // Show toast with unique ID based on mode
      showToast({
        id: isEditMode ? 'profile-updated' : 'profile-completed',
        title: isEditMode ? 'Profile Updated' : 'Profile Completed',
        description: isEditMode 
          ? 'Your profile has been successfully updated.' 
          : 'Your profile has been successfully set up.',
        status: 'success',
        duration: 5000,
      });
      
      console.log('[ProfileCompletionForm] Profile data prepared, calling onComplete');
      
      // Call the onComplete callback and await it in case it's async
      await onComplete(userProfile);
      
      console.log('[ProfileCompletionForm] onComplete callback finished');
    } catch (error) {
      console.error('[ERROR] Error in handleSubmit:', error);
      showToast({
        id: 'profile-submission-error',
        title: 'Error',
        description: 'Failed to complete profile. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

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
            {isEditMode ? 'Edit Your Profile' : 'Complete Your Profile'}
          </Heading>
          <Text textAlign="center" color="gray.600">
            {isEditMode 
              ? 'Update your profile information below' 
              : 'Please complete your profile to access all features of the Researka platform'}
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
              {steps.map((step, index) => (
                <Tab key={index} isDisabled={currentStep !== index}>
                  <Flex align="center">
                    {index === 0 && <Icon as={FiUser} mr={2} />}
                    {index === 1 && <Icon as={FiBookOpen} mr={2} />}
                    {index === 2 && <Icon as={FiHash} mr={2} />}
                    {index === 3 && <Icon as={FiGlobe} mr={2} />}
                    <Text>{step.title}</Text>
                  </Flex>
                </Tab>
              ))}
            </TabList>
            
            <TabPanels>
              {/* Step 1: Basic Identity & Contact */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired isInvalid={!!errors.firstName}>
                      <FormLabel>First Name</FormLabel>
                      <Input 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleChange} 
                        placeholder="Enter your first name"
                        isReadOnly={isEditMode && safeInitialData?.hasChangedName === true} 
                        bg={isEditMode && safeInitialData?.hasChangedName === true ? "gray.100" : undefined}
                      />
                      {isEditMode && safeInitialData?.hasChangedName === true ? (
                        <FormHelperText>
                          First name cannot be changed after initial update
                        </FormHelperText>
                      ) : isEditMode ? (
                        <FormHelperText>
                          You can change your name once after profile creation
                        </FormHelperText>
                      ) : null}
                      <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isRequired isInvalid={!!errors.lastName}>
                      <FormLabel>Last Name</FormLabel>
                      <Input 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleChange} 
                        placeholder="Enter your last name"
                        isReadOnly={isEditMode && safeInitialData?.hasChangedName === true} 
                        bg={isEditMode && safeInitialData?.hasChangedName === true ? "gray.100" : undefined}
                      />
                      {isEditMode && safeInitialData?.hasChangedName === true ? (
                        <FormHelperText>
                          Last name cannot be changed after initial update
                        </FormHelperText>
                      ) : isEditMode ? (
                        <FormHelperText>
                          You can change your name once after profile creation
                        </FormHelperText>
                      ) : null}
                      <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>
                  
                  <FormControl isRequired isInvalid={!!errors.email}>
                    <FormLabel>Academic Email Address</FormLabel>
                    <Input 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="Enter your academic email (.edu or .ac.xx domain)"
                      isReadOnly={isEditMode} 
                      bg={isEditMode ? "gray.100" : undefined}
                    />
                    {isEditMode && (
                      <FormHelperText>
                        Email address cannot be changed after profile creation
                      </FormHelperText>
                    )}
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
                      <Box display="inline-block">
                        <Icon as={FiInfo} color="blue.500" mr={2} />
                      </Box>
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
                    <FormLabel>University / Institution</FormLabel>
                    <Select
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="Select your institution"
                      isReadOnly={isEditMode && safeInitialData?.hasChangedInstitution === true}
                      isDisabled={isEditMode && safeInitialData?.hasChangedInstitution === true}
                      bg={isEditMode && safeInitialData?.hasChangedInstitution === true ? "gray.100" : undefined}
                    >
                      {MOCK_INSTITUTIONS.map((institution, index) => (
                        <option key={index} value={institution}>
                          {institution}
                        </option>
                      ))}
                    </Select>
                    {isEditMode && safeInitialData?.hasChangedInstitution === true ? (
                      <FormHelperText>
                        Institution cannot be changed after initial update
                      </FormHelperText>
                    ) : isEditMode ? (
                      <FormHelperText>
                        You can change your institution once after profile creation
                      </FormHelperText>
                    ) : null}
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
                        ORCID ID (Optional)
                        <Tooltip label="ORCID provides a persistent digital identifier that distinguishes you from other researchers">
                          <Box display="inline-block">
                            <Icon as={FiInfo} ml={1} color="gray.500" />
                          </Box>
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
                    <ResearchInterestSelector
                      selectedInterests={formData.researchInterests}
                      onChange={(interests) => setFormData({ ...formData, researchInterests: interests })}
                      isRequired={true}
                      error={errors.researchInterests}
                      maxInterests={5}
                    />
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
          
          <Flex justify="space-between" mt={6}>
            {currentStep > 0 ? (
              <Button 
                leftIcon={<FiArrowLeft />} 
                onClick={() => setCurrentStep(currentStep - 1)}
                variant="outline"
              >
                Previous
              </Button>
            ) : (
              isEditMode && onCancel ? (
                <Button 
                  leftIcon={<FiX />} 
                  onClick={onCancel}
                  variant="outline"
                  colorScheme="red"
                >
                  Cancel
                </Button>
              ) : <Box />
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button 
                rightIcon={<FiArrowRight />} 
                onClick={handleNext}
                colorScheme="blue"
              >
                Next
              </Button>
            ) : (
              <Button 
                rightIcon={<FiCheck />} 
                onClick={handleSubmit}
                colorScheme="green"
                isLoading={isSubmitting}
              >
                {isEditMode ? 'Save Changes' : 'Complete Profile'}
              </Button>
            )}
          </Flex>
        </VStack>
      </Box>
    </Container>
  );
};

export default ProfileCompletionForm;
