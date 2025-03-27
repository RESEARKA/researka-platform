import React from 'react';
import {
  Flex,
  Box,
  Avatar,
  Text,
  Badge,
  Button,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiEdit, FiX } from 'react-icons/fi';
import { UserProfile } from '../../hooks/useProfileData';
import ResponsiveText from '../ResponsiveText';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  isEditMode: boolean;
  isLoading: boolean;
  onEditClick: () => void;
  onCancelEdit: () => void;
}

/**
 * Profile header component displaying user information and edit controls
 */
const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isEditMode,
  isLoading,
  onEditClick,
  onCancelEdit
}) => {
  // UI colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Default values for profile properties
  const avatarUrl = profile?.avatarUrl || 'https://bit.ly/broken-link';
  const name = profile?.name || 'Anonymous User';
  const role = profile?.role || 'Researcher';
  const institution = profile?.institution || 'Unknown Institution';
  const department = profile?.department || '';
  const position = profile?.position || '';
  const bio = profile?.bio || '';
  
  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="md"
      mb={6}
    >
      <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'flex-start' }}>
        <Avatar
          size="xl"
          src={avatarUrl}
          name={name}
          mr={{ base: 0, md: 6 }}
          mb={{ base: 4, md: 0 }}
        />
        
        <Box flex="1">
          <Flex 
            justify="space-between" 
            align={{ base: 'center', md: 'flex-start' }}
            direction={{ base: 'column', md: 'row' }}
            mb={2}
          >
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={1}>
              <ResponsiveText
                variant="h2"
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                textAlign={{ base: 'center', md: 'left' }}
              >
                {name}
              </ResponsiveText>
              
              <Flex align="center" wrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
                <Badge colorScheme="green" mr={2} mb={1}>
                  {role}
                </Badge>
                {institution && (
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    {institution}
                  </Text>
                )}
              </Flex>
              
              {(department || position) && (
                <Text 
                  fontSize="sm" 
                  color="gray.500"
                  textAlign={{ base: 'center', md: 'left' }}
                >
                  {department}{department && position && ', '}{position}
                </Text>
              )}
            </VStack>
            
            {!isEditMode ? (
              <Button
                leftIcon={<FiEdit />}
                size="sm"
                onClick={onEditClick}
                isLoading={isLoading}
                mt={{ base: 4, md: 0 }}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                leftIcon={<FiX />}
                size="sm"
                variant="outline"
                onClick={onCancelEdit}
                mt={{ base: 4, md: 0 }}
              >
                Cancel
              </Button>
            )}
          </Flex>
          
          {bio && (
            <Text 
              mt={4} 
              fontSize="md"
              textAlign={{ base: 'center', md: 'left' }}
            >
              {bio}
            </Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default ProfileHeader;
