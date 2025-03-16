import React from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';

/**
 * Enhanced button component with improved touch interactions for mobile
 */
const TouchButton: React.FC<ButtonProps> = (props) => {
  return (
    <Button
      {...props}
      sx={{
        // Increase touch target size on mobile
        '@media (max-width: 768px)': {
          minHeight: '44px',
          minWidth: '44px',
          padding: props.size === 'sm' ? '8px 12px' : '12px 16px',
        },
        // Remove hover effects on touch devices
        '@media (hover: none)': {
          _hover: {
            bg: props.variant === 'ghost' ? 'transparent' : undefined,
          }
        },
        // Add active state for touch feedback
        _active: {
          transform: 'scale(0.98)',
          ...props._active
        },
        ...props.sx
      }}
    />
  );
};

export default TouchButton;
