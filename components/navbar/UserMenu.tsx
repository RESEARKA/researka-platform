import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  Avatar,
  Flex,
  Divider,
  Link as ChakraLink
} from '@chakra-ui/react';
import { FiChevronDown, FiUser, FiSettings, FiLogOut, FiShield } from 'react-icons/fi';
import Link from 'next/link';
import { UserMenuProps } from './types';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger instance for this component
const logger = createLogger('UserMenu');

/**
 * UserMenu component
 * Renders a dropdown menu for authenticated users
 */
function UserMenu({ 
  userProfile, 
  isAdmin, 
  onLogout 
}: UserMenuProps) {
  const handleLogout = async () => {
    try {
      logger.info('User initiated logout', {
        context: { userId: userProfile?.id },
        category: LogCategory.AUTH
      });
      
      await onLogout();
    } catch (error) {
      logger.error('Error during logout', {
        error,
        context: { userId: userProfile?.id },
        category: LogCategory.AUTH
      });
    }
  };

  const displayName = userProfile?.name || 'User';
  
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
      >
        <Flex align="center">
          <Avatar size="xs" name={displayName} mr={2} />
          <Text>{displayName}</Text>
        </Flex>
      </MenuButton>
      <MenuList>
        <Link href="/profile" passHref legacyBehavior>
          <MenuItem as={ChakraLink} icon={<FiUser />} _hover={{ textDecoration: 'none' }}>
            Profile
          </MenuItem>
        </Link>
        
        <Link href="/settings" passHref legacyBehavior>
          <MenuItem as={ChakraLink} icon={<FiSettings />} _hover={{ textDecoration: 'none' }}>
            Settings
          </MenuItem>
        </Link>
        
        {isAdmin && (
          <>
            <Divider />
            <Link href="/admin" passHref legacyBehavior>
              <MenuItem as={ChakraLink} icon={<FiShield />} _hover={{ textDecoration: 'none' }}>
                Admin Panel
              </MenuItem>
            </Link>
          </>
        )}
        
        <Divider />
        
        <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

export default UserMenu;
