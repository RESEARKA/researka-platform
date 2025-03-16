import React from 'react';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import Head from 'next/head';
import { ErrorBoundary } from '../components';
import { AuthProvider } from '../contexts/AuthContext';
import { ModalProvider } from '../contexts/ModalContext';
import dynamic from 'next/dynamic';

// Import WalletProvider with SSR disabled to prevent window.ethereum access during server rendering
const WalletProviderWithNoSSR = dynamic(
  () => import('../components/WalletProvider').then(mod => ({ default: mod.WalletProvider })),
  { ssr: false }
);

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Researka - Decentralizing Academic Research</title>
        <meta name="description" content="Researka - A decentralized platform for academic research and peer review" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://mainnet.era.zksync.io" />
        <link rel="dns-prefetch" href="https://mainnet.era.zksync.io" />
      </Head>
      <ChakraProvider>
        <ErrorBoundary>
          <AuthProvider>
            <WalletProviderWithNoSSR>
              <ModalProvider>
                <Component {...pageProps} />
              </ModalProvider>
            </WalletProviderWithNoSSR>
          </AuthProvider>
        </ErrorBoundary>
      </ChakraProvider>
    </>
  );
}
