import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockFirebaseAuth, simulateAuthenticated, mockFirestore } from '../../utils/integration-test-utils';
import ProfileCompletionForm from '../ProfileCompletionForm';
import { ProfileLoadingState } from '../../hooks/useProfileData';

// Mock the hooks
jest.mock('../../hooks/useProfileData', () => ({
  ...jest.requireActual('../../hooks/useProfileData'),
  useProfileData: jest.fn().mockReturnValue({
    profile: {
      uid: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: '',
      institution: '',
    },
    isLoading: false,
    isUpdating: false,
    error: null,
    loadingState: ProfileLoadingState.SUCCESS,
    updateProfile: jest.fn().mockResolvedValue({}),
    isProfileComplete: false,
  }),
  ProfileLoadingState,
  isInLoadingState: jest.requireActual('../../hooks/useProfileData').isInLoadingState,
}));

jest.mock('../../hooks/useProfileOperations', () => ({
  useProfileOperations: jest.fn().mockReturnValue({
    profile: {
      uid: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: '',
      institution: '',
    },
    isLoading: false,
    error: null,
    updateProfile: jest.fn().mockResolvedValue({}),
    batchUpdateProfile: jest.fn().mockResolvedValue({}),
    handleError: jest.fn(),
    isInLoadingState: jest.fn().mockReturnValue(false),
  }),
}));

// Mock Firebase modules
jest.mock('../../config/firebase', () => ({
  getFirebaseAuth: jest.fn().mockReturnValue(mockFirebaseAuth),
  getFirebaseFirestore: jest.fn().mockReturnValue(mockFirestore),
  initializeFirebase: jest.fn().mockReturnValue(true),
}));

describe('ProfileCompletionForm Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    simulateAuthenticated();
  });

  it('should render the profile completion form with user data', async () => {
    renderWithProviders(
      <ProfileCompletionForm isLoading={false} />
    );

    // Verify form fields are rendered with user data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/institution/i)).toBeInTheDocument();
    });
  });

  it('should handle form submission with valid data', async () => {
    const { getByLabelText, getByRole } = renderWithProviders(
      <ProfileCompletionForm isLoading={false} />
    );

    // Fill in required fields
    await userEvent.type(getByLabelText(/role/i), 'Researcher');
    await userEvent.type(getByLabelText(/institution/i), 'Test University');
    await userEvent.type(getByLabelText(/department/i), 'Computer Science');

    // Submit form
    await userEvent.click(getByRole('button', { name: /save profile/i }));

    // Verify profile update was called with correct data
    await waitFor(() => {
      const { batchUpdateProfile } = require('../../hooks/useProfileOperations').useProfileOperations();
      expect(batchUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'Researcher',
          institution: 'Test University',
          department: 'Computer Science',
        })
      );
    });
  });

  it('should validate required fields before submission', async () => {
    const { getByLabelText, getByRole, findByText } = renderWithProviders(
      <ProfileCompletionForm isLoading={false} />
    );

    // Clear the name field (which has a default value)
    const nameInput = getByLabelText(/name/i);
    await userEvent.clear(nameInput);

    // Submit form without filling required fields
    await userEvent.click(getByRole('button', { name: /save profile/i }));

    // Verify validation errors
    expect(await findByText(/name is required/i)).toBeInTheDocument();
    expect(await findByText(/role is required/i)).toBeInTheDocument();
    expect(await findByText(/institution is required/i)).toBeInTheDocument();

    // Verify profile update was not called
    const { batchUpdateProfile } = require('../../hooks/useProfileOperations').useProfileOperations();
    expect(batchUpdateProfile).not.toHaveBeenCalled();
  });

  it('should show loading state during form submission', async () => {
    // Mock the hooks to show loading state
    jest.mock('../../hooks/useProfileOperations', () => ({
      useProfileOperations: jest.fn().mockReturnValue({
        profile: {
          uid: 'test-user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: '',
          institution: '',
        },
        isLoading: false,
        error: null,
        updateProfile: jest.fn().mockResolvedValue({}),
        batchUpdateProfile: jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 500))),
        handleError: jest.fn(),
        isInLoadingState: jest.fn().mockReturnValue(true),
      }),
    }));

    const { getByLabelText, getByRole, findByText } = renderWithProviders(
      <ProfileCompletionForm isLoading={true} />
    );

    // Fill in required fields
    await userEvent.type(getByLabelText(/role/i), 'Researcher');
    await userEvent.type(getByLabelText(/institution/i), 'Test University');

    // Submit form
    await userEvent.click(getByRole('button', { name: /save profile/i }));

    // Verify loading state is shown
    expect(await findByText(/saving/i)).toBeInTheDocument();
  });

  it('should handle errors during form submission', async () => {
    // Mock the hooks to simulate an error
    const mockError = new Error('Failed to update profile');
    const mockHandleError = jest.fn();
    
    jest.spyOn(require('../../hooks/useProfileOperations'), 'useProfileOperations').mockReturnValue({
      profile: {
        uid: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: '',
        institution: '',
      },
      isLoading: false,
      error: 'Failed to update profile',
      updateProfile: jest.fn().mockResolvedValue({}),
      batchUpdateProfile: jest.fn().mockRejectedValue(mockError),
      handleError: mockHandleError,
      isInLoadingState: jest.fn().mockReturnValue(false),
    });

    const { getByLabelText, getByRole } = renderWithProviders(
      <ProfileCompletionForm isLoading={false} />
    );

    // Fill in required fields
    await userEvent.type(getByLabelText(/role/i), 'Researcher');
    await userEvent.type(getByLabelText(/institution/i), 'Test University');

    // Submit form
    await userEvent.click(getByRole('button', { name: /save profile/i }));

    // Verify error handler was called
    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(mockError);
    });
  });

  it('should handle research interests selection', async () => {
    const { getByLabelText, getByRole, findByText } = renderWithProviders(
      <ProfileCompletionForm isLoading={false} />
    );

    // Open the research interests dropdown
    const interestsField = getByLabelText(/research interests/i);
    await userEvent.click(interestsField);

    // Select some interests (this depends on the actual implementation)
    const interestOption = await findByText(/artificial intelligence/i);
    await userEvent.click(interestOption);

    // Submit form
    await userEvent.click(getByRole('button', { name: /save profile/i }));

    // Verify profile update was called with research interests
    await waitFor(() => {
      const { batchUpdateProfile } = require('../../hooks/useProfileOperations').useProfileOperations();
      expect(batchUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          researchInterests: expect.arrayContaining(['Artificial Intelligence']),
        })
      );
    });
  });
});
