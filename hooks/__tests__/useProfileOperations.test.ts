import { renderHookWithProviders, act } from '../../utils/test-hook-utils';
import { useProfileOperations } from '../useProfileOperations';
import { useProfileData, ProfileLoadingState } from '../useProfileData';
import useAppToast from '../useAppToast';

// Mock dependencies
jest.mock('../useProfileData');
jest.mock('../useAppToast');

describe('useProfileOperations', () => {
  // Mock profile data
  const mockProfile = {
    uid: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'Researcher',
    institution: 'Test University',
  };
  
  // Mock update profile function
  const mockUpdateProfile = jest.fn();
  
  // Mock retry loading function
  const mockRetryLoading = jest.fn();
  
  // Mock load data function
  const mockLoadData = jest.fn();
  
  // Mock toast function
  const mockShowToast = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup useProfileData mock
    (useProfileData as jest.Mock).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      isUpdating: false,
      error: null,
      isProfileComplete: true,
      updateProfile: mockUpdateProfile,
      retryLoading: mockRetryLoading,
      isLoadingData: false,
      loadingState: ProfileLoadingState.SUCCESS,
      loadData: mockLoadData,
    });
    
    // Setup useAppToast mock
    (useAppToast as jest.Mock).mockReturnValue(mockShowToast);
    
    // Mock console.log
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock Date.now for consistent timing tests
    jest.spyOn(Date, 'now').mockReturnValue(1000);
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('should initialize with the correct state', () => {
    const { result } = renderHookWithProviders(() => useProfileOperations());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.profile).toEqual(mockProfile);
  });
  
  it('should handle profile updates successfully', async () => {
    // Mock Date.now to return incremental values for timing calculations
    (Date.now as jest.Mock)
      .mockReturnValueOnce(1000)  // Start time
      .mockReturnValueOnce(2000); // End time (1 second later)
    
    const { result } = renderHookWithProviders(() => useProfileOperations());
    
    // Update the profile
    await act(async () => {
      await result.current.updateProfile({ name: 'Updated Name' });
    });
    
    // Check that the update was called with the correct data
    expect(mockUpdateProfile).toHaveBeenCalledWith({ name: 'Updated Name' });
    
    // Check that the operation was logged
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[ProfileOperations] updateProfile completed'),
      expect.any(Object)
    );
    
    // Check that a success toast was shown
    expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({
      status: 'success',
      title: expect.stringContaining('Profile updated')
    }));
  });
  
  it('should handle errors during profile updates', async () => {
    // Setup error state
    const mockError = new Error('Update failed');
    mockUpdateProfile.mockRejectedValueOnce(mockError);
    
    const { result } = renderHookWithProviders(() => useProfileOperations());
    
    // Try to update the profile
    await act(async () => {
      await result.current.updateProfile({ name: 'Updated Name' });
    });
    
    // Check that the error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[ProfileOperations] Error updating profile'),
      expect.objectContaining({ error: mockError })
    );
    
    // Check that an error toast was shown
    expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({
      status: 'error',
      title: expect.stringContaining('Error updating profile')
    }));
  });
  
  it('should handle retrying profile loading', async () => {
    const { result } = renderHookWithProviders(() => useProfileOperations());
    
    // Call handleError to trigger retry
    await act(async () => {
      result.current.handleError('test-error');
    });
    
    // Check that retryLoading was called
    expect(mockRetryLoading).toHaveBeenCalled();
    
    // Check that the error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[ProfileOperations] Error'),
      expect.objectContaining({ error: 'test-error' })
    );
  });
  
  it('should correctly check loading states', () => {
    // Mock different loading states
    (useProfileData as jest.Mock)
      .mockReturnValueOnce({
        ...useProfileData(),
        loadingState: ProfileLoadingState.LOADING,
      })
      .mockReturnValueOnce({
        ...useProfileData(),
        loadingState: ProfileLoadingState.UPDATING,
      })
      .mockReturnValueOnce({
        ...useProfileData(),
        loadingState: ProfileLoadingState.SUCCESS,
      });
    
    // Test with LOADING state
    const { result, rerender } = renderHookWithProviders(() => useProfileOperations());
    expect(result.current.isInLoadingState([ProfileLoadingState.LOADING])).toBe(true);
    expect(result.current.isInLoadingState([ProfileLoadingState.UPDATING])).toBe(false);
    
    // Test with UPDATING state
    rerender();
    expect(result.current.isInLoadingState([ProfileLoadingState.UPDATING])).toBe(true);
    expect(result.current.isInLoadingState([ProfileLoadingState.LOADING])).toBe(false);
    
    // Test with SUCCESS state
    rerender();
    expect(result.current.isInLoadingState([ProfileLoadingState.LOADING, ProfileLoadingState.UPDATING])).toBe(false);
  });
  
  it('should batch update profile fields', async () => {
    const { result } = renderHookWithProviders(() => useProfileOperations());
    
    // Batch update multiple fields
    await act(async () => {
      await result.current.batchUpdateProfile({
        name: 'Updated Name',
        institution: 'Updated Institution',
        department: 'Updated Department',
      });
    });
    
    // Check that updateProfile was called with all fields
    expect(mockUpdateProfile).toHaveBeenCalledWith({
      name: 'Updated Name',
      institution: 'Updated Institution',
      department: 'Updated Department',
    });
    
    // Check that the operation was logged
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[ProfileOperations] batchUpdateProfile completed'),
      expect.any(Object)
    );
  });
  
  it('should handle timeouts for long-running operations', async () => {
    // Mock a long-running update (timeout will be triggered)
    jest.useFakeTimers();
    mockUpdateProfile.mockImplementation(() => new Promise(resolve => {
      setTimeout(resolve, 10000); // 10 seconds (longer than timeout)
    }));
    
    const { result } = renderHookWithProviders(() => useProfileOperations());
    
    // Start the update
    const updatePromise = act(async () => {
      await result.current.updateProfile({ name: 'Updated Name' });
    });
    
    // Fast-forward time to trigger timeout
    jest.advanceTimersByTime(6000); // 6 seconds (default timeout is 5 seconds)
    
    // Complete the test
    await updatePromise;
    
    // Check that a timeout warning was logged
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[ProfileOperations] Operation is taking longer than expected'),
      expect.any(Object)
    );
    
    jest.useRealTimers();
  });
});
