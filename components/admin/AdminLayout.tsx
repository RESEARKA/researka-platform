import React, { ReactNode, useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Icon,
  Link as ChakraLink,
  Divider,
  VStack,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  FiUsers, 
  FiFileText, 
  FiSettings, 
  FiAlertTriangle,
  FiHome
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { createLogger, LogCategory } from '../../utils/logger';

const logger = createLogger('admin');

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        logger.warn('No user logged in, redirecting from admin page', {
          category: LogCategory.AUTH
        });
        router.push('/login?redirect=/admin');
        return;
      }

      try {
        // In a production environment, you would check custom claims or a dedicated admin role
        // For now, we'll use the same approach as the existing admin pages
        const adminEmails = ['admin@researka.org', 'dom123dxb@gmail.com', 'dominic@dominic.ac'];
        const hasAdminAccess = adminEmails.includes(currentUser.email || '');
        
        if (!hasAdminAccess) {
          logger.warn('User does not have admin access', {
            context: { email: currentUser.email },
            category: LogCategory.AUTH
          });
          router.push('/');
          return;
        }
        
        setIsAdmin(true);
      } catch (error) {
        logger.error('Error checking admin status', {
          context: { error },
          category: LogCategory.ERROR
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [currentUser, router]);

  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Verifying admin access...</Text>
        </VStack>
      </Center>
    );
  }

  if (!isAdmin) {
    return (
      <Center h="100vh">
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          width="400px"
          borderRadius="md"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Access Denied
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            You do not have permission to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Flex>
        {/* Sidebar */}
        <Box
          w="250px"
          bg={bgColor}
          borderRight="1px"
          borderColor={borderColor}
          position="fixed"
          h="100vh"
          py={5}
        >
          <VStack align="start" spacing={1} px={4} mb={8}>
            <Heading size="md" mb={2}>DecentraJournal Admin</Heading>
            <Text fontSize="sm" color="gray.500">
              Platform Management
            </Text>
          </VStack>
          
          <Divider mb={5} />
          
          <VStack align="start" spacing={1} px={4}>
            <Link href="/admin" passHref legacyBehavior>
              <ChakraLink 
                py={2} 
                px={4} 
                borderRadius="md" 
                w="full" 
                display="flex"
                alignItems="center"
                _hover={{ bg: 'gray.100', textDecoration: 'none' }}
                bg={router.pathname === '/admin' ? 'gray.100' : 'transparent'}
              >
                <Icon as={FiHome} mr={3} />
                Dashboard
              </ChakraLink>
            </Link>
            
            <Link href="/admin/users" passHref legacyBehavior>
              <ChakraLink 
                py={2} 
                px={4} 
                borderRadius="md" 
                w="full" 
                display="flex"
                alignItems="center"
                _hover={{ bg: 'gray.100', textDecoration: 'none' }}
                bg={router.pathname === '/admin/users' ? 'gray.100' : 'transparent'}
              >
                <Icon as={FiUsers} mr={3} />
                User Management
              </ChakraLink>
            </Link>
            
            <Link href="/admin/articles" passHref legacyBehavior>
              <ChakraLink 
                py={2} 
                px={4} 
                borderRadius="md" 
                w="full" 
                display="flex"
                alignItems="center"
                _hover={{ bg: 'gray.100', textDecoration: 'none' }}
                bg={router.pathname === '/admin/articles' ? 'gray.100' : 'transparent'}
              >
                <Icon as={FiFileText} mr={3} />
                Article Management
              </ChakraLink>
            </Link>
            
            <Link href="/admin/content-moderation" passHref legacyBehavior>
              <ChakraLink 
                py={2} 
                px={4} 
                borderRadius="md" 
                w="full" 
                display="flex"
                alignItems="center"
                _hover={{ bg: 'gray.100', textDecoration: 'none' }}
                bg={router.pathname === '/admin/content-moderation' ? 'gray.100' : 'transparent'}
              >
                <Icon as={FiAlertTriangle} mr={3} />
                Content Moderation
              </ChakraLink>
            </Link>
            
            <Link href="/admin/settings" passHref legacyBehavior>
              <ChakraLink 
                py={2} 
                px={4} 
                borderRadius="md" 
                w="full" 
                display="flex"
                alignItems="center"
                _hover={{ bg: 'gray.100', textDecoration: 'none' }}
                bg={router.pathname === '/admin/settings' ? 'gray.100' : 'transparent'}
              >
                <Icon as={FiSettings} mr={3} />
                Platform Settings
              </ChakraLink>
            </Link>
          </VStack>
          
          <Divider my={5} />
          
          <VStack align="start" spacing={1} px={4}>
            <Link href="/" passHref legacyBehavior>
              <ChakraLink 
                py={2} 
                px={4} 
                borderRadius="md" 
                w="full" 
                display="flex"
                alignItems="center"
                _hover={{ bg: 'gray.100', textDecoration: 'none' }}
              >
                <Icon as={FiHome} mr={3} />
                Return to Site
              </ChakraLink>
            </Link>
          </VStack>
        </Box>
        
        {/* Main Content */}
        <Box ml="250px" w="calc(100% - 250px)" p={8}>
          <Heading mb={6}>{title}</Heading>
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default AdminLayout;
