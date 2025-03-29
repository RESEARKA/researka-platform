import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Progress,
  VStack,
  HStack,
  Heading,
  Text,
  useToast,
  useColorModeValue,
  Icon
} from '@chakra-ui/react';
import { FiArrowRight, FiArrowLeft, FiCheck, FiSave } from 'react-icons/fi';
import { useRouter } from 'next/router';
import useAppToast from '../../hooks/useAppToast';
import { UserProfile } from '../../hooks/useProfileData';
import { createLogger, LogCategory } from '../../utils/logger';

// Import form sections
import BasicIdentitySection, { validateBasicIdentity } from './BasicIdentitySection';
import InstitutionalAffiliationSection, { validateInstitutionalAffiliation } from './InstitutionalAffiliationSection';
import AcademicDetailsSection, { validateAcademicDetails } from './AcademicDetailsSection';
import OptionalDetailsSection, { validateOptionalDetails } from './OptionalDetailsSection';

// Import types
import { 
  ProfileFormData, 
  FormStep, 
  ValidationResult,
  formDataToUserProfile,
  userProfileToFormData
} from './types';

// Create a logger instance for this component
const logger = createLogger('ProfileFormStepper');

// Define form steps
const FORM_STEPS: FormStep[] = [
  { title: 'Basic Identity & Contact', description: 'Your personal information', key: 'basic' },
  { title: 'Institutional Affiliation', description: 'Your academic institution', key: 'institution' },
  { title: 'Academic & Professional Details', description: 'Your research profile', key: 'academic' },
  { title: 'Platform Roles & Optional Details', description: 'Additional information', key: 'optional' }
];

