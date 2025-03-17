import React, { useState } from 'react';
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

interface MobileNavProps {
  activePage?: string;
  isLoggedIn?: boolean;
  onLoginClick?: (redirectPath?: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({
  activePage = 'home',
  isLoggedIn = false,
  onLoginClick = () => {}
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const activePageLower = activePage.toLowerCase();
  
  // Background colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box 
      display={{ base: 'block', md: 'none' }}
      borderBottom="1px"
      borderColor={borderColor}
      py={2}
    >
      <Flex justify="space-between" align="center" px={4}>
        <Box 
          as="button" 
          onClick={() => window.location.href = "/"} 
          _hover={{ textDecoration: 'none' }}
        >
          <Box fontWeight="bold" fontSize="xl" color="green.400">RESEARKA</Box>
        </Box>
        
        <IconButton
          aria-label="Toggle Navigation"
          icon={isOpen ? <FiX /> : <FiMenu />}
          variant="ghost"
          onClick={onToggle}
          size="lg"
          _hover={{ bg: 'gray.100' }}
        />
      </Flex>
      
      <Collapse in={isOpen} animateOpacity>
        <VStack
          spacing={4}
          p={4}
          align="stretch"
          bg={bgColor}
          borderBottomRadius="md"
          boxShadow={isOpen ? "sm" : "none"}
          mt={2}
        >
          {/* Main Nav Items */}
          <MobileNavItem 
            href="/" 
            label="HOME" 
            isActive={activePageLower === 'home'} 
          />
          
          {/* SEARCH functionality is not yet implemented */}
          <Button
            variant="ghost"
            justifyContent="flex-start"
            width="100%"
            height="auto"
            py={3}
            px={4}
            borderRadius="md"
            fontWeight="500"
            color="gray.500" // Lighter color to indicate it's disabled
            cursor="not-allowed" // Change cursor to indicate it's not clickable
            _hover={{ bg: "transparent" }} // Disable hover effect
            sx={{
              // Increase touch target size
              minHeight: '44px',
            }}
          >
            SEARCH
          </Button>
          
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
            <MobileNavItem 
              href="/profile" 
              label="PROFILE" 
              isActive={activePageLower === 'profile'} 
            />
          ) : (
            <MobileNavItem 
              href="#" 
              label="LOGIN" 
              isActive={false} 
              onClick={() => onLoginClick()}
            />
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
    <Button
      as="button"
      onClick={() => window.location.href = href}
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
            <Box
              key={index}
              as="button"
              onClick={() => window.location.href = item.href}
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
              {item.label}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default MobileNav;
