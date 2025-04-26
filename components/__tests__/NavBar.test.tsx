import React from 'react';
import { render, screen } from '@testing-library/react';
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
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  );
});

// Mock the NavLinks, UserMenu, and AuthButtons components
jest.mock('../navbar/NavLinks', () => {
  return function MockNavLinks() {
    return (
      <div data-testid="nav-links">
        <a href="/home">HOME</a>
        <a href="/articles">ARTICLES</a>
        <a href="/info">INFO</a>
      </div>
    );
  };
});

jest.mock('../navbar/UserMenu', () => {
  return function MockUserMenu() {
    return <div data-testid="user-menu">User Menu</div>;
  };
});

jest.mock('../navbar/AuthButtons', () => {
  return function MockAuthButtons() {
    return <div data-testid="auth-buttons">Auth Buttons</div>;
  };
});

// Create a custom render function that includes providers
const renderNavBar = () => {
  return render(<NavBar />);
};

describe('NavBar Component', () => {
  it('renders without crashing', () => {
    const { getByTestId } = renderNavBar();
    expect(getByTestId('nav-links')).toBeInTheDocument();
  });

  it('displays navigation links', () => {
    renderNavBar();
    // Use queryByText instead of getByText to avoid throwing errors if not found
    const homeLink = screen.queryByText('HOME');
    const articlesLink = screen.queryByText('ARTICLES');
    const infoLink = screen.queryByText('INFO');
    
    // Assert that the links exist
    expect(homeLink).toBeInTheDocument();
    expect(articlesLink).toBeInTheDocument();
    expect(infoLink).toBeInTheDocument();
  });
});
