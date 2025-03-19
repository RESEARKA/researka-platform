import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'next/router';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string; // Used for redirecting to /submit or /review pages, otherwise defaults to /profile
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, redirectPath = '/profile' }) => {
  const toast = useToast();
  const router = useRouter();
  
  // Debug: Log the redirectPath value when component mounts or redirectPath changes
  React.useEffect(() => {
    console.log('LoginModal received redirectPath:', redirectPath);
  }, [redirectPath]);

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
      
      // If redirecting to submit or review, mark profile as complete to prevent redirect loop
      if (redirectPath === '/submit' || redirectPath === '/review') {
        localStorage.setItem('profileComplete', 'true');
      } else {
        // Check if a profile already exists
        const existingProfile = localStorage.getItem('userProfile');
        if (!existingProfile) {
          // Only set profile as incomplete if no profile exists
          localStorage.setItem('profileComplete', 'false');
          
          // Set default profile data only if no profile exists
          localStorage.setItem('userProfile', JSON.stringify({
            name: 'Wallet User',
            role: 'Researcher',
            institution: 'Decentralized University',
            articles: 3,
            reviews: 12,
            reputation: 89
          }));
        }
      }
      
      onClose();
      
      // Use Next.js router for redirection
      console.log('Redirecting to:', redirectPath);
      router.push(redirectPath);
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
      
      // If redirecting to submit or review, mark profile as complete to prevent redirect loop
      if (redirectPath === '/submit' || redirectPath === '/review') {
        localStorage.setItem('profileComplete', 'true');
      } else {
        // Check if a profile already exists
        const existingProfile = localStorage.getItem('userProfile');
        if (!existingProfile) {
          // Only set profile as incomplete if no profile exists
          localStorage.setItem('profileComplete', 'false');
          
          // Set default profile data only if no profile exists
          localStorage.setItem('userProfile', JSON.stringify({
            name: 'Email User',
            role: 'Researcher',
            institution: 'Science Academy',
            articles: 5,
            reviews: 8,
            reputation: 76
          }));
        }
      }
      
      onClose();
      
      // Use Next.js router for redirection
      console.log('Redirecting to:', redirectPath);
      router.push(redirectPath);
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
              colorScheme="green" 
              onClick={handleWalletLogin}
              width="full"
            >
              Connect Wallet
            </Button>
            
            <Flex align="center" my={2}>
              <Divider flex="1" />
              <Text mx={4} color="gray.500" fontSize="sm">OR</Text>
              <Divider flex="1" />
            </Flex>
            
            <form onSubmit={handleEmailLogin}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel color="gray.700">Email Address</FormLabel>
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: "gray.400" }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel color="gray.700">Password</FormLabel>
                  <Input 
                    type="password" 
                    placeholder="********" 
                    required 
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: "gray.400" }}
                  />
                </FormControl>
                
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  variant="outline" 
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
          <Text fontSize="sm" color="gray.500">
            Don't have an account? <Button variant="link" colorScheme="blue" size="sm">Sign Up</Button>
          </Text>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
