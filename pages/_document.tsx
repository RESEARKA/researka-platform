import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to blockchain RPC endpoints */}
        <link rel="preconnect" href="https://mainnet.era.zksync.io" />
        <link rel="preconnect" href="https://testnet.era.zksync.dev" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
