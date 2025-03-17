import React from 'react';
import Head from 'next/head';
import { Box } from '@chakra-ui/react';
import NavBar from './NavBar';
import MobileNav from './MobileNav';

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
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Box minH="100vh" bg="white">
        <NavBar activePage={activePage} />
        <MobileNav activePage={activePage} />
        
        <Box as="main">
          {children}
        </Box>
      </Box>
    </>
  );
};

export default Layout;
