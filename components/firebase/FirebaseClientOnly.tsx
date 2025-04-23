import { useEffect, useState, PropsWithChildren } from 'react';
import ClientOnly from '../common/ClientOnly';
import styles from '../../styles/Hydration.module.css';

interface FirebaseClientOnlyProps extends PropsWithChildren {
  fallback?: React.ReactNode;
}

/**
 * FirebaseClientOnly component
 * 
 * Ensures Firebase-dependent components only render client-side
 * to prevent hydration mismatches, with an optional fallback/placeholder.
 */
const FirebaseClientOnly: React.FC<FirebaseClientOnlyProps> = ({ 
  children, 
  fallback = null 
}) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <ClientOnly>
      <div className={isClient ? styles.hydrated : styles.hydrating}>
        {isClient ? children : fallback}
      </div>
    </ClientOnly>
  );
};

export default FirebaseClientOnly;
