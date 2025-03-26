import { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ClientOnly component ensures that children are only rendered on the client side
 * This prevents hydration errors by avoiding rendering components that use browser APIs during SSR
 */
const ClientOnly: React.FC<ClientOnlyProps> = ({ 
  children, 
  fallback = null 
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client after hydration
    setIsClient(true);
  }, []);

  // Return fallback (or null) during SSR, and children only on client
  return isClient ? <>{children}</> : <>{fallback}</>;
};

export default ClientOnly;
