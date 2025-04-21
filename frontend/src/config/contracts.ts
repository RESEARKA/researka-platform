// Define types for environment variables to avoid process.env errors
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_RESKA_API_URL?: string;
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

// RESKA API URL
export const RESKA_API_URL = process.env.NEXT_PUBLIC_RESKA_API_URL || 'https://api.reska.io';

// Cache for formatted addresses
const formattedAddressCache: Record<string, string> = {};

/**
 * Format address for display (0x1234...5678)
 * @param address Ethereum address
 * @returns Formatted address
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  
  // Return from cache if available
  if (formattedAddressCache[address]) {
    return formattedAddressCache[address];
  }
  
  // Format address
  const formatted = address.length > 10
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : address;
  
  // Cache result
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
  if (!baseUrl || !txHash) return '';
  
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
  if (!baseUrl || !address) return '';
  
  return `${baseUrl}/address/${address}`;
}
