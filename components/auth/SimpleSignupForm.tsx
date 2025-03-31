import React, { useState } from 'react';
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
  Select
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import { saveUserProfile } from '../../services/profileService';
import { createLogger, LogCategory } from '../../utils/logger';
import { useRouter } from 'next/router';

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

/**
 * SimpleSignupForm component
 * 
 * A streamlined form for new users to complete their profile with minimal required fields.
 * This component focuses on reliability and simplicity.
 * 
 * @param existingProfile - Optional existing profile data for editing mode
 * @param onComplete - Callback function to execute when the profile is saved
 */
function SimpleSignupForm({ 
  existingProfile, 
  onComplete 
}: { 
  existingProfile?: any; 
  onComplete?: () => void 
}) {
  // Get authentication context
  const { currentUser } = useAuth();
  const toast = useToast();
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    name: existingProfile?.name || currentUser?.displayName || '',
    role: existingProfile?.role || '',
    institution: existingProfile?.institution || '', 
    bio: existingProfile?.bio || '',
    interests: existingProfile?.interests || '',
    email: existingProfile?.email || currentUser?.email || '',
  });
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditMode] = useState(!!existingProfile);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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
    
    setIsSubmitting(true);
    
    try {
      logger.info('Submitting simplified profile form', {
        category: LogCategory.LIFECYCLE
      });
      
      // Save profile directly to Firestore
      const success = await saveUserProfile(currentUser.uid, {
        name: formData.name.trim(),
        role: formData.role,
        institution: formData.institution,
        bio: formData.bio,
        email: formData.email,
      });
      
      if (success) {
        toast({
          title: 'Profile Saved',
          description: 'Your profile has been successfully saved',
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
        throw new Error('Failed to save profile');
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
            <Input
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="Enter your institution"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Bio</FormLabel>
            <Input
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Enter a short bio"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Interests</FormLabel>
            <Input
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="Enter your interests"
            />
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
