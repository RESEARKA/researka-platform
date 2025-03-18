/**
 * Image Optimizer Utility
 * 
 * This utility provides functions for optimizing images based on device type,
 * connection speed, and screen size.
 */

interface ImageOptions {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'original';
  placeholder?: boolean;
}

interface SrcSetItem {
  src: string;
  width: number;
}

/**
 * Detects the connection speed of the user
 * @returns 'slow' | 'medium' | 'fast'
 */
export function detectConnectionSpeed(): 'slow' | 'medium' | 'fast' {
  if (typeof navigator === 'undefined') return 'medium';
  
  // Use the Network Information API if available
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  if (connection) {
    const { effectiveType, downlink } = connection;
    
    if (effectiveType === '4g' || downlink > 2) return 'fast';
    if (effectiveType === '3g' || (downlink > 0.5 && downlink <= 2)) return 'medium';
    return 'slow';
  }
  
  // Fallback to assuming medium speed if API not available
  return 'medium';
}

/**
 * Determines if the current device is mobile
 * @returns boolean
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Generates a quality value based on connection speed
 * @returns number between 30-90
 */
export function getQualityByConnection(): number {
  const speed = detectConnectionSpeed();
  
  switch (speed) {
    case 'fast': return 85;
    case 'medium': return 70;
    case 'slow': return 50;
    default: return 70;
  }
}

/**
 * Generates an optimized image URL
 * @param options ImageOptions
 * @returns string - optimized image URL
 */
export function getOptimizedImageUrl(options: ImageOptions): string {
  const { 
    src, 
    width = 0, 
    height = 0, 
    quality = getQualityByConnection(),
    format = 'webp',
    placeholder = false
  } = options;
  
  // If we're in a server environment or the src is already an absolute URL
  if (typeof window === 'undefined' || src.startsWith('http') || src.startsWith('data:')) {
    return src;
  }
  
  // For local development, just return the original
  if (process.env.NODE_ENV === 'development' && !process.env.ENABLE_IMAGE_OPTIMIZATION) {
    return src;
  }
  
  // In production, use CDN or image optimization service
  const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || '';
  
  // If using a placeholder, return a tiny image
  if (placeholder) {
    return `${baseUrl}/_next/image?url=${encodeURIComponent(src)}&w=20&q=30&blur=true`;
  }
  
  // Construct the optimized URL
  let optimizedUrl = `${baseUrl}/_next/image?url=${encodeURIComponent(src)}`;
  
  if (width > 0) optimizedUrl += `&w=${width}`;
  if (height > 0) optimizedUrl += `&h=${height}`;
  if (quality > 0) optimizedUrl += `&q=${quality}`;
  if (format !== 'original') optimizedUrl += `&fm=${format}`;
  
  return optimizedUrl;
}

/**
 * Generates a srcSet for responsive images
 * @param src Image source
 * @param widths Array of widths to generate
 * @param format Image format
 * @returns string - srcSet attribute value
 */
export function generateSrcSet(
  src: string, 
  widths: number[] = [320, 640, 768, 1024, 1280, 1920], 
  format: 'webp' | 'avif' | 'jpeg' | 'png' | 'original' = 'webp'
): string {
  return widths
    .map(width => {
      const optimizedSrc = getOptimizedImageUrl({
        src,
        width,
        format,
        quality: getQualityByConnection()
      });
      return `${optimizedSrc} ${width}w`;
    })
    .join(', ');
}

/**
 * Creates a responsive image object with src and srcSet
 * @param src Image source
 * @param options Additional options
 * @returns Object with src and srcSet
 */
export function createResponsiveImage(
  src: string,
  options: {
    widths?: number[];
    format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'original';
    defaultWidth?: number;
    quality?: number;
  } = {}
): { src: string; srcSet: string } {
  const { 
    widths = [320, 640, 768, 1024, 1280, 1920],
    format = 'webp',
    defaultWidth = 1280,
    quality = 80
  } = options;
  
  return {
    src: getOptimizedImageUrl({ src, width: defaultWidth, format, quality }),
    srcSet: generateSrcSet(src, widths, format)
  };
}

export default {
  getOptimizedImageUrl,
  generateSrcSet,
  createResponsiveImage,
  detectConnectionSpeed,
  isMobileDevice,
  getQualityByConnection
};
