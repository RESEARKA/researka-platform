/**
 * useOptimizedImage Hook
 * 
 * Custom hook for optimizing images using Next.js Image component.
 * This hook provides utilities for generating optimized image props and URLs.
 */

import { useState, useEffect } from 'react';

// Default image dimensions
const DEFAULT_DIMENSIONS = {
  width: 800,
  height: 600,
  quality: 80
};

// Placeholder image URL for when the actual image is loading or fails
const PLACEHOLDER_IMAGE = '/images/placeholder.jpg';

// Image formats supported by Next.js Image optimization
export type ImageFormat = 'image/webp' | 'image/avif' | 'image/jpeg' | 'image/png' | 'image/gif';

/**
 * Image optimization options
 */
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  format?: ImageFormat;
}

/**
 * Optimized image props for use with Next.js Image component
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  quality?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  className?: string;
}

/**
 * Custom hook for optimizing images
 * @param src Image source URL
 * @param alt Image alt text
 * @param options Image optimization options
 * @returns Optimized image props and utilities
 */
export function useOptimizedImage(
  src: string,
  alt: string,
  options: ImageOptimizationOptions = {}
) {
  // State for tracking image loading and errors
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: options.width || DEFAULT_DIMENSIONS.width,
    height: options.height || DEFAULT_DIMENSIONS.height
  });

  // Merge default options with provided options
  const imageOptions = {
    ...DEFAULT_DIMENSIONS,
    ...options
  };

  // Generate responsive sizes based on viewport width
  const getSizes = () => {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  };

  // Handle image loading
  useEffect(() => {
    if (!src || src === PLACEHOLDER_IMAGE) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // If dimensions are not provided, try to get them from the actual image
    if (!options.width || !options.height) {
      const img = new Image();
      img.src = src;

      img.onload = () => {
        setImageDimensions({
          width: img.width,
          height: img.height
        });
        setIsLoading(false);
      };

      img.onerror = () => {
        setHasError(true);
        setIsLoading(false);
      };
    } else {
      setIsLoading(false);
    }
  }, [src, options.width, options.height]);

  // Generate optimized image props for Next.js Image component
  const getImageProps = (overrideProps: Partial<OptimizedImageProps> = {}): OptimizedImageProps => {
    return {
      src: hasError ? PLACEHOLDER_IMAGE : src,
      alt: alt || 'Image',
      width: imageDimensions.width,
      height: imageDimensions.height,
      quality: imageOptions.quality,
      priority: imageOptions.priority,
      placeholder: imageOptions.placeholder,
      blurDataURL: imageOptions.blurDataURL,
      loading: imageOptions.priority ? 'eager' : 'lazy',
      sizes: getSizes(),
      ...overrideProps
    };
  };

  // Generate a responsive image URL with width and quality parameters
  const getResponsiveImageUrl = (width?: number, quality?: number): string => {
    if (!src || hasError) return PLACEHOLDER_IMAGE;

    // For external URLs, we can't add parameters
    if (src.startsWith('http') && !src.includes(window.location.hostname)) {
      return src;
    }

    // For internal URLs, add width and quality parameters
    const url = new URL(src, window.location.origin);
    if (width) url.searchParams.set('w', width.toString());
    if (quality) url.searchParams.set('q', quality.toString());

    return url.toString();
  };

  return {
    isLoading,
    hasError,
    imageDimensions,
    getImageProps,
    getResponsiveImageUrl,
    placeholderImage: PLACEHOLDER_IMAGE
  };
}

/**
 * Helper function to get image dimensions from a URL
 * @param url Image URL
 * @returns Promise with image dimensions
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}

/**
 * Helper function to generate a blur data URL for an image
 * @param url Image URL
 * @returns Promise with blur data URL
 */
export async function generateBlurDataURL(url: string): Promise<string> {
  try {
    // This would typically be done server-side
    // For client-side, we're using a simple placeholder
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXIDTjwAAAABJRU5ErkJggg==';
  } catch (error) {
    console.error('Error generating blur data URL:', error);
    return '';
  }
}
