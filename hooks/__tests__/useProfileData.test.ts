import { renderHookWithProviders, act } from '../../utils/test-hook-utils';
import { useProfileData, ProfileLoadingState, isInLoadingState } from '../useProfileData';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '../../config/firebase';
import useClient from '../useClient';

// Mock the dependencies
jest.mock('../../contexts/AuthContext');
jest.mock('../../config/firebase');
jest.mock('../useClient');
jest.mock('firebase/firestore');

describe('useProfileData', () => {
  // Mock setup
  const mockUser = { uid: 'test-user-123', email: 'test@example.com' };
  const mockProfile = {
    uid: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'Researcher',
    institution: 'Test University',
    department: 'Computer Science',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };
  
  // Mock Firestore document reference
  const mockDocRef = { id: 'test-user-123' };
  
  // Mock Firestore document snapshot
  const mockDocSnap = {
    exists: jest.fn().mockReturnValue(true),
    data: jest.fn().mockReturnValue(mockProfile),
  };
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock useAuth hook
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: mockUser,
      authIsInitialized: true,
    });
    
    // Mock useClient hook
    (useClient as jest.Mock).mockReturnValue(true);
    
    // Mock Firestore functions
    (getFirebaseFirestore as jest.Mock).mockReturnValue({});
    (doc as jest.Mock).mockReturnValue(mockDocRef);
    (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
    (setDoc as jest.Mock).mockResolvedValue(undefined);
    (updateDoc as jest.Mock).mockResolvedValue(undefined);
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore console methods
    jest.restoreAllMocks();
  });
  
  it('should initialize with the correct loading state', () => {
    const { result } = renderHookWithProviders(() => useProfileData());
    
    expect(result.current.loadingState).toBe(ProfileLoadingState.INITIALIZING);
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBeNull();
  });
  
  it('should load profile data when auth is initialized', async () => {
    const { result, waitForNextUpdate } = renderHookWithProviders(() => useProfileData());
    
    // Initial state
    expect(result.current.loadingState).toBe(ProfileLoadingState.INITIALIZING);
    
    // Wait for the profile to load
    await waitForNextUpdate();
    
    // Check that the profile was loaded
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.loadingState).toBe(ProfileLoadingState.SUCCESS);
    expect(result.current.isProfileComplete).toBe(true);
    expect(getDoc).toHaveBeenCalledTimes(1);
  });
  
  it('should handle errors when loading profile data', async () => {
    // Mock getDoc to throw an error
    (getDoc as jest.Mock).mockRejectedValueOnce(new Error('Failed to load profile'));
    
    const { result, waitForNextUpdate } = renderHookWithProviders(() => useProfileData());
    
    // Wait for the error
    await waitForNextUpdate();
    
    // Check that the error was handled
    expect(result.current.loadingState).toBe(ProfileLoadingState.ERROR);
    expect(result.current.error).toBe('Failed to load profile');
    expect(console.error).toHaveBeenCalled();
  });
  
  it('should create a new profile if one does not exist', async () => {
    // Mock document snapshot to not exist
    (mockDocSnap.exists as jest.Mock).mockReturnValueOnce(false);
    
    const { result, waitForNextUpdate } = renderHookWithProviders(() => useProfileData());
    
    // Wait for the profile to be created
    await waitForNextUpdate();
    
    // Check that setDoc was called to create a new profile
    expect(setDoc).toHaveBeenCalledTimes(1);
    expect(result.current.loadingState).toBe(ProfileLoadingState.SUCCESS);
  });
  
  it('should update profile data successfully', async () => {
    const { result, waitForNextUpdate } = renderHookWithProviders(() => useProfileData());
    
    // Wait for the initial profile load
    await waitForNextUpdate();
    
    // Update the profile
    const updatedProfile = {
      ...mockProfile,
      name: 'Updated Name',
      department: 'Updated Department',
    };
    
    await act(async () => {
      await result.current.updateProfile(updatedProfile);
    });
    
    // Check that the profile was updated
    expect(updateDoc).toHaveBeenCalledTimes(1);
    expect(result.current.profile).toEqual(updatedProfile);
    expect(result.current.loadingState).toBe(ProfileLoadingState.SUCCESS);
  });
  
  it('should handle errors when updating profile data', async () => {
    const { result, waitForNextUpdate } = renderHookWithProviders(() => useProfileData());
    
    // Wait for the initial profile load
    await waitForNextUpdate();
    
    // Mock updateDoc to throw an error
    (updateDoc as jest.Mock).mockRejectedValueOnce(new Error('Failed to update profile'));
    
    // Try to update the profile
    await act(async () => {
      await result.current.updateProfile({ name: 'Updated Name' });
    });
    
    // Check that the error was handled
    expect(result.current.loadingState).toBe(ProfileLoadingState.ERROR);
    expect(result.current.error).toBe('Failed to update profile');
    expect(console.error).toHaveBeenCalled();
  });
  
  it('should not load profile data when not authenticated', async () => {
    // Mock user as not authenticated
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: null,
      authIsInitialized: true,
    });
    
    const { result } = renderHookWithProviders(() => useProfileData());
    
    // Check that no profile was loaded
    expect(result.current.profile).toBeNull();
    expect(result.current.loadingState).toBe(ProfileLoadingState.IDLE);
    expect(getDoc).not.toHaveBeenCalled();
  });
  
  it('should correctly determine if a profile is complete', async () => {
    const { result, waitForNextUpdate } = renderHookWithProviders(() => useProfileData());
    
    // Wait for the initial profile load
    await waitForNextUpdate();
    
    // Complete profile
    expect(result.current.isProfileComplete).toBe(true);
    
    // Update to incomplete profile
    await act(async () => {
      await result.current.updateProfile({ institution: '' });
    });
    
    // Check that the profile is now incomplete
    expect(result.current.isProfileComplete).toBe(false);
  });
  
  it('should retry loading profile data on failure', async () => {
    // Mock getDoc to fail on first call but succeed on second
    (getDoc as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockDocSnap);
    
    const { result, waitForNextUpdate } = renderHookWithProviders(() => useProfileData());
    
    // Wait for the retry and successful load
    await waitForNextUpdate();
    
    // Check that the profile was loaded after retry
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.loadingState).toBe(ProfileLoadingState.SUCCESS);
    expect(getDoc).toHaveBeenCalledTimes(2);
  });
  
  it('should correctly identify loading states with isInLoadingState helper', () => {
    // Test the helper function
    expect(isInLoadingState([ProfileLoadingState.LOADING, ProfileLoadingState.UPDATING], ProfileLoadingState.LOADING)).toBe(true);
    expect(isInLoadingState([ProfileLoadingState.LOADING, ProfileLoadingState.UPDATING], ProfileLoadingState.SUCCESS)).toBe(false);
    expect(isInLoadingState([ProfileLoadingState.LOADING, ProfileLoadingState.UPDATING], undefined)).toBe(false);
  });
});
