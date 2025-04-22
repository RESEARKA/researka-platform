/**
 * OptimizedImage Component
 * 
 * A wrapper around Next.js Image component with optimizations and fallbacks.
 * This component should be used for all images in the RESEARKA platform.
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { Box, Skeleton } from '@chakra-ui/react';
import { useOptimizedImage, ImageOptimizationOptions } from '../../hooks/useOptimizedImage';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component
 * Wrapper around Next.js Image with optimizations and fallbacks
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  objectFit = 'cover',
  priority = false,
  quality = 80,
  sizes,
  placeholder,
  blurDataURL,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Options for the useOptimizedImage hook
  const options: ImageOptimizationOptions = {
    width,
    height,
    quality,
    priority,
    placeholder,
    blurDataURL
  };

  // Use our custom hook for image optimization
  const {
    isLoading,
    hasError,
    getImageProps,
    placeholderImage
  } = useOptimizedImage(src, alt, options);

  // Handle image load event
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle image error event
  const handleError = () => {
    setLoadError(true);
    if (onError) onError();
  };

  // If there's an error loading the image, show the placeholder
  const imageSrc = loadError ? placeholderImage : src;

  // Get the image props from our hook
  const imageProps = getImageProps({
    src: imageSrc,
    alt,
    className,
    sizes: sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  });

  return (
    <Box position="relative" overflow="hidden" width={width} height={height}>
      {/* Show skeleton while loading */}
      {!isLoaded && (
        <Skeleton
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          startColor="gray.100"
          endColor="gray.300"
        />
      )}
      
      {/* Next.js Image component with optimization */}
      <Image
        {...imageProps}
        style={{
          objectFit,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </Box>
  );
};

/**
 * OptimizedArticleImage component
 * Specialized version of OptimizedImage for article images
 */
export const OptimizedArticleImage: React.FC<OptimizedImageProps> = (props) => {
  return (
    <OptimizedImage
      {...props}
      quality={85}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
      className={`article-image ${props.className || ''}`}
    />
  );
};

/**
 * OptimizedProfileImage component
 * Specialized version of OptimizedImage for profile images
 */
export const OptimizedProfileImage: React.FC<OptimizedImageProps & { isRound?: boolean }> = ({
  isRound = true,
  ...props
}) => {
  return (
    <Box
      borderRadius={isRound ? "full" : "md"}
      overflow="hidden"
      width={props.width || 64}
      height={props.height || 64}
    >
      <OptimizedImage
        {...props}
        quality={90}
        objectFit="cover"
        sizes="(max-width: 768px) 64px, 128px"
        className={`profile-image ${props.className || ''}`}
      />
    </Box>
  );
};

export default OptimizedImage;
