import React, { useState, useEffect } from 'react';
import { Container, Heading, VStack, Box, Grid, GridItem, Text, Skeleton, Button, Flex, Alert, AlertIcon } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useWallet } from '../frontend/src/contexts/WalletContext';
import { getContractAddress, NETWORKS } from '../frontend/src/config/contracts';
import { FiExternalLink } from 'react-icons/fi';

// Import tree-shaking friendly token components
// This technique ensures components are only loaded when feature flag is true
import { 
  TokenBalance, 
  TokenTransactions, 
  StakingPositions,
  TokenDashboard 
} from '../frontend/src/utils/token-components';

// Dynamically import components with code splitting for better performance
const WalletConnect = dynamic(
  () => import('../frontend/src/components/wallet/WalletConnect'),
  { ssr: false, loading: () => <Skeleton height="50px" width="200px" /> }
);

const TokenDashboardPage: React.FC = () => {
  const { chainId } = useWallet();
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [treasuryAddress, setTreasuryAddress] = useState<string>('');
  const ENABLE_TOKEN_FEATURES = process.env.NEXT_PUBLIC_ENABLE_TOKEN_FEATURES === 'true';
  const EXTERNAL_TOKEN_WEBSITE = process.env.NEXT_PUBLIC_EXTERNAL_TOKEN_WEBSITE || 'https://researka.io/token';

  // Get contract addresses based on current network
  useEffect(() => {
    if (!ENABLE_TOKEN_FEATURES) return;
    
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

  // If token features are disabled, show a message directing users to the external token website
  if (!ENABLE_TOKEN_FEATURES) {
    return (
      <>
        <Head>
          <title>RESEARKA Token | External Integration</title>
          <meta name="description" content="RESEARKA token dashboard - now available on a dedicated platform" />
        </Head>
        
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Heading as="h1" size="xl" color="green.700" textAlign="center">RESEARKA Token Dashboard</Heading>
            
            <Box
              borderWidth="1px"
              borderRadius="lg"
              p={8}
              boxShadow="lg"
              bg="white"
              textAlign="center"
            >
              <Alert status="info" mb={6} borderRadius="md">
                <AlertIcon />
                RESEARKA token functionality is now available on a separate dedicated platform.
              </Alert>
              
              <Text fontSize="lg" mb={6}>
                For token features including balance checking, staking, and transfers,
                please visit the official RESEARKA token platform.
              </Text>
              
              <Flex justifyContent="center">
                <Button 
                  as="a" 
                  href={EXTERNAL_TOKEN_WEBSITE} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  size="lg"
                  colorScheme="green" 
                  rightIcon={<FiExternalLink />}
                >
                  Visit RESEARKA Token Website
                </Button>
              </Flex>
            </Box>
          </VStack>
        </Container>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>RESEARKA Token Dashboard</title>
        <meta name="description" content="Manage your RESEARKA tokens, stake, and earn rewards" />
      </Head>
      
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" color="green.700" textAlign="center">RESEARKA Token Dashboard</Heading>
          
          <Box>
            <WalletConnect />
          </Box>
          
          {/* Use TokenDashboard component which adapts based on feature flag */}
          {ENABLE_TOKEN_FEATURES ? (
            <>
              {/* Token components only loaded when feature flag is true */}
              {tokenAddress && <TokenBalance tokenAddress={tokenAddress} />}
              
              {tokenAddress && treasuryAddress && (
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <StakingPositions treasuryAddress={treasuryAddress} />
                  </GridItem>
                  <GridItem>
                    <TokenTransactions tokenAddress={tokenAddress} treasuryAddress={treasuryAddress} />
                  </GridItem>
                </Grid>
              )}
            </>
          ) : (
            <TokenDashboard />
          )}
        </VStack>
      </Container>
    </>
  );
};

export default TokenDashboardPage;
