import React from 'react';
import Head from 'next/head';
import { Box } from '@chakra-ui/react';
import NavBar from './NavBar';
import MobileNav from './MobileNav';
import { useModal } from '../contexts/ModalContext';

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
  const { onOpen, setRedirectPath } = useModal();
  
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
      
      <Box minH="100vh" bg="white">
        <NavBar activePage={activePage} onLoginClick={handleLoginClick} />
        <MobileNav activePage={activePage} onLoginClick={handleLoginClick} />
        
        <Box as="main">
          {children}
        </Box>
      </Box>
    </>
  );
};

export default Layout;
