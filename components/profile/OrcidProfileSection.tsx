import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Link,
  Skeleton,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { FiExternalLink } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import OrcidConnectButton from '../auth/OrcidConnectButton';
import { formatOrcidId } from '../../utils/orcidHelper';

// ORCID icon component
const OrcidIcon = (props) => (
  <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z"
      fill="#A6CE39"
    />
    <path
      d="M86.3 186.2H70.9V79.1h15.4v107.1zM108.9 79.1h41.6c39.6 0 57 28.3 57 53.6 0 27.5-21.5 53.6-56.8 53.6h-41.8V79.1zm15.4 93.3h24.5c34.9 0 42.9-26.5 42.9-39.7C191.7 111.2 178 93 148 93h-23.7v79.4zM88.7 56.8c0 5.5-4.5 10.1-10.1 10.1s-10.1-4.6-10.1-10.1c0-5.6 4.5-10.1 10.1-10.1s10.1 4.6 10.1 10.1z"
      fill="#FFF"
    />
  </svg>
);

/**
 * Component to display ORCID profile information
 * 
 * Shows the user's ORCID iD and connection status
 * Provides a button to connect to ORCID if not already connected
 */
const OrcidProfileSection: React.FC = () => {
  const { currentUser, getUserProfile } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Fetch user profile data including ORCID information
  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        try {
          setIsLoading(true);
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchProfile();
  }, [currentUser, getUserProfile]);
  
  // Check if user has connected their ORCID iD
  const hasOrcid = userProfile?.orcid && userProfile.orcidConnected;
  
  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={6}
      mb={6}
      width="100%"
    >
      <Heading as="h3" size="md" mb={4}>
        ORCID Integration
      </Heading>
      
      {isLoading ? (
        <VStack align="stretch" spacing={4}>
          <Skeleton height="24px" width="70%" />
          <Skeleton height="20px" width="90%" />
          <Skeleton height="40px" width="50%" />
        </VStack>
      ) : hasOrcid ? (
        <VStack align="start" spacing={3}>
          <HStack>
            <OrcidIcon boxSize={6} />
            <Text fontWeight="medium">
              ORCID iD: {formatOrcidId(userProfile.orcid)}
            </Text>
          </HStack>
          
          <Link 
            href={`https://orcid.org/${userProfile.orcid}`}
            isExternal
            color="blue.500"
            display="flex"
            alignItems="center"
          >
            View ORCID Profile <Icon as={FiExternalLink} ml={1} />
          </Link>
          
          <Text fontSize="sm" color="gray.600" mt={2}>
            Your ORCID iD is connected to your DecentraJournal profile. This helps ensure proper attribution of your academic work.
          </Text>
        </VStack>
      ) : (
        <VStack align="start" spacing={4}>
          <Text>
            Connect your ORCID iD to verify your identity as a researcher and streamline the submission process.
          </Text>
          
          <Text fontSize="sm" color="gray.600">
            ORCID provides a persistent digital identifier that distinguishes you from other researchers and supports automated linkages between you and your professional activities.
          </Text>
          
          <OrcidConnectButton />
        </VStack>
      )}
    </Box>
  );
};

export default OrcidProfileSection;
