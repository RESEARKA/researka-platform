import React, { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  VStack,
  Heading,
  Text,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
  Box
} from '@chakra-ui/react';
import { BaseFormSectionProps, FormSectionValidator } from './types';
import { createLogger, LogCategory } from '../../utils/logger';
import { verifyEmailDomain, requiresDomainVerification, getExpectedDomain } from '../../utils/universityDomains';

// Create a logger instance for this component
const logger = createLogger('InstitutionalAffiliationSection');

// Mock data for institutions - includes prestigious universities that require domain verification
const MOCK_INSTITUTIONS = [
  // Top US Universities
  'Massachusetts Institute of Technology',
  'Stanford University',
  'Harvard University',
  'California Institute of Technology',
  'Princeton University',
  'Yale University',
  'University of Chicago',
  'Columbia University',
  'University of Pennsylvania',
  'Duke University',
  'Northwestern University',
  'University of California, Berkeley',
  'Cornell University',
  'Johns Hopkins University',
  'University of California, Los Angeles',
  'University of Michigan, Ann Arbor',
  'New York University',
  'Brown University',
  'Rice University',
  'University of Southern California',
  
  // UK
  'University of Oxford',
  'University of Cambridge',
  'Imperial College London',
  'University College London',
  'London School of Economics and Political Science',
  
  // Canada
  'University of Toronto',
  'University of British Columbia',
  'McGill University',
  
  // Australia
  'University of Melbourne',
  'Australian National University',
  'University of Sydney',
  
  // New Zealand
  'University of Auckland',
  'University of Otago',
  
  // Ireland
  'Trinity College Dublin',
  'University College Dublin',
  
  // China
  'Tsinghua University',
  'Peking University',
  'Fudan University',
  'Shanghai Jiao Tong University',
  'Zhejiang University',
  
  // Japan
  'University of Tokyo',
  'Kyoto University',
  'Osaka University',
  'Tohoku University',
  
  // South Korea
  'Seoul National University',
  'Korea Advanced Institute of Science and Technology',
  'Pohang University of Science and Technology',
  'Yonsei University',
  
  // Other institutions (no domain verification required)
  'Other (not listed)'
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

  // Verify email domain for prestigious universities
  if (data.institution && data.email) {
    const isDomainValid = verifyEmailDomain(data.email, data.institution);
    if (!isDomainValid) {
      errors.institution = `Your email domain doesn't match the expected domain for ${data.institution}. Please use your institutional email or select a different institution.`;
      isValid = false;
      
      logger.warn('Email domain verification failed', {
        context: { 
          institution: data.institution,
          emailDomain: data.email.split('@')[1] || 'invalid-email'
        },
        category: LogCategory.ERROR
      });
    }
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
  // State to track if the selected institution requires domain verification
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [expectedDomain, setExpectedDomain] = useState<string | null>(null);
  
  // Check if the institution requires verification when it changes
  useEffect(() => {
    if (formData.institution) {
      const needsVerification = requiresDomainVerification(formData.institution);
      setRequiresVerification(needsVerification);
      
      if (needsVerification) {
        setExpectedDomain(getExpectedDomain(formData.institution));
      } else {
        setExpectedDomain(null);
      }
    } else {
      setRequiresVerification(false);
      setExpectedDomain(null);
    }
  }, [formData.institution]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  // Only disable fields for existing profiles in edit mode
  // For new profiles, fields should always be editable
  const isInstitutionDisabled = isDisabled || isLoading || (isEditMode && formData.isExistingProfile);
  const isDepartmentDisabled = isDisabled || isLoading || (isEditMode && formData.isExistingProfile);
  
  return (
    <VStack spacing={6} align="stretch" width="100%">
      <VStack align="flex-start" spacing={1}>
        <Heading size="md">Institutional Affiliation</Heading>
        <Text fontSize="sm" color="gray.500">
          Tell us about your academic institution
        </Text>
      </VStack>
      
      <Divider />
      
      <FormControl isInvalid={!!errors.institution} isRequired isDisabled={isInstitutionDisabled}>
        <FormLabel htmlFor="institution">Institution</FormLabel>
        {formData.institution === 'Other' ? (
          <Input
            id="institution"
            name="institution"
            value={formData.institution === 'Other' ? '' : formData.institution}
            onChange={handleInputChange}
            placeholder="Enter your institution name"
            bg={isEditMode && formData.isExistingProfile ? "gray.100" : undefined}
            _disabled={{ 
              cursor: "not-allowed",
              opacity: 0.7,
              bg: "gray.100"
            }}
            readOnly={isInstitutionDisabled}
          />
        ) : (
          <Select
            name="institution"
            value={formData.institution}
            onChange={handleInputChange}
            placeholder="Select your institution"
            bg={isEditMode && formData.isExistingProfile ? "gray.100" : undefined}
            _disabled={{ 
              cursor: "not-allowed",
              opacity: 0.7,
              bg: "gray.100"
            }}
            isReadOnly={isInstitutionDisabled}
          >
            {MOCK_INSTITUTIONS.map((institution) => (
              <option key={institution} value={institution}>
                {institution}
              </option>
            ))}
          </Select>
        )}
        <FormErrorMessage>{errors.institution}</FormErrorMessage>
        
        {/* Domain verification alert */}
        {requiresVerification && !isInstitutionDisabled && (
          <Box mt={2}>
            <Alert status="info" borderRadius="md" fontSize="sm">
              <AlertIcon />
              <AlertDescription>
                {expectedDomain ? (
                  <>
                    This institution requires email verification. Please use an email with the domain <strong>@{expectedDomain}</strong>.
                  </>
                ) : (
                  <>
                    This institution requires email verification. Please use your institutional email address.
                  </>
                )}
              </AlertDescription>
            </Alert>
          </Box>
        )}
      </FormControl>

      <FormControl isInvalid={!!errors.department} isDisabled={isDepartmentDisabled}>
        <FormLabel htmlFor="department">Department</FormLabel>
        <Select
          id="department"
          name="department"
          value={formData.department || ''}
          onChange={handleInputChange}
          placeholder="Select your department"
          bg={isEditMode && formData.isExistingProfile ? "gray.100" : undefined}
          _disabled={{ 
            cursor: "not-allowed",
            opacity: 0.7,
            bg: "gray.100"
          }}
          isReadOnly={isDepartmentDisabled}
        >
          {MOCK_DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
          <option value="Other">Other (not listed)</option>
        </Select>
        <FormErrorMessage>{errors.department}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
}

export default InstitutionalAffiliationSection;
