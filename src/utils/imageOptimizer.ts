/**
 * Image optimization utility for Researka platform
 * Provides functions for responsive image loading and optimization
 */

// Get CDN URL from environment variables
const cdnUrl = import.meta.env.VITE_CDN_URL || '';

/**
 * Detect browser support for image formats
 * @returns Object with support status for each format
 */
export const detectImageSupport = (): { webp: boolean; avif: boolean } => {
  // Use memoization to avoid recalculating
  if (typeof window === 'undefined') {
    return { webp: false, avif: false };
  }
  
  // Check for WebP support
  const webp = document.createElement('canvas')
    .toDataURL('image/webp')
    .indexOf('data:image/webp') === 0;
    
  // Check for AVIF support (less reliable, so we'll be conservative)
  // Most modern browsers now support AVIF, but we'll default to false for safety
  const avif = false;
  
  return { webp, avif };
};

/**
 * Get optimized image URL with proper sizing and format based on device
 * @param imagePath - The original image path
 * @param size - The requested size (sm, md, lg, xl)
 * @param format - The requested format (auto, webp, avif, original)
 * @returns The optimized image URL
 */
export const getOptimizedImageUrl = (
  imagePath: string, 
  size: 'sm' | 'md' | 'lg' | 'xl' = 'md',
  format: 'auto' | 'webp' | 'avif' | 'original' = 'auto'
): string => {
  // If image is already an absolute URL or data URL, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  // Define size dimensions
  const dimensions = {
    sm: '300',  // Small devices
    md: '600',  // Medium devices
    lg: '1200', // Large devices
    xl: '2000', // Extra large devices
  };

  // Get the file extension
  const extension = imagePath.split('.').pop()?.toLowerCase() || 'jpg';
  
  // Determine the best format to use
  let outputFormat = extension;
  if (format === 'auto') {
    const { webp, avif } = detectImageSupport();
    if (avif) {
      outputFormat = 'avif';
    } else if (webp) {
      outputFormat = 'webp';
    }
  } else if (format !== 'original') {
    outputFormat = format;
  }
  
  // If using a CDN, format the URL accordingly
  if (cdnUrl) {
    const quality = getImageQuality();
    return `${cdnUrl}assets/images/${imagePath}?w=${dimensions[size]}&fm=${outputFormat}&q=${quality}`;
  }
  
  // For local images, we need to check if the converted format exists
  // Since we can't do this dynamically without server support, we'll use the original format
  // but in a production environment, you'd want to pre-generate these formats during build
  return `/assets/images/${imagePath}`;
};

/**
 * Generate srcSet for responsive images with format conversion
 * @param imagePath - The original image path
 * @param format - The requested format (auto, webp, avif, original)
 * @returns The srcSet string for responsive images
 */
export const generateSrcSet = (
  imagePath: string,
  format: 'auto' | 'webp' | 'avif' | 'original' = 'auto'
): string => {
  // If image is already an absolute URL or data URL, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  // Determine the best format to use
  let outputFormat = imagePath.split('.').pop()?.toLowerCase() || 'jpg';
  if (format === 'auto') {
    const { webp, avif } = detectImageSupport();
    if (avif) {
      outputFormat = 'avif';
    } else if (webp) {
      outputFormat = 'webp';
    }
  } else if (format !== 'original') {
    outputFormat = format;
  }
  
  const quality = getImageQuality();
  
  // If using a CDN, format the URL accordingly with different sizes
  if (cdnUrl) {
    return [
      `${cdnUrl}assets/images/${imagePath}?w=300&fm=${outputFormat}&q=${quality} 300w`,
      `${cdnUrl}assets/images/${imagePath}?w=600&fm=${outputFormat}&q=${quality} 600w`,
      `${cdnUrl}assets/images/${imagePath}?w=1200&fm=${outputFormat}&q=${quality} 1200w`,
      `${cdnUrl}assets/images/${imagePath}?w=2000&fm=${outputFormat}&q=${quality} 2000w`,
    ].join(', ');
  }
  
  // If no CDN, use local path
  return `/assets/images/${imagePath}`;
};

/**
 * Generate a low-quality image placeholder
 * @param imagePath - The original image path
 * @returns A low-quality placeholder image URL
 */
