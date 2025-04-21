import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Spacer,
  Link as ChakraLink
} from '@chakra-ui/react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { createLogger, LogCategory } from '../utils/logger';
import NavLinks from './navbar/NavLinks';
import UserMenu from './navbar/UserMenu';
import AuthButtons from './navbar/AuthButtons';

// Create a logger instance for this component
const logger = createLogger('NavBar');

/**
 * Interface for NavBar component props
 */
interface NavBarProps {
  activePage?: string;
  isLoggedIn?: boolean;
  onLoginClick?: (redirectPath?: string) => void;
  onSignupClick?: (redirectPath?: string) => void;
}

/**
 * Interface for user profile data
 */
interface UserProfileData {
  id?: string;
  name?: string;
  email?: string;
  profileComplete?: boolean;
  role?: string;
  articleCount?: number;
  reviewCount?: number;
  reputation?: number;
  [key: string]: any;
}

/**
 * NavBar component
 * Main navigation component that handles authentication state and user profile
 */
function NavBar({ 
  activePage = 'home',
  isLoggedIn: propIsLoggedIn,
  onLoginClick,
  onSignupClick
}: NavBarProps) {
  const { 
    currentUser, 
    logout, 
    getUserProfile, 
    authIsInitialized, 
    isLoading
  } = useAuth();
  
  // Component state with proper typing
  const [isLoggedInState, setIsLoggedInState] = useState<boolean>(propIsLoggedIn || false);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Log initial render with context
  logger.debug('Initial render', { 
    context: { 
      propIsLoggedIn, 
      activePage, 
      currentUserExists: !!currentUser,
      isLoggedInState,
      authIsInitialized,
      isLoading
    },
    category: LogCategory.UI
  });

  // Track performance of authentication state updates
  useEffect(() => {
    logger.startPerformance('authStateUpdate');
    
    // Update login state based on props or context
    const isAuthenticated = propIsLoggedIn !== undefined 
      ? propIsLoggedIn 
      : !!currentUser;
    
    setIsLoggedInState(!!isAuthenticated);
    
    // If user is logged in, fetch profile data
    if (isAuthenticated && currentUser) {
      // In a real implementation, this would fetch from an API or database
      getUserProfile(currentUser.uid).then(profile => {
        if (profile && isMounted.current) {
          setUserProfile(profile);
          
          // Check if user is admin
          if (profile.role === 'Admin') {
            setIsAdmin(true);
          }
        }
      });
    } else {
      setUserProfile(null);
      setIsAdmin(false);
    }
    
    logger.endPerformance('authStateUpdate', {
      context: { 
        isAuthenticated,
        hasCurrentUser: !!currentUser
      }
    });
  }, [currentUser, propIsLoggedIn, authIsInitialized, getUserProfile]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle login click with logging
  const handleLoginClick = (redirectPath?: string) => {
    logger.userAction('clicked_login', { 
      context: { redirectPath },
      category: LogCategory.USER_ACTION
    });
    
    if (onLoginClick) {
      onLoginClick(redirectPath);
    }
  };

  // Handle signup click with logging
  const handleSignupClick = (redirectPath?: string) => {
    logger.userAction('clicked_signup', { 
      context: { redirectPath },
      category: LogCategory.USER_ACTION
    });
    
    if (onSignupClick) {
      onSignupClick(redirectPath);
    }
  };

  // Handle logout with proper error handling
  const handleLogout = async () => {
    try {
      logger.info('Starting logout process', {
        context: { userId: currentUser?.uid },
        category: LogCategory.AUTH
      });
      
      // Clear local state immediately before calling logout
      if (isMounted.current) {
        setIsLoggedInState(false);
        setUserProfile(null);
        setIsAdmin(false);
      }
      
      // Call Firebase logout
      await logout();
      
      logger.info('Logout successful', {
        category: LogCategory.AUTH
      });
      
      // Use client-side navigation instead of direct window.location
      // This avoids the hydration error by ensuring we don't mix server and client rendering
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      logger.error('Error during logout', {
        context: { 
          userId: currentUser?.uid,
          error: error instanceof Error ? error.message : String(error)
        },
        category: LogCategory.AUTH
      });
      
      // Force reset the auth state even if there was an error
      if (isMounted.current) {
        setIsLoggedInState(false);
        setUserProfile(null);
        setIsAdmin(false);
      }
      
      // Redirect anyway in case of error, but with a slight delay
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  };

  return (
    <Box borderBottom="1px" borderColor="gray.200" py={2}>
      <Container maxW="container.xl">
        <Flex align="center">
          {/* Logo and site name */}
          <Link href="/" passHref>
            <ChakraLink _hover={{ textDecoration: 'none' }}>
              <Flex align="center">
                <Heading as="h1" size="md" color="green.700">
                  RESEARKA
                </Heading>
              </Flex>
            </ChakraLink>
          </Link>
          
          <Spacer display={{ base: "none", md: "block" }} />
          
          {/* Navigation Links */}
          <NavLinks activePage={activePage} isLoggedIn={isLoggedInState} />
          
          <Spacer display={{ base: "none", md: "block" }} />
          
          {/* User menu or auth buttons */}
          {isLoggedInState ? (
            <UserMenu 
              userProfile={userProfile} 
              isAdmin={isAdmin} 
              onLogout={handleLogout} 
            />
          ) : (
            <AuthButtons 
              isLoggedIn={isLoggedInState} 
              onLoginClick={handleLoginClick} 
              onSignupClick={handleSignupClick}
              onLogout={handleLogout} 
            />
          )}
        </Flex>
      </Container>
    </Box>
  );
}

export default NavBar;
