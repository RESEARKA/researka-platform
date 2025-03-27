import { ReactNode } from 'react';
import ClientOnly from './ClientOnly';
import useFirebaseInitialization, { FirebaseStatus } from '../hooks/useFirebaseInitialization';

interface FirebaseClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  /**
   * Options for Firebase initialization
   */
  options?: {
    /**
     * Timeout in milliseconds before initialization is considered failed
     * Default: 10000 (10 seconds)
     */
    timeoutMs?: number;
    
    /**
     * Maximum number of initialization attempts
     * Default: 3
     */
    maxAttempts?: number;
    
    /**
     * Whether to enable detailed logging
     * Default: false
     */
    enableLogging?: boolean;
  };
}

/**
 * FirebaseClientOnly component ensures that children are only rendered:
 * 1. On the client side (not during SSR)
 * 2. After Firebase has been properly initialized
 * 
 * This prevents hydration errors and Firebase-related errors
 */
const FirebaseClientOnly: React.FC<FirebaseClientOnlyProps> = ({ 
  children, 
  fallback = <div className="p-4 text-center">Loading...</div>,
  options = {}
}) => {
  // Use the centralized Firebase initialization hook
  const { status, error } = useFirebaseInitialization({
    timeoutMs: options.timeoutMs || 10000,
    maxAttempts: options.maxAttempts || 3,
    enableLogging: options.enableLogging || false
  });

  // If there's an error, show error message
  if (status === FirebaseStatus.ERROR || status === FirebaseStatus.TIMEOUT) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error: {error?.message || 'Failed to initialize Firebase'}</p>
        <button 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </button>
      </div>
    );
  }

  // Use ClientOnly to ensure we're on the client side, then check if Firebase is ready
  return (
    <ClientOnly>
      {status === FirebaseStatus.INITIALIZED ? children : fallback}
    </ClientOnly>
  );
};

export default FirebaseClientOnly;
