import React, { useState, useEffect, useLayoutEffect, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that ensures children are only rendered on the client side
 * This helps prevent hydration errors by avoiding rendering components
 * that use browser APIs during SSR
 */
const ClientOnly: React.FC<ClientOnlyProps> = ({ 
  children, 
  fallback = null 
}) => {
  // Use state to track if we're on the client
  const [isClient, setIsClient] = useState(false);
  
  // Use useLayoutEffect for synchronous effect execution before browser paint
  // Fall back to useEffect for SSR environments where useLayoutEffect warns
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
  
  // Effect runs once after hydration
  useIsomorphicLayoutEffect(() => {
    // Set state to true when running on client
    setIsClient(true);
  }, []);
  
  // During SSR and initial client render before hydration, render the fallback
  // This ensures the HTML structure matches between server and client
  if (!isClient) {
    return <>{fallback}</>;
  }
  
  // Once on client and after hydration, render the actual children
  return <>{children}</>;
};

export default ClientOnly;
