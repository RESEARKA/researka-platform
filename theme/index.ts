import { extendTheme, ThemeConfig } from '@chakra-ui/react';

// Color mode config
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// RESEARKA brand colors
const colors = {
  brand: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50',
    600: '#43a047',
    700: '#388e3c', // Primary RESEARKA brand color
    800: '#2e7d32',
    900: '#1b5e20',
  },
  // Ensure we keep Chakra's default colors
  ...extendTheme().colors,
};

// Typography
const fonts = {
  heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
};

// Component style overrides
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
    },
    variants: {
      primary: {
        bg: 'brand.700',
        color: 'white',
        _hover: {
          bg: 'brand.800',
        },
        _active: {
          bg: 'brand.900',
        },
      },
      secondary: {
        bg: 'gray.100',
        color: 'gray.800',
        _hover: {
          bg: 'gray.200',
        },
        _active: {
          bg: 'gray.300',
        },
      },
    },
    defaultProps: {
      variant: 'primary',
    },
  },
  Link: {
    baseStyle: {
      color: 'brand.700',
      _hover: {
        textDecoration: 'underline',
      },
    },
  },
  Heading: {
    baseStyle: {
      color: 'gray.800',
      fontWeight: 'bold',
    },
  },
};

// Create the theme
const theme = extendTheme({
  config,
  colors,
  fonts,
  components,
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'gray.800',
      },
    },
  },
});

export default theme;
