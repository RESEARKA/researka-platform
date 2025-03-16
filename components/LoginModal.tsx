import React, { useState } from 'react';
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
  Link as ChakraLink,
  useToast,
  InputGroup,
  InputRightElement,
  Divider,
  useColorModeValue,
  HStack,
  Checkbox,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useModal } from '../contexts/ModalContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, redirectPath }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { redirectPath: contextRedirectPath } = useModal();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  
  const finalRedirectPath = redirectPath || contextRedirectPath;
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      // In a real app, you would call your authentication API here
      toast({
        title: 'Login Successful',
        description: 'Welcome to Researka!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setIsLoading(false);
      onClose();
      
      // Navigate to the profile page by default, or to the redirect path if provided
      if (finalRedirectPath && finalRedirectPath !== '/') {
        router.push(finalRedirectPath);
      } else {
        router.push('/profile');
      }
    }, 1500);
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      isCentered
      motionPreset="slideInBottom"
      size={{ base: "sm", md: "md" }}
    >
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={bgColor} borderRadius="lg">
        <ModalHeader textAlign="center">Login to Researka</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <form onSubmit={handleLogin}>
            <VStack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="your.email@example.com"
                />
              </FormControl>
              
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Enter your password"
                  />
                  <InputRightElement width="3rem">
                    <Button 
                      h="1.5rem" 
                      size="sm" 
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <HStack width="100%" justify="space-between">
                <Checkbox 
                  isChecked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                >
                  Remember me
                </Checkbox>
                <ChakraLink color="blue.600" fontSize="sm">
                  Forgot password?
                </ChakraLink>
              </HStack>
              
              <Button 
                type="submit" 
                colorScheme="green" 
                width="full" 
                mt={4} 
                isLoading={isLoading}
                loadingText="Logging in..."
              >
                Login
              </Button>
            </VStack>
          </form>
          
          <Divider my={6} />
          
          <Text textAlign="center" mb={4}>
            Don't have an account?{' '}
            <ChakraLink color="blue.600" onClick={onClose} href="/register">
              Sign up
            </ChakraLink>
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
