import React, { ReactNode } from 'react';
import useClient from '../hooks/useClient';
import ClientLoadingSkeleton from './ui/ClientLoadingSkeleton';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  showSkeleton?: boolean;
  skeletonHeight?: string | number;
  skeletonCount?: number;
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
  fallback = null,
  showSkeleton = false,
  skeletonHeight = '20px',
  skeletonCount = 3
}) => {
  // Use our dedicated hook to check if we're on the client
  const isClient = useClient();
  
  // During SSR and initial client render before hydration, render the fallback
  // This ensures the HTML structure matches between server and client
  if (!isClient) {
    // If showSkeleton is true, use the skeleton component as fallback
    if (showSkeleton) {
      return <ClientLoadingSkeleton height={skeletonHeight} count={skeletonCount} />;
    }
    return <>{fallback}</>;
  }
  
  // Once on client and after hydration, render the actual children
  return <>{children}</>;
};

export default ClientOnly;
