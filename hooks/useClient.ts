import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if code is running on client side
 * Helps prevent hydration errors by ensuring certain components
 * only render on the client side
 */
export default function useClient(): boolean {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // This will only run on the client side after hydration
    setIsClient(true);
  }, []);
  
  return isClient;
}
