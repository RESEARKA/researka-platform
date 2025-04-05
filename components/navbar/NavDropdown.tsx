import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Link as ChakraLink
} from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import Link from 'next/link';
import { NavDropdownProps } from './types';

/**
 * NavDropdown component
 * Renders a dropdown menu with navigation links
 */
function NavDropdown({ label, items, isActive = false }: NavDropdownProps) {
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
        mx={1}
        color={isActive ? "blue.500" : "inherit"}
        borderBottom={isActive ? "2px solid" : "none"}
        borderColor="blue.500"
        borderRadius={0}
      >
        {label}
      </MenuButton>
      <MenuList>
        {items.map((item) => (
          <Link key={item.href} href={item.href} passHref legacyBehavior>
            <MenuItem as={ChakraLink} _hover={{ textDecoration: 'none' }}>
              {item.label}
            </MenuItem>
          </Link>
        ))}
      </MenuList>
    </Menu>
  );
}

export default NavDropdown;
