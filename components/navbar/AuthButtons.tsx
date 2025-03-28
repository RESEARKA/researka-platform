import React from 'react';
import { Button, HStack } from '@chakra-ui/react';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';
import { AuthButtonsProps } from './types';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger instance for this component
const logger = createLogger('AuthButtons');

/**
 * AuthButtons component
 * Renders login and signup buttons for unauthenticated users
 */
function AuthButtons({ 
  isLoggedIn, 
  onLoginClick, 
  onLogout 
}: AuthButtonsProps) {
  if (isLoggedIn) {
    return (
      <Button
        variant="outline"
        colorScheme="red"
        size="sm"
        leftIcon={<FiLogIn />}
        onClick={() => {
          logger.info('User clicked logout button', {
            category: LogCategory.UI
          });
          onLogout();
        }}
      >
        Logout
      </Button>
    );
  }

  return (
    <HStack spacing={2}>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<FiLogIn />}
        onClick={() => {
          logger.info('User clicked login button', {
            category: LogCategory.UI
          });
          onLoginClick();
        }}
      >
        Login
      </Button>
      
      <Button
        variant="solid"
        colorScheme="blue"
        size="sm"
        leftIcon={<FiUserPlus />}
        onClick={() => {
          logger.info('User clicked signup button', {
            category: LogCategory.UI
          });
          onLoginClick('/signup');
        }}
      >
        Sign Up
      </Button>
    </HStack>
  );
}

export default AuthButtons;
