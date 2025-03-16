import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useWallet } from '../contexts/WalletContext';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  useColorModeValue,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useToast,
  Skeleton,
  Spinner,
} from '@chakra-ui/react';
import { usePlatformStats, useTokenContract, useTreasuryContract } from '../hooks/useContract';
import { NETWORKS, NETWORK_NAMES, getContractAddress } from '../config/contracts';

// Lazy-loaded components
const WalletConnect = lazy(() => import('../components/wallet/WalletConnect'));
const TokenBalance = lazy(() => import('../components/token/TokenBalance'));
const TokenTransactions = lazy(() => import('../components/token/TokenTransactions'));
const StakingPositions = lazy(() => import('../components/token/StakingPositions'));

// Loading fallback component
const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
    <Spinner size="xl" color="blue.500" thickness="4px" />
  </Box>
);

const TokenDashboard: React.FC = () => {
  const { account, chainId } = useWallet();
  const { stats, isLoading } = usePlatformStats();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Check if on the correct network
  const isCorrectNetwork = chainId === NETWORKS.ZKSYNC_MAINNET || chainId === NETWORKS.ZKSYNC_TESTNET;

  // Get contract addresses based on current network
  const getAddressForCurrentNetwork = (contractType: 'token' | 'treasury' | 'submission' | 'review'): string => {
    if (!chainId) return '';
    try {
      return getContractAddress(contractType, chainId);
    } catch (error) {
      console.error(`Error getting ${contractType} address:`, error);
      return '';
    }
  };

  // Preconnect to RPC endpoints for performance
  useEffect(() => {
    // Add preconnect link for zkSync RPC
    const linkEl = document.createElement('link');
    linkEl.rel = 'preconnect';
    linkEl.href = 'https://mainnet.era.zksync.io';
    document.head.appendChild(linkEl);

    return () => {
      document.head.removeChild(linkEl);
    };
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="xl">Researka Token Dashboard</Heading>
        <Suspense fallback={<Button isLoading colorScheme="blue">Connect Wallet</Button>}>
          <WalletConnect />
        </Suspense>
      </Flex>
      
      {account && !isCorrectNetwork && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Wrong Network</AlertTitle>
          <AlertDescription>
            Please switch to {NETWORK_NAMES[NETWORKS.ZKSYNC_MAINNET]} network to interact with the platform.
          </AlertDescription>
        </Alert>
      )}
      
      <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(4, 1fr)' }} gap={6} mb={8}>
        <GridItem colSpan={{ base: 1, md: 4 }}>
          <Box p={5} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} shadow="sm">
            <Heading size="md" mb={4}>Platform Overview</Heading>
            <Skeleton isLoaded={!isLoading}>
              <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(5, 1fr)' }} gap={4}>
                <Stat>
                  <StatLabel>Total Supply</StatLabel>
                  <StatNumber>{stats.totalSupply}</StatNumber>
                  <StatHelpText>RSKA Tokens</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Circulating Supply</StatLabel>
                  <StatNumber>{stats.circulatingSupply}</StatNumber>
                  <StatHelpText>RSKA Tokens</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Market Cap</StatLabel>
                  <StatNumber>{stats.marketCap}</StatNumber>
                  <StatHelpText>@ $0.10 per token</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Total Staked</StatLabel>
                  <StatNumber>{stats.totalStaked}</StatNumber>
                  <StatHelpText>RSKA Tokens</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Staking APY</StatLabel>
                  <StatNumber>{stats.stakingAPY}%</StatNumber>
                  <StatHelpText>Base Rate</StatHelpText>
                </Stat>
              </Grid>
            </Skeleton>
          </Box>
        </GridItem>
      </Grid>
      
      {!account ? (
        <Box p={10} textAlign="center" bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} shadow="sm">
          <VStack spacing={4}>
            <Heading size="md">Connect Your Wallet</Heading>
            <Text>Connect your wallet to view your token balance, stake tokens, and participate in the Researka ecosystem.</Text>
            <Suspense fallback={<Button isLoading colorScheme="blue">Connect Wallet</Button>}>
              <WalletConnect />
            </Suspense>
          </VStack>
        </Box>
      ) : (
        <Tabs variant="enclosed" colorScheme="blue" isLazy>
          <TabList>
            <Tab>My Tokens</Tab>
            <Tab>Staking</Tab>
            <Tab>Transactions</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={6}>
                <GridItem colSpan={{ base: 1, md: 1 }}>
                  <Suspense fallback={<LoadingFallback />}>
                    <TokenBalance tokenAddress={getAddressForCurrentNetwork('token')} />
                  </Suspense>
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Suspense fallback={<LoadingFallback />}>
                    <TokenTransactions 
                      tokenAddress={getAddressForCurrentNetwork('token')} 
                      treasuryAddress={getAddressForCurrentNetwork('treasury')} 
                    />
                  </Suspense>
                </GridItem>
              </Grid>
            </TabPanel>
            
            <TabPanel>
              <Suspense fallback={<LoadingFallback />}>
                <StakingPositions treasuryAddress={getAddressForCurrentNetwork('treasury')} />
              </Suspense>
            </TabPanel>
            
            <TabPanel>
              <Box p={5} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} shadow="sm">
                <Heading size="md" mb={4}>Transaction History</Heading>
                <Text color="gray.500">
                  This feature will display your transaction history, including token transfers, staking operations, 
                  article submissions, and review rewards.
                </Text>
                <Divider my={4} />
                <Text fontSize="sm">Coming soon in the next update.</Text>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
      
      <Box mt={12} p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Heading size="md" mb={4}>About Researka Token (RSKA)</Heading>
        <Text mb={4}>
          The Researka Token (RSKA) is the native utility token of the Researka platform, designed to facilitate 
          transactions, incentivize quality contributions, and enable platform governance.
        </Text>
        
        <Heading size="sm" mb={2}>Token Utility</Heading>
        <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={4} mb={4}>
          <Box p={3} bg="blue.50" borderRadius="md">
            <Heading size="xs" mb={2}>Submission & Publication</Heading>
            <Text fontSize="sm">
              Pay submission fees, purchase articles, and subscribe to journals using RSKA tokens.
            </Text>
          </Box>
          <Box p={3} bg="green.50" borderRadius="md">
            <Heading size="xs" mb={2}>Rewards & Royalties</Heading>
            <Text fontSize="sm">
              Earn tokens for reviewing articles, receiving citations, and contributing to the platform.
            </Text>
          </Box>
          <Box p={3} bg="purple.50" borderRadius="md">
            <Heading size="xs" mb={2}>Governance & Staking</Heading>
            <Text fontSize="sm">
              Stake tokens to earn rewards and participate in platform governance decisions.
            </Text>
          </Box>
        </Grid>
        
        <Heading size="sm" mb={2}>Tokenomics</Heading>
        <HStack spacing={8} wrap="wrap">
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" fontWeight="bold">Total Supply</Text>
            <Text>100,000,000 RSKA</Text>
          </VStack>
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" fontWeight="bold">Initial Price</Text>
            <Text>$0.10 USD</Text>
          </VStack>
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" fontWeight="bold">Initial Market Cap</Text>
            <Text>$10,000,000 USD</Text>
          </VStack>
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" fontWeight="bold">Founder Allocation</Text>
            <Text>3,000,000 RSKA (3%)</Text>
          </VStack>
        </HStack>
      </Box>
    </Container>
  );
};

export default TokenDashboard;
