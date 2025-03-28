import React from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Checkbox,
  VStack,
  Heading,
  Text,
  Divider,
  InputGroup,
  InputLeftAddon
} from '@chakra-ui/react';
import { BaseFormSectionProps, FormSectionValidator } from './types';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger instance for this component
const logger = createLogger('OptionalDetailsSection');

/**
 * Validates the optional details section of the profile form
 * Since these are optional, we only validate format if values are provided
 */
export const validateOptionalDetails: FormSectionValidator = (data) => {
  const errors: Record<string, string> = {};
  let isValid = true;

  // Validate website URL format if provided
  if (data.personalWebsite && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(data.personalWebsite)) {
    errors.personalWebsite = 'Please enter a valid website URL';
    isValid = false;
  }

  // Validate ORCID format if provided
  if (data.orcidId && !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(data.orcidId)) {
    errors.orcidId = 'Please enter a valid ORCID ID (e.g., 0000-0002-1825-0097)';
    isValid = false;
  }

  // Validate Twitter handle format if provided
  if (data.twitter && !/^@?[a-zA-Z0-9_]{1,15}$/.test(data.twitter)) {
    errors.twitter = 'Please enter a valid Twitter handle';
    isValid = false;
  }

  // Validate LinkedIn URL format if provided
  if (data.linkedin && !/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/.test(data.linkedin)) {
    errors.linkedin = 'Please enter a valid LinkedIn profile URL';
    isValid = false;
  }

  logger.debug('Optional details validation result', {
    context: { isValid, errorCount: Object.keys(errors).length },
    category: LogCategory.UI
  });

  return { isValid, errors };
};

/**
 * Optional details section of the profile form
 * Handles social media, website, ORCID, and editor preference
 */
function OptionalDetailsSection({ 
  formData, 
  errors, 
  onChange,
  isDisabled = false,
  isLoading = false
}: BaseFormSectionProps) {
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    onChange(name, type === 'checkbox' ? checked : value);
  };

  return (
    <VStack spacing={6} align="stretch" width="100%">
      <VStack align="flex-start" spacing={1}>
        <Heading size="md">Platform Roles & Optional Details</Heading>
        <Text fontSize="sm" color="gray.500">
          Additional information to enhance your profile (all fields optional)
        </Text>
      </VStack>
      
      <Divider />
      
      <FormControl isInvalid={!!errors.personalWebsite} isDisabled={isDisabled || isLoading}>
        <FormLabel>Personal Website</FormLabel>
        <Input
          name="personalWebsite"
          value={formData.personalWebsite || ''}
          onChange={handleInputChange}
          placeholder="https://yourwebsite.com"
        />
        {errors.personalWebsite ? (
          <FormErrorMessage>{errors.personalWebsite}</FormErrorMessage>
        ) : (
          <FormHelperText>Your personal or academic website</FormHelperText>
        )}
      </FormControl>

      <FormControl isInvalid={!!errors.orcidId} isDisabled={isDisabled || isLoading}>
        <FormLabel>ORCID ID</FormLabel>
        <Input
          name="orcidId"
          value={formData.orcidId || ''}
          onChange={handleInputChange}
          placeholder="0000-0000-0000-0000"
        />
        {errors.orcidId ? (
          <FormErrorMessage>{errors.orcidId}</FormErrorMessage>
        ) : (
          <FormHelperText>Your ORCID identifier (e.g., 0000-0002-1825-0097)</FormHelperText>
        )}
      </FormControl>

      <FormControl isInvalid={!!errors.twitter} isDisabled={isDisabled || isLoading}>
        <FormLabel>Twitter</FormLabel>
        <InputGroup>
          <InputLeftAddon>@</InputLeftAddon>
          <Input
            name="twitter"
            value={(formData.twitter || '').replace('@', '')}
            onChange={handleInputChange}
            placeholder="username"
          />
        </InputGroup>
        {errors.twitter ? (
          <FormErrorMessage>{errors.twitter}</FormErrorMessage>
        ) : (
          <FormHelperText>Your Twitter handle (without the @)</FormHelperText>
        )}
      </FormControl>

      <FormControl isInvalid={!!errors.linkedin} isDisabled={isDisabled || isLoading}>
        <FormLabel>LinkedIn</FormLabel>
        <Input
          name="linkedin"
          value={formData.linkedin || ''}
          onChange={handleInputChange}
          placeholder="https://linkedin.com/in/username"
        />
        {errors.linkedin ? (
          <FormErrorMessage>{errors.linkedin}</FormErrorMessage>
        ) : (
          <FormHelperText>Your LinkedIn profile URL</FormHelperText>
        )}
      </FormControl>

      <FormControl isDisabled={isDisabled || isLoading}>
        <Checkbox
          name="wantsToBeEditor"
          isChecked={formData.wantsToBeEditor}
          onChange={handleInputChange}
        >
          I would like to be considered as an editor for DecentraJournal
        </Checkbox>
        <FormHelperText>
          Editors help review and approve submissions. We'll contact you with more information.
        </FormHelperText>
      </FormControl>
    </VStack>
  );
}

export default OptionalDetailsSection;
