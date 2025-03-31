import React from 'react';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { WalletProvider } from '../frontend/src/contexts/WalletContext';
import { ModalProvider } from '../contexts/ModalContext';
import { AuthProvider } from '../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Head from 'next/head';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/pagination.css'; // Import pagination styles
import useClient from '../hooks/useClient';
import { isClientSide } from '../utils/imageOptimizer';

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
  // Use our dedicated hook to check if we're on the client
  const isClient = useClient();
  
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
            <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
            <meta httpEquiv="Pragma" content="no-cache" />
            <meta httpEquiv="Expires" content="0" />
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
                  if (isClientSide()) {
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
