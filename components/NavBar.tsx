import React from 'react';
import { 
  Box, 
  Flex, 
  Button, 
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Container,
  Heading,
  Link as ChakraLink,
  Spacer
} from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';

interface NavBarProps {
  activePage?: string;
  isLoggedIn?: boolean;
  onLoginClick?: (redirectPath?: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ 
  activePage = 'home',
  isLoggedIn = false,
  onLoginClick = () => {}
}) => {
  // Convert activePage to lowercase for comparison
  const activePageLower = activePage.toLowerCase();
  
  return (
    <Box borderBottom="1px" borderColor="gray.200" py={2}>
      <Container maxW="container.xl">
        <Flex 
          justify="space-between" 
          align="center"
          direction={{ base: "column", md: "row" }}
          gap={{ base: 4, md: 0 }}
        >
          <ChakraLink href="/" _hover={{ textDecoration: 'none' }}>
            <Heading as="h1" size="lg" color="green.400">RESEARKA</Heading>
          </ChakraLink>
          
          <Spacer display={{ base: "none", md: "block" }} />
          
          <Flex 
            align="center"
            justify={{ base: "center", md: "flex-end" }}
            width={{ base: "100%", md: "auto" }}
            wrap="nowrap"
          >
            <NavItem 
              href="/" 
              label="HOME" 
              isActive={activePageLower === 'home'} 
            />
            
            <NavItem 
              href="/search" 
              label="SEARCH" 
              isActive={activePageLower === 'search'} 
            />
            
            <NavItem 
              href={isLoggedIn ? "/submit" : "#"} 
              label="SUBMIT" 
              isActive={activePageLower === 'submit'} 
              onClick={!isLoggedIn ? () => onLoginClick('/submit') : undefined}
            />
            
            <NavItem 
              href={isLoggedIn ? "/review" : "#"} 
              label="REVIEW" 
              isActive={activePageLower === 'review'} 
              onClick={!isLoggedIn ? () => onLoginClick('/review') : undefined}
            />
            
            {isLoggedIn ? (
              <NavItem 
                href="/profile" 
                label="PROFILE" 
                isActive={activePageLower === 'profile'} 
              />
            ) : (
              <NavItem 
                href="#" 
                label="LOGIN" 
                isActive={true} 
                onClick={() => onLoginClick()}
              />
            )}
            
            <NavDropdown 
              label="INFO" 
              items={[
                { label: "ROLES", href: "/info/roles" },
                { label: "ABOUT", href: "/info/about" },
                { label: "TEAM", href: "/info/team" },
                { label: "WHITEPAPER", href: "/info/whitepaper" },
                { label: "CONTACT", href: "/info/contact" }
              ]}
            />
            
            <NavDropdown 
              label="GOVERNANCE" 
              items={[
                { label: "LEGAL", href: "/governance/legal" },
                { label: "PRIVACY POLICY", href: "/governance/privacy-policy" },
                { label: "COOKIE POLICY", href: "/governance/cookie-policy" },
                { label: "PRIVACY CENTER", href: "/governance/privacy-center" }
              ]}
            />
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

interface NavItemProps {
  href: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ 
  href, 
  label, 
  isActive = false,
  onClick
}) => {
  if (onClick) {
    return (
      <Button
        as="button"
        onClick={onClick}
        variant="ghost"
        size="sm"
        px={3}
        py={1}
        height="auto"
        fontWeight="500"
        color="gray.700"
        borderRadius="md"
        mx={1}
        _hover={{ bg: "gray.100" }}
        _active={{ bg: "gray.200" }}
        {...(isActive && { fontWeight: "600", color: "blue.500" })}
      >
        {label}
      </Button>
    );
  }
  
  return (
    <Button
      as="a"
      href={href}
      variant="ghost"
      size="sm"
      px={3}
      py={1}
      height="auto"
      fontWeight="500"
      color="gray.700"
      borderRadius="md"
      mx={1}
      _hover={{ bg: "gray.100" }}
      _active={{ bg: "gray.200" }}
      {...(isActive && { fontWeight: "600", color: "blue.500" })}
    >
      {label}
    </Button>
  );
};

interface NavDropdownProps {
  label: string;
  items: Array<{ label: string; href: string }>;
}

const NavDropdown: React.FC<NavDropdownProps> = ({ label, items }) => {
  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<FiChevronDown />}
        variant="ghost"
        size="sm"
        px={3}
        py={1}
        height="auto"
        fontWeight="500"
        color="gray.700"
        borderRadius="md"
        mx={1}
        _hover={{ bg: "gray.100" }}
        _active={{ bg: "gray.200" }}
      >
        {label}
      </MenuButton>
      <MenuList minWidth="180px" fontSize="sm">
        {items.map((item, index) => (
          <MenuItem key={index} as="a" href={item.href}>
            {item.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default NavBar;
