/**
 * useWeb3Provider Hook
 * 
 * Custom hook for managing Web3 provider connections using ethers.js.
 * This hook abstracts wallet connection logic and handles network changes.
 */

import { useState, useEffect, useCallback } from 'react';
import { providers } from 'ethers';
import { createLogger, LogCategory } from '../utils/logger';

// Type aliases for better readability
type BrowserProvider = providers.Web3Provider;
type JsonRpcSigner = providers.JsonRpcSigner;
type Network = providers.Network;
type Eip1193Provider = providers.ExternalProvider & {
  on?: (event: string, callback: any) => void;
  removeListener?: (event: string, callback: any) => void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isWalletConnect?: boolean;
  request?: (request: { method: string; params?: Array<any> }) => Promise<any>;
};

// Create a logger instance for this hook
const logger = createLogger('useWeb3Provider');

/**
 * Supported wallet types
 */
export enum WalletType {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'walletconnect',
  COINBASE = 'coinbase',
  OTHER = 'other'
}

/**
 * Connection status
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

/**
 * Web3 provider state
 */
export interface Web3ProviderState {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  network: Network | null;
  walletType: WalletType | null;
  status: ConnectionStatus;
  error: Error | null;
  isConnecting: boolean;
  isConnected: boolean;
}

/**
 * Web3 provider options
 */
export interface Web3ProviderOptions {
  autoConnect?: boolean;
  desiredChainId?: number;
  supportedChainIds?: number[];
}

/**
 * Custom hook for managing Web3 provider connections
 * @param options Web3 provider options
 * @returns Web3 provider state and methods
 */
