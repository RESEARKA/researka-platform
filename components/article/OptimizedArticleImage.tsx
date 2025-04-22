/**
 * OptimizedArticleImage Component
 * 
 * A specialized image component for article images in the RESEARKA platform.
 * This component uses Next.js Image for optimization and provides article-specific styling.
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { Box, Skeleton, useColorModeValue } from '@chakra-ui/react';
import { useOptimizedImage } from '../../hooks/useOptimizedImage';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger instance for this component
const logger = createLogger('OptimizedArticleImage');

// Props for the OptimizedArticleImage component
interface OptimizedArticleImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  caption?: string;
  credit?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedArticleImage component
 * A specialized image component for article images
 */
export const OptimizedArticleImage: React.FC<OptimizedArticleImageProps> = ({
  src,
  alt,
  width = 800,
  height = 450,
  className,
  priority = false,
  caption,
  credit,
  objectFit = 'cover',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  
  // Colors for caption and credit
  const captionBg = useColorModeValue('gray.50', 'gray.800');
  const captionBorder = useColorModeValue('gray.200', 'gray.700');
  const captionText = useColorModeValue('gray.700', 'gray.300');
  const creditText = useColorModeValue('gray.500', 'gray.500');
  
  // Use our custom hook for image optimization
  const {
    placeholderImage,
    getImageProps
  } = useOptimizedImage(src, alt, {
    width,
    height,
    quality: 85,
    priority,
    placeholder: 'blur'
  });
  
  // Handle image load event
  const handleLoad = () => {
    setIsLoaded(true);
    logger.debug('Article image loaded', {
      context: { src, alt },
      category: LogCategory.UI
    });
    if (onLoad) onLoad();
  };
  
  // Handle image error event
  const handleError = () => {
    setLoadError(true);
    logger.error('Error loading article image', {
      context: { src, alt },
      category: LogCategory.ERROR
    });
    if (onError) onError();
  };
  
  // If there's an error loading the image, show the placeholder
  const imageSrc = loadError ? placeholderImage : src;
  
  // Get the image props from our hook
  const imageProps = getImageProps({
    src: imageSrc,
    alt,
    className: `researka-article-image ${className || ''}`,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw'
  });
  
  return (
    <Box
      position="relative"
      width="100%"
      marginY={6}
      borderRadius="md"
      overflow="hidden"
      boxShadow="md"
      className="researka-article-image-container"
    >
      {/* Image container with aspect ratio */}
      <Box
        position="relative"
        paddingBottom={`${(height / width) * 100}%`}
        overflow="hidden"
      >
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
          fill
          style={{
            objectFit,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      </Box>
      
      {/* Caption and credit */}
      {(caption || credit) && (
        <Box
          p={3}
          bg={captionBg}
          borderTop="1px"
          borderColor={captionBorder}
        >
          {caption && (
            <Box
              fontSize="sm"
              fontWeight="medium"
              color={captionText}
              mb={credit ? 1 : 0}
            >
              {caption}
            </Box>
          )}
          
          {credit && (
            <Box
              fontSize="xs"
              color={creditText}
              fontStyle="italic"
            >
              Credit: {credit}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

/**
 * ArticleFeaturedImage component
 * A specialized image component for article featured images
 */
export const ArticleFeaturedImage: React.FC<OptimizedArticleImageProps> = (props) => {
  return (
    <OptimizedArticleImage
      {...props}
      width={1200}
      height={630}
      priority={true}
      className={`researka-featured-image ${props.className || ''}`}
    />
  );
};

/**
 * ArticleThumbnailImage component
 * A specialized image component for article thumbnails
 */
export const ArticleThumbnailImage: React.FC<OptimizedArticleImageProps> = (props) => {
  return (
    <OptimizedArticleImage
      {...props}
      width={300}
      height={200}
      className={`researka-thumbnail-image ${props.className || ''}`}
    />
  );
};

export default OptimizedArticleImage;
