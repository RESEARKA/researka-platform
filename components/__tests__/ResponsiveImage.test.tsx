import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveImage from '../ResponsiveImage';

// Create mock functions
const mockCreateResponsiveImage = jest.fn(() => ({
  src: 'optimized-test-image.jpg',
  srcSet: 'optimized-test-image.jpg 1x, optimized-test-image@2x.jpg 2x',
}));
const mockIsMobileDevice = jest.fn(() => false);

// Mock the imageOptimizer utilities
jest.mock('../../utils/imageOptimizer', () => ({
  createResponsiveImage: mockCreateResponsiveImage,
  isMobileDevice: mockIsMobileDevice,
}));

describe('ResponsiveImage Component', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    mockCreateResponsiveImage.mockClear();
    mockIsMobileDevice.mockClear();
  });

  // Use a simplified approach to test just that the component renders
  it('renders without crashing', () => {
    // Render the component with minimal props
    const { container } = render(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
        width={300} 
        height={200} 
      />
    );
    
    // If we got here without errors, the test passes
    expect(container).toBeInTheDocument();
  });

  it('uses the createResponsiveImage utility', () => {
    render(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Custom alt text" 
        width={300} 
        height={200} 
      />
    );
    
    // Verify the utility was called
    expect(mockCreateResponsiveImage).toHaveBeenCalled();
  });
});
