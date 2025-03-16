/**
 * Performance Optimizations Module for Researka
 * 
 * This module centralizes all performance optimization strategies including:
 * - Resource prefetching
 * - Image optimization
 * - Font optimization
 * - Script loading optimization
 */

import { initPerformanceMonitoring } from './performanceMonitor';

/**
 * Prefetches critical resources that will be needed soon
 */
const prefetchCriticalResources = (): void => {
  if (typeof window === 'undefined') return;

  // Only prefetch in production to avoid development overhead
  if (process.env.NODE_ENV !== 'production') return;

  // Helper to create and append link elements
  const prefetch = (url: string, as: 'script' | 'style' | 'image' | 'font' = 'script') => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = as;
    document.head.appendChild(link);
  };

  // Prefetch critical routes based on current page
  const currentPath = window.location.pathname;
  
  // Common resources to prefetch
  const commonResources = [
    { url: '/assets/fonts/inter-var.woff2', as: 'font' },
  ];
  
  // Route-specific prefetching
  if (currentPath === '/' || currentPath === '/home') {
    // Prefetch resources likely needed after visiting home
    prefetch('/assets/js/pages-[hash].js');
    prefetch('/assets/images/hero-image.webp', 'image');
  } else if (currentPath.includes('/articles')) {
    // Prefetch resources for article reading
    prefetch('/assets/js/pdf-viewer-[hash].js');
  }
  
  // Prefetch common resources
  commonResources.forEach(resource => prefetch(resource.url, resource.as as any));
};

/**
 * Optimizes font loading using font-display and preloading
 */
const optimizeFontLoading = (): void => {
  if (typeof window === 'undefined') return;
  
  // Add font-display: swap to all font faces
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-display: swap !important;
    }
  `;
  document.head.appendChild(style);
  
  // Preload critical fonts
  const fontUrls = [
    '/assets/fonts/inter-var.woff2',
  ];
  
  fontUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * Defers non-critical scripts and styles
 */
const deferNonCriticalResources = (): void => {
  if (typeof window === 'undefined') return;
  
  // Only apply in production
  if (process.env.NODE_ENV !== 'production') return;
  
  // Find non-critical scripts and defer them
  const scripts = Array.from(document.getElementsByTagName('script'));
  scripts.forEach(script => {
    // Skip if already has defer/async or is inline script
    if (script.defer || script.async || !script.src || script.src.includes('main')) return;
    
    // Create a new deferred script
    const deferredScript = document.createElement('script');
    deferredScript.src = script.src;
    deferredScript.defer = true;
    
    // Replace the original script
    script.parentNode?.replaceChild(deferredScript, script);
  });
};

/**
 * Initializes connection preloading for critical domains
 */
const preconnectToCriticalDomains = (): void => {
  if (typeof window === 'undefined') return;
  
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.researka.org',
    // Add CDN domains here
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * Initializes all performance optimizations
 */
export const initPerformanceOptimizations = (): void => {
  // Initialize monitoring first to track performance
  initPerformanceMonitoring();
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      preconnectToCriticalDomains();
      optimizeFontLoading();
    });
  } else {
    preconnectToCriticalDomains();
    optimizeFontLoading();
  }
  
  // Wait for window to load before prefetching to prioritize current page resources
  window.addEventListener('load', () => {
    // Use requestIdleCallback if available, otherwise setTimeout
    const scheduleTask = window.requestIdleCallback || ((cb) => setTimeout(cb, 1000));
    
    scheduleTask(() => {
      prefetchCriticalResources();
      deferNonCriticalResources();
    });
  });
};

export default {
  initPerformanceOptimizations,
  prefetchCriticalResources,
  optimizeFontLoading,
  deferNonCriticalResources,
  preconnectToCriticalDomains,
};
