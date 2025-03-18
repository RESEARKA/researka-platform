import React from 'react';
import { IconButton, useColorMode, useColorModeValue, Tooltip } from '@chakra-ui/react';
import { FiSun, FiMoon } from 'react-icons/fi';

interface ColorModeToggleProps {
  size?: string;
}

const ColorModeToggle: React.FC<ColorModeToggleProps> = ({ size = 'md' }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const SwitchIcon = useColorModeValue(FiMoon, FiSun);
  const tooltipLabel = useColorModeValue('Switch to dark mode', 'Switch to light mode');
  
  return (
    <Tooltip label={tooltipLabel} placement="bottom" hasArrow>
      <IconButton
        aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
        variant="ghost"
        color={useColorModeValue('gray.800', 'white')}
        icon={<SwitchIcon />}
        onClick={toggleColorMode}
        size={size}
        _hover={{
          bg: useColorModeValue('gray.100', 'whiteAlpha.200'),
        }}
      />
    </Tooltip>
  );
};

export default ColorModeToggle;
