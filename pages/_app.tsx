import React from 'react';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Import WalletProvider as a client-side only component
const WalletProviderClient = dynamic(
  () => import('../frontend/src/contexts/WalletContext').then(mod => mod.WalletProvider),
  { ssr: false }
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Researka Platform</title>
        <meta name="description" content="Decentralized Academic Publishing Solution" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Add DNS prefetch for zkSync resources */}
        <link rel="dns-prefetch" href="https://mainnet.era.zksync.io" />
      </Head>
      <ChakraProvider>
        <WalletProviderClient>
          <Component {...pageProps} />
        </WalletProviderClient>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
