import React, { useState, useEffect } from 'react';
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
    // Check localStorage for login status and user data (client-side only)
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
            setUsername('User');
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
      position="sticky"
      top={0}
      zIndex={10}
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
    >
      <Flex
        py={2}
        px={4}
        justify="space-between"
        align="center"
      >
        <Link href="/" passHref>
          <Box 
            as="a"
            fontSize="xl"
            fontWeight="bold"
            color="green.400"
          >
            RESEARKA
          </Box>
        </Link>
        
        <IconButton
          aria-label={navIsOpen ? "Close menu" : "Open menu"}
          icon={navIsOpen ? <FiX /> : <FiMenu />}
          variant="ghost"
          onClick={onNavToggle}
        />
      </Flex>
      
      <Collapse in={navIsOpen} animateOpacity>
        <VStack spacing={0} align="stretch" pb={4} px={2}>
          <MobileNavItem 
            href="/" 
            label="HOME" 
            isActive={activePageLower === 'home'} 
          />
          
          <MobileNavItem 
            href="/search" 
            label="SEARCH" 
            isActive={activePageLower === 'search'} 
          />
          
          <MobileNavItem 
            href={isLoggedIn ? "/submit" : "#"} 
            label="SUBMIT" 
            isActive={activePageLower === 'submit'} 
            onClick={!isLoggedIn ? () => onLoginClick('/submit') : undefined}
          />
          
          <MobileNavItem 
            href={isLoggedIn ? "/review" : "#"} 
            label="REVIEW" 
            isActive={activePageLower === 'review'} 
            onClick={!isLoggedIn ? () => onLoginClick('/review') : undefined}
          />
          
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
                  <Link href="/profile" passHref>
                    <Box
                      as="a"
                      py={2}
                      px={4}
                      width="100%"
                      textAlign="left"
                      display="block"
                      borderRadius="md"
                      _hover={{ bg: 'gray.100' }}
                    >
                      Profile
                    </Box>
                  </Link>
                  <Box
                    as="button"
                    py={2}
                    px={4}
                    width="100%"
                    textAlign="left"
                    display="block"
                    borderRadius="md"
                    onClick={handleLogout}
                    _hover={{ bg: 'gray.100' }}
                  >
                    Logout
                  </Box>
                </Box>
              </Collapse>
            </Box>
          ) : (
            <Button
              colorScheme="blue"
              width="100%"
              justifyContent="flex-start"
              onClick={() => onLoginClick()}
              mt={2}
              sx={{
                minHeight: '44px',
              }}
            >
              Login
            </Button>
          )}
          
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
    <Link href={href} passHref>
      <Button
        as="a"
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
    <Box>
      <Button
        variant="ghost"
        width="100%"
        justifyContent="space-between"
        py={3}
        px={4}
        onClick={onToggle}
        rightIcon={<FiChevronDown />}
        fontWeight="500"
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
            <Link key={index} href={item.href} passHref>
              <Box
                as="a"
                py={2}
                px={4}
                width="100%"
                textAlign="left"
                display="block"
                borderRadius="md"
                _hover={{ bg: 'gray.100' }}
              >
                {item.label}
              </Box>
            </Link>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default MobileNav;
