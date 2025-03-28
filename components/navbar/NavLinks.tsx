import React from 'react';
import { Flex } from '@chakra-ui/react';
import NavItem from './NavItem';
import NavDropdown from './NavDropdown';
import { NavLinksProps } from './types';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger instance for this component
const logger = createLogger('NavLinks');

/**
 * NavLinks component
 * Renders all navigation links based on authentication state
 */
function NavLinks({ 
  activePage, 
  isLoggedIn 
}: NavLinksProps) {
  // Convert activePage to lowercase for comparison
  const activePageLower = activePage.toLowerCase();
  
  return (
    <Flex 
      align="center"
      justify={{ base: "center", md: "flex-start" }}
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
      
      {isLoggedIn && (
        <>
          <NavItem 
            href="/submit" 
            label="SUBMIT" 
            isActive={activePageLower === 'submit'} 
          />
          
          <NavItem 
            href="/review" 
            label="REVIEWS" 
            isActive={activePageLower === 'review'} 
          />
        </>
      )}
    </Flex>
  );
}

export default NavLinks;
