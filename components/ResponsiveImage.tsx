import React, { useState, useEffect } from 'react';
import { Box, Image, Skeleton } from '@chakra-ui/react';
import { createResponsiveImage, isMobileDevice } from '../utils/imageOptimizer';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  borderRadius?: string | number;
  quality?: number;
  priority?: boolean;
  fallbackSrc?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  objectFit = 'cover',
  borderRadius = 'md',
  quality,
  priority = false,
  fallbackSrc = '/images/placeholder.jpg',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  loading = 'lazy',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Determine if we're on a mobile device for optimizations
  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);
  
  // Generate responsive image attributes
  const { src: optimizedSrc, srcSet } = createResponsiveImage(src, {
    format: 'webp',
    defaultWidth: typeof width === 'number' ? width : 1280,
    // Use smaller image sizes for mobile devices
    widths: isMobile 
      ? [320, 480, 640, 768] 
      : [640, 768, 1024, 1280, 1920],
    quality: quality || 80 // Use provided quality or default to 80
  });
  
  return (
    <Box position="relative" width={width} height={height} overflow="hidden">
      {!isLoaded && (
        <Skeleton
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          borderRadius={borderRadius}
          startColor="gray.100"
          endColor="gray.300"
        />
      )}
      <Image
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width="100%"
        height="100%"
        objectFit={objectFit}
        borderRadius={borderRadius}
        fallbackSrc={fallbackSrc}
        loading={priority ? 'eager' : loading}
        onLoad={() => setIsLoaded(true)}
        opacity={isLoaded ? 1 : 0}
        transition="opacity 0.3s ease-in-out"
      />
    </Box>
  );
};

export default ResponsiveImage;
