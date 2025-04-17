import React from 'react';
import { Box, Text, Progress, VStack, HStack, Icon } from '@chakra-ui/react';
import { FiCheck, FiX } from 'react-icons/fi';

// Define a proper type for the profile
interface ProfileData {
  name?: string;
  affiliation?: string;
  orcidId?: string;
  bio?: string;
  researchInterests?: string[];
}

interface ProfileCompletenessProps {
  profile: ProfileData;
}

// Required fields for a complete profile
const REQUIRED_FIELDS = [
  { key: 'name', label: 'Full Name' },
  { key: 'affiliation', label: 'University/Institution' },
  { key: 'orcidId', label: 'ORCID ID' },
  { key: 'bio', label: 'Short Bio' }
];

/**
 * A component that displays profile completion status
 * Shows a progress bar and checklist of required fields
 */
export const ProfileCompleteness: React.FC<ProfileCompletenessProps> = ({ profile }) => {
  // Check if a field is complete
  const isFieldComplete = (key: string): boolean => {
    const value = profile[key as keyof ProfileData];
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    return true;
  };
  
  // Calculate completed fields and percentage
  const completedFields = REQUIRED_FIELDS.filter(field => isFieldComplete(field.key));
  const percentage = Math.round((completedFields.length / REQUIRED_FIELDS.length) * 100);
  
  return (
    <Box p={4} bg="gray.50" borderRadius="md" shadow="sm" mb={6}>
      <Text fontWeight="medium" mb={2}>Profile Completeness: {percentage}%</Text>
      <Progress 
        value={percentage} 
        colorScheme="blue" 
        size="sm" 
        mb={4} 
        aria-label="Profile completion progress"
      />
      
      <VStack align="stretch" spacing={2}>
        {REQUIRED_FIELDS.map(field => {
          const isComplete = isFieldComplete(field.key);
          return (
            <HStack key={field.key} justify="space-between">
              <Text fontSize="sm">{field.label}</Text>
              <Icon 
                as={isComplete ? FiCheck : FiX} 
                color={isComplete ? "green.500" : "red.500"} 
                aria-label={isComplete ? "Complete" : "Incomplete"}
              />
            </HStack>
          );
        })}
      </VStack>
      
      {percentage < 100 && (
        <Text fontSize="sm" mt={4} color="gray.600">
          Complete your profile to increase visibility
        </Text>
      )}
    </Box>
  );
};

export default ProfileCompleteness;
