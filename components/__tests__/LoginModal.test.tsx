import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import LoginModal from '../LoginModal';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location
const mockLocation = {
  href: '',
};

Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    get href() {
      return mockLocation.href;
    },
    set href(value) {
      mockLocation.href = value;
    }
  },
  writable: false,
  configurable: true
});

describe('LoginModal Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    
    // Reset window.location.href
    mockLocation.href = '';
  });

  it('renders the login modal with correct elements', () => {
    render(<LoginModal isOpen={true} onClose={() => {}} />);
    
    // Check if the modal title is present
    expect(screen.getByText('Login to Researka')).toBeInTheDocument();
    
    // Check if the wallet login button is present
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    
    // Check if the email form fields are present
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    
    // Check if the email login button is present
    expect(screen.getByText('Login with Email')).toBeInTheDocument();
  });

  it('handles wallet login correctly', async () => {
    const onCloseMock = jest.fn();
    
    render(<LoginModal isOpen={true} onClose={onCloseMock} redirectPath="/dashboard" />);
    
    // Click the wallet login button
    fireEvent.click(screen.getByText('Connect Wallet'));
    
    // Wait for the simulated login to complete
    await waitFor(() => {
      // Check that localStorage was updated correctly
      expect(localStorageMock.setItem).toHaveBeenCalledWith('isLoggedIn', 'true');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('loginMethod', 'wallet');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userProfile', expect.any(String));
      
      // Check that onClose was called
      expect(onCloseMock).toHaveBeenCalled();
      
      // Check that the page was redirected to the specified path
      expect(mockLocation.href).toBe('/dashboard');
    });
  });

  it('handles email login correctly', async () => {
    const onCloseMock = jest.fn();
    
    render(<LoginModal isOpen={true} onClose={onCloseMock} redirectPath="/profile" />);
    
    // Fill in the email and password fields
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.submit(screen.getByText('Login with Email').closest('form')!);
    
    // Wait for the simulated login to complete
    await waitFor(() => {
      // Check that localStorage was updated correctly
      expect(localStorageMock.setItem).toHaveBeenCalledWith('isLoggedIn', 'true');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('loginMethod', 'email');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userProfile', expect.any(String));
      
      // Check that onClose was called
      expect(onCloseMock).toHaveBeenCalled();
      
      // Check that the page was redirected to the specified path
      expect(mockLocation.href).toBe('/profile');
    });
  });

  it('does not render when isOpen is false', () => {
    render(<LoginModal isOpen={false} onClose={() => {}} />);
    
    // The modal should not be visible
    expect(screen.queryByText('Login to Researka')).not.toBeInTheDocument();
  });
});
