import React from 'react';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { WalletProvider } from '../frontend/src/contexts/WalletContext';
import Head from 'next/head';

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
        <WalletProvider>
          <Component {...pageProps} />
        </WalletProvider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
