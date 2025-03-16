import { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { getContractAddress, formatTokenAmount, parseTokenAmount, ContractType } from '../config/contracts';

// ABIs
import ResearkaTokenABI from '../abis/ResearkaToken.json';
import ResearchaTreasuryABI from '../abis/ResearchaTreasury.json';

// Types for contract instances
type TokenContract = ethers.Contract;
type TreasuryContract = ethers.Contract;

// Type for staking position
interface StakingPosition {
  id: number;
  amount: string;
  startTime: Date;
  endTime: Date;
  apy: number;
  isUnstakable: boolean;
}

// Type for platform stats
interface PlatformStats {
  totalSupply: string;
  circulatingSupply: string;
  marketCap: string;
  totalStaked: string;
  stakingAPY: string;
}

// Cache for contract instances to improve performance
const contractCache: Record<string, ethers.Contract> = {};

// Hook for ResearkaToken contract
export function useTokenContract(withSigner = false): TokenContract | null {
  const { provider, account, chainId } = useWallet();
  
  return useMemo(() => {
    if (!provider || !chainId) return null;
    
    try {
      let contractAddress: string;
      try {
        contractAddress = getContractAddress('token', chainId);
      } catch (error) {
        console.error('Contract not deployed on this network:', error);
        return null;
      }
      
      // Check cache first for better performance
      const cacheKey = `token-${contractAddress}-${withSigner ? 'signer' : 'provider'}`;
      if (contractCache[cacheKey]) {
        return contractCache[cacheKey];
      }
      
      const contractABI = ResearkaTokenABI.abi;
      
      let contract: ethers.Contract;
      if (withSigner && account) {
        const signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
      } else {
        contract = new ethers.Contract(contractAddress, contractABI, provider);
      }
      
      // Cache the contract instance
      contractCache[cacheKey] = contract;
      
      return contract;
    } catch (error) {
      console.error('Error creating token contract instance:', error);
      return null;
    }
  }, [provider, account, chainId, withSigner]);
}

// Hook for ResearchaTreasury contract
export function useTreasuryContract(withSigner = false): TreasuryContract | null {
  const { provider, account, chainId } = useWallet();
  
  return useMemo(() => {
    if (!provider || !chainId) return null;
    
    try {
      let contractAddress: string;
      try {
        contractAddress = getContractAddress('treasury', chainId);
      } catch (error) {
        console.error('Contract not deployed on this network:', error);
        return null;
      }
      
      // Check cache first for better performance
      const cacheKey = `treasury-${contractAddress}-${withSigner ? 'signer' : 'provider'}`;
      if (contractCache[cacheKey]) {
        return contractCache[cacheKey];
      }
      
      const contractABI = ResearchaTreasuryABI.abi;
      
      let contract: ethers.Contract;
      if (withSigner && account) {
        const signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
      } else {
        contract = new ethers.Contract(contractAddress, contractABI, provider);
      }
      
      // Cache the contract instance
      contractCache[cacheKey] = contract;
      
      return contract;
    } catch (error) {
      console.error('Error creating treasury contract instance:', error);
      return null;
    }
  }, [provider, account, chainId, withSigner]);
}

// Hook to get token balance with StaleWhileRevalidate caching strategy
export function useTokenBalance(address?: string) {
  const [balance, setBalance] = useState<string>('0');
  const [formattedBalance, setFormattedBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const { account } = useWallet();
  const tokenContract = useTokenContract();
  
  const targetAddress = address || account;
  
  // Cache duration in milliseconds (30 seconds)
  const CACHE_DURATION = 30 * 1000;
  
  useEffect(() => {
    const fetchBalance = async () => {
      if (!tokenContract || !targetAddress) {
        setIsLoading(false);
        return;
      }
      
      // Implement StaleWhileRevalidate strategy
      const now = Date.now();
      const shouldUseCache = now - lastUpdated < CACHE_DURATION;
      
      if (shouldUseCache && balance !== '0') {
        // Use cached data first, then update in background
        fetchBalanceInBackground();
        return;
      }
      
      try {
        setIsLoading(true);
        const rawBalance = await tokenContract.balanceOf(targetAddress);
        setBalance(rawBalance.toString());
        
        // Format balance with 18 decimals
        const formatted = formatTokenAmount(rawBalance);
        setFormattedBalance(formatted);
        
        setLastUpdated(Date.now());
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching token balance:', error);
        setIsLoading(false);
      }
    };
    
    const fetchBalanceInBackground = async () => {
      if (!tokenContract || !targetAddress) return;
      
      try {
        const rawBalance = await tokenContract.balanceOf(targetAddress);
        setBalance(rawBalance.toString());
        
        // Format balance with 18 decimals
        const formatted = formatTokenAmount(rawBalance);
        setFormattedBalance(formatted);
        
        setLastUpdated(Date.now());
      } catch (error) {
        console.error('Error fetching token balance in background:', error);
      }
    };
    
    fetchBalance();
    
    // Set up event listener for Transfer events
    if (tokenContract && targetAddress) {
      const fromFilter = tokenContract.filters.Transfer(targetAddress, null);
      const toFilter = tokenContract.filters.Transfer(null, targetAddress);
      
      tokenContract.on(fromFilter, fetchBalance);
      tokenContract.on(toFilter, fetchBalance);
      
      return () => {
        tokenContract.off(fromFilter, fetchBalance);
        tokenContract.off(toFilter, fetchBalance);
      };
    }
  }, [tokenContract, targetAddress, balance, lastUpdated]);
  
  return { balance, formattedBalance, isLoading };
}

// Hook to get staking positions
export function useStakingPositions() {
  const [positions, setPositions] = useState<StakingPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { account } = useWallet();
  const treasuryContract = useTreasuryContract();
  
  useEffect(() => {
    const fetchPositions = async () => {
      if (!treasuryContract || !account) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const stakingPositions = await treasuryContract.getStakingPositions(account);
        
        // Transform the positions for easier consumption in the UI
        const formattedPositions = stakingPositions.map((position: any, index: number) => ({
          id: index,
          amount: formatTokenAmount(position.amount),
          startTime: new Date(position.startTime.toNumber() * 1000),
          endTime: new Date(position.endTime.toNumber() * 1000),
          apy: position.apy.toNumber() / 100, // Convert basis points to percentage
          isUnstakable: Date.now() >= position.endTime.toNumber() * 1000
        }));
        
        setPositions(formattedPositions);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching staking positions:', error);
        setIsLoading(false);
      }
    };
    
    fetchPositions();
    
    // Set up event listener for Staked and Unstaked events
    if (treasuryContract && account) {
      const stakedFilter = treasuryContract.filters.Staked(account);
      const unstakedFilter = treasuryContract.filters.Unstaked(account);
      
      treasuryContract.on(stakedFilter, fetchPositions);
      treasuryContract.on(unstakedFilter, fetchPositions);
      
      return () => {
        treasuryContract.off(stakedFilter, fetchPositions);
        treasuryContract.off(unstakedFilter, fetchPositions);
      };
    }
  }, [treasuryContract, account]);
  
  return { positions, isLoading };
}

// Hook to get token price in USD
export function useTokenPrice() {
  const [price, setPrice] = useState<string>('0.10'); // Initial price
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real implementation, this would fetch from an API or price oracle
    // For now, we'll use a static price
    setPrice('0.10');
    setIsLoading(false);
    
    // Refresh every 5 minutes
    const intervalId = setInterval(() => {
      setPrice('0.10');
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return { price, isLoading };
}

// Hook to get platform statistics
export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats>({
    totalSupply: '100,000,000',
    circulatingSupply: '25,000,000',
    marketCap: '$2,500,000',
    totalStaked: '5,000,000',
    stakingAPY: '15.0'
  });
  const [isLoading, setIsLoading] = useState(true);
  const tokenContract = useTokenContract();
  const treasuryContract = useTreasuryContract();
  const { price } = useTokenPrice();
  
  useEffect(() => {
    const fetchStats = async () => {
      if (!tokenContract || !treasuryContract) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch total supply
        const totalSupply = await tokenContract.totalSupply();
        const formattedTotalSupply = formatTokenAmount(totalSupply);
        
        // Fetch total staked
        const totalStaked = await treasuryContract.getTotalStaked();
        const formattedTotalStaked = formatTokenAmount(totalStaked);
        
        // Calculate circulating supply (total - staked)
        const circulatingSupply = totalSupply.sub(totalStaked);
        const formattedCirculatingSupply = formatTokenAmount(circulatingSupply);
        
        // Calculate market cap
        const numericPrice = parseFloat(price);
        const numericCirculatingSupply = parseFloat(formattedCirculatingSupply.replace(/,/g, ''));
        const marketCap = (numericPrice * numericCirculatingSupply).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        });
        
        // Fetch staking APY
        const stakingAPY = await treasuryContract.getCurrentAPY();
        const formattedStakingAPY = (stakingAPY.toNumber() / 100).toFixed(1); // Convert basis points to percentage
        
        setStats({
          totalSupply: formattedTotalSupply,
          circulatingSupply: formattedCirculatingSupply,
          marketCap,
          totalStaked: formattedTotalStaked,
          stakingAPY: formattedStakingAPY
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching platform stats:', error);
        setIsLoading(false);
      }
    };
    
    fetchStats();
    
    // Refresh every 5 minutes
    const intervalId = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [tokenContract, treasuryContract, price]);
  
  return { stats, isLoading };
}
