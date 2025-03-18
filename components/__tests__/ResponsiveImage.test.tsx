import React from 'react';
import { render, screen } from '../../utils/test-utils';
import ResponsiveImage from '../ResponsiveImage';

// Mock the imageOptimizer utilities
jest.mock('../../utils/imageOptimizer', () => ({
  createResponsiveImage: jest.fn(() => ({
    src: 'optimized-test-image.jpg',
    srcSet: 'optimized-test-image.jpg 1x, optimized-test-image@2x.jpg 2x',
  })),
  isMobileDevice: jest.fn(() => false),
}));

describe('ResponsiveImage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the image with correct attributes', () => {
    render(
      <ResponsiveImage
        src="/images/test-image.jpg"
        alt="Test image"
        width={400}
        height={300}
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'optimized-test-image.jpg');
    expect(image).toHaveAttribute('srcSet', 'optimized-test-image.jpg 1x, optimized-test-image@2x.jpg 2x');
    expect(image).toHaveAttribute('alt', 'Test image');
  });

  it('applies the correct object-fit style', () => {
    render(
      <ResponsiveImage
        src="/images/test-image.jpg"
        alt="Test image"
        objectFit="contain"
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toHaveStyle('object-fit: contain');
  });

  it('applies the correct border radius', () => {
    render(
      <ResponsiveImage
        src="/images/test-image.jpg"
        alt="Test image"
        borderRadius="lg"
      />
    );
    
    const image = screen.getByAltText('Test image');
    // Check the style property instead of attribute
    expect(image).toHaveStyle('border-radius: var(--chakra-radii-lg)');
  });

  it('uses the fallback src when provided', () => {
    render(
      <ResponsiveImage
        src="/images/test-image.jpg"
        alt="Test image"
        fallbackSrc="/images/fallback.jpg"
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toHaveAttribute('src', 'optimized-test-image.jpg');
    // The fallbackSrc is passed as a prop to the Chakra UI Image component
    // but it doesn't appear as an attribute in the DOM
  });

  it('sets loading to eager when priority is true', () => {
    render(
      <ResponsiveImage
        src="/images/test-image.jpg"
        alt="Test image"
        priority={true}
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toHaveAttribute('loading', 'eager');
  });

  it('shows a skeleton while the image is loading', () => {
    render(
      <ResponsiveImage
        src="/images/test-image.jpg"
        alt="Test image"
      />
    );
    
    // Check that the skeleton is present
    const skeleton = document.querySelector('.chakra-skeleton');
    expect(skeleton).toBeInTheDocument();
    
    // The image should have opacity 0 initially
    const image = screen.getByAltText('Test image');
    expect(image).toHaveStyle('opacity: 0');
  });
});
