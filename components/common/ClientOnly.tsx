import dynamic from 'next/dynamic';
import { PropsWithChildren } from 'react';

/**
 * ClientOnly component
 * 
 * A wrapper component that ensures its children are only rendered on the client side
 * and not during server-side rendering, preventing hydration mismatches.
 */
const ClientOnly = dynamic(() => Promise.resolve(
  ({ children }: PropsWithChildren) => <>{children}</>
), { ssr: false });

export default ClientOnly;
