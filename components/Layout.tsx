import React from 'react';
import Head from 'next/head';
import { Box, useColorModeValue } from '@chakra-ui/react';
import NavBar from './NavBar';
import MobileNav from './MobileNav';
import { useModal } from '../contexts/ModalContext';
import dynamic from 'next/dynamic';

// Dynamically import LoginModal with SSR disabled and no caching
const LoginModal = dynamic(() => import('./LoginModal'), {
  ssr: false,
  loading: () => null
});

// Dynamically import SignupModal with SSR disabled and no caching
const SignupModal = dynamic(() => import('./SignupModal'), {
  ssr: false,
  loading: () => null
});

interface LayoutProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  activePage?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  title = 'Researka', 
  description = 'Decentralized Research Platform', 
  children,
  activePage
}) => {
  const { 
    isLoginModalOpen, 
    openLoginModal, 
    closeLoginModal, 
    isSignupModalOpen, 
    openSignupModal, 
    closeSignupModal,
    redirectPath, 
    setRedirectPath 
  } = useModal();
  
  const bgColor = useColorModeValue('white', 'dark.bg');
  
  const handleLoginClick = (redirectPath?: string) => {
    if (redirectPath) {
      setRedirectPath(redirectPath);
    } else {
      setRedirectPath('/profile');
    }
    openLoginModal();
  };

  const handleSignupClick = () => {
    openSignupModal();
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Box minH="100vh" bg={bgColor}>
        <Box display={{ base: "none", md: "block" }}>
          <NavBar 
            activePage={activePage} 
            onLoginClick={handleLoginClick}
            onSignupClick={handleSignupClick}
          />
        </Box>
        <MobileNav 
          activePage={activePage} 
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
        />
        
        <Box as="main">
          {children}
        </Box>
        
        {/* Login Modal */}
        {isLoginModalOpen && (
          <LoginModal 
            isOpen={isLoginModalOpen} 
            onClose={closeLoginModal} 
            redirectPath={redirectPath} 
          />
        )}
        
        {/* Signup Modal */}
        {isSignupModalOpen && (
          <SignupModal 
            isOpen={isSignupModalOpen} 
            onClose={closeSignupModal} 
            redirectPath="/profile" 
          />
        )}
      </Box>
    </>
  );
};

export default Layout;
