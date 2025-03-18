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
      <ModalContent bg="white">
        <ModalHeader color="gray.800">Login to Researka</ModalHeader>
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
                <FormControl id="email" isRequired>
                  <FormLabel color="gray.700">Email</FormLabel>
                  <Input 
                    type="email" 
                    placeholder="your@email.com"
                    bg="white"
                    borderColor="gray.300"
                  />
                </FormControl>
                
                <FormControl id="password" isRequired>
                  <FormLabel color="gray.700">Password</FormLabel>
                  <Input 
                    type="password" 
                    placeholder="********"
                    bg="white"
                    borderColor="gray.300"
                  />
                </FormControl>
                
                <Button 
                  type="submit" 
                  colorScheme="green" 
                  width="full"
                  mt={2}
                >
                  Login with Email
                </Button>
              </VStack>
            </form>
          </VStack>
        </ModalBody>
        
        <ModalFooter justifyContent="center">
          <Text fontSize="sm" color="gray.600">
            Don't have an account? <Button variant="link" colorScheme="blue" size="sm">Sign up</Button>
          </Text>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
