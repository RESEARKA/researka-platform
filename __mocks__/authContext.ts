// Mock for the AuthContext
export const mockAuthContext = {
  currentUser: null,
  authIsInitialized: true,
  isLoading: false,
  login: jest.fn().mockResolvedValue(true),
  signup: jest.fn().mockResolvedValue(true),
  logout: jest.fn().mockResolvedValue(true),
  resetPassword: jest.fn().mockResolvedValue(true),
  getUserProfile: jest.fn().mockResolvedValue(null),
  updateUserData: jest.fn().mockResolvedValue(true),
};

// Mock the useAuth hook
export const mockUseAuth = jest.fn().mockReturnValue(mockAuthContext);
