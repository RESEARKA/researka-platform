import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveImage from '../ResponsiveImage';

// Define mock functions before jest.mock (but don't initialize them)
// This avoids the "Cannot access before initialization" error due to hoisting
const mockCreateResponsiveImage = jest.fn();
const mockIsMobileDevice = jest.fn();

// Mock the Chakra UI components
jest.mock('@chakra-ui/react', () => {
  const React = require('react');
  return {
    Box: ({ children, ...props }: any) => <div data-testid="chakra-box" {...props}>{children}</div>,
    Image: ({ src, alt, onLoad, ...props }: any) => {
      // Trigger onLoad to simulate image loading
      React.useEffect(() => {
        if (onLoad) onLoad();
      }, []);
      return <img src={src} alt={alt} data-testid="chakra-image" {...props} />;
    },
    Skeleton: () => <div data-testid="chakra-skeleton" />,
    useColorModeValue: jest.fn((light) => light),
  };
});

// Mock the imageOptimizer utilities
jest.mock('../../utils/imageOptimizer', () => ({
  // Keep ESM default/named exports happy
  createResponsiveImage: (...args: any[]) => mockCreateResponsiveImage(...args),
  isMobileDevice: (...args: any[]) => mockIsMobileDevice(...args),
}));

describe('ResponsiveImage Component', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    mockCreateResponsiveImage.mockClear();
    mockIsMobileDevice.mockClear();
    
    // Set up the return values for the mocks
    mockCreateResponsiveImage.mockReturnValue({
      src: 'optimized-test-image.jpg',
      srcSet: 'optimized-test-image.jpg 1x, optimized-test-image@2x.jpg 2x',
    });
    mockIsMobileDevice.mockReturnValue(false);
  });

  it('renders without crashing', () => {
    // Render the component with minimal props
    const { getByTestId } = render(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
        width={300} 
        height={200} 
      />
    );
    
    // Check if the component rendered the Chakra UI components
    expect(getByTestId('chakra-box')).toBeInTheDocument();
    expect(getByTestId('chakra-image')).toBeInTheDocument();
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
    
    // Verify the utility was called with the expected arguments
    expect(mockCreateResponsiveImage).toHaveBeenCalledWith(
      '/test-image.jpg',
      expect.objectContaining({
        format: 'webp',
        defaultWidth: 300,
      })
    );
  });
});
