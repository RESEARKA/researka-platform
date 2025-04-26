// Mock implementation of Chakra UI components for testing
const React = require('react');

// Create simple mock components that render their children without Emotion dependencies
const Box = ({ children, ...props }) => React.createElement('div', props, children);
const Flex = ({ children, ...props }) => React.createElement('div', props, children);
const Text = ({ children, ...props }) => React.createElement('span', props, children);
const Image = ({ src, alt, ...props }) => React.createElement('img', { src, alt, ...props });
const Button = ({ children, ...props }) => React.createElement('button', props, children);
const Link = ({ children, ...props }) => React.createElement('a', props, children);
const Heading = ({ children, ...props }) => React.createElement('h2', props, children);
const Stack = ({ children, ...props }) => React.createElement('div', props, children);
const HStack = ({ children, ...props }) => React.createElement('div', props, children);
const VStack = ({ children, ...props }) => React.createElement('div', props, children);
const Center = ({ children, ...props }) => React.createElement('div', props, children);
const Container = ({ children, ...props }) => React.createElement('div', props, children);
const Spinner = (props) => React.createElement('div', { ...props, 'data-testid': 'spinner' });

// Mock the ChakraProvider to simply render its children
const ChakraProvider = ({ children }) => React.createElement(React.Fragment, null, children);

// Export all the mocked components
module.exports = {
  Box,
  Flex,
  Text,
  Image,
  Button,
  Link,
  Heading,
  Stack,
  HStack,
  VStack,
  Center,
  Container,
  Spinner,
  ChakraProvider,
  useDisclosure: () => ({ isOpen: false, onOpen: jest.fn(), onClose: jest.fn() }),
  useToast: () => jest.fn(),
  useBreakpointValue: () => null,
  useColorMode: () => ({ colorMode: 'light', toggleColorMode: jest.fn() }),
  useColorModeValue: (light, dark) => light,
};
