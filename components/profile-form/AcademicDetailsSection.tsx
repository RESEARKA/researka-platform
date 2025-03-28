import React from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  VStack,
  Heading,
  Text,
  Divider,
  Select
} from '@chakra-ui/react';
import { BaseFormSectionProps, FormSectionValidator } from './types';
import ResearchInterestSelector from '../ResearchInterestSelector';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger instance for this component
const logger = createLogger('AcademicDetailsSection');

/**
 * Validates the academic details section of the profile form
 */
export const validateAcademicDetails: FormSectionValidator = (data) => {
  const errors: Record<string, string> = {};
  let isValid = true;

  // Validate research interests
  if (!data.researchInterests.length) {
    errors.researchInterests = 'At least one research interest is required';
    isValid = false;
  }

  // Validate role
  if (!data.role) {
    errors.role = 'Role is required';
    isValid = false;
  }

  logger.debug('Academic details validation result', {
    context: { 
      isValid, 
      errorCount: Object.keys(errors).length,
      interestsCount: data.researchInterests.length 
    },
    category: LogCategory.UI
  });

  return { isValid, errors };
};

/**
 * Academic details section of the profile form
 * Handles research interests and role fields
 */
function AcademicDetailsSection({ 
  formData, 
  errors, 
  onChange,
  isDisabled = false,
  isLoading = false
}: BaseFormSectionProps) {
  // Handle research interests change
  const handleInterestsChange = (interests: string[]) => {
    onChange('researchInterests', interests);
    
    logger.debug('Research interests updated', {
      context: { count: interests.length },
      category: LogCategory.UI
    });
  };

  // Handle role change
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <VStack spacing={6} align="stretch" width="100%">
      <VStack align="flex-start" spacing={1}>
        <Heading size="md">Academic & Professional Details</Heading>
        <Text fontSize="sm" color="gray.500">
          Tell us about your research interests and academic role
        </Text>
      </VStack>
      
      <Divider />
      
      <FormControl 
        isInvalid={!!errors.researchInterests} 
        isRequired 
        isDisabled={isDisabled || isLoading}
      >
        <FormLabel>Research Interests</FormLabel>
        <ResearchInterestSelector
          selectedInterests={formData.researchInterests}
          onChange={handleInterestsChange}
          isDisabled={isDisabled || isLoading}
        />
        {errors.researchInterests ? (
          <FormErrorMessage>{errors.researchInterests}</FormErrorMessage>
        ) : (
          <FormHelperText>
            Select at least one research interest. You can add custom interests.
          </FormHelperText>
        )}
      </FormControl>

      <FormControl 
        isInvalid={!!errors.role} 
        isRequired 
        isDisabled={isDisabled || isLoading}
      >
        <FormLabel>Academic Role</FormLabel>
        <Select
          name="role"
          value={formData.role}
          onChange={handleRoleChange}
          placeholder="Select your primary role"
        >
          <option value="Researcher">Researcher</option>
          <option value="Professor">Professor</option>
          <option value="Associate Professor">Associate Professor</option>
          <option value="Assistant Professor">Assistant Professor</option>
          <option value="Postdoctoral Researcher">Postdoctoral Researcher</option>
          <option value="PhD Student">PhD Student</option>
          <option value="Master's Student">Master's Student</option>
          <option value="Undergraduate Student">Undergraduate Student</option>
          <option value="Industry Researcher">Industry Researcher</option>
          <option value="Independent Researcher">Independent Researcher</option>
        </Select>
        <FormErrorMessage>{errors.role}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
}

export default AcademicDetailsSection;
