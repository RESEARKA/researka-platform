import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavBar from '../NavBar';

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Chakra UI components
jest.mock('@chakra-ui/react', () => {
  const React = require('react');
  return {
    Box: ({ children, ...props }: any) => <div data-testid="chakra-box" {...props}>{children}</div>,
    Container: ({ children, ...props }: any) => <div data-testid="chakra-container" {...props}>{children}</div>,
    Flex: ({ children, ...props }: any) => <div data-testid="chakra-flex" {...props}>{children}</div>,
    Heading: ({ children, ...props }: any) => <h1 data-testid="chakra-heading" {...props}>{children}</h1>,
    Spacer: () => <div data-testid="chakra-spacer" />,
    Link: ({ children, ...props }: any) => <a data-testid="chakra-link" {...props}>{children}</a>,
    useDisclosure: jest.fn(() => ({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    })),
  };
});

// Mock the logger
jest.mock('../../utils/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  })),
  LogCategory: {
    USER: 'user',
    SYSTEM: 'system',
  },
}));

// Mock the AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  })),
}));

// Mock the next/link component
jest.mock('next/link', () => {
  const React = require('react');
  return React.forwardRef(({ children, href, ...rest }: any, ref: any) => (
    <a href={href} ref={ref} data-testid="next-link" {...rest}>
      {children}
    </a>
  ));
});

// Mock the NavLinks component - make sure to match the exact import structure
jest.mock('../navbar/NavLinks', () => {
  const React = require('react');
  // Important: use default export to match how it's imported in NavBar.tsx
  return {
    __esModule: true,
    default: () => (
      <div data-testid="nav-links">
        <a href="/home">HOME</a>
        <a href="/articles">ARTICLES</a>
        <a href="/info">INFO</a>
      </div>
    ),
  };
});

// Mock the UserMenu component
jest.mock('../navbar/UserMenu', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => <div data-testid="user-menu">User Menu</div>,
  };
});

// Mock the AuthButtons component
jest.mock('../navbar/AuthButtons', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => <div data-testid="auth-buttons">Auth Buttons</div>,
  };
});

describe('NavBar Component', () => {
  it('renders without crashing', () => {
    const { container, debug } = render(<NavBar />);
    // Debug the rendered output to see what's actually being rendered
    debug();
    
    // Check if the component rendered the container
    expect(container.querySelector('[data-testid="chakra-container"]')).toBeInTheDocument();
    
    // The NavLinks component should be rendered
    const navLinks = container.querySelector('[data-testid="nav-links"]');
    expect(navLinks).toBeInTheDocument();
  });

  it('displays navigation links', () => {
    const { container } = render(<NavBar />);
    
    // Find the links within the NavLinks component
    const homeLink = container.querySelector('a[href="/home"]');
    const articlesLink = container.querySelector('a[href="/articles"]');
    const infoLink = container.querySelector('a[href="/info"]');
    
    // Assert that the links exist
    expect(homeLink).toBeInTheDocument();
    expect(articlesLink).toBeInTheDocument();
    expect(infoLink).toBeInTheDocument();
  });
});
