import React, { ReactNode, useEffect, useState } from 'react';
import { isClientSide } from '../utils/hydrationHelpers';

interface BrowserOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  onlyAfterFirstRender?: boolean;
}

/**
 * Component that ensures content is only rendered in a browser environment
 * This helps prevent hydration errors with browser-specific APIs
 * 
 * @param children Content to render only in browser
 * @param fallback Optional fallback content to show during SSR
 * @param onlyAfterFirstRender If true, will only show content after first render, even on client
 */
function BrowserOnly({ 
  children, 
  fallback = null, 
  onlyAfterFirstRender = false 
}: BrowserOnlyProps) {
  // Track if we're mounted on the client
  const [isMounted, setIsMounted] = useState(!onlyAfterFirstRender && isClientSide());
  
  // Effect runs once after hydration is complete
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // If not mounted or not on client, show fallback
  if (!isMounted) {
    return <>{fallback}</>;
  }
  
  // Otherwise show children
  return <>{children}</>;
}

export default BrowserOnly;
