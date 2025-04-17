import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Select,
  List,
  ListItem,
  InputGroup,
  InputRightElement,
  IconButton,
  useOutsideClick
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { createLogger, LogCategory } from '../../utils/logger';
import { useRouter } from 'next/router';
import { useProfileData } from '../../hooks/useProfileData';

// Create a logger instance for this component
const logger = createLogger('SimpleSignupForm');

// Academic roles for the dropdown
const ACADEMIC_ROLES = [
  'Student',
  'PhD Candidate',
  'Postdoctoral Researcher',
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Researcher',
  'Author',
  'Other'
];

// Top universities for autocomplete
const UNIVERSITIES = [
  'Harvard University',
  'Stanford University',
  'Massachusetts Institute of Technology (MIT)',
  'University of Cambridge',
  'University of Oxford',
  'California Institute of Technology (Caltech)',
  'Princeton University',
  'Yale University',
  'Columbia University',
  'University of Chicago',
  'Imperial College London',
  'ETH Zurich',
  'Johns Hopkins University',
  'University of California, Berkeley',
  'University of Michigan',
  'Cornell University',
  'University of California, Los Angeles (UCLA)',
  'University of California, San Diego (UCSD)',
  'University of Toronto',
  'University of Washington'
];

// Research interests for autocomplete
const RESEARCH_INTERESTS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Robotics',
  'Quantum Computing',
  'Cybersecurity',
  'Bioinformatics',
  'Climate Science',
  'Neuroscience',
  'Genomics',
  'Data Science',
  'Blockchain',
  'Cryptography',
  'Renewable Energy',
  'Cancer Research',
  'Immunology',
  'Psychology',
  'Sociology',
  'Materials Science',
  'Nanotechnology',
  'Astrophysics',
  'Sustainable Development',
  'Economics',
  'Finance',
  'Political Science'
];

/**
 * SimpleSignupForm component
 * 
 * A streamlined form for new users to complete their profile with minimal required fields.
 * This component focuses on reliability and simplicity.
 * 
 * @param existingProfile - Optional existing profile data for editing mode
 * @param onComplete - Callback function to execute when the profile is saved
 */
