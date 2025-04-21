import React from 'react';
import { Box, Text, Progress, VStack, HStack, Icon } from '@chakra-ui/react';
import { FiCheck, FiX } from 'react-icons/fi';

interface ProfileCompletenessProps {
  profile: any;
}

export const ProfileCompleteness: React.FC<ProfileCompletenessProps> = ({ profile }) => {
  // Define required fields for a complete profile
  const requiredFields = [
    { key: 'name', label: 'Full Name' },
    { key: 'affiliation', label: 'University/Institution' },
    { key: 'orcidId', label: 'ORCID ID' },
    { key: 'bio', label: 'Short Bio' },
    { key: 'researchInterests', label: 'Research Interests' }
  ];
  
  // Calculate completed fields
  const completedFields = requiredFields.filter(field => 
    Boolean(profile[field.key]) && 
    (typeof profile[field.key] === 'string' ? profile[field.key].trim() !== '' : true)
  );
  
  const percentage = Math.round((completedFields.length / requiredFields.length) * 100);
  
  return (
    <Box p={4} bg="gray.50" borderRadius="md" shadow="sm" mb={6}>
      <Text fontWeight="medium" mb={2}>Profile Completeness: {percentage}%</Text>
      <Progress value={percentage} colorScheme="blue" size="sm" mb={4} />
      
      <VStack align="stretch" spacing={2}>
        {requiredFields.map(field => (
          <HStack key={field.key} justify="space-between">
            <Text fontSize="sm">{field.label}</Text>
            <Icon 
              as={Boolean(profile[field.key]) ? FiCheck : FiX} 
              color={Boolean(profile[field.key]) ? "green.500" : "red.500"} 
            />
          </HStack>
        ))}
      </VStack>
      
      {percentage < 100 && (
        <Text fontSize="sm" mt={4} color="gray.600">
          Complete your profile to increase visibility and credibility
        </Text>
      )}
    </Box>
  );
};
