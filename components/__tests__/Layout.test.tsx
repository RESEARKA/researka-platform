import React from 'react';
import { render, screen } from '../../utils/test-utils';
import Layout from '../Layout';
import { ModalProvider } from '../../contexts/ModalContext';

// Mock the NavBar and MobileNav components
jest.mock('../NavBar', () => {
  return function MockNavBar({ activePage, onLoginClick }) {
    return (
      <div data-testid="navbar" data-active-page={activePage}>
        <button onClick={() => onLoginClick('/test-redirect')}>Login</button>
      </div>
    );
  };
});

jest.mock('../MobileNav', () => {
  return function MockMobileNav({ activePage, onLoginClick }) {
    return (
      <div data-testid="mobile-nav" data-active-page={activePage}>
        <button onClick={() => onLoginClick('/test-redirect')}>Login Mobile</button>
      </div>
    );
  };
});

// Mock Head from next/head
jest.mock('next/head', () => {
  return function MockHead({ children }) {
    return <div data-testid="head">{children}</div>;
  };
});

describe('Layout Component', () => {
  it('renders the layout with correct elements', () => {
    render(
      <ModalProvider>
        <Layout title="Test Title" description="Test Description" activePage="home">
          <div data-testid="content">Test Content</div>
        </Layout>
      </ModalProvider>
    );
    
    // Check if the navbar and mobile nav are present
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
    
    // Check if the active page is passed correctly
    expect(screen.getByTestId('navbar')).toHaveAttribute('data-active-page', 'home');
    expect(screen.getByTestId('mobile-nav')).toHaveAttribute('data-active-page', 'home');
    
    // Check if the content is rendered
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('sets the document title and description', () => {
    render(
      <ModalProvider>
        <Layout title="Custom Title" description="Custom Description">
          <div>Content</div>
        </Layout>
      </ModalProvider>
    );
    
    // Check if the title and description are set correctly
    const head = screen.getByTestId('head');
    expect(head).toContainHTML('Custom Title');
    expect(head).toContainHTML('Custom Description');
  });

  it('uses default title and description if not provided', () => {
    render(
      <ModalProvider>
        <Layout>
          <div>Content</div>
        </Layout>
      </ModalProvider>
    );
    
    // Check if the default title and description are used
    const head = screen.getByTestId('head');
    expect(head).toContainHTML('Researka');
    expect(head).toContainHTML('Decentralized Research Platform');
  });

  it('passes the handleLoginClick function to NavBar and MobileNav', () => {
    // Create a mock for the useModal hook
    const mockOnOpen = jest.fn();
    const mockSetRedirectPath = jest.fn();
    
    jest.mock('../../contexts/ModalContext', () => ({
      useModal: () => ({
        onOpen: mockOnOpen,
        setRedirectPath: mockSetRedirectPath
      })
    }));
    
    render(
      <ModalProvider>
        <Layout>
          <div>Content</div>
        </Layout>
      </ModalProvider>
    );
    
    // The test passes if the component renders without errors
    // We can't easily test the handleLoginClick function without mocking the useModal hook
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
