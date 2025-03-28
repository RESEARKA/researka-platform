import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockFirebaseAuth, simulateUnauthenticated } from '../../utils/integration-test-utils';
import LoginModal from '../LoginModal';

// Mock Firebase modules
jest.mock('../../config/firebase', () => ({
  getFirebaseAuth: jest.fn().mockReturnValue(mockFirebaseAuth),
  getFirebaseFirestore: jest.fn(),
  initializeFirebase: jest.fn().mockReturnValue(true),
}));

describe('LoginModal Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    simulateUnauthenticated();
  });

  it('should render login form by default', () => {
    renderWithProviders(
      <LoginModal isOpen={true} onClose={jest.fn()} />
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should toggle between login and signup forms', async () => {
    renderWithProviders(
      <LoginModal isOpen={true} onClose={jest.fn()} />
    );

    // Initially shows login form
    expect(screen.getByText('Sign In')).toBeInTheDocument();

    // Click on signup link
    await userEvent.click(screen.getByText(/create an account/i));

    // Should now show signup form
    await waitFor(() => {
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    // Click on login link
    await userEvent.click(screen.getByText(/already have an account/i));

    // Should show login form again
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  it('should handle login submission with valid credentials', async () => {
    // Mock successful login
    mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: 'test-user-123', email: 'test@example.com' }
    });

    const onCloseMock = jest.fn();
    renderWithProviders(
      <LoginModal isOpen={true} onClose={onCloseMock} />
    );

    // Fill in login form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify Firebase auth was called with correct credentials
    await waitFor(() => {
      expect(mockFirebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        mockFirebaseAuth,
        'test@example.com',
        'password123'
      );
    });

    // Modal should close on successful login
    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it('should display error message on login failure', async () => {
    // Mock login failure
    const errorMessage = 'Invalid email or password';
    mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValueOnce({
      code: 'auth/wrong-password',
      message: errorMessage
    });

    renderWithProviders(
      <LoginModal isOpen={true} onClose={jest.fn()} />
    );

    // Fill in login form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('should handle signup submission with valid credentials', async () => {
    // Mock successful signup
    mockFirebaseAuth.createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: { 
        uid: 'new-user-123', 
        email: 'newuser@example.com',
        updateProfile: jest.fn().mockResolvedValueOnce(undefined)
      }
    });

    const onCloseMock = jest.fn();
    renderWithProviders(
      <LoginModal isOpen={true} onClose={onCloseMock} />
    );

    // Switch to signup form
    await userEvent.click(screen.getByText(/create an account/i));

    // Fill in signup form
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
    
    await userEvent.type(screen.getByLabelText(/name/i), 'New User');
    await userEvent.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    // Verify Firebase auth was called with correct credentials
    await waitFor(() => {
      expect(mockFirebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        mockFirebaseAuth,
        'newuser@example.com',
        'password123'
      );
    });

    // Modal should close on successful signup
    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it('should validate form inputs before submission', async () => {
    renderWithProviders(
      <LoginModal isOpen={true} onClose={jest.fn()} />
    );

    // Try to submit with empty fields
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    // Firebase auth should not be called
    expect(mockFirebaseAuth.signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    renderWithProviders(
      <LoginModal isOpen={true} onClose={jest.fn()} />
    );

    // Enter invalid email
    await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Should show email validation error
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });

    // Firebase auth should not be called
    expect(mockFirebaseAuth.signInWithEmailAndPassword).not.toHaveBeenCalled();
  });
});
