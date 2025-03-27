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
  isDisabled?: boolean;
}

const ProfileCompletionForm: React.FC<ProfileCompletionFormProps> = ({ 
  onSave, 
  initialData, 
  isEditMode = false, 
  onCancel,
  isDisabled = false,
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
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('ProfileCompletionForm: Submission already in progress, skipping duplicate request');
      return;
    }
    
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
        // Mark profile as complete
        profileComplete: true,
        // Add timestamp
        updatedAt: new Date().toISOString(),
        // Additional fields can be added here if they're added to UserProfile type
      };
      
      console.log('ProfileCompletionForm: Submitting profile data:', profileData);
      
      // Add a debounce delay to prevent rapid consecutive submissions
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
        
        // If not in edit mode, redirect to home page after a short delay
        // This gives time for the toast to be seen and Firebase to update
        if (!isEditMode) {
          setTimeout(() => {
            router.push('/');
          }, 1000);
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
      // Add a small delay before resetting the submitting state
      // This prevents accidental double-clicks
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <Box 
      bg={bgColor} 
      p={6} 
      borderRadius="lg" 
      boxShadow="md" 
      borderWidth="1px" 
      borderColor={borderColor}
    >
      {/* Form header */}
      <Heading as="h2" size="lg" mb={6}>
        {isEditMode ? 'Edit Your Profile' : 'Complete Your Profile'}
      </Heading>
      
      {/* Progress bar */}
      <Progress 
        value={progressPercentage} 
        size="sm" 
        colorScheme="blue" 
        mb={6} 
        borderRadius="full"
        hasStripe
        isAnimated
      />
      
      {/* Step indicator */}
      <Flex justify="space-between" mb={6}>
        {steps.map((step, index) => (
          <Tooltip key={index} label={step.description}>
            <Box 
              textAlign="center" 
              opacity={index <= currentStep ? 1 : 0.5}
              fontWeight={index === currentStep ? 'bold' : 'normal'}
              cursor="pointer"
              onClick={() => {
                // Only allow going back to previous steps, not skipping ahead
                if (index < currentStep) {
                  setCurrentStep(index);
                }
              }}
            >
              <Badge 
                colorScheme={index <= currentStep ? 'blue' : 'gray'} 
                borderRadius="full" 
                px={2}
                mb={1}
              >
                {index + 1}
              </Badge>
              <Text fontSize="xs" display={{ base: 'none', md: 'block' }}>
                {step.title}
              </Text>
            </Box>
          </Tooltip>
        ))}
      </Flex>
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          {/* Step 1: Basic Identity & Contact */}
          {currentStep === 0 && (
            <>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired isInvalid={!!errors.firstName}>
                  <FormLabel>First Name</FormLabel>
                  <Input 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    placeholder="Enter your first name"
                    isDisabled={isSubmitting || isDisabled}
                  />
                  {errors.firstName && (
                    <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                  )}
                </FormControl>
                
                <FormControl isRequired isInvalid={!!errors.lastName}>
                  <FormLabel>Last Name</FormLabel>
                  <Input 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    placeholder="Enter your last name"
                    isDisabled={isSubmitting || isDisabled}
                  />
                  {errors.lastName && (
                    <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                  )}
                </FormControl>
              </SimpleGrid>
              
              <FormControl isRequired isInvalid={!!errors.email}>
                <FormLabel>Academic Email</FormLabel>
                <Input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="Enter your academic email"
                  isDisabled={isSubmitting || isDisabled}
                />
                <FormHelperText>
                  We recommend using your institutional email (.edu or .ac domains)
                </FormHelperText>
                {errors.email && (
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                )}
              </FormControl>
            </>
          )}
          
          {/* Step 2: Institutional Affiliation */}
          {currentStep === 1 && (
            <>
              <FormControl isRequired isInvalid={!!errors.institution}>
                <FormLabel>Institution</FormLabel>
                <Input 
                  name="institution" 
                  value={formData.institution} 
                  onChange={handleChange} 
                  placeholder="Enter your institution"
                  list="institutions"
                  isDisabled={isSubmitting || isDisabled}
                />
                <datalist id="institutions">
                  {MOCK_INSTITUTIONS.map((inst, index) => (
                    <option key={index} value={inst} />
                  ))}
                </datalist>
                {errors.institution && (
                  <FormErrorMessage>{errors.institution}</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl isRequired isInvalid={!!errors.department}>
                <FormLabel>Department</FormLabel>
                <Input 
                  name="department" 
                  value={formData.department} 
                  onChange={handleChange} 
                  placeholder="Enter your department"
                  list="departments"
                  isDisabled={isSubmitting || isDisabled}
                />
                <datalist id="departments">
                  {MOCK_DEPARTMENTS.map((dept, index) => (
                    <option key={index} value={dept} />
                  ))}
                </datalist>
                {errors.department && (
                  <FormErrorMessage>{errors.department}</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl isRequired isInvalid={!!errors.position}>
                <FormLabel>Position</FormLabel>
                <Select 
                  name="position" 
                  value={formData.position} 
                  onChange={handleChange}
                  placeholder="Select your position"
                  isDisabled={isSubmitting || isDisabled}
                >
                  {ACADEMIC_POSITIONS.map((pos, index) => (
                    <option key={index} value={pos}>{pos}</option>
                  ))}
                </Select>
                {errors.position && (
                  <FormErrorMessage>{errors.position}</FormErrorMessage>
                )}
              </FormControl>
            </>
          )}
          
          {/* Step 3: Academic & Professional Details */}
          {currentStep === 2 && (
            <>
              <FormControl isRequired isInvalid={!!errors.researchInterests}>
                <FormLabel>Research Interests</FormLabel>
                <ResearchInterestSelector 
                  selectedInterests={formData.researchInterests} 
                  onChange={(interests) => {
                    setFormData(prev => ({
                      ...prev,
                      researchInterests: interests
                    }));
                    
                    // Clear error if it exists
                    if (errors.researchInterests) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.researchInterests;
                        return newErrors;
                      });
                    }
                  }}
                  isDisabled={isSubmitting || isDisabled}
                />
                {errors.researchInterests && (
                  <FormErrorMessage>{errors.researchInterests}</FormErrorMessage>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!errors.orcidId}>
                <FormLabel>
                  ORCID ID
                  <Tooltip label="ORCID provides a persistent digital identifier for researchers">
                    <Icon as={FiInfo} ml={1} />
                  </Tooltip>
                </FormLabel>
                <Input 
                  name="orcidId" 
                  value={formData.orcidId || ''} 
                  onChange={handleChange} 
                  placeholder="0000-0000-0000-0000"
                  isDisabled={isSubmitting || isDisabled}
                />
                <FormHelperText>
                  Optional. Format: 0000-0000-0000-0000
                </FormHelperText>
                {errors.orcidId && (
                  <FormErrorMessage>{errors.orcidId}</FormErrorMessage>
                )}
              </FormControl>
            </>
          )}
          
          {/* Step 4: Platform Roles & Optional Details */}
          {currentStep === 3 && (
            <>
              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  isDisabled={isSubmitting || isDisabled}
                >
                  <option value="Researcher">Researcher</option>
                  <option value="Professor">Professor</option>
                  <option value="Student">Student</option>
                  <option value="Industry Professional">Industry Professional</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>
                  <Checkbox 
                    name="wantsToBeEditor" 
                    isChecked={formData.wantsToBeEditor} 
                    onChange={handleCheckboxChange}
                    isDisabled={isSubmitting || isDisabled}
                  >
                    I'm interested in becoming an editor
                  </Checkbox>
                </FormLabel>
                <FormHelperText>
                  Editors help review and approve submissions
                </FormHelperText>
              </FormControl>
            </>
          )}
          
          {/* Navigation buttons */}
          <Flex justify="space-between" mt={8}>
            {currentStep > 0 ? (
              <Button 
                leftIcon={<FiArrowLeft />} 
                onClick={handlePrevStep}
                variant="outline"
                isDisabled={isSubmitting || isDisabled}
              >
                Previous
              </Button>
            ) : (
              <Button 
                leftIcon={<FiX />} 
                onClick={onCancel || (() => router.push('/'))}
                variant="outline"
                isDisabled={isSubmitting || isDisabled}
              >
                Cancel
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button 
                rightIcon={<FiArrowRight />} 
                onClick={handleNext}
                colorScheme="blue"
                isDisabled={isSubmitting || isDisabled}
              >
                Next
              </Button>
            ) : (
              <Button 
                type="submit" 
                colorScheme="green" 
                rightIcon={<FiCheck />}
                isLoading={isSubmitting}
                loadingText="Saving..."
                isDisabled={isSubmitting || isDisabled}
              >
                {isEditMode ? 'Save Changes' : 'Complete Profile'}
              </Button>
            )}
          </Flex>
        </VStack>
      </form>
    </Box>
  );
};

export default ProfileCompletionForm;
