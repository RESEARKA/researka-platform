import React, { useState, useEffect } from 'react';
import { getLazyLoadImageProps, isMobileDevice } from '../utils/imageOptimizer';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * ResponsiveImage component for optimized image loading
 * Features:
 * - Responsive sizing based on device
 * - Lazy loading with blur-up effect
 * - Proper srcSet for different viewport sizes
 * - Fallback for image loading errors
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const isMobile = isMobileDevice();

  // Get optimized image properties
  const imageProps = getLazyLoadImageProps(src);

  // Reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setError(false);
  }, [src]);

  // Handle image load error
  const handleError = () => {
    setError(true);
    console.error(`Failed to load image: ${src}`);
  };

  // Handle image load success
  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Determine image dimensions
  const getImageDimensions = () => {
    if (width && height) {
      return { width, height };
    }
    
    // Default dimensions based on device
    return isMobile 
      ? { width: 'auto', height: 'auto', maxWidth: '100%' } 
      : { width: 'auto', height: 'auto', maxWidth: '100%' };
  };

  // Placeholder for error state
  if (error) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center text-gray-500 ${className}`}
        style={getImageDimensions()}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={getImageDimensions()}>
      {/* Low quality placeholder */}
      {!isLoaded && !priority && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      <img
        src={imageProps.src}
        srcSet={imageProps.srcSet}
        sizes={imageProps.sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={getImageDimensions()}
      />
    </div>
  );
};

export default ResponsiveImage;