export function useWeb3Provider(options: Web3ProviderOptions = {}) {
  // Merge options with defaults
  const {
    autoConnect = false,
    desiredChainId = 1, // Ethereum Mainnet
    supportedChainIds = [1, 5, 137, 80001, 324, 42161], // Mainnet, Goerli, Polygon, Mumbai, zkSync Era, Arbitrum
  } = options;

  // Provider state
  const [state, setState] = useState<Web3ProviderState>({
    provider: null,
    signer: null,
    account: null,
    chainId: null,
    network: null,
    walletType: null,
    status: ConnectionStatus.DISCONNECTED,
    error: null,
    isConnecting: false,
    isConnected: false
  });

  /**
   * Get the Ethereum provider from window
   */
  const getEthereumProvider = useCallback((): Eip1193Provider | null => {
    if (typeof window === 'undefined') return null;
    
    // Check for injected providers
    const ethereum = (window as any).ethereum;
    
    if (!ethereum) {
      logger.warn('No Ethereum provider found', {
        category: LogCategory.BLOCKCHAIN
      });
      return null;
    }
    
    return ethereum;
  }, []);

  /**
   * Detect wallet type from provider
   */
  const detectWalletType = useCallback((provider: any): WalletType => {
    if (!provider) return WalletType.OTHER;
    
    if (provider.isMetaMask) {
      return WalletType.METAMASK;
    } else if (provider.isCoinbaseWallet) {
      return WalletType.COINBASE;
    } else if (provider.isWalletConnect) {
      return WalletType.WALLET_CONNECT;
    }
    
    return WalletType.OTHER;
  }, []);

  /**
   * Disconnect from the wallet
   */
  const disconnect = useCallback(async (): Promise<void> => {
    setState({
      provider: null,
      signer: null,
      account: null,
      chainId: null,
      network: null,
      walletType: null,
      status: ConnectionStatus.DISCONNECTED,
      error: null,
      isConnecting: false,
      isConnected: false
    });
    
    logger.info('Disconnected from wallet', {
      category: LogCategory.BLOCKCHAIN
    });
  }, []);

  /**
   * Add a chain to the wallet
   */
  const addChain = useCallback(async (chainId: number): Promise<boolean> => {
    try {
      // Get the Ethereum provider
      const ethereumProvider = getEthereumProvider();
      
      if (!ethereumProvider || !ethereumProvider.request) {
        throw new Error('No Ethereum provider available.');
      }
      
      // Chain parameters based on chain ID
      let params;
      
      switch (chainId) {
        case 1: // Ethereum Mainnet
          params = {
            chainId: '0x1',
            chainName: 'Ethereum Mainnet',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
            blockExplorerUrls: ['https://etherscan.io']
          };
          break;
        case 5: // Goerli Testnet
          params = {
            chainId: '0x5',
            chainName: 'Goerli Testnet',
            nativeCurrency: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
            blockExplorerUrls: ['https://goerli.etherscan.io']
          };
          break;
        case 137: // Polygon Mainnet
          params = {
            chainId: '0x89',
            chainName: 'Polygon Mainnet',
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com'],
            blockExplorerUrls: ['https://polygonscan.com']
          };
          break;
        case 80001: // Mumbai Testnet
          params = {
            chainId: '0x13881',
            chainName: 'Mumbai Testnet',
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
            blockExplorerUrls: ['https://mumbai.polygonscan.com']
          };
          break;
        case 324: // zkSync Era Mainnet
          params = {
            chainId: '0x144',
            chainName: 'zkSync Era Mainnet',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.era.zksync.io'],
            blockExplorerUrls: ['https://explorer.zksync.io']
          };
          break;
        case 42161: // Arbitrum One
          params = {
            chainId: '0xA4B1',
            chainName: 'Arbitrum One',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://arb1.arbitrum.io/rpc'],
            blockExplorerUrls: ['https://arbiscan.io']
          };
          break;
        default:
          throw new Error(`Chain ID ${chainId} is not supported.`);
      }
      
      // Add the chain
      await ethereumProvider.request({
        method: 'wallet_addEthereumChain',
        params: [params]
      });
      
      logger.info('Added chain to wallet', {
        context: { chainId, chainName: params.chainName },
        category: LogCategory.BLOCKCHAIN
      });
      
      return true;
    } catch (error: any) {
      logger.error('Error adding chain', {
        context: { error, chainId },
        category: LogCategory.ERROR
      });
      
      return false;
    }
  }, [getEthereumProvider]);

  /**
   * Switch to a different chain
   */
  const switchChain = useCallback(async (chainId: number): Promise<boolean> => {
    try {
      if (!state.provider) {
        throw new Error('No provider available. Please connect to a wallet first.');
      }
      
      // Check if the chain is supported
      if (!supportedChainIds.includes(chainId)) {
        throw new Error(`Chain ID ${chainId} is not supported.`);
      }
      
      // Convert chain ID to hex
      const chainIdHex = `0x${chainId.toString(16)}`;
      
      // Get the Ethereum provider
      const ethereumProvider = getEthereumProvider();
      
      if (!ethereumProvider || !ethereumProvider.request) {
        throw new Error('No Ethereum provider available.');
      }
      
      try {
        // Try to switch to the chain
        await ethereumProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }]
        });
        
        // The network change will be handled by the network change event listener
        return true;
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to the wallet
        if (switchError.code === 4902) {
          // Add the chain
          await addChain(chainId);
          return true;
        }
        
        throw switchError;
      }
    } catch (error: any) {
      logger.error('Error switching chain', {
        context: { error, chainId },
        category: LogCategory.ERROR
      });
      
      return false;
    }
  }, [state.provider, supportedChainIds, getEthereumProvider, addChain]);

  /**
   * Handle account changes
   */
  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      await disconnect();
      return;
    }
    
    // Update the account
    setState(prev => ({
      ...prev,
      account: accounts[0]
    }));
    
    logger.info('Account changed', {
      context: { account: accounts[0] },
      category: LogCategory.BLOCKCHAIN
    });
  }, [disconnect]);

  /**
   * Handle chain/network changes
   */
  const handleChainChanged = useCallback(async (chainIdHex: string) => {
    try {
      // Convert hex chain ID to number
      const chainId = parseInt(chainIdHex, 16);
      
      // Check if the provider exists
      if (!state.provider) {
        throw new Error('No provider available.');
      }
      
      // Get the new network
      const network = await state.provider.getNetwork();
      
      // Check if the chain is supported
      const isChainSupported = supportedChainIds.includes(chainId);
      
      if (!isChainSupported) {
        logger.warn('Switched to unsupported chain', {
          context: { chainId, supportedChainIds },
          category: LogCategory.BLOCKCHAIN
        });
      }
      
      // Update state
      setState(prev => ({
        ...prev,
        chainId,
        network
      }));
      
      logger.info('Chain changed', {
        context: { 
          chainId, 
          networkName: network.name,
          isSupported: isChainSupported
        },
        category: LogCategory.BLOCKCHAIN
      });
    } catch (error: any) {
      logger.error('Error handling chain change', {
        context: { error, chainIdHex },
        category: LogCategory.ERROR
      });
    }
  }, [state.provider, supportedChainIds]);

  /**
   * Handle disconnect events
   */
  const handleDisconnect = useCallback(async (error: any) => {
    logger.info('Disconnect event received', {
      context: { error },
      category: LogCategory.BLOCKCHAIN
    });
    
    await disconnect();
  }, [disconnect]);

  /**
   * Connect to a wallet
   */
  const connect = useCallback(async (walletType?: WalletType): Promise<boolean> => {
    try {
      setState(prev => ({
        ...prev,
        status: ConnectionStatus.CONNECTING,
        isConnecting: true,
        error: null
      }));
      
      // Get the Ethereum provider
      const ethereumProvider = getEthereumProvider();
      
      if (!ethereumProvider) {
        throw new Error('No Ethereum provider available. Please install MetaMask or another wallet.');
      }
      
      // Create ethers provider
      const provider = new providers.Web3Provider(ethereumProvider);
      
      // Request accounts
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet and try again.');
      }
      
      // Get the first account
      const account = accounts[0];
      
      // Get the signer
      const signer = await provider.getSigner();
      
      // Get the network
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Check if the chain is supported
      const isChainSupported = supportedChainIds.includes(chainId);
      
      if (!isChainSupported) {
        logger.warn('Unsupported chain', {
          context: { chainId, supportedChainIds },
          category: LogCategory.BLOCKCHAIN
        });
      }
      
      // Detect wallet type
      const detectedWalletType = walletType || detectWalletType(ethereumProvider);
      
      // Update state
      setState({
        provider,
        signer,
        account,
        chainId,
        network,
        walletType: detectedWalletType,
        status: ConnectionStatus.CONNECTED,
        error: null,
        isConnecting: false,
        isConnected: true
      });
      
      logger.info('Connected to wallet', {
        context: { 
          account, 
          chainId, 
          networkName: network.name,
          walletType: detectedWalletType
        },
        category: LogCategory.BLOCKCHAIN
      });
      
      return true;
    } catch (error: any) {
      logger.error('Error connecting to wallet', {
        context: { error },
        category: LogCategory.ERROR
      });
      
      setState(prev => ({
        ...prev,
        status: ConnectionStatus.ERROR,
        error,
        isConnecting: false,
        isConnected: false
      }));
      
      return false;
    }
  }, [getEthereumProvider, supportedChainIds, detectWalletType]);

  /**
   * Set up event listeners for wallet events
   */
  useEffect(() => {
    const ethereumProvider = getEthereumProvider();
    
    if (!ethereumProvider || !ethereumProvider.on || !ethereumProvider.removeListener) return;
    
    // Set up event listeners
    ethereumProvider.on('accountsChanged', handleAccountsChanged);
    ethereumProvider.on('chainChanged', handleChainChanged);
    ethereumProvider.on('disconnect', handleDisconnect);
    
    // Auto-connect if enabled
    if (autoConnect) {
      connect().catch(error => {
        logger.error('Auto-connect failed', {
          context: { error },
          category: LogCategory.ERROR
        });
      });
    }
    
    // Clean up event listeners
    return () => {
      if (ethereumProvider && ethereumProvider.removeListener) {
        ethereumProvider.removeListener('accountsChanged', handleAccountsChanged);
        ethereumProvider.removeListener('chainChanged', handleChainChanged);
        ethereumProvider.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [
    getEthereumProvider,
    handleAccountsChanged,
    handleChainChanged,
    handleDisconnect,
    autoConnect,
    connect
  ]);

  return {
    ...state,
    connect,
    disconnect,
    switchChain,
    addChain,
    isMetaMaskInstalled: !!getEthereumProvider()?.isMetaMask,
    isSupportedChain: state.chainId ? supportedChainIds.includes(state.chainId) : false,
    desiredChainId,
    supportedChainIds
  };
}
