import { ethers } from 'ethers';

// Define types for environment variables to avoid process.env errors
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_MAINNET_TOKEN_ADDRESS?: string;
      NEXT_PUBLIC_MAINNET_TREASURY_ADDRESS?: string;
      NEXT_PUBLIC_MAINNET_SUBMISSION_ADDRESS?: string;
      NEXT_PUBLIC_MAINNET_REVIEW_ADDRESS?: string;
      NEXT_PUBLIC_TESTNET_TOKEN_ADDRESS?: string;
      NEXT_PUBLIC_TESTNET_TREASURY_ADDRESS?: string;
      NEXT_PUBLIC_TESTNET_SUBMISSION_ADDRESS?: string;
      NEXT_PUBLIC_TESTNET_REVIEW_ADDRESS?: string;
      NEXT_PUBLIC_LOCAL_TOKEN_ADDRESS?: string;
      NEXT_PUBLIC_LOCAL_TREASURY_ADDRESS?: string;
      NEXT_PUBLIC_LOCAL_SUBMISSION_ADDRESS?: string;
      NEXT_PUBLIC_LOCAL_REVIEW_ADDRESS?: string;
    }
  }
}

// Network IDs
export const NETWORKS = {
  ZKSYNC_MAINNET: 324,
  ZKSYNC_TESTNET: 280,
  LOCALHOST: 1337
} as const;

// Network names
export const NETWORK_NAMES: Record<number, string> = {
  [NETWORKS.ZKSYNC_MAINNET]: 'zkSync Mainnet',
  [NETWORKS.ZKSYNC_TESTNET]: 'zkSync Testnet',
  [NETWORKS.LOCALHOST]: 'Localhost'
};

// RPC URLs
export const RPC_URLS: Record<number, string> = {
  [NETWORKS.ZKSYNC_MAINNET]: 'https://mainnet.era.zksync.io',
  [NETWORKS.ZKSYNC_TESTNET]: 'https://testnet.era.zksync.dev',
  [NETWORKS.LOCALHOST]: 'http://localhost:8545'
};

// Block explorers
export const BLOCK_EXPLORERS: Record<number, string> = {
  [NETWORKS.ZKSYNC_MAINNET]: 'https://explorer.zksync.io',
  [NETWORKS.ZKSYNC_TESTNET]: 'https://goerli.explorer.zksync.io',
  [NETWORKS.LOCALHOST]: ''
};

// Contract types
export type ContractType = 'token' | 'treasury' | 'submission' | 'review';

// Contract addresses by network
export const CONTRACT_ADDRESSES: {
  [networkId: number]: {
    [key in ContractType]: string;
  }
} = {
  [NETWORKS.ZKSYNC_MAINNET]: {
    token: process.env.NEXT_PUBLIC_MAINNET_TOKEN_ADDRESS || '',
    treasury: process.env.NEXT_PUBLIC_MAINNET_TREASURY_ADDRESS || '',
    submission: process.env.NEXT_PUBLIC_MAINNET_SUBMISSION_ADDRESS || '',
    review: process.env.NEXT_PUBLIC_MAINNET_REVIEW_ADDRESS || ''
  },
  [NETWORKS.ZKSYNC_TESTNET]: {
    token: process.env.NEXT_PUBLIC_TESTNET_TOKEN_ADDRESS || '',
    treasury: process.env.NEXT_PUBLIC_TESTNET_TREASURY_ADDRESS || '',
    submission: process.env.NEXT_PUBLIC_TESTNET_SUBMISSION_ADDRESS || '',
    review: process.env.NEXT_PUBLIC_TESTNET_REVIEW_ADDRESS || ''
  },
  [NETWORKS.LOCALHOST]: {
    token: process.env.NEXT_PUBLIC_LOCAL_TOKEN_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    treasury: process.env.NEXT_PUBLIC_LOCAL_TREASURY_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    submission: process.env.NEXT_PUBLIC_LOCAL_SUBMISSION_ADDRESS || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    review: process.env.NEXT_PUBLIC_LOCAL_REVIEW_ADDRESS || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
  }
};

// Cache for formatted addresses and amounts
const formattedAddressCache: Record<string, string> = {};
const formattedAmountCache: Record<string, string> = {};

/**
 * Get contract address based on network ID
 * @param contractName Contract type
 * @param networkId Network ID
 * @returns Contract address
 */
export function getContractAddress(contractName: ContractType, networkId: number): string {
  if (!CONTRACT_ADDRESSES[networkId]) {
    throw new Error(`Network ID ${networkId} not supported`);
  }
  
  const address = CONTRACT_ADDRESSES[networkId][contractName];
  if (!address) {
    throw new Error(`Contract ${contractName} not deployed on network ${NETWORK_NAMES[networkId]}`);
  }
  
  return address;
}

/**
 * Format token amount with proper decimals
 * @param amount Amount in wei
 * @param decimals Decimal places (default: 18)
 * @returns Formatted amount
 */
export function formatTokenAmount(amount: ethers.BigNumberish, decimals = 18): string {
  const cacheKey = `${amount.toString()}-${decimals}`;
  
  // Check cache first
  if (formattedAmountCache[cacheKey]) {
    return formattedAmountCache[cacheKey];
  }
  
  const formatted = ethers.utils.formatUnits(amount, decimals);
  const parts = formatted.split('.');
  
  // Format with commas for thousands
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  let result: string;
  if (parts.length > 1) {
    // Trim trailing zeros in decimal part
    const decimalPart = parts[1].replace(/0+$/, '');
    result = decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  } else {
    result = integerPart;
  }
  
  // Cache the result
  formattedAmountCache[cacheKey] = result;
  
  return result;
}

/**
 * Parse token amount string to BigNumber
 * @param amount Amount as string
 * @param decimals Decimal places (default: 18)
 * @returns BigNumber
 */
export function parseTokenAmount(amount: string, decimals = 18): ethers.BigNumber {
  try {
    // Remove commas and validate
    const sanitized = amount.replace(/,/g, '');
    return ethers.utils.parseUnits(sanitized, decimals);
  } catch (error) {
    console.error('Error parsing token amount:', error);
    return ethers.BigNumber.from(0);
  }
}

/**
 * Format address for display (0x1234...5678)
 * @param address Ethereum address
 * @returns Formatted address
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  
  // Check cache first
  if (formattedAddressCache[address]) {
    return formattedAddressCache[address];
  }
  
  const formatted = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  
  // Cache the result
  formattedAddressCache[address] = formatted;
  
  return formatted;
}

/**
 * Get transaction URL for block explorer
 * @param txHash Transaction hash
 * @param networkId Network ID
 * @returns Block explorer URL
 */
export function getTransactionUrl(txHash: string, networkId: number): string {
  const baseUrl = BLOCK_EXPLORERS[networkId];
  if (!baseUrl) return '';
  
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Get address URL for block explorer
 * @param address Ethereum address
 * @param networkId Network ID
 * @returns Block explorer URL
 */
export function getAddressUrl(address: string, networkId: number): string {
  const baseUrl = BLOCK_EXPLORERS[networkId];
  if (!baseUrl) return '';
  
  return `${baseUrl}/address/${address}`;
}
