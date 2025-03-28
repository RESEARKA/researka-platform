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
import { createLogger, LogCategory } from '../utils/logger';

// Create a logger instance for profile completion form
const logger = createLogger('profileCompletionForm');

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
  isLoading?: boolean;
}

const ProfileCompletionForm: React.FC<ProfileCompletionFormProps> = ({ 
  onSave, 
  initialData, 
  isEditMode = false, 
  onCancel,
  isDisabled = false,
  isLoading = false,
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
      
      logger.info('Initializing form with existing profile data', {
        context: { 
          userId: initialData.id,
          isComplete: initialData.profileComplete,
          hasName: !!initialData.name
        },
        category: LogCategory.UI
      });
      
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
    
    logger.info('Initializing empty profile form', {
      category: LogCategory.UI
    });
    
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
      
      logger.debug('Checkbox field updated', {
        context: { field: name, value: checked },
        category: LogCategory.UI
      });
      
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    // Handle nested properties (like socialMedia.twitter)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      logger.debug('Nested field updated', {
        context: { parent, child, value },
        category: LogCategory.UI
      });
      
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
      return;
    }
    
    logger.debug('Form field updated', {
      context: { field: name, valueLength: value.length },
      category: LogCategory.UI
    });
    
    // Handle regular inputs
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle research interests changes
  const handleInterestsChange = (interests: string[]) => {
    logger.debug('Research interests updated', {
      context: { count: interests.length, interests },
      category: LogCategory.UI
    });
    
    setFormData(prev => ({
      ...prev,
      researchInterests: interests
    }));
  };

  // Validate form fields for the current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    logger.info(`Validating step ${step + 1}`, {
      category: LogCategory.UI
    });

    // Step 1: Basic Identity & Contact
    if (step === 0) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
        isValid = false;
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
        isValid = false;
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
        isValid = false;
      }
    }
    
    // Step 2: Institutional Affiliation
    else if (step === 1) {
      if (!formData.institution.trim()) {
        newErrors.institution = 'Institution is required';
        isValid = false;
      }
    }
    
    // Step 3: Academic & Professional Details
    else if (step === 2) {
      if (!formData.position.trim()) {
        newErrors.position = 'Position is required';
        isValid = false;
      }
      
      if (formData.researchInterests.length === 0) {
        newErrors.researchInterests = 'At least one research interest is required';
        isValid = false;
      }
    }
    
    // Step 4: Platform Roles & Optional Details
    else if (step === 3) {
      if (formData.personalWebsite && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.personalWebsite)) {
        newErrors.personalWebsite = 'Invalid website URL';
        isValid = false;
      }
      
      if (formData.orcidId && !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(formData.orcidId)) {
        newErrors.orcidId = 'Invalid ORCID ID format (e.g., 0000-0002-1825-0097)';
        isValid = false;
      }
    }
    
    if (!isValid) {
      logger.warn(`Validation failed for step ${step + 1}`, {
        context: { errors: newErrors },
        category: LogCategory.UI
      });
    } else {
      logger.info(`Validation passed for step ${step + 1}`, {
        category: LogCategory.UI
      });
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle next step button click
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      logger.info(`Moving to step ${currentStep + 2}`, {
        context: { 
          fromStep: currentStep + 1, 
          toStep: currentStep + 2,
          totalSteps: steps.length
        },
        category: LogCategory.UI
      });
      
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle previous step button click
  const handlePrevStep = () => {
    logger.info(`Moving to step ${currentStep}`, {
      context: { 
        fromStep: currentStep + 1, 
        toStep: currentStep,
        totalSteps: steps.length
      },
      category: LogCategory.UI
    });
    
    setCurrentStep(prev => prev - 1);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the current step
    if (!validateStep(currentStep)) {
      logger.warn('Form submission blocked due to validation errors', {
        context: { errors },
        category: LogCategory.UI
      });
      return;
    }
    
    // For the final step, validate all steps before submitting
    if (currentStep === steps.length - 1) {
      let allValid = true;
      
      for (let i = 0; i < steps.length; i++) {
        if (!validateStep(i)) {
          allValid = false;
          setCurrentStep(i);
          break;
        }
      }
      
      if (!allValid) {
        logger.warn('Form submission blocked due to validation errors in previous steps', {
          category: LogCategory.UI
        });
        return;
      }
      
      try {
        setIsSubmitting(true);
        
        // Prepare the profile data
        const profileData: Partial<UserProfile> = {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          institution: formData.institution,
          department: formData.department,
          position: formData.position,
          researchInterests: formData.researchInterests,
          role: formData.role,
          profileComplete: true
        };
        
        logger.info('Submitting profile data', {
          context: { 
            isEditMode,
            fieldsUpdated: Object.keys(profileData).length
          },
          category: LogCategory.DATA
        });
        
        const startTime = performance.now();
        const success = await onSave(profileData);
        const duration = performance.now() - startTime;
        
        if (success) {
          logger.info('Profile saved successfully', {
            context: { 
              duration: `${duration.toFixed(2)}ms`,
              isEditMode
            },
            category: LogCategory.DATA
          });
          
          showToast({
            title: isEditMode ? 'Profile Updated' : 'Profile Completed',
            description: isEditMode 
              ? 'Your profile has been updated successfully.' 
              : 'Your profile has been completed. You can now use all features of the platform.',
            status: 'success',
          });
          
          // If in edit mode, call onCancel to go back to profile view
          if (isEditMode && onCancel) {
            onCancel();
          } else {
            // Otherwise, redirect to dashboard
            router.push('/dashboard');
          }
        } else {
          logger.error('Failed to save profile', {
            context: { duration: `${duration.toFixed(2)}ms` },
            category: LogCategory.ERROR
          });
          
          showToast({
            title: 'Error',
            description: 'Failed to save your profile. Please try again.',
            status: 'error',
          });
        }
      } catch (error) {
        logger.error('Error saving profile', {
          context: { error },
          category: LogCategory.ERROR
        });
        
        showToast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
          status: 'error',
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // If not the final step, move to the next step
      handleNextStep();
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
                  onChange={handleInterestsChange}
                  maxInterests={5}
                  isRequired={true}
                  error={errors.researchInterests}
                  isDisabled={isDisabled}
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
                    onChange={handleChange}
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
                onClick={handleNextStep}
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
