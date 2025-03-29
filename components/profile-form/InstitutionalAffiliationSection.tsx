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
import { BaseFormSectionProps, FormSectionValidator } from './types';
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

// Mock data for Departments
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
 * Handles institution and department fields
 */
function InstitutionalAffiliationSection({
  formData,
  errors,
  onChange,
  isDisabled = false,
  isLoading = false,
  isEditMode = false
}: BaseFormSectionProps) {
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  // In edit mode, these fields should be non-editable
  const isFieldDisabled = isDisabled || isLoading || isEditMode;
  
  return (
    <VStack spacing={6} align="stretch" width="100%">
      <VStack align="flex-start" spacing={1}>
        <Heading size="md">Institutional Affiliation</Heading>
        <Text fontSize="sm" color="gray.500">
          Tell us about your academic institution
        </Text>
      </VStack>
      
      <Divider />
      
      <FormControl isInvalid={!!errors.institution} isRequired>
        <FormLabel htmlFor="institution">Institution</FormLabel>
        {formData.institution === 'Other' ? (
          <Input
            id="institution"
            name="institution"
            value={formData.institution === 'Other' ? '' : formData.institution}
            onChange={handleInputChange}
            placeholder="Enter your institution name"
            isDisabled={isFieldDisabled}
            bg={isEditMode ? "gray.100" : undefined}
            _disabled={isEditMode ? { 
              cursor: "not-allowed",
              opacity: 0.7,
              borderColor: "gray.300"
            } : undefined}
          />
        ) : (
          <Select
            name="institution"
            value={formData.institution}
            onChange={handleInputChange}
            placeholder="Select your institution"
            isDisabled={isFieldDisabled}
            bg={isEditMode ? "gray.100" : undefined}
            _disabled={isEditMode ? { 
              cursor: "not-allowed",
              opacity: 0.7,
              borderColor: "gray.300"
            } : undefined}
          >
            {MOCK_INSTITUTIONS.map((institution) => (
              <option key={institution} value={institution}>
                {institution}
              </option>
            ))}
            <option value="Other">Other (not listed)</option>
          </Select>
        )}
        <FormErrorMessage>{errors.institution}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.department}>
        <FormLabel htmlFor="department">Department</FormLabel>
        <Select
          id="department"
          name="department"
          value={formData.department || ''}
          onChange={handleInputChange}
          placeholder="Select department"
          isDisabled={isFieldDisabled}
          bg={isEditMode ? "gray.100" : undefined}
          _disabled={isEditMode ? { 
            cursor: "not-allowed",
            opacity: 0.7,
            borderColor: "gray.300"
          } : undefined}
        >
          {MOCK_DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </Select>
        <FormErrorMessage>{errors.department}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
}

export default InstitutionalAffiliationSection;
