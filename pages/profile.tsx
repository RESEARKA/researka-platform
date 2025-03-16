import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Divider,
  Badge,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Skeleton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../components/WalletProvider';
import dynamic from 'next/dynamic';

// Dynamically import wallet-related components to prevent SSR issues
const WalletSection = dynamic(() => import('../components/profile/WalletSection'), {
  ssr: false,
  loading: () => (
    <Box p={5} borderWidth="1px" borderRadius="lg">
      <Heading size="md" mb={4}>Wallet</Heading>
      <Skeleton height="20px" mb={2} />
      <Skeleton height="20px" mb={2} />
      <Skeleton height="40px" width="150px" />
    </Box>
  )
});

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <Container maxW="container.xl" py={10}>
        <Skeleton height="400px" />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Heading mb={6}>Your Profile</Heading>
      
      <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
        {/* Profile Information */}
        <Box 
          flex={1} 
          p={5} 
          borderWidth="1px" 
          borderRadius="lg" 
          bg={bgColor}
          borderColor={borderColor}
        >
          <Flex direction={{ base: 'column', sm: 'row' }} align={{ sm: 'center' }} mb={6} gap={4}>
            <Avatar 
              size="xl" 
              name={user.name || user.email} 
              src={user.profileImage || undefined} 
            />
            <VStack align="start" spacing={1}>
              <Heading size="lg">{user.name || 'Researcher'}</Heading>
              <Text color="gray.500">{user.email}</Text>
              <HStack mt={2}>
                <Badge colorScheme="green">Verified</Badge>
                {user.role && <Badge colorScheme="blue">{user.role}</Badge>}
              </HStack>
            </VStack>
          </Flex>
          
          <Divider my={4} />
          
          <VStack align="start" spacing={4}>
            <Box>
              <Heading size="sm" mb={2}>Bio</Heading>
              <Text>{user.bio || 'No bio provided yet.'}</Text>
            </Box>
            
            <Box>
              <Heading size="sm" mb={2}>Institution</Heading>
              <Text>{user.institution || 'Not specified'}</Text>
            </Box>
            
            <Box>
              <Heading size="sm" mb={2}>Research Interests</Heading>
              <Flex wrap="wrap" gap={2}>
                {user.interests && user.interests.length > 0 ? (
                  user.interests.map((interest, index) => (
                    <Badge key={index} colorScheme="purple">{interest}</Badge>
                  ))
                ) : (
                  <Text>No research interests specified</Text>
                )}
              </Flex>
            </Box>
          </VStack>
          
          <Button colorScheme="red" variant="outline" mt={6} onClick={logout}>
            Logout
          </Button>
        </Box>
        
        {/* Activity and Wallet Section */}
        <VStack flex={1} spacing={6} align="stretch">
          {/* Research Activity */}
          <Box p={5} borderWidth="1px" borderRadius="lg" bg={bgColor} borderColor={borderColor}>
            <Heading size="md" mb={4}>Research Activity</Heading>
            <Flex justify="space-between" wrap="wrap" gap={4}>
              <Stat>
                <StatLabel>Submissions</StatLabel>
                <StatNumber>{user.submissions?.length || 0}</StatNumber>
                <StatHelpText>Research papers</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Reviews</StatLabel>
                <StatNumber>{user.reviews?.length || 0}</StatNumber>
                <StatHelpText>Peer reviews</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Citations</StatLabel>
                <StatNumber>{user.citations || 0}</StatNumber>
                <StatHelpText>From other papers</StatHelpText>
              </Stat>
            </Flex>
          </Box>
          
          {/* Wallet Section - Loaded dynamically to prevent SSR issues */}
          <WalletSection />
        </VStack>
      </Flex>
    </Container>
  );
}
