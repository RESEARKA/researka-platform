import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  VStack,
  Collapse,
  useDisclosure,
  useColorModeValue,
  Divider,
  Button,
  Link as ChakraLink
} from '@chakra-ui/react';
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
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
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
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
      borderBottom="1px"
      borderColor={borderColor}
      py={2}
    >
      <Flex justify="space-between" align="center" px={4}>
        <Link href="/" passHref legacyBehavior>
          <ChakraLink _hover={{ textDecoration: 'none' }}>
            <Box fontWeight="bold" fontSize="xl" color="green.400">RESEARKA</Box>
          </ChakraLink>
        </Link>
        
        <IconButton
          aria-label="Toggle Navigation"
          icon={navIsOpen ? <FiX /> : <FiMenu />}
          variant="ghost"
          onClick={onNavToggle}
          size="lg"
          _hover={{ bg: 'gray.100' }}
        />
      </Flex>
      
      <Collapse in={navIsOpen} animateOpacity>
        <VStack
          spacing={4}
          p={4}
          align="stretch"
          bg={bgColor}
          borderBottomRadius="md"
          boxShadow={navIsOpen ? "sm" : "none"}
          mt={2}
        >
          {/* Main Nav Items */}
          <MobileNavItem 
            href="/" 
            label="HOME" 
            isActive={activePageLower === 'home'} 
          />
          
          {/* SEARCH functionality */}
          <MobileNavItem 
            href="/search" 
            label="SEARCH" 
            isActive={activePageLower === 'search'} 
          />
          
          {isLoggedIn ? (
            <MobileNavItem 
              href="/submit" 
              label="SUBMIT" 
              isActive={activePageLower === 'submit'} 
            />
          ) : (
            <Button
              variant="ghost"
              justifyContent="flex-start"
              width="100%"
              height="auto"
              py={3}
              px={4}
              borderRadius="md"
              fontWeight="500"
              _hover={{ bg: 'gray.100' }}
              _active={{ bg: 'gray.200' }}
              onClick={() => onLoginClick('/submit')}
              sx={{
                minHeight: '44px',
              }}
            >
              SUBMIT
            </Button>
          )}
          
          {isLoggedIn ? (
            <MobileNavItem 
              href="/review" 
              label="REVIEW" 
              isActive={activePageLower === 'review'} 
            />
          ) : (
            <Button
              variant="ghost"
              justifyContent="flex-start"
              width="100%"
              height="auto"
              py={3}
              px={4}
              borderRadius="md"
              fontWeight="500"
              _hover={{ bg: 'gray.100' }}
              _active={{ bg: 'gray.200' }}
              onClick={() => onLoginClick('/review')}
              sx={{
                minHeight: '44px',
              }}
            >
              REVIEW
            </Button>
          )}
          
          {isLoggedIn ? (
            <Box>
              <Button
                variant="ghost"
                justifyContent="flex-start"
                width="100%"
                height="auto"
                py={3}
                px={4}
                borderRadius="md"
                fontWeight="500"
                onClick={() => setUserMenuIsOpen(!userMenuIsOpen)}
                _hover={{ bg: 'gray.100' }}
                _active={{ bg: 'gray.200' }}
                sx={{
                  // Increase touch target size
                  minHeight: '44px',
                }}
              >
                {username || 'User'}
              </Button>
              <Collapse in={userMenuIsOpen} animateOpacity>
                <Box
                  pl={4}
                  py={2}
                  borderLeft="1px"
                  borderColor="gray.200"
                  ml={4}
                  mt={1}
                >
                  <Link href="/profile" passHref legacyBehavior>
                    <ChakraLink
                      py={2}
                      px={4}
                      width="100%"
                      display="block"
                      borderRadius="md"
                      _hover={{ textDecoration: 'none', bg: 'gray.100' }}
                      _active={{ bg: 'gray.200' }}
                    >
                      Profile
                    </ChakraLink>
                  </Link>
                  <Box
                    as="button"
                    onClick={handleLogout}
                    py={2}
                    px={4}
                    width="100%"
                    textAlign="left"
                    fontWeight="500"
                    borderRadius="md"
                    _hover={{ bg: 'gray.100' }}
                    _active={{ bg: 'gray.200' }}
                    display="block"
                  >
                    Logout
                  </Box>
                </Box>
              </Collapse>
            </Box>
          ) : (
            <Button
              variant="ghost"
              justifyContent="flex-start"
              width="100%"
              height="auto"
              py={3}
              px={4}
              borderRadius="md"
              fontWeight="500"
              _hover={{ bg: 'gray.100' }}
              _active={{ bg: 'gray.200' }}
              onClick={() => onLoginClick()}
              sx={{
                minHeight: '44px',
              }}
            >
              LOGIN
            </Button>
          )}
          
          <Divider />
          
          {/* INFO Dropdown */}
          <MobileNavDropdown 
            label="INFO" 
            items={[
              { label: "ROLES", href: "/info/roles" },
              { label: "ABOUT", href: "/info/about" },
              { label: "TEAM", href: "/info/team" },
              { label: "WHITEPAPER", href: "/info/whitepaper" },
              { label: "CONTACT", href: "/info/contact" }
            ]}
          />
          
          {/* GOVERNANCE Dropdown */}
          <MobileNavDropdown 
            label="GOVERNANCE" 
            items={[
              { label: "LEGAL", href: "/governance/legal" },
              { label: "PRIVACY POLICY", href: "/governance/privacy-policy" },
              { label: "COOKIE POLICY", href: "/governance/cookie-policy" },
              { label: "PRIVACY CENTER", href: "/governance/privacy-center" }
            ]}
          />
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
  // Touch-friendly styles
  const activeStyle = isActive ? {
    bg: 'blue.50',
    color: 'blue.500',
    fontWeight: '600'
  } : {};
  
  if (onClick) {
    return (
      <Button
        as="button"
        onClick={onClick}
        variant="ghost"
        justifyContent="flex-start"
        width="100%"
        height="auto"
        py={3}
        px={4}
        borderRadius="md"
        fontWeight="500"
        {...activeStyle}
        _hover={{ bg: 'gray.100' }}
        _active={{ bg: 'gray.200' }}
        sx={{
          // Increase touch target size
          minHeight: '44px',
        }}
      >
        {label}
      </Button>
    );
  }
  
  return (
    <Link href={href} passHref legacyBehavior>
      <ChakraLink
        display="block"
        py={3}
        px={4}
        width="100%"
        borderRadius="md"
        fontWeight="500"
        _hover={{ textDecoration: 'none', bg: 'gray.100' }}
        _active={{ bg: 'gray.200' }}
        sx={{
          // Increase touch target size
          minHeight: '44px',
        }}
        {...activeStyle}
      >
        {label}
      </ChakraLink>
    </Link>
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
        _hover={{ bg: 'gray.100' }}
        _active={{ bg: 'gray.200' }}
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
                _hover={{ textDecoration: 'none', bg: 'gray.100' }}
                _active={{ bg: 'gray.200' }}
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
