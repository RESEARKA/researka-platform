import { useState, useEffect } from 'react';
import { initializeFirebase, isFirebaseInitialized } from '../config/firebase';

/**
 * Custom hook to ensure Firebase is initialized on the client side
 * and provide a clean way for components to know when Firebase is ready
 * 
 * @returns boolean indicating if Firebase is initialized and ready to use
 */
export function useFirebaseInitialized(): boolean {
  const [initialized, setInitialized] = useState<boolean>(false);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check if already initialized
    if (isFirebaseInitialized()) {
      setInitialized(true);
      return;
    }
    
    // Initialize Firebase
    const result = initializeFirebase();
    setInitialized(result);
    
    // Log initialization status
    console.log(`Firebase: Initialization ${result ? 'successful' : 'failed'} in useFirebaseInitialized hook`);
  }, []);
  
  return initialized;
}

export default useFirebaseInitialized;
