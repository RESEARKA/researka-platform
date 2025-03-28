import React from 'react';
import { Box, Link as ChakraLink } from '@chakra-ui/react';
import Link from 'next/link';
import { NavItemProps } from './types';

/**
 * NavItem component
 * Renders a navigation link with active state styling
 */
function NavItem({ 
  href, 
  label, 
  isActive = false,
  onClick
}: NavItemProps) {
  return (
    <Link href={href} passHref legacyBehavior>
      <ChakraLink
        px={3}
        py={1}
        rounded="md"
        fontWeight="500"
        color={isActive ? 'blue.500' : 'gray.600'}
        _hover={{
          textDecoration: 'none',
          bg: 'gray.100',
        }}
        onClick={onClick}
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mx={1}
      >
        {label}
        {isActive && (
          <Box
            position="absolute"
            bottom="-1px"
            left="0"
            right="0"
            height="2px"
            bg="blue.500"
            borderRadius="full"
          />
        )}
      </ChakraLink>
    </Link>
  );
}

export default NavItem;
