import React, { ReactNode } from 'react';
import useClient from '../hooks/useClient';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that ensures children are only rendered on the client side
 * This helps prevent hydration errors by avoiding rendering components
 * that use browser APIs during SSR
 * 
 * Now using the dedicated useClient hook for better client-side detection
 */
const ClientOnly: React.FC<ClientOnlyProps> = ({ 
  children, 
  fallback = null 
}) => {
  // Use our dedicated hook to check if we're on the client
  const isClient = useClient();
  
  // During SSR and initial client render before hydration, render the fallback
  // This ensures the HTML structure matches between server and client
  if (!isClient) {
    return <>{fallback}</>;
  }
  
  // Once on client and after hydration, render the actual children
  return <>{children}</>;
};

export default ClientOnly;
