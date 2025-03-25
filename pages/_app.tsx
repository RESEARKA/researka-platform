import React from 'react';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { WalletProvider } from '../frontend/src/contexts/WalletContext';
import { ModalProvider } from '../contexts/ModalContext';
import { AuthProvider } from '../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Head from 'next/head';
import ErrorBoundary from '../components/ErrorBoundary';
import * as Sentry from '@sentry/nextjs';
import AnimatedPage from '../components/AnimatedPage';
import '../styles/pagination.css'; // Import pagination styles

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  // Add a client-side only state to prevent hydration mismatch
  const [isClient, setIsClient] = React.useState(false);
  
  // Only run on client-side
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <>
      <Head>
        <title>Researka Platform</title>
        <meta name="description" content="Decentralized Academic Publishing Solution" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Add DNS prefetch for zkSync resources */}
        <link rel="dns-prefetch" href="https://mainnet.era.zksync.io" />
        {/* Add preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Disable caching for development */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
            <meta http-equiv="Pragma" content="no-cache" />
            <meta http-equiv="Expires" content="0" />
          </>
        )}
      </Head>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <AuthProvider>
            <WalletProvider>
              <ModalProvider>
                <ErrorBoundary onReset={() => {
                  // Optional: Reset any state or perform actions when error boundary resets
                  console.log('Error boundary reset');
                  // Force a hard refresh on error
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}>
                  {/* Render without animations until client-side hydration is complete */}
                  {isClient ? (
                    <Component {...pageProps} />
                  ) : (
                    <div style={{ visibility: 'hidden' }}>
                      <Component {...pageProps} />
                    </div>
                  )}
                </ErrorBoundary>
              </ModalProvider>
            </WalletProvider>
          </AuthProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
