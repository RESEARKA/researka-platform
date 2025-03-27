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
        const { initializeFirebase, isFirebaseInitialized } = await import('../config/firebase');
        
        // Check if Firebase is already initialized
        if (isFirebaseInitialized()) {
          console.log('FirebaseClientOnly: Firebase already initialized');
          setIsFirebaseReady(true);
          return;
        }
        
        // Initialize Firebase
        console.log('FirebaseClientOnly: Initializing Firebase');
        const success = initializeFirebase();
        
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

    // Initialize Firebase on client side
    initFirebase();

    // Cleanup function
    return () => {
      console.log('FirebaseClientOnly: Component unmounted');
    };
  }, []);

  // If there's an error, show error message
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error: {error}</p>
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
      {isFirebaseReady ? children : fallback}
    </ClientOnly>
  );
};

export default FirebaseClientOnly;
