import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholderColor?: string;
  loading?: 'lazy' | 'eager';
  fallbackSrc?: string;
  webpSrc?: string;
  avifSrc?: string;
}

/**
 * LazyImage Component
 * 
 * A performance-optimized image component that:
 * 1. Supports lazy loading
 * 2. Provides a color placeholder while loading
 * 3. Supports modern image formats (WebP, AVIF) with fallbacks
 * 4. Implements intersection observer for viewport detection
 * 5. Includes error handling with fallback image
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholderColor = '#f3f4f6',
  loading = 'lazy',
  fallbackSrc,
  webpSrc,
  avifSrc
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Set up intersection observer to detect when image enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load images when they're within 200px of viewport
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Handle image load event
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  // Handle image error event
  const handleError = () => {
    setError(true);
    if (fallbackSrc) {
      setIsLoaded(false);
    }
  };
  
  // Create placeholder style
  const placeholderStyle = {
    backgroundColor: placeholderColor,
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : '200px',
  };
  
  // Determine which image source to use
  const imageSrc = error && fallbackSrc ? fallbackSrc : src;
  
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width: width ? `${width}px` : '100%' }}>
      {/* Placeholder shown until image loads */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 animate-pulse" 
          style={placeholderStyle}
          aria-hidden="true"
        />
      )}
      
      {/* Only load image when in viewport */}
      {(isInView || loading === 'eager') && (
        <picture>
          {/* AVIF format - best compression, modern browsers */}
          {avifSrc && <source srcSet={avifSrc} type="image/avif" />}
          
          {/* WebP format - good compression, wide support */}
          {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
          
          {/* Fallback image format (jpg/png) */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            onLoad={handleLoad}
            onError={handleError}
            className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </picture>
      )}
    </div>
  );
};

export default LazyImage;
