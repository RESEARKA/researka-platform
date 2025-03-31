import { ProfileLoadingState } from '../hooks/profileUtils';
import { UserProfile } from '../hooks/useProfileData';

// Mock profile data
export const mockUserProfile: UserProfile = {
  uid: 'test-user-id',
  email: 'test@example.edu',
  name: 'Test User',
  role: 'Researcher',
  institution: 'Test University',
  department: 'Computer Science',
  profileComplete: true,
};

// Mock implementation for useProfileData
export const mockUseProfileData = {
  profile: mockUserProfile,
  isProfileComplete: true,
  loadingState: ProfileLoadingState.SUCCESS,
  error: null,
  loadProfileData: jest.fn().mockResolvedValue(undefined),
  updateProfileData: jest.fn().mockResolvedValue(undefined),
  checkProfileComplete: jest.fn((profile) => !!profile && !!profile.name && !!profile.role),
  isInLoadingState: jest.fn((states, current) => current ? states.includes(current) : false),
};

// Mock the hook itself
jest.mock('../hooks/useProfileData', () => ({
  useProfileData: () => mockUseProfileData,
  // Ensure ProfileLoadingState and isInLoadingState are also exported from the mock
  // even though they now live in profileUtils, tests might implicitly expect them here
  ProfileLoadingState: jest.requireActual('../hooks/profileUtils').ProfileLoadingState,
  isInLoadingState: jest.requireActual('../hooks/profileUtils').isInLoadingState,
  // Export the UserProfile type as well
  __esModule: true, // Required for ES module mocking
  // No default export, only named exports
}));
