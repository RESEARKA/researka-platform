import React from 'react';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { WalletProvider } from '../frontend/src/contexts/WalletContext';
import { ModalProvider } from '../contexts/ModalContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Head from 'next/head';
import ErrorBoundary from '../components/ErrorBoundary';
import * as Sentry from '@sentry/nextjs';
import AnimatedPage from '../components/AnimatedPage';

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
      </Head>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <WalletProvider>
            <ModalProvider>
              <ErrorBoundary onReset={() => {
                // Optional: Reset any state or perform actions when error boundary resets
                console.log('Error boundary reset');
              }}>
                <AnimatedPage>
                  <Component {...pageProps} />
                </AnimatedPage>
              </ErrorBoundary>
            </ModalProvider>
          </WalletProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
