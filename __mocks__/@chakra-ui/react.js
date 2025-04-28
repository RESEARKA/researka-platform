// Mock implementation of Chakra UI components for testing
const React = require('react');

// Helper function to create elements with data-testid
const mk = (element, id) => 
  React.forwardRef(({ children, ...rest }, ref) => 
    React.createElement(element, { 
      ...rest, 
      'data-testid': id,
      ref 
    }, children)
  );

// Export all components and hooks
module.exports = {
  __esModule: true,
  // Components
  Box: mk('div', 'chakra-box'),
  Container: mk('div', 'chakra-container'),
  Flex: mk('div', 'chakra-flex'),
  Stack: mk('div', 'chakra-stack'),
  HStack: mk('div', 'chakra-hstack'),
  VStack: mk('div', 'chakra-vstack'),
  Heading: mk('h1', 'chakra-heading'),
  Text: mk('p', 'chakra-text'),
  Image: mk('img', 'chakra-image'),
  Spacer: mk('div', 'chakra-spacer'),
  Divider: mk('hr', 'chakra-divider'),
  Link: mk('a', 'chakra-link'),
  Skeleton: mk('div', 'chakra-skeleton'),
  Spinner: mk('div', 'chakra-spinner'),
  
  // Hooks
  useColorMode: jest.fn(() => ({
    colorMode: 'light',
    toggleColorMode: jest.fn(),
  })),
  useColorModeValue: jest.fn((light) => light),
  useDisclosure: jest.fn(() => ({
    isOpen: false,
    onOpen: jest.fn(),
    onClose: jest.fn(),
    onToggle: jest.fn(),
  })),
  useBreakpointValue: jest.fn((values) => {
    // Return the base value or the first value
    return values.base || Object.values(values)[0];
  }),
  
  // Add any other exports that might be needed
  ChakraProvider: ({ children }) => React.createElement(React.Fragment, null, children),
};
