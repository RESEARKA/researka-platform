import React from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  VStack,
  Heading,
  Text,
  Divider
} from '@chakra-ui/react';
import { BaseFormSectionProps, FormSectionValidator, ValidationResult } from './types';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger instance for this component
const logger = createLogger('InstitutionalAffiliationSection');

// Mock data for institutions
const MOCK_INSTITUTIONS = [
  'Harvard University',
  'Stanford University',
  'Massachusetts Institute of Technology',
  'California Institute of Technology',
  'University of Cambridge',
  'University of Oxford',
  'ETH Zurich',
  'University College London',
  'Imperial College London',
  'University of Chicago',
  'National University of Singapore',
  'Tsinghua University',
  'Peking University',
  'University of Tokyo',
  'Seoul National University'
];

// Mock data for departments
const MOCK_DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Physics',
  'Mathematics',
  'Chemistry',
  'Biology',
  'Economics',
  'Business Administration',
  'Psychology',
  'Sociology',
  'Political Science',
  'History'
];

/**
 * Validates the institutional affiliation section of the profile form
 */
export const validateInstitutionalAffiliation: FormSectionValidator = (data) => {
  const errors: Record<string, string> = {};
  let isValid = true;

  // Validate institution
  if (!data.institution.trim()) {
    errors.institution = 'Institution is required';
    isValid = false;
  }

  logger.debug('Institutional affiliation validation result', {
    context: { isValid, errorCount: Object.keys(errors).length },
    category: LogCategory.UI
  });

  return { isValid, errors };
};

/**
 * Institutional affiliation section of the profile form
 * Handles institution, department, and position fields
 */
function InstitutionalAffiliationSection({ 
  formData, 
  errors, 
  onChange,
  isDisabled = false,
  isLoading = false
}: BaseFormSectionProps) {
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <VStack spacing={6} align="stretch" width="100%">
      <VStack align="flex-start" spacing={1}>
        <Heading size="md">Institutional Affiliation</Heading>
        <Text fontSize="sm" color="gray.500">
          Tell us about your academic institution and role
        </Text>
      </VStack>
      
      <Divider />
      
      <FormControl isInvalid={!!errors.institution} isRequired isDisabled={isDisabled || isLoading}>
        <FormLabel>Institution</FormLabel>
        <Select
          name="institution"
          value={formData.institution}
          onChange={handleInputChange}
          placeholder="Select your institution"
        >
          {MOCK_INSTITUTIONS.map((institution) => (
            <option key={institution} value={institution}>
              {institution}
            </option>
          ))}
          <option value="Other">Other (not listed)</option>
        </Select>
        <FormErrorMessage>{errors.institution}</FormErrorMessage>
      </FormControl>

      {formData.institution === 'Other' && (
        <FormControl isInvalid={!!errors.institution} isRequired isDisabled={isDisabled || isLoading}>
          <FormLabel>Institution Name</FormLabel>
          <Input
            name="institution"
            value={formData.institution === 'Other' ? '' : formData.institution}
            onChange={handleInputChange}
            placeholder="Enter your institution name"
          />
          <FormErrorMessage>{errors.institution}</FormErrorMessage>
        </FormControl>
      )}

      <FormControl isInvalid={!!errors.department} isDisabled={isDisabled || isLoading}>
        <FormLabel>Department</FormLabel>
        <Select
          name="department"
          value={formData.department}
          onChange={handleInputChange}
          placeholder="Select your department"
        >
          {MOCK_DEPARTMENTS.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
          <option value="Other">Other (not listed)</option>
        </Select>
        <FormErrorMessage>{errors.department}</FormErrorMessage>
      </FormControl>

      {formData.department === 'Other' && (
        <FormControl isInvalid={!!errors.department} isDisabled={isDisabled || isLoading}>
          <FormLabel>Department Name</FormLabel>
          <Input
            name="department"
            value={formData.department === 'Other' ? '' : formData.department}
            onChange={handleInputChange}
            placeholder="Enter your department name"
          />
          <FormErrorMessage>{errors.department}</FormErrorMessage>
        </FormControl>
      )}

      <FormControl isInvalid={!!errors.position} isDisabled={isDisabled || isLoading}>
        <FormLabel>Position</FormLabel>
        <Input
          name="position"
          value={formData.position}
          onChange={handleInputChange}
          placeholder="E.g., Professor, Associate Professor, PhD Student"
        />
        <FormErrorMessage>{errors.position}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
}

export default InstitutionalAffiliationSection;
