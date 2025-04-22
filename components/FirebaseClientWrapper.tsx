import dynamic from 'next/dynamic';

// Import FirebaseClientOnly with SSR disabled to prevent hydration errors
const FirebaseClientOnly = dynamic(() => import('./FirebaseClientOnly'), {
  ssr: false, // Crucial setting that prevents server-side rendering of this component
});

/**
 * A wrapper component that safely loads Firebase-dependent components only on the client side.
 * This pattern isolates all Firebase code from server-side rendering to prevent hydration errors.
 * 
 * Usage:
 * ```tsx
 * <FirebaseClientWrapper>
 *   <YourFirebaseDependentComponent />
 * </FirebaseClientWrapper>
 * ```
 */
export function FirebaseClientWrapper({ children }: { children: React.ReactNode }) {
  // This outer component can be safely included in SSR components
  return <FirebaseClientOnly>{children}</FirebaseClientOnly>;
}

export default FirebaseClientWrapper;
