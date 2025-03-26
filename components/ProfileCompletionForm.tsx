import React, { useState, useEffect } from 'react';
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
import { UserProfile } from '../hooks/useProfileData';

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

// Define the form data structure
interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  department: string;
  position: string;
  researchInterests: string[];
  role: string;
  twitter?: string;
  linkedin?: string;
  personalWebsite?: string;
  orcidId?: string;
  wantsToBeEditor?: boolean;
}

// Define component props
export interface ProfileCompletionFormProps {
  onSave: (profileData: Partial<UserProfile>) => Promise<boolean>;
  initialData?: UserProfile;
  isEditMode?: boolean;
  onCancel?: () => void;
}

const ProfileCompletionForm: React.FC<ProfileCompletionFormProps> = ({ 
  onSave, 
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

  // Initialize form data with defaults or provided initialData
  const [formData, setFormData] = useState<ProfileFormData>(() => {
    // If initialData is provided, parse the name into firstName and lastName
    if (initialData) {
      const nameParts = (initialData.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        firstName,
        lastName,
        email: initialData.email || '',
        institution: initialData.institution || '',
        department: initialData.department || '',
        position: initialData.position || '',
        researchInterests: initialData.researchInterests || [],
        role: initialData.role || 'Researcher',
        // Optional fields
        personalWebsite: '',
        orcidId: '',
        wantsToBeEditor: false
      };
    }
    
    // Default empty form
    return {
      firstName: '',
      lastName: '',
      email: '',
      institution: '',
      department: '',
      position: '',
      researchInterests: [],
      role: 'Researcher',
      personalWebsite: '',
      orcidId: '',
      wantsToBeEditor: false
    };
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    // Handle nested properties (like socialMedia.twitter)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
      return;
    }
    
    // Handle regular inputs
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
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

  // Validate form data for a specific step
  const validateStep = (step: number): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    if (step === 0) {
      // Basic Identity & Contact validation
      if (!isEditMode) {
        // Only validate first name, last name, and email if not in edit mode
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'First name is required';
        }
        
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
        }
        
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!isValidEmail(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        } else if (!isValidAcademicEmail(formData.email)) {
          newErrors.email = 'Please use an academic email (.edu or .ac.xx domain)';
        }
      }
    } else if (step === 1) {
      // Institutional Affiliation validation
      if (!isEditMode) {
        // Only validate institution if not in edit mode
        if (!formData.institution.trim()) {
          newErrors.institution = 'Institution is required';
        }
      }
      
      // Always validate department and position
      if (!formData.department.trim()) {
        newErrors.department = 'Department is required';
      }
      
      if (!formData.position.trim()) {
        newErrors.position = 'Position is required';
      }
    } else if (step === 2) {
      // Academic & Professional Details validation
      if (formData.orcidId && !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(formData.orcidId)) {
        newErrors.orcidId = 'Please enter a valid ORCID ID (format: 0000-0000-0000-0000)';
      }
      
      if (!formData.researchInterests || formData.researchInterests.length === 0) {
        newErrors.researchInterests = 'Please select at least one research interest';
      }
    }
    
    // Update errors state
    setErrors(newErrors);
    
    return newErrors;
  };

  // Move to next step
  const handleNext = () => {
    if (Object.keys(validateStep(currentStep)).length === 0) {
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Validate form
      const validationErrors = validateStep(currentStep);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }
      
      // Combine first and last name for the API
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      // Prepare data for API - only include fields that exist in UserProfile
      const profileData: Partial<UserProfile> = {
        name: fullName,
        email: formData.email,
        institution: formData.institution,
        department: formData.department,
        position: formData.position,
        researchInterests: formData.researchInterests,
        role: formData.role,
        // Additional fields can be added here if they're added to UserProfile type
      };
      
      console.log('ProfileCompletionForm: Submitting profile data:', profileData);
      
      // Call the onSave function passed from parent
      const success = await onSave(profileData);
      
      if (success) {
        showToast({
          id: isEditMode ? 'profile-updated' : 'profile-completed',
          title: isEditMode ? 'Profile Updated' : 'Profile Completed',
          description: isEditMode 
            ? 'Your profile has been successfully updated.' 
            : 'Your profile has been successfully set up.',
          status: 'success',
          duration: 5000,
        });
        
        // If not in edit mode, redirect to home page
        if (!isEditMode) {
          router.push('/');
        }
      } else {
        showToast({
          id: 'profile-submission-error',
          title: 'Error',
          description: 'Failed to save profile. Please try again.',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('[ERROR] Error in handleSubmit:', error);
      showToast({
        id: 'profile-submission-error',
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
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
                        isReadOnly={isEditMode} 
                        bg={isEditMode ? "gray.100" : undefined}
                      />
                      {isEditMode && (
                        <FormHelperText>
                          First name cannot be changed after profile creation
                        </FormHelperText>
                      )}
                      <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isRequired isInvalid={!!errors.lastName}>
                      <FormLabel>Last Name</FormLabel>
                      <Input 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleChange} 
                        placeholder="Enter your last name"
                        isReadOnly={isEditMode} 
                        bg={isEditMode ? "gray.100" : undefined}
                      />
                      {isEditMode && (
                        <FormHelperText>
                          Last name cannot be changed after profile creation
                        </FormHelperText>
                      )}
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
                      isReadOnly={isEditMode}
                      isDisabled={isEditMode}
                      bg={isEditMode ? "gray.100" : undefined}
                    >
                      {MOCK_INSTITUTIONS.map((institution, index) => (
                        <option key={index} value={institution}>
                          {institution}
                        </option>
                      ))}
                    </Select>
                    {isEditMode && (
                      <FormHelperText>
                        Institution cannot be changed after profile creation
                      </FormHelperText>
                    )}
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
                      onChange={(interests) => setFormData(prev => ({ ...prev, researchInterests: interests }))}
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