// Define component props with proper TypeScript typing
interface ProfileFormStepperProps {
  onSave: (profileData: Partial<UserProfile>) => Promise<boolean>;
  initialData?: UserProfile;
  isEditMode?: boolean;
  onCancel?: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

/**
 * ProfileFormStepper component
 * A multi-step form for profile completion with proper validation
 */
function ProfileFormStepper({
  onSave,
  initialData,
  isEditMode = false,
  onCancel,
  isDisabled = false,
  isLoading = false
}: ProfileFormStepperProps) {
  const router = useRouter();
  const showToast = useAppToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Initialize form data with defaults or provided initialData
  const [formData, setFormData] = useState<ProfileFormData>(() => {
    if (initialData) {
      logger.info('Initializing form with existing profile data', {
        context: { 
          userId: initialData.id,
          isComplete: initialData.profileComplete,
          hasName: !!initialData.name
        },
        category: LogCategory.UI
      });
      
      return userProfileToFormData(initialData);
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
      twitter: '',
      linkedin: '',
      wantsToBeEditor: false
    };
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle field changes
  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for the field when it changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate the current step
  const validateCurrentStep = (): ValidationResult => {
    switch (currentStep) {
      case 0:
        return validateBasicIdentity(formData);
      case 1:
        return validateInstitutionalAffiliation(formData);
      case 2:
        return validateAcademicDetails(formData);
      case 3:
        return validateOptionalDetails(formData);
      default:
        return { isValid: true, errors: {} };
    }
  };

  // Validate all steps
  const validateAllSteps = (): ValidationResult => {
    const basicResult = validateBasicIdentity(formData);
    const institutionResult = validateInstitutionalAffiliation(formData);
    const academicResult = validateAcademicDetails(formData);
    const optionalResult = validateOptionalDetails(formData);
    
    const allErrors = {
      ...basicResult.errors,
      ...institutionResult.errors,
      ...academicResult.errors,
      ...optionalResult.errors
    };
    
    const isValid = 
      basicResult.isValid && 
      institutionResult.isValid && 
      academicResult.isValid && 
      optionalResult.isValid;
    
    return { isValid, errors: allErrors };
  };

  // Handle next step
  const handleNext = () => {
    const { isValid, errors: validationErrors } = validateCurrentStep();
    
    if (!isValid) {
      setErrors(validationErrors);
      showToast({
        title: 'Validation Error',
        description: 'Please fix the errors before proceeding.',
        status: 'error'
      });
      return;
    }
    
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    const { isValid, errors: validationErrors } = validateAllSteps();
    
    if (!isValid) {
      setErrors(validationErrors);
      showToast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting.',
        status: 'error'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      logger.info('Submitting profile form', {
        context: { 
          isEditMode,
          userId: initialData?.id
        },
        category: LogCategory.UI
      });
      
      // Convert form data to user profile format
      const profileData = formDataToUserProfile(formData);
      
      // Call the onSave handler
      const success = await onSave(profileData);
      
      if (success && isMounted.current) {
        showToast({
          title: isEditMode ? 'Profile Updated' : 'Profile Created',
          description: isEditMode 
            ? 'Your profile has been successfully updated.' 
            : 'Your profile has been successfully created.',
          status: 'success'
        });
        
        // If not in edit mode, redirect to profile page
        if (!isEditMode) {
          router.push('/profile');
        }
      }
    } catch (error) {
      logger.error('Error submitting profile form', {
        error,
        context: { isEditMode },
        category: LogCategory.UI
      });
      
      if (isMounted.current) {
        showToast({
          title: 'Error',
          description: 'There was an error saving your profile. Please try again.',
          status: 'error'
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  // Render the current step content
  const renderStepContent = () => {
    const commonProps = {
      formData,
      errors,
      onChange: handleFieldChange,
      isDisabled: isDisabled || isSubmitting,
      isLoading: isLoading
    };
    
    switch (currentStep) {
      case 0:
        return <BasicIdentitySection {...commonProps} />;
      case 1:
        return <InstitutionalAffiliationSection {...commonProps} />;
      case 2:
        return <AcademicDetailsSection {...commonProps} />;
      case 3:
        return <OptionalDetailsSection {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      p={6}
      width="100%"
      maxWidth="800px"
      mx="auto"
    >
      {/* Progress bar */}
      <Progress
        value={(currentStep / (FORM_STEPS.length - 1)) * 100}
        size="sm"
        colorScheme="blue"
        borderRadius="full"
        mb={6}
      />
      
      {/* Step indicator */}
      <Flex justify="space-between" mb={8}>
        {FORM_STEPS.map((step, index) => (
          <VStack 
            key={step.key}
            spacing={1}
            align="center"
            opacity={index === currentStep ? 1 : 0.5}
            cursor={index < currentStep ? 'pointer' : 'default'}
            onClick={() => index < currentStep && setCurrentStep(index)}
          >
            <Box
              w="10px"
              h="10px"
              borderRadius="full"
              bg={index <= currentStep ? 'blue.500' : 'gray.300'}
            />
            <Text fontSize="xs" fontWeight="medium" textAlign="center">
              {step.title}
            </Text>
          </VStack>
        ))}
      </Flex>
      
      {/* Step content */}
      <Box mb={8}>
        {renderStepContent()}
      </Box>
      
      {/* Navigation buttons */}
      <Flex justify="space-between" mt={8}>
        <Button
          leftIcon={<Icon as={FiArrowLeft} />}
          onClick={currentStep === 0 ? onCancel : handlePrevious}
          variant="outline"
          isDisabled={isDisabled || isSubmitting || isLoading}
        >
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>
        
        <Button
          rightIcon={<Icon as={currentStep === FORM_STEPS.length - 1 ? FiSave : FiArrowRight} />}
          onClick={currentStep === FORM_STEPS.length - 1 ? handleSubmit : handleNext}
          colorScheme="blue"
          isLoading={isSubmitting}
          isDisabled={isDisabled || isLoading}
        >
          {currentStep === FORM_STEPS.length - 1 ? (isEditMode ? 'Save Changes' : 'Complete Profile') : 'Next'}
        </Button>
      </Flex>
    </Box>
  );
}

export default ProfileFormStepper;
