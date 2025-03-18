import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Color mode config
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

// Define colors for light and dark mode
const colors = {
  brand: {
    50: '#e6f7e6',
    100: '#c2e8c2',
    200: '#9dd99d',
    300: '#78ca78',
    400: '#53bb53',
    500: '#3fa63f', // Primary green
    600: '#348a34',
    700: '#296e29',
    800: '#1f521f',
    900: '#143614',
  },
  // Dark mode specific overrides
  dark: {
    bg: '#121212',
    card: '#1e1e1e',
    border: '#333333',
    text: {
      primary: '#ffffff',
      secondary: '#a0aec0',
    },
  },
  // Light mode specific overrides
  light: {
    bg: '#ffffff',
    card: '#f7f7f7',
    border: '#e2e8f0',
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
  },
};

// Define semantic tokens for color mode
const semanticTokens = {
  colors: {
    bg: {
      default: 'light.bg',
      _dark: 'dark.bg',
    },
    cardBg: {
      default: 'light.card',
      _dark: 'dark.card',
    },
    border: {
      default: 'light.border',
      _dark: 'dark.border',
    },
    text: {
      primary: {
        default: 'light.text.primary',
        _dark: 'dark.text.primary',
      },
      secondary: {
        default: 'light.text.secondary',
        _dark: 'dark.text.secondary',
      },
    },
  },
};

// Define styles for specific components
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
    },
    variants: {
      solid: (props: { colorMode: string }) => ({
        bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.500',
        color: 'white',
        _hover: {
          bg: props.colorMode === 'dark' ? 'brand.700' : 'brand.600',
        },
      }),
      outline: (props: { colorMode: string }) => ({
        border: '1px solid',
        borderColor: props.colorMode === 'dark' ? 'brand.600' : 'brand.500',
        color: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
      }),
      ghost: (props: { colorMode: string }) => ({
        color: props.colorMode === 'dark' ? 'gray.300' : 'gray.800',
        _hover: {
          bg: props.colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.100',
        },
      }),
    },
  },
  Card: {
    baseStyle: (props: { colorMode: string }) => ({
      bg: props.colorMode === 'dark' ? 'dark.card' : 'white',
      boxShadow: props.colorMode === 'dark' ? 'none' : 'md',
      borderWidth: props.colorMode === 'dark' ? '1px' : '0',
      borderColor: props.colorMode === 'dark' ? 'dark.border' : 'transparent',
    }),
  },
  Link: {
    baseStyle: (props: { colorMode: string }) => ({
      color: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
      _hover: {
        textDecoration: 'none',
        color: props.colorMode === 'dark' ? 'brand.300' : 'brand.600',
      },
    }),
  },
};

// Create the extended theme
const theme = extendTheme({
  config,
  colors,
  semanticTokens,
  components,
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'dark.bg' : 'light.bg',
        color: props.colorMode === 'dark' ? 'dark.text.primary' : 'light.text.primary',
      },
    }),
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
});

export default theme;
