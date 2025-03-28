import React from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Heading,
  Text,
  Divider
} from '@chakra-ui/react';
import { BaseFormSectionProps, FormSectionValidator, ValidationResult } from './types';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger instance for this component
const logger = createLogger('BasicIdentitySection');

/**
 * Validates the basic identity section of the profile form
 */
export const validateBasicIdentity: FormSectionValidator = (data) => {
  const errors: Record<string, string> = {};
  let isValid = true;

  // Validate first name
  if (!data.firstName.trim()) {
    errors.firstName = 'First name is required';
    isValid = false;
  }

  // Validate email
  if (!data.email.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  logger.debug('Basic identity validation result', {
    context: { isValid, errorCount: Object.keys(errors).length },
    category: LogCategory.UI
  });

  return { isValid, errors };
};

/**
 * Basic identity section of the profile form
 * Handles first name, last name, and email fields
 */
function BasicIdentitySection({ 
  formData, 
  errors, 
  onChange,
  isDisabled = false,
  isLoading = false
}: BaseFormSectionProps) {
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <VStack spacing={6} align="stretch" width="100%">
      <VStack align="flex-start" spacing={1}>
        <Heading size="md">Basic Identity & Contact</Heading>
        <Text fontSize="sm" color="gray.500">
          Tell us who you are and how to reach you
        </Text>
      </VStack>
      
      <Divider />
      
      <FormControl isInvalid={!!errors.firstName} isRequired isDisabled={isDisabled || isLoading}>
        <FormLabel>First Name</FormLabel>
        <Input
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          placeholder="Enter your first name"
        />
        <FormErrorMessage>{errors.firstName}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.lastName} isDisabled={isDisabled || isLoading}>
        <FormLabel>Last Name</FormLabel>
        <Input
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          placeholder="Enter your last name"
        />
        <FormErrorMessage>{errors.lastName}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.email} isRequired isDisabled={isDisabled || isLoading}>
        <FormLabel>Email Address</FormLabel>
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email address"
        />
        <FormErrorMessage>{errors.email}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
}

export default BasicIdentitySection;
