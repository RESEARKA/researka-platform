import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  VStack,
  Collapse,
  useDisclosure,
  Divider,
  Button,
  Link as ChakraLink,
  Text,
  HStack
} from '@chakra-ui/react';
import { FiMenu, FiX, FiChevronDown, FiUser, FiLogOut } from 'react-icons/fi';
import Link from 'next/link';

interface MobileNavProps {
  activePage?: string;
  isLoggedIn?: boolean;
  onLoginClick?: (redirectPath?: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({
  activePage = 'home',
  isLoggedIn: propIsLoggedIn = false,
  onLoginClick = () => {}
}) => {
  const { isOpen: navIsOpen, onToggle: onNavToggle } = useDisclosure();
  const activePageLower = activePage.toLowerCase();
  
  // Background colors
  const bgColor = 'white';
  const borderColor = 'gray.200';
  
  // Check if user is logged in from localStorage (client-side only)
  const [isLoggedIn, setIsLoggedIn] = React.useState(propIsLoggedIn);
  const [username, setUsername] = React.useState<string | null>(null);
  const [userMenuIsOpen, setUserMenuIsOpen] = React.useState(false);
  
  React.useEffect(() => {
    // Check localStorage for login status (client-side only)
    if (typeof window !== 'undefined') {
      const storedLoginStatus = localStorage.getItem('isLoggedIn');
      const storedUser = localStorage.getItem('user');
      
      if (storedLoginStatus === 'true') {
        setIsLoggedIn(true);
        
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUsername(userData.username || userData.name || 'User');
          } catch (e) {
            console.error('Failed to parse user data:', e);
          }
        }
      }
    }
  }, []);
  
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUsername(null);
      window.location.href = '/';
    }
  };
  
  return (
    <Box
      display={{ base: 'block', md: 'none' }}
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="1000"
      bg={bgColor}
      boxShadow="md"
      borderBottom="1px"
      borderColor={borderColor}
      transition="all 0.3s"
    >
      <Flex
        h="60px"
        alignItems="center"
        justifyContent="space-between"
        px={4}
      >
        <Box as="a" href="/" fontWeight="bold" fontSize="xl">
          Researka
        </Box>
        
        <HStack spacing={2}>
          <IconButton
            aria-label="Toggle Navigation"
            icon={navIsOpen ? <FiX /> : <FiMenu />}
            variant="ghost"
            onClick={onNavToggle}
            size="md"
          />
        </HStack>
      </Flex>
      
      <Collapse in={navIsOpen} animateOpacity>
        <VStack
          spacing={0}
          align="stretch"
          pb={4}
          px={4}
          bg={bgColor}
          boxShadow="md"
          maxH="calc(100vh - 60px)"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray.300',
              borderRadius: '24px',
            },
          }}
        >
          <MobileNavItem 
            href="/" 
            label="HOME" 
            isActive={activePageLower === 'home'} 
          />
          
          <MobileNavItem 
            href="/articles" 
            label="ARTICLES" 
            isActive={activePageLower === 'articles'} 
          />
          
          <MobileNavDropdown 
            label="INFO" 
            items={[
              { label: "About", href: "/info/about" },
              { label: "Roles", href: "/info/roles" },
              { label: "Whitepaper", href: "/info/whitepaper" },
              { label: "Contact", href: "/info/contact" }
            ]}
          />
          
          <MobileNavDropdown 
            label="GOVERNANCE" 
            items={[
              { label: "Privacy Center", href: "/governance/privacy-center" },
              { label: "Privacy Policy", href: "/governance/privacy-policy" },
              { label: "Cookie Policy", href: "/governance/cookie-policy" },
              { label: "Legal", href: "/governance/legal" }
            ]}
          />
          
          {isLoggedIn ? (
            <>
              <MobileNavItem 
                href="/submit" 
                label="SUBMIT" 
                isActive={activePageLower === 'submit'} 
              />
              
              <MobileNavItem 
                href="/review" 
                label="REVIEW" 
                isActive={activePageLower === 'review'} 
              />
            </>
          ) : (
            <>
              <MobileNavItem 
                label="SUBMIT" 
                href="#"
                onClick={() => onLoginClick('/submit')} 
              />
              
              <MobileNavItem 
                label="REVIEW" 
                href="#"
                onClick={() => onLoginClick('/review')} 
              />
            </>
          )}
          
          <Divider my={2} borderColor="gray.200" />
          
          {isLoggedIn ? (
            <>
              <MobileNavItem 
                href="/profile" 
                label={`PROFILE (${username || 'User'})`}
                isActive={activePageLower === 'profile'} 
              />
              
              <Box 
                py={3}
                px={4}
                as="button"
                onClick={handleLogout}
                width="100%"
                textAlign="left"
                _hover={{ bg: "gray.100" }}
                borderRadius="md"
                transition="all 0.2s"
              >
                <HStack spacing={2}>
                  <FiLogOut />
                  <Text fontWeight="medium">LOGOUT</Text>
                </HStack>
              </Box>
            </>
          ) : (
            <Box 
              py={3}
              px={4}
              as="button"
              onClick={() => onLoginClick()}
              width="100%"
              textAlign="left"
              _hover={{ bg: "gray.100" }}
              borderRadius="md"
              transition="all 0.2s"
              fontWeight="medium"
            >
              <HStack spacing={2}>
                <FiUser />
                <Text>LOGIN</Text>
              </HStack>
            </Box>
          )}
        </VStack>
      </Collapse>
    </Box>
  );
};

interface MobileNavItemProps {
  href: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ 
  href, 
  label, 
  isActive = false,
  onClick
}) => {
  const activeBg = 'blue.50';
  const hoverBg = 'gray.100';
  const activeColor = 'blue.600';
  const color = 'gray.800';
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };
  
  return (
    <Box
      as="a"
      href={href}
      onClick={handleClick}
      py={3}
      px={4}
      display="block"
      fontWeight="medium"
      borderRadius="md"
      transition="all 0.2s"
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : color}
      _hover={{ bg: hoverBg }}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </Box>
  );
};

interface MobileNavDropdownProps {
  label: string;
  items: Array<{ label: string; href: string }>;
}

const MobileNavDropdown: React.FC<MobileNavDropdownProps> = ({ label, items }) => {
  const { isOpen, onToggle } = useDisclosure();
  
  return (
    <Box width="100%">
      <Button
        as="div"
        variant="ghost"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        height="auto"
        py={3}
        px={4}
        borderRadius="md"
        fontWeight="500"
        onClick={onToggle}
        rightIcon={<FiChevronDown />}
        _hover={{ bg: "gray.100" }}
        _active={{ bg: "gray.200" }}
        sx={{
          // Increase touch target size
          minHeight: '44px',
        }}
      >
        {label}
      </Button>
      
      <Collapse in={isOpen} animateOpacity>
        <Box
          pl={4}
          py={2}
          borderLeft="1px"
          borderColor="gray.200"
          ml={4}
          mt={1}
        >
          {items.map((item, index) => (
            <Link key={index} href={item.href} passHref legacyBehavior>
              <ChakraLink
                display="block"
                py={2}
                px={4}
                width="100%"
                borderRadius="md"
                _hover={{ textDecoration: 'none', bg: "gray.100" }}
                _active={{ bg: "gray.200" }}
              >
                {item.label}
              </ChakraLink>
            </Link>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default MobileNav;
