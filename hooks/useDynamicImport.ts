/**
 * useDynamicImport Hook
 * 
 * Custom hook for dynamically importing components with loading and error states.
 * This hook helps implement code splitting for heavy components in the RESEARKA platform.
 * 
 * @example
 * const { Component, isLoading, error } = useDynamicImport(() => import('../components/HeavyComponent'));
 * 
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * if (!Component) return null;
 * 
 * return <Component {...props} />;
 */

import { useState, useEffect, ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { createLogger, LogCategory } from '../utils/logger';

// Create a logger instance for this hook
const logger = createLogger('useDynamicImport');

/**
 * Options for dynamic imports
 */
export interface DynamicImportOptions {
  /**
   * Whether to use server-side rendering
   */
  ssr?: boolean;
  
  /**
   * Component to show while loading
   */
  LoadingComponent?: ComponentType<any>;
  
  /**
   * Delay before showing loading component (ms)
   */
  delay?: number;
  
  /**
   * Timeout before showing error (ms)
   */
  timeout?: number;
}

/**
 * Result of the useDynamicImport hook
 */
export interface DynamicImportResult<T = any> {
  /**
   * The dynamically imported component
   */
  Component: ComponentType<T> | null;
  
  /**
   * Whether the component is loading
   */
  isLoading: boolean;
  
  /**
   * Error if import failed
   */
  error: Error | null;
  
  /**
   * Function to retry the import
   */
  retry: () => void;
}

/**
 * Custom hook for dynamically importing components
 * 
 * @param importFn Function that returns a dynamic import (e.g., () => import('./Component'))
 * @param options Dynamic import options
 * @returns Object with the dynamically imported component, loading state, and error
 */
export function useDynamicImport<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: DynamicImportOptions = {}
): DynamicImportResult<T> {
  const { 
    ssr = false, 
    timeout = 10000 
  } = options;
  
  // Component state
  const [Component, setComponent] = useState<ComponentType<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // Import the component
  const loadComponent = async () => {
    // Reset state
    setIsLoading(true);
    setError(null);
    
    // Set up timeout timer
    const timeoutTimer = setTimeout(() => {
      setError(new Error(`Dynamic import timed out after ${timeout}ms`));
      setIsLoading(false);
      
      logger.warn('Dynamic import timed out', {
        context: { timeout },
        category: LogCategory.PERFORMANCE
      });
    }, timeout);
    
    try {
      // Import the component
      const result = await importFn();
      
      // Get the default export
      const component = result.default;
      
      // Update state
      setComponent(component);
      setIsLoading(false);
      
      logger.debug('Dynamic import successful', {
        category: LogCategory.PERFORMANCE
      });
    } catch (err: any) {
      // Handle error
      setError(err);
      setIsLoading(false);
      
      logger.error('Dynamic import failed', {
        context: { error: err },
        category: LogCategory.ERROR
      });
    } finally {
      // Clear timer
      clearTimeout(timeoutTimer);
    }
  };
  
  // Function to retry loading the component
  const retry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  // Load the component on mount or when retry is called
  useEffect(() => {
    // If SSR is enabled and we're on the server, don't load the component
    if (ssr && typeof window === 'undefined') {
      return;
    }
    
    loadComponent();
  }, [ssr, retryCount]);
  
  // Return the component, loading state, and error
  return {
    Component,
    isLoading,
    error,
    retry
  };
}

/**
 * Helper function to create a dynamically imported component
 * 
 * @param importFn Function that returns a dynamic import
 * @param options Dynamic import options
 * @returns Dynamically imported component
 */
export function createDynamicComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: DynamicImportOptions = {}
): ComponentType<T> {
  // Use Next.js dynamic import with proper type handling
  return dynamic(
    () => importFn().catch(err => {
      logger.error('Error loading dynamic component', {
        context: { error: err },
        category: LogCategory.ERROR
      });
      return { default: (() => null) as unknown as ComponentType<T> };
    }),
    {
      ssr: options.ssr ?? false,
      // Convert the loading component to a function that returns an element
      loading: options.LoadingComponent 
        ? () => options.LoadingComponent as unknown as JSX.Element
        : undefined
    }
  );
}
