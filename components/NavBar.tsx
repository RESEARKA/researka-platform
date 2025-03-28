import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Spacer,
  Link as ChakraLink,
  useDisclosure
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
  isLoggedIn: propIsLoggedIn = false,
  onLoginClick = () => {}
}: NavBarProps) {
  // Use Firebase authentication
  const { 
    currentUser, 
    logout, 
    getUserProfile, 
    authIsInitialized, 
    isLoading, 
    persistentUsername 
  } = useAuth();
  
  // Component state with proper typing
  const [isLoggedIn, setIsLoggedIn] = useState(propIsLoggedIn);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Log initial render
  logger.debug('Initial render', {
    context: { 
      propIsLoggedIn, 
      activePage,
      currentUserExists: !!currentUser,
      persistentUsername,
      isLoggedInState: isLoggedIn,
      authIsInitialized,
      isLoading
    },
    category: LogCategory.UI
  });
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Authentication effect
  useEffect(() => {
    logger.debug('Auth state changed', {
      context: { 
        currentUser: currentUser ? {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          isAnonymous: currentUser.isAnonymous
        } : 'null',
        authIsInitialized,
        isLoading,
        currentUsername: persistentUsername
      },
      category: LogCategory.AUTH
    });
    
    // Check if user is logged in with Firebase
    if (currentUser && authIsInitialized && !isLoading) {
      logger.info('User is authenticated', {
        context: { userId: currentUser.uid },
        category: LogCategory.AUTH
      });
      
      if (isMounted.current) {
        setIsLoggedIn(true);
      }
      
      // Get user profile from Firestore only if we haven't already fetched it
      if (!userProfile && isMounted.current) {
        const getUserData = async () => {
          try {
            logger.debug('Fetching user profile', {
              context: { userId: currentUser.uid },
              category: LogCategory.DATA
            });
            
            const profile = await getUserProfile(currentUser.uid);
            
            if (profile && isMounted.current) {
              logger.debug('User profile fetched successfully', {
                context: { 
                  userId: currentUser.uid,
                  hasName: !!profile.name,
                  isComplete: profile.profileComplete
                },
                category: LogCategory.DATA
              });
              
              setUserProfile(profile);
              
              // Check if user is admin
              if (profile.role === 'Admin' && isMounted.current) {
                logger.debug('User has admin role', {
                  context: { userId: currentUser.uid },
                  category: LogCategory.AUTH
                });
                
                setIsAdmin(true);
              }
            }
          } catch (error) {
            logger.error('Error fetching user profile', {
              context: { 
                userId: currentUser.uid,
                error: error instanceof Error ? error.message : String(error)
              },
              category: LogCategory.DATA
            });
          }
        };
        
        getUserData();
      }
    } else {
      logger.debug('User is not authenticated or auth not initialized', {
        context: { 
          authIsInitialized, 
          isLoading 
        },
        category: LogCategory.AUTH
      });
      
      if (isMounted.current) {
        setIsLoggedIn(false);
        
        if (userProfile) {
          setUserProfile(null);
        }
        
        setIsAdmin(false);
      }
    }
  }, [currentUser, getUserProfile, authIsInitialized, isLoading, persistentUsername, userProfile]);
  
  // Handle logout with proper error handling
  const handleLogout = async () => {
    try {
      logger.info('Starting logout process', {
        context: { userId: currentUser?.uid },
        category: LogCategory.AUTH
      });
      
      await logout();
      
      // Clear local state immediately
      if (isMounted.current) {
        setIsLoggedIn(false);
        setUserProfile(null);
        setIsAdmin(false);
      }
      
      logger.info('Logout successful', {
        category: LogCategory.AUTH
      });
      
      // Use Next.js router instead of direct window.location for better reliability
      window.location.href = '/';
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
        setIsLoggedIn(false);
        setUserProfile(null);
        setIsAdmin(false);
      }
      
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
          {/* Logo */}
          <Link href="/" passHref legacyBehavior>
            <ChakraLink _hover={{ textDecoration: 'none' }}>
              <Heading as="h1" size="lg" color="green.700">RESEARKA</Heading>
            </ChakraLink>
          </Link>
          
          <Spacer display={{ base: "none", md: "block" }} />
          
          {/* Navigation Links */}
          <NavLinks activePage={activePage} isLoggedIn={isLoggedIn} />
          
          <Spacer display={{ base: "none", md: "block" }} />
          
          {/* Authentication */}
          {isLoggedIn ? (
            <UserMenu 
              userProfile={userProfile} 
              isAdmin={isAdmin} 
              onLogout={handleLogout} 
            />
          ) : (
            <AuthButtons 
              isLoggedIn={isLoggedIn} 
              onLoginClick={onLoginClick} 
              onLogout={handleLogout} 
            />
          )}
        </Flex>
      </Container>
    </Box>
  );
}

export default NavBar;
