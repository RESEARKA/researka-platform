import React from 'react';
import {
  Flex,
  Box,
  Avatar,
  Text,
  Badge,
  Button,
  VStack,
  HStack,
  Link,
  useColorModeValue,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { FiEdit, FiX, FiTwitter, FiLinkedin, FiGlobe, FiHash } from 'react-icons/fi';
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
  const twitter = profile?.twitter || '';
  const linkedin = profile?.linkedin || '';
  const orcidId = profile?.orcidId || '';
  const personalWebsite = profile?.personalWebsite || '';
  
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
          
          {/* Social Media Links */}
          {(twitter || linkedin || orcidId || personalWebsite) && (
            <HStack 
              mt={4} 
              spacing={4} 
              justify={{ base: 'center', md: 'flex-start' }}
              wrap="wrap"
            >
              {twitter && (
                <Tooltip label={`@${twitter}`}>
                  <Link 
                    href={`https://twitter.com/${twitter}`} 
                    isExternal 
                    display="flex" 
                    alignItems="center"
                  >
                    <Icon as={FiTwitter} mr={1} color="blue.400" />
                    <Text fontSize="sm">Twitter</Text>
                  </Link>
                </Tooltip>
              )}
              
              {linkedin && (
                <Tooltip label={linkedin}>
                  <Link 
                    href={linkedin} 
                    isExternal 
                    display="flex" 
                    alignItems="center"
                  >
                    <Icon as={FiLinkedin} mr={1} color="blue.700" />
                    <Text fontSize="sm">LinkedIn</Text>
                  </Link>
                </Tooltip>
              )}
              
              {orcidId && (
                <Tooltip label={orcidId}>
                  <Link 
                    href={`https://orcid.org/${orcidId}`} 
                    isExternal 
                    display="flex" 
                    alignItems="center"
                  >
                    <Icon as={FiHash} mr={1} color="green.600" />
                    <Text fontSize="sm">ORCID</Text>
                  </Link>
                </Tooltip>
              )}
              
              {personalWebsite && (
                <Tooltip label={personalWebsite}>
                  <Link 
                    href={personalWebsite} 
                    isExternal 
                    display="flex" 
                    alignItems="center"
                  >
                    <Icon as={FiGlobe} mr={1} color="purple.500" />
                    <Text fontSize="sm">Website</Text>
                  </Link>
                </Tooltip>
              )}
            </HStack>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default ProfileHeader;
