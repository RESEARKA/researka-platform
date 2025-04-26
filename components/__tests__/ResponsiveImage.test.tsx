import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Explicitly mock the modules
jest.mock('@chakra-ui/react');
jest.mock('../../utils/imageOptimizer');

// Import the component after setting up mocks
import ResponsiveImage from '../ResponsiveImage';

describe('ResponsiveImage Component', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    jest.clearAllMocks();
  });

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
    
    // Check if the component rendered the Chakra UI components
    expect(container.querySelector('[data-testid="chakra-box"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="chakra-image"]')).toBeInTheDocument();
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
    
    // Get the mock from the mocked module
    const { createResponsiveImage } = require('../../utils/imageOptimizer');
    
    // Verify the utility was called with the expected arguments
    expect(createResponsiveImage).toHaveBeenCalledWith(
      '/test-image.jpg',
      expect.objectContaining({
        format: 'webp',
        defaultWidth: 300,
      })
    );
  });
});
