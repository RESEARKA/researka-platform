import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  StatArrow, 
  Skeleton, 
  useColorModeValue 
} from '@chakra-ui/react';
import { useWallet } from '../contexts/WalletContext';
import { useTokenContract } from '../hooks/useContract';
import { formatTokenAmount } from '../config/contracts';
import { FiTrendingUp } from 'react-icons/fi';

interface TokenBalanceProps {
  tokenAddress: string;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({ tokenAddress }) => {
  const { account, isCorrectNetwork } = useWallet();
  const tokenContract = useTokenContract();
  const [balance, setBalance] = useState<string>('0');
  const [usdValue, setUsdValue] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  
  // Cache for token balances
  const balanceCache = new Map<string, string>();
  
  // Memoized fetch function to improve performance
  const fetchBalance = useCallback(async () => {
    if (!tokenContract || !account) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Check cache first (StaleWhileRevalidate strategy)
      const cacheKey = `${account}-${tokenAddress}`;
      if (balanceCache.has(cacheKey)) {
        setBalance(balanceCache.get(cacheKey) || '0');
        // Continue fetching in background
      }
      
      // Get token balance
      const rawBalance = await tokenContract.balanceOf(account);
      const formattedBalance = formatTokenAmount(rawBalance);
      
      // Update cache
      balanceCache.set(cacheKey, formattedBalance);
      
      // Update state
      setBalance(formattedBalance);
      
      // Calculate USD value (assuming $0.10 per token)
      const usdVal = (parseFloat(formattedBalance) * 0.10).toFixed(2);
      setUsdValue(usdVal);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      setIsLoading(false);
    }
  }, [tokenContract, account, tokenAddress]);
  
  useEffect(() => {
    fetchBalance();
    
    // Set up event listener for token transfers
    if (tokenContract && account) {
      const receivedFilter = tokenContract.filters.Transfer(null, account);
      const sentFilter = tokenContract.filters.Transfer(account, null);
      
      tokenContract.on(receivedFilter, fetchBalance);
      tokenContract.on(sentFilter, fetchBalance);
      
      return () => {
        tokenContract.off(receivedFilter, fetchBalance);
        tokenContract.off(sentFilter, fetchBalance);
      };
    }
  }, [tokenContract, account, fetchBalance]);
  
  const bgColor = useColorModeValue('white', 'gray.700');
  
  if (!account) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
        <Text textAlign="center" color="gray.500">Connect your wallet to view your token balance</Text>
      </Box>
    );
  }
  
  if (!isCorrectNetwork) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
        <Text textAlign="center" color="orange.500">Switch to zkSync network to view your token balance</Text>
      </Box>
    );
  }
  
  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
      <Heading size="md" mb={4}>Your RSK Balance</Heading>
      
      {isLoading ? (
        <Skeleton height="80px" />
      ) : (
        <Stat>
          <StatLabel>Available Balance</StatLabel>
          <StatNumber fontSize="2xl">{balance} RSK</StatNumber>
          <StatHelpText>
            <Box display="flex" alignItems="center">
              <FiTrendingUp color="green.400" style={{ marginRight: '5px' }} />
              <Text color="green.400">${usdValue} USD</Text>
            </Box>
          </StatHelpText>
        </Stat>
      )}
    </Box>
  );
};

export default TokenBalance;
