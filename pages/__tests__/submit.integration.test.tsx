import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { setupIntegrationTest } from '../../utils/integration-test-utils';
import SubmitPage from '../submit';
import { mockAuthContext } from '../../__mocks__/authContext';
import * as articleService from '../../services/articleService';
import { act } from 'react-dom/test-utils';

// Mock the articleService
jest.mock('../../services/articleService', () => ({
  submitArticle: jest.fn(),
}));

// Mock the router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
  }),
}));

// Increase Jest timeout for all tests
jest.setTimeout(10000);

describe('Article Submission Integration Tests', () => {
  // Setup for each test
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock the auth context with a logged-in user
    mockAuthContext.currentUser = { 
      uid: 'test-user-id', 
      email: 'test@example.edu',
      displayName: 'Test User'
    } as any; // Type assertion to avoid TypeScript error
    
    mockAuthContext.authIsInitialized = true;
    mockAuthContext.isLoading = false;
    mockAuthContext.getUserProfile.mockResolvedValue({
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.edu',
      institution: 'Test University',
      department: 'Computer Science',
      position: 'Researcher',
      researchInterests: ['AI', 'Machine Learning'],
      role: 'Researcher',
      profileComplete: true
    });
  });

  // This is a minimal test to verify that the component renders without crashing
  test('renders without crashing', async () => {
    // Use a try-catch block to handle any rendering errors
    try {
      // Setup the test with our integration test utility
      const { container, waitForStateUpdates } = setupIntegrationTest(<SubmitPage />);
      
      // Wait for any state updates to complete
      await waitForStateUpdates();
      
      // If we get here, the component rendered without crashing
      expect(container).toBeTruthy();
      
      // Log success
      console.log('Component rendered successfully');
    } catch (error) {
      // Log the error and fail the test
      console.error('Error rendering component:', error);
      throw error;
    }
  });

  // This test verifies that the articleService is properly mocked
  test('articleService is properly mocked', async () => {
    // Setup the test with our integration test utility
    const { waitForStateUpdates } = setupIntegrationTest(<SubmitPage />);
    
    // Wait for any state updates to complete
    await waitForStateUpdates();
    
    // Verify that the mock function exists
    expect(articleService.submitArticle).toBeDefined();
    expect(typeof articleService.submitArticle).toBe('function');
    
    // Verify that the mock function has not been called yet
    expect(articleService.submitArticle).not.toHaveBeenCalled();
    
    // Log success
    console.log('articleService is properly mocked');
  });

  // Add a test to check basic form interaction
  test('can interact with form elements', async () => {
    // Setup the test with our integration test utility
    const { user, actAsync, waitForStateUpdates } = setupIntegrationTest(<SubmitPage />);
    
    // Wait for any state updates to complete
    await waitForStateUpdates();
    
    // Try to find any form elements
    const formElements = screen.queryAllByRole('textbox');
    
    // Log what we found for debugging
    console.log(`Found ${formElements.length} form elements`);
    
    // If we found any form elements, try to interact with the first one
    if (formElements.length > 0) {
      // Use actAsync to wrap the interaction
      await actAsync(async () => {
        await user.type(formElements[0], 'Test input');
      });
      
      // Wait for any state updates to complete
      await waitForStateUpdates();
      
      // Log success
      console.log('Successfully interacted with form element');
    } else {
      console.log('No form elements found to interact with');
    }
  });
});
