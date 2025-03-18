import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Flex,
  Divider,
  useToast
} from '@chakra-ui/react';
import { FaEthereum } from 'react-icons/fa';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, redirectPath = '/profile' }) => {
  const toast = useToast();

  const handleWalletLogin = () => {
    // Simulate wallet connection
    setTimeout(() => {
      toast({
        title: "Wallet connected",
        description: "You've been successfully logged in",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Set login state in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loginMethod', 'wallet');
      localStorage.setItem('userProfile', JSON.stringify({
        name: 'Wallet User',
        role: 'Researcher',
        institution: 'Decentralized University',
        articles: 3,
        reviews: 12,
        reputation: 89
      }));
      
      onClose();
      
      // Redirect to the specified path
      if (redirectPath) {
        window.location.href = redirectPath;
      }
    }, 1000);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate email login
    setTimeout(() => {
      toast({
        title: "Login successful",
        description: "You've been logged in via email",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Set login state in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loginMethod', 'email');
      localStorage.setItem('userProfile', JSON.stringify({
        name: 'Email User',
        role: 'Researcher',
        institution: 'Science Academy',
        articles: 5,
        reviews: 8,
        reputation: 76
      }));
      
      onClose();
      
      // Redirect to the specified path
      if (redirectPath) {
        window.location.href = redirectPath;
      }
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Login to Researka</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Button 
              leftIcon={<FaEthereum />} 
              colorScheme="blue" 
              variant="outline"
              onClick={handleWalletLogin}
            >
              Connect Wallet
            </Button>
            
            <Flex align="center" my={4}>
              <Divider />
              <Text mx={2} fontSize="sm" color="gray.500">or</Text>
              <Divider />
            </Flex>
            
            <form onSubmit={handleEmailLogin}>
              <VStack spacing={4}>
                <FormControl id="email">
                  <FormLabel>Email address</FormLabel>
                  <Input type="email" placeholder="your@email.com" />
                </FormControl>
                <FormControl id="password">
                  <FormLabel>Password</FormLabel>
                  <Input type="password" placeholder="********" />
                </FormControl>
                <Button type="submit" colorScheme="green" width="full">
                  Login with Email
                </Button>
              </VStack>
            </form>
            
            <Text fontSize="sm" textAlign="center" mt={2}>
              Don&apos;t have an account? <Button variant="link" colorScheme="blue" size="sm">Sign up</Button>
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Text fontSize="xs" color="gray.500">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
