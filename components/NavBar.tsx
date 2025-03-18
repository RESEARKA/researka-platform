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
  Spacer,
  Link as ChakraLink,
  useColorModeValue
} from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import Link from 'next/link';
import ColorModeToggle from './ColorModeToggle';

interface NavBarProps {
  activePage?: string;
  isLoggedIn?: boolean;
  onLoginClick?: (redirectPath?: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ 
  activePage = 'home',
  isLoggedIn: propIsLoggedIn = false,
  onLoginClick = () => {}
}) => {
  // Convert activePage to lowercase for comparison
  const activePageLower = activePage.toLowerCase();
  
  // Check if user is logged in from localStorage (client-side only)
  const [isLoggedIn, setIsLoggedIn] = React.useState(propIsLoggedIn);
  const [username, setUsername] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    // Check localStorage for login status (client-side only)
    if (typeof window !== 'undefined') {
      const storedLoginStatus = localStorage.getItem('isLoggedIn');
      if (storedLoginStatus === 'true') {
        setIsLoggedIn(true);
        
        // Try to get username
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
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
    <Box borderBottom="1px" borderColor="gray.200" py={2}>
      <Container maxW="container.xl">
        <Flex 
          justify="space-between" 
          align="center"
          direction={{ base: "column", md: "row" }}
          gap={{ base: 4, md: 0 }}
        >
          <Link href="/" passHref legacyBehavior>
            <ChakraLink _hover={{ textDecoration: 'none' }}>
              <Heading as="h1" size="lg" color="green.700">RESEARKA</Heading>
            </ChakraLink>
          </Link>
          
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
              href="/articles" 
              label="ARTICLES" 
              isActive={activePageLower === 'articles'} 
            />
            
            <NavDropdown 
              label="INFO" 
              items={[
                { label: "About", href: "/info/about" },
                { label: "Roles", href: "/info/roles" },
                { label: "Whitepaper", href: "/info/whitepaper" },
                { label: "Contact", href: "/info/contact" }
              ]}
            />
            
            <NavDropdown 
              label="GOVERNANCE" 
              items={[
                { label: "Privacy Center", href: "/governance/privacy-center" },
                { label: "Privacy Policy", href: "/governance/privacy-policy" },
                { label: "Cookie Policy", href: "/governance/cookie-policy" },
                { label: "Legal", href: "/governance/legal" }
              ]}
            />
            
            {isLoggedIn ? (
              <NavItem 
                href="/submit" 
                label="SUBMIT" 
                isActive={activePageLower === 'submit'} 
              />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                px={3}
                py={1}
                height="auto"
                fontWeight="500"
                color={useColorModeValue("gray.800", "gray.200")}
                borderRadius="md"
                mx={1}
                _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.200") }}
                _active={{ bg: useColorModeValue("gray.200", "whiteAlpha.300") }}
                onClick={() => onLoginClick('/submit')}
              >
                SUBMIT
              </Button>
            )}
            
            {isLoggedIn ? (
              <NavItem 
                href="/review" 
                label="REVIEW" 
                isActive={activePageLower === 'review'} 
              />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                px={3}
                py={1}
                height="auto"
                fontWeight="500"
                color={useColorModeValue("gray.800", "gray.200")}
                borderRadius="md"
                mx={1}
                _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.200") }}
                _active={{ bg: useColorModeValue("gray.200", "whiteAlpha.300") }}
                onClick={() => onLoginClick('/review')}
              >
                REVIEW
              </Button>
            )}
            
            <ColorModeToggle size="sm" />
            
            {isLoggedIn ? (
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
                  color={useColorModeValue("blue.700", "blue.300")}
                  borderRadius="md"
                  mx={1}
                  _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.200") }}
                  _active={{ bg: useColorModeValue("gray.200", "whiteAlpha.300") }}
                >
                  {username || 'User'}
                </MenuButton>
                <MenuList minWidth="180px" fontSize="sm">
                  <Link href="/profile" passHref legacyBehavior>
                    <MenuItem as={ChakraLink}>
                      Profile
                    </MenuItem>
                  </Link>
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                px={3}
                py={1}
                height="auto"
                fontWeight="500"
                color={useColorModeValue("gray.800", "gray.200")}
                borderRadius="md"
                mx={1}
                _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.200") }}
                _active={{ bg: useColorModeValue("gray.200", "whiteAlpha.300") }}
                onClick={() => onLoginClick()}
              >
                LOGIN
              </Button>
            )}
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
        color="gray.800"
        borderRadius="md"
        mx={1}
        _hover={{ bg: "gray.100" }}
        _active={{ bg: "gray.200" }}
        {...(isActive && { fontWeight: "600", color: "blue.700" })}
      >
        {label}
      </Button>
    );
  }
  
  return (
    <Link href={href} passHref legacyBehavior>
      <ChakraLink
        px={3}
        py={1}
        borderRadius="md"
        fontWeight={isActive ? "600" : "500"}
        color={isActive ? "blue.700" : "gray.800"}
        mx={1}
        _hover={{ textDecoration: 'none', bg: "gray.100" }}
        _active={{ bg: "gray.200" }}
        display="inline-block"
      >
        {label}
      </ChakraLink>
    </Link>
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
        color="gray.800"
        borderRadius="md"
        mx={1}
        _hover={{ bg: "gray.100" }}
        _active={{ bg: "gray.200" }}
      >
        {label}
      </MenuButton>
      <MenuList minWidth="180px" fontSize="sm">
        {items.map((item, index) => (
          <Link key={index} href={item.href} passHref legacyBehavior>
            <MenuItem as={ChakraLink}>
              {item.label}
            </MenuItem>
          </Link>
        ))}
      </MenuList>
    </Menu>
  );
};

export default NavBar;
