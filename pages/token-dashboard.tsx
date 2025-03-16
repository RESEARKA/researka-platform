import React, { Suspense, useState, useEffect } from 'react';
import { Box, Container, Heading, Text, VStack, Grid, GridItem, Skeleton } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useWallet } from '../frontend/src/contexts/WalletContext';
import { getContractAddress, NETWORKS } from '../frontend/src/config/contracts';

// Dynamically import components with code splitting for better performance
const WalletConnect = dynamic(
  () => import('../frontend/src/components/wallet/WalletConnect'),
  { ssr: false, loading: () => <Skeleton height="50px" width="200px" /> }
);

const TokenBalance = dynamic(
  () => import('../frontend/src/components/token/TokenBalance'),
  { ssr: false, loading: () => <Skeleton height="100px" /> }
);

const TokenTransactions = dynamic(
  () => import('../frontend/src/components/token/TokenTransactions'),
  { ssr: false, loading: () => <Skeleton height="300px" /> }
);

const StakingPositions = dynamic(
  () => import('../frontend/src/components/token/StakingPositions'),
  { ssr: false, loading: () => <Skeleton height="300px" /> }
);

const TokenDashboardPage: React.FC = () => {
  const { chainId } = useWallet();
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [treasuryAddress, setTreasuryAddress] = useState<string>('');

  // Get contract addresses based on current network
  useEffect(() => {
    try {
      // Default to localhost if chainId is not available
      const networkId = chainId || NETWORKS.LOCALHOST;

      const tokenAddr = getContractAddress('token', networkId);
      const treasuryAddr = getContractAddress('treasury', networkId);

      setTokenAddress(tokenAddr);
      setTreasuryAddress(treasuryAddr);
    } catch (error) {
      console.error('Error getting contract addresses:', error);
      // Fallback to localhost addresses if there's an error
      setTokenAddress(getContractAddress('token', NETWORKS.LOCALHOST));
      setTreasuryAddress(getContractAddress('treasury', NETWORKS.LOCALHOST));
    }
  }, [chainId]);

  return (
    <>
      <Head>
        <title>Token Dashboard | Researka Platform</title>
        <meta name="description" content="Manage your Researka tokens and staking positions" />
      </Head>

      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" mb={4}>
            <Heading as="h1" size="xl">Token Dashboard</Heading>
            <Text color="gray.600">Manage your Researka tokens and staking positions</Text>
          </Box>

          <Box display="flex" justifyContent="flex-end" mb={4}>
            <Suspense fallback={<Skeleton height="50px" width="200px" />}>
              <WalletConnect />
            </Suspense>
          </Box>

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
            <GridItem>
              <Suspense fallback={<Skeleton height="100px" />}>
                <TokenBalance tokenAddress={tokenAddress} />
              </Suspense>
            </GridItem>

            <GridItem>
              <Suspense fallback={<Skeleton height="100px" />}>
                <StakingPositions treasuryAddress={treasuryAddress} />
              </Suspense>
            </GridItem>
          </Grid>

          <Suspense fallback={<Skeleton height="300px" />}>
            <TokenTransactions tokenAddress={tokenAddress} treasuryAddress={treasuryAddress} />
          </Suspense>
        </VStack>
      </Container>
    </>
  );
};

export default TokenDashboardPage;
