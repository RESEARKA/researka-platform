import { useState, useEffect, useLayoutEffect } from 'react';

/**
 * Custom hook to detect if code is running on client side
 * Helps prevent hydration errors by ensuring certain components
 * only render on the client side
 */
export default function useClient(): boolean {
  // Use a ref-like pattern with useState to avoid unnecessary re-renders
  const [isClient, setIsClient] = useState(false);
  
  // Use useLayoutEffect for synchronous effect execution before browser paint
  // Fall back to useEffect for SSR environments where useLayoutEffect warns
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
  
  useIsomorphicLayoutEffect(() => {
    // This will only run on the client side after hydration
    // Using immediate state update to minimize flicker
    setIsClient(true);
  }, []);
  
  return isClient;
}
