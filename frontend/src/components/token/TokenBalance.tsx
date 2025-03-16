import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Text, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  Skeleton, 
  Flex, 
  Button, 
  useToast 
} from '@chakra-ui/react';
import { useWallet } from '../../contexts/WalletContext';
import { useTokenContract, useTokenBalance } from '../../hooks/useContract';
import { formatTokenAmount } from '../../config/contracts';
import { FiTrendingUp } from 'react-icons/fi';
import { ethers } from 'ethers';

interface TokenBalanceProps {
  tokenAddress: string;
}

// Cache for token balances
const balanceCache = new Map<string, string>();

const TokenBalance: React.FC<TokenBalanceProps> = ({ tokenAddress }) => {
  const { account, provider, signer } = useWallet();
  const [balance, setBalance] = useState<string>('0');
  const [tokenPrice, setTokenPrice] = useState<string>('0.10');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [usdValue, setUsdValue] = useState<string>('0');
  const toast = useToast();
  const tokenContract = useTokenContract(false, tokenAddress);
  const tokenContractWithSigner = useTokenContract(true, tokenAddress);
  
  // Memoized fetch function to improve performance
  const fetchTokenBalance = useCallback(async () => {
    if (account && provider && tokenAddress && tokenContract) {
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
        const usdVal = (parseFloat(formattedBalance) * parseFloat(tokenPrice)).toFixed(2);
        setUsdValue(usdVal);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching token balance:', error);
        setIsLoading(false);
      }
    }
  }, [account, provider, tokenAddress, tokenContract, tokenPrice]);
  
  useEffect(() => {
    fetchTokenBalance();
    
    // Set up event listener for token transfers
    if (tokenContract && account) {
      const receivedFilter = tokenContract.filters.Transfer(null, account);
      const sentFilter = tokenContract.filters.Transfer(account, null);
      
      tokenContract.on(receivedFilter, fetchTokenBalance);
      tokenContract.on(sentFilter, fetchTokenBalance);
      
      return () => {
        tokenContract.off(receivedFilter, fetchTokenBalance);
        tokenContract.off(sentFilter, fetchTokenBalance);
      };
    }
  }, [tokenContract, account, fetchTokenBalance]);
  
  if (!account) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
        <Text textAlign="center" color="gray.500">Connect your wallet to view your token balance</Text>
      </Box>
    );
  }
  
  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
      <Stat>
        <StatLabel fontSize="md" color="gray.600">Your Token Balance</StatLabel>
        {isLoading ? (
          <Skeleton height="40px" mt={2} mb={2} />
        ) : (
          <StatNumber fontSize="3xl" fontWeight="bold" mt={1}>
            {balance} RSK
          </StatNumber>
        )}
        
        <StatHelpText display="flex" alignItems="center">
          <FiTrendingUp color="green.400" style={{ marginRight: '5px' }} />
          <Text color="green.400">${usdValue} USD</Text>
        </StatHelpText>
      </Stat>
    </Box>
  );
};

export default TokenBalance;
