import React from 'react';
import { Button, HStack, Icon, Text, useToast, ButtonProps } from '@chakra-ui/react';
import { FiExternalLink } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

// ORCID icon component
const OrcidIcon = (props: any) => (
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

interface OrcidConnectButtonProps extends Omit<ButtonProps, 'isFullWidth'> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline';
  isFullWidth?: boolean;
  onConnect?: (orcidId: string) => void;
}

/**
 * Button component for connecting to ORCID
 * 
 * This button initiates the ORCID OAuth flow when clicked
 */
const OrcidConnectButton: React.FC<OrcidConnectButtonProps> = ({ 
  size = 'md', 
  variant = 'solid',
  isFullWidth = false,
  onConnect,
  ...props
}) => {
  const router = useRouter();
  const toast = useToast();
  const { currentUser } = useAuth();
  
  const handleConnect = async () => {
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to connect your ORCID iD',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      router.push('/login');
      return;
    }
    
    try {
      // Check if user already has an ORCID ID in their profile
      if (currentUser.profile?.orcid && onConnect) {
        // If they do and we have an onConnect callback, call it with the existing ORCID ID
        onConnect(currentUser.profile.orcid);
        toast({
          title: 'ORCID iD already connected',
          description: 'Your ORCID iD is already linked to your account',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Otherwise, redirect to the ORCID authorization endpoint
      router.push('/api/auth/orcid');
    } catch (error) {
      console.error('Error connecting to ORCID:', error);
      toast({
        title: 'Connection error',
        description: 'There was a problem connecting to ORCID. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  return (
    <Button
      onClick={handleConnect}
      size={size}
      variant={variant}
      colorScheme="green"
      bg={variant === 'solid' ? '#A6CE39' : 'transparent'}
      color={variant === 'solid' ? 'white' : '#A6CE39'}
      borderColor={variant === 'outline' ? '#A6CE39' : 'transparent'}
      _hover={{
        bg: variant === 'solid' ? '#95BD33' : 'rgba(166, 206, 57, 0.1)',
      }}
      isFullWidth={isFullWidth}
      {...props}
    >
      <HStack spacing={2}>
        <OrcidIcon boxSize={size === 'sm' ? 4 : size === 'lg' ? 6 : 5} />
        <Text>Connect with ORCID</Text>
        <Icon as={FiExternalLink} boxSize={size === 'sm' ? 3 : size === 'lg' ? 5 : 4} />
      </HStack>
    </Button>
  );
};

export default OrcidConnectButton;
