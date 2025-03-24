import React, { useEffect, useState } from 'react';
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
  Link as ChakraLink
} from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

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
  
  // Use Firebase authentication
  const { currentUser, logout, getUserProfile, authIsInitialized, isLoading, persistentUsername, setPersistentUsername } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(propIsLoggedIn);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Debug logging for initial render
  console.log('NavBar: Initial render with props:', { 
    propIsLoggedIn, 
    activePage,
    currentUserExists: !!currentUser,
    persistentUsername,
    isLoggedInState: isLoggedIn,
    authIsInitialized,
    isLoading
  });
  
  useEffect(() => {
    // Debug logging for useEffect
    console.log('NavBar: useEffect triggered with:', { 
      currentUser: currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        isAnonymous: currentUser.isAnonymous
      } : 'null',
      authIsInitialized,
      isLoading,
      currentUsername: persistentUsername
    });
    
    // Check if user is logged in with Firebase
    if (currentUser && authIsInitialized && !isLoading) {
      console.log('NavBar: User is logged in, setting isLoggedIn to true');
      setIsLoggedIn(true);
      
      // Get user profile from Firestore only if we haven't already fetched it
      if (!userProfile) {
        const getUserData = async () => {
          try {
            console.log('NavBar: Fetching user profile...');
            const profile = await getUserProfile();
            console.log('NavBar: Got user profile:', profile);
            
            if (profile) {
              setUserProfile(profile);
              
              // Check if user is admin
              if (profile.role === 'Admin') {
                console.log('NavBar: User is admin');
                setIsAdmin(true);
              }
            }
          } catch (error) {
            console.error('NavBar: Error getting user profile:', error);
          }
        };
        
        getUserData();
      }
    } else {
      console.log('NavBar: User is not logged in or auth not initialized, setting isLoggedIn to false');
      setIsLoggedIn(false);
      
      if (userProfile) {
        setUserProfile(null);
      }
      
      setIsAdmin(false);
    }
  }, [currentUser, getUserProfile, authIsInitialized, isLoading, persistentUsername, userProfile]);
  
  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setUserProfile(null);
      setIsAdmin(false);
      
      // Add a small delay to ensure Firebase operations complete
      // This helps prevent the blank screen issue after logout
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('NavBar: Error during logout:', error);
      // Redirect anyway in case of error
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
                color="gray.800"
                borderRadius="md"
                mx={1}
                _hover={{ bg: "gray.100" }}
                _active={{ bg: "gray.200" }}
                onClick={() => {
                  // Use the onLoginClick function to set the redirect path in the ModalContext
                  onLoginClick('/submit');
                }}
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
                color="gray.800"
                borderRadius="md"
                mx={1}
                _hover={{ bg: "gray.100" }}
                _active={{ bg: "gray.200" }}
                onClick={() => {
                  // Use the onLoginClick function to set the redirect path in the ModalContext
                  onLoginClick('/review');
                }}
              >
                REVIEW
              </Button>
            )}
            
            {isLoggedIn && isAdmin ? (
              <NavItem 
                href="/admin" 
                label="ADMIN" 
                isActive={activePageLower === 'admin'} 
              />
            ) : null}
            
            {isLoggedIn ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<FiChevronDown />}
                  variant="solid"
                  colorScheme="blue"
                  size="sm"
                  minW="120px"
                  px={3}
                  py={1}
                  height="auto"
                  fontWeight="bold"
                  color="white"
                  borderRadius="md"
                  mx={1}
                  _hover={{ bg: "blue.600" }}
                  _active={{ bg: "blue.700" }}
                  data-testid="user-menu-button"
                >
                  {persistentUsername || 'User'}
                </MenuButton>
                <MenuList minWidth="180px" fontSize="sm" bg="white" borderColor="gray.200">
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
                color="gray.800"
                borderRadius="md"
                mx={1}
                _hover={{ bg: "gray.100" }}
                _active={{ bg: "gray.200" }}
                onClick={() => {
                  // Use the onLoginClick function to set the redirect path in the ModalContext
                  onLoginClick('/profile');
                }}
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
      <MenuList minWidth="180px" fontSize="sm" bg="white" borderColor="gray.200">
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
