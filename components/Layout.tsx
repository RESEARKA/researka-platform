import React from 'react';
import Head from 'next/head';
import { Box, useColorModeValue } from '@chakra-ui/react';
import NavBar from './NavBar';
import MobileNav from './MobileNav';
import { useModal } from '../contexts/ModalContext';
import dynamic from 'next/dynamic';

// Dynamically import LoginModal with SSR disabled
const LoginModal = dynamic(() => import('./LoginModal'), {
  ssr: false,
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
  const { isOpen, onOpen, onClose, redirectPath, setRedirectPath } = useModal();
  const bgColor = useColorModeValue('white', 'dark.bg');
  
  const handleLoginClick = (redirectPath?: string) => {
    if (redirectPath) {
      setRedirectPath(redirectPath);
    } else {
      setRedirectPath('/profile');
    }
    onOpen();
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
        <NavBar activePage={activePage} onLoginClick={handleLoginClick} />
        <MobileNav activePage={activePage} onLoginClick={handleLoginClick} />
        
        <Box as="main">
          {children}
        </Box>
        
        {/* Login Modal */}
        <LoginModal isOpen={isOpen} onClose={onClose} redirectPath={redirectPath} />
      </Box>
    </>
  );
};

export default Layout;
