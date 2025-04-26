import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

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

// Explicitly mock the modules
jest.mock('@chakra-ui/react');
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

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  })),
}));

jest.mock('next/link', () => {
  const React = require('react');
  return React.forwardRef(({ children, href, ...rest }: any, ref: any) => (
    <a href={href} ref={ref} data-testid="next-link" {...rest}>
      {children}
    </a>
  ));
});

jest.mock('../navbar/NavLinks', () => {
  const React = require('react');
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

jest.mock('../navbar/UserMenu', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => <div data-testid="user-menu">User Menu</div>,
  };
});

jest.mock('../navbar/AuthButtons', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => <div data-testid="auth-buttons">Auth Buttons</div>,
  };
});

// Import the component after setting up mocks
import NavBar from '../NavBar';

describe('NavBar Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  it('renders without crashing', () => {
    const { container } = render(<NavBar />);
    
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