const SimpleSignupForm = ({ 
  existingProfile, 
  onComplete 
}: { 
  existingProfile?: any; 
  onComplete?: () => void 
}) => {
  // Get authentication context
  const { currentUser } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { updateProfile, updateOperationInProgress } = useProfileData();
  
  // Form state
  const [formData, setFormData] = useState({
    name: existingProfile?.name || currentUser?.displayName || '',
    role: existingProfile?.role || '',
    institution: existingProfile?.institution || '', 
    researchInterests: existingProfile?.researchInterests || '',
    email: existingProfile?.email || currentUser?.email || '',
  });
  
  // Autocomplete state
  const [institutionResults, setInstitutionResults] = useState<string[]>([]);
  const [interestsResults, setInterestsResults] = useState<string[]>([]);
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);
  const [showInterestsDropdown, setShowInterestsDropdown] = useState(false);

  // References for click outside detection
  const institutionRef = useRef<HTMLDivElement>(null);
  const interestsRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks to close dropdowns
  useOutsideClick({
    ref: institutionRef,
    handler: () => setShowInstitutionDropdown(false),
  });

  useOutsideClick({
    ref: interestsRef,
    handler: () => setShowInterestsDropdown(false),
  });

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditMode] = useState(!!existingProfile);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Handle autocomplete for institution
    if (name === 'institution' && value) {
      const filteredInstitutions = UNIVERSITIES.filter(univ => 
        univ.toLowerCase().includes(value.toLowerCase())
      );
      setInstitutionResults(filteredInstitutions);
      setShowInstitutionDropdown(filteredInstitutions.length > 0);
    } else if (name === 'institution') {
      setShowInstitutionDropdown(false);
    }

    // Handle autocomplete for research interests
    if (name === 'researchInterests' && value) {
      const filteredInterests = RESEARCH_INTERESTS.filter(interest => 
        interest.toLowerCase().includes(value.toLowerCase())
      );
      setInterestsResults(filteredInterests);
      setShowInterestsDropdown(filteredInterests.length > 0);
    } else if (name === 'researchInterests') {
      setShowInterestsDropdown(false);
    }
    
    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle autocomplete selection
  const handleAutocompleteSelect = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'institution') {
      setShowInstitutionDropdown(false);
    } else if (field === 'researchInterests') {
      setShowInterestsDropdown(false);
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast({
        title: 'Form Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!currentUser) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to complete your profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Check if an update is already in progress
    if (updateOperationInProgress?.current) {
      logger.warn('Update already in progress, skipping duplicate submission', {
        category: LogCategory.LIFECYCLE
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      logger.info('Submitting simplified profile form', {
        category: LogCategory.LIFECYCLE
      });
      
      // Use the centralized profile operations hook
      const profileData = {
        name: formData.name.trim(),
        role: formData.role,
        institution: formData.institution,
        researchInterests: formData.researchInterests,
        email: formData.email,
        profileComplete: true
      };
      
      // Add debug log to track the update operation
      logger.debug('Starting profile update operation', {
        category: LogCategory.LIFECYCLE,
        context: { profileData }
      });
      
      const success = await updateProfile(profileData);
      
      logger.debug('Profile update operation completed', {
        category: LogCategory.LIFECYCLE,
        context: { success }
      });
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Your profile has been saved successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Call completion callback if provided
        if (onComplete) {
          onComplete();
        } else {
          // Otherwise, redirect to homepage
          router.push('/');
        }
      } else {
        throw new Error('Profile update returned false');
      }
    } catch (error) {
      logger.error('Error saving profile', {
        context: { error },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: 'Failed to save your profile. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If no user is authenticated, show a message
  if (!currentUser) {
    return (
      <Box textAlign="center" p={8}>
        <Heading size="md" mb={4}>Authentication Required</Heading>
        <Text>Please log in to complete your profile</Text>
      </Box>
    );
  }
  
  return (
    <Box 
      maxW="md" 
      mx="auto" 
      p={6} 
      borderWidth="1px" 
      borderRadius="lg" 
      boxShadow="lg"
      bg="white"
    >
      <Heading size="lg" mb={6} textAlign="center">
        {isEditMode ? 'Edit Your Profile' : 'Complete Your Profile'}
      </Heading>
      <Text mb={6} textAlign="center">
        Please provide the following information to access all features.
      </Text>
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired isInvalid={!!errors.name}>
            <FormLabel>Full Name</FormLabel>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
            {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
          </FormControl>
          
          <FormControl isRequired isInvalid={!!errors.role}>
            <FormLabel>Academic Role</FormLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              {ACADEMIC_ROLES.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
            {errors.role && <FormErrorMessage>{errors.role}</FormErrorMessage>}
          </FormControl>
          
          <FormControl>
            <FormLabel>Institution</FormLabel>
            <Box position="relative" ref={institutionRef}>
              <InputGroup>
                <Input
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="Start typing your university name..."
                  onClick={() => setShowInstitutionDropdown(true)}
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Show universities"
                    icon={<ChevronDownIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowInstitutionDropdown(!showInstitutionDropdown)}
                  />
                </InputRightElement>
              </InputGroup>
              {showInstitutionDropdown && (
                <List
                  position="absolute"
                  zIndex={10}
                  width="100%"
                  bg="white"
                  boxShadow="md"
                  borderRadius="md"
                  mt={1}
                  maxH="200px"
                  overflowY="auto"
                  as="ul"
                >
                  {institutionResults.length > 0 ? (
                    institutionResults.map((university, idx) => (
                      <ListItem
                        key={idx}
                        px={4}
                        py={2}
                        cursor="pointer"
                        _hover={{ bg: "blue.50" }}
                        onClick={() => handleAutocompleteSelect('institution', university)}
                        as="li"
                      >
                        {university}
                      </ListItem>
                    ))
                  ) : (
                    <ListItem px={4} py={2} as="li">No matching universities</ListItem>
                  )}
                </List>
              )}
            </Box>
          </FormControl>
          
          <FormControl>
            <FormLabel>Research Interests</FormLabel>
            <Box position="relative" ref={interestsRef}>
              <InputGroup>
                <Input
                  name="researchInterests"
                  value={formData.researchInterests}
                  onChange={handleChange}
                  placeholder="Start typing your research interests..."
                  onClick={() => setShowInterestsDropdown(true)}
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Show interests"
                    icon={<ChevronDownIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowInterestsDropdown(!showInterestsDropdown)}
                  />
                </InputRightElement>
              </InputGroup>
              {showInterestsDropdown && (
                <List
                  position="absolute"
                  zIndex={10}
                  width="100%"
                  bg="white"
                  boxShadow="md"
                  borderRadius="md"
                  mt={1}
                  maxH="200px"
                  overflowY="auto"
                  as="ul"
                >
                  {interestsResults.length > 0 ? (
                    interestsResults.map((interest, idx) => (
                      <ListItem
                        key={idx}
                        px={4}
                        py={2}
                        cursor="pointer"
                        _hover={{ bg: "blue.50" }}
                        onClick={() => handleAutocompleteSelect('researchInterests', interest)}
                        as="li"
                      >
                        {interest}
                      </ListItem>
                    ))
                  ) : (
                    <ListItem px={4} py={2} as="li">No matching interests</ListItem>
                  )}
                </List>
              )}
            </Box>
          </FormControl>
          
          <FormControl isDisabled>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              value={formData.email}
              readOnly
              placeholder="Your email is set from your account"
            />
          </FormControl>
          
          <Button
            mt={6}
            colorScheme="blue"
            isLoading={isSubmitting}
            loadingText="Saving..."
            type="submit"
            width="full"
          >
            {isEditMode ? 'Update Profile' : 'Save Profile'}
          </Button>
          
          {isEditMode && (
            <Button
              colorScheme="gray"
              width="full"
              mt={2}
              onClick={() => router.push('/')}
            >
              Return to Homepage
            </Button>
          )}
        </VStack>
      </form>
    </Box>
  );
}

export default SimpleSignupForm;
