import { useEffect, useState, ReactNode } from 'react';
import ClientOnly from './ClientOnly';

interface FirebaseClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
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
  fallback = <div className="p-4 text-center">Loading...</div> 
}) => {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        // Dynamically import Firebase config to avoid SSR issues
        const { initializeFirebaseOnClient, isFirebaseInitialized } = await import('../config/firebase');
        
        // Check if Firebase is already initialized
        if (isFirebaseInitialized()) {
          console.log('FirebaseClientOnly: Firebase already initialized');
          setIsFirebaseReady(true);
          return;
        }
        
        // Initialize Firebase
        console.log('FirebaseClientOnly: Initializing Firebase');
        const success = await initializeFirebaseOnClient();
        
        if (success) {
          console.log('FirebaseClientOnly: Firebase initialization successful');
          setIsFirebaseReady(true);
        } else {
          console.error('FirebaseClientOnly: Firebase initialization failed');
          setError('Failed to initialize Firebase services');
        }
      } catch (err) {
        console.error('FirebaseClientOnly: Error initializing Firebase:', err);
        setError('Error initializing Firebase services');
      }
    };

    initFirebase();
  }, []);

  // Show error state if initialization failed
  if (error) {
    return (
      <ClientOnly fallback={fallback}>
        <div className="p-4 text-center text-red-500">
          <p>Error: {error}</p>
          <p className="text-sm mt-2">Please try refreshing the page</p>
        </div>
      </ClientOnly>
    );
  }

  // Render children only when Firebase is ready and we're on the client
  return (
    <ClientOnly fallback={fallback}>
      {isFirebaseReady ? children : fallback}
    </ClientOnly>
  );
};

export default FirebaseClientOnly;