export const generatePlaceholder = (imagePath: string): string => {
  // If using a CDN, generate a tiny placeholder
  if (cdnUrl) {
    return `${cdnUrl}assets/images/${imagePath}?w=20&blur=200&q=30`;
  }
  
  // If no CDN, use a very small version of the image
  return getOptimizedImageUrl(imagePath, 'sm');
};

/**
 * Lazy load image with blur-up technique and format conversion
 * @param imagePath - The original image path
 * @returns An object with image URLs for different sizes and loading states
 */
export const getLazyLoadImageProps = (imagePath: string) => {
  const { webp, avif } = detectImageSupport();
  const format = avif ? 'avif' : (webp ? 'webp' : 'original');
  
  return {
    src: getOptimizedImageUrl(imagePath, 'md', format),
    srcSet: generateSrcSet(imagePath, format),
    loading: 'lazy' as const,
    decoding: 'async' as const,
    sizes: '(max-width: 640px) 300px, (max-width: 1024px) 600px, (max-width: 1920px) 1200px, 2000px',
    placeholder: generatePlaceholder(imagePath),
    // Add blur-up effect with CSS
    style: {
      backgroundColor: '#f0f0f0',
      transition: 'filter 0.3s ease-in-out',
    },
    onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.target as HTMLImageElement;
      img.style.filter = 'none';
    },
  };
};

/**
 * Get properties for a picture element with multiple source formats
 * @param imagePath - Path to the image
 * @param alt - Alt text for the image
 * @param className - Optional CSS class name
 * @returns Object with source elements for different formats and fallback img
 */
export const getPictureElementProps = (imagePath: string, alt: string, className?: string) => {
  // Base properties for the img element
  const imgProps = {
    src: getOptimizedImageUrl(imagePath, 'md', 'original'),
    alt,
    className,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    sizes: '(max-width: 640px) 300px, (max-width: 1024px) 600px, (max-width: 1920px) 1200px, 2000px',
  };
  
  // AVIF source element
  const avifSource = {
    srcSet: generateSrcSet(imagePath, 'avif'),
    type: 'image/avif',
  };
  
  // WebP source element
  const webpSource = {
    srcSet: generateSrcSet(imagePath, 'webp'),
    type: 'image/webp',
  };
  
  // Original format source element
  const originalSource = {
    srcSet: generateSrcSet(imagePath, 'original'),
    type: getImageMimeType(imagePath),
  };
  
  return {
    sources: [avifSource, webpSource, originalSource],
    img: imgProps,
  };
};

/**
 * Check if the current device is mobile
 * @returns True if the device is mobile, false otherwise
 */
export const isMobileDevice = (): boolean => {
  return window.innerWidth <= 768;
};

/**
 * Check if the current connection is slow
 * @returns True if the connection is slow, false otherwise
 */
export const isSlowConnection = (): boolean => {
  const connection = (navigator as any).connection;
  
  if (!connection) {
    return false;
  }
  
  // Check connection type
  if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
    return true;
  }
  
  // Check if saveData is enabled
  if (connection.saveData) {
    return true;
  }
  
  return false;
};

/**
 * Get image quality based on connection speed
 * @returns The appropriate image quality
 */
export const getImageQuality = (): number => {
  if (isSlowConnection()) {
    return 60; // Lower quality for slow connections
  }
  
  return isMobileDevice() ? 80 : 90; // Slightly lower quality for mobile
};

/**
 * Preload critical images
 * @param imagePaths - Array of critical image paths to preload
 */
export const preloadCriticalImages = (imagePaths: string[]): void => {
  if (typeof window === 'undefined') return;
  
  const { webp, avif } = detectImageSupport();
  const format = avif ? 'avif' : (webp ? 'webp' : 'original');
  
  imagePaths.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = getOptimizedImageUrl(path, 'md', format);
    document.head.appendChild(link);
  });
};

/**
 * Get the MIME type of an image based on its path
 * @param imagePath - The path to the image
 * @returns The MIME type of the image
 */
export const getImageMimeType = (imagePath: string): string => {
  const extension = imagePath.split('.').pop()?.toLowerCase() || 'jpg';
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'bmp':
      return 'image/bmp';
    case 'webp':
      return 'image/webp';
    case 'avif':
      return 'image/avif';
    default:
      return 'image/jpeg';
  }
};
