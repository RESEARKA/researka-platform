/**
 * WalletContext
 * 
 * Context for managing wallet connections in the RESEARKA platform.
 * This context uses the useWeb3Provider hook to abstract wallet connection logic.
 */

import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { 
  useWeb3Provider, 
  WalletType, 
  ConnectionStatus 
} from '../hooks/useWeb3Provider';
import { providers } from 'ethers';
import { createLogger, LogCategory } from '../utils/logger';

// Type aliases for better readability
type BrowserProvider = providers.Web3Provider;
type JsonRpcSigner = providers.JsonRpcSigner;
type Network = providers.Network;

// Create a logger instance for this context
const logger = createLogger('WalletContext');

// Wallet context interface
interface WalletContextType {
  // Provider state
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  network: Network | null;
  
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  isReady: boolean;
  error: Error | null;
  
  // Network state
  isSupportedChain: boolean;
  supportedChainIds: number[];
  
  // Methods
  connect: (walletType?: WalletType) => Promise<boolean>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: number) => Promise<boolean>;
  
  // RESEARKA token state
  researchaTokenBalance: string;
  isLoadingBalance: boolean;
}

// Create the context with default values
const WalletContext = createContext<WalletContextType>({
  // Provider state
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  network: null,
  
  // Connection state
  isConnected: false,
  isConnecting: false,
  isReady: false,
  error: null,
  
  // Network state
  isSupportedChain: false,
  supportedChainIds: [],
  
  // Methods
  connect: async () => false,
  disconnect: async () => {},
  switchChain: async () => false,
  
  // RESEARKA token state
  researchaTokenBalance: '0',
  isLoadingBalance: false
});

// Hook to use the wallet context
export const useWallet = () => useContext(WalletContext);

// Props for the WalletProvider component
interface WalletProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
  desiredChainId?: number;
  supportedChainIds?: number[];
}

/**
 * WalletProvider component
 * Provides wallet connection state and methods to the application
 */
export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  autoConnect = false,
  desiredChainId = 324, // zkSync Era Mainnet
  supportedChainIds = [1, 5, 137, 80001, 324, 42161] // Mainnet, Goerli, Polygon, Mumbai, zkSync Era, Arbitrum
}) => {
  // Use our custom hook for wallet connection
  const web3Provider = useWeb3Provider({
    autoConnect,
    desiredChainId,
    supportedChainIds
  });
  
  // State for RESEARKA token balance
  const [researchaTokenBalance, setResearchaTokenBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  
  // Extract values from web3Provider
  const {
    provider,
    signer,
    account,
    chainId,
    network,
    isConnected,
    isConnecting,
    error,
    status,
    isSupportedChain,
    connect: connectWallet,
    disconnect: disconnectWallet,
    switchChain: switchNetwork
  } = web3Provider;
  
  // Check if the wallet context is ready
  const isReady = status !== ConnectionStatus.CONNECTING && !isConnecting;
  
  /**
   * Connect to a wallet
   */
  const connect = useCallback(async (walletType?: WalletType): Promise<boolean> => {
    try {
      logger.info('Connecting wallet', {
        context: { walletType },
        category: LogCategory.BLOCKCHAIN
      });
      
      const success = await connectWallet(walletType);
      
      if (success) {
        logger.info('Wallet connected', {
          context: { account, walletType },
          category: LogCategory.BLOCKCHAIN
        });
      }
      
      return success;
    } catch (error: any) {
      logger.error('Error connecting wallet', {
        context: { error, walletType },
        category: LogCategory.ERROR
      });
      
      return false;
    }
  }, [connectWallet, account]);
  
  /**
   * Disconnect from the wallet
   */
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      logger.info('Disconnecting wallet', {
        context: { account },
        category: LogCategory.BLOCKCHAIN
      });
      
      await disconnectWallet();
      
      // Reset RESEARKA token balance
      setResearchaTokenBalance('0');
    } catch (error: any) {
      logger.error('Error disconnecting wallet', {
        context: { error },
        category: LogCategory.ERROR
      });
    }
  }, [disconnectWallet, account]);
  
  /**
   * Switch to a different chain
   */
  const switchChain = useCallback(async (chainId: number): Promise<boolean> => {
    try {
      logger.info('Switching chain', {
        context: { chainId },
        category: LogCategory.BLOCKCHAIN
      });
      
      return await switchNetwork(chainId);
    } catch (error: any) {
      logger.error('Error switching chain', {
        context: { error, chainId },
        category: LogCategory.ERROR
      });
      
      return false;
    }
  }, [switchNetwork]);
  
  /**
   * Fetch RESEARKA token balance
   */
  const fetchTokenBalance = useCallback(async () => {
    if (!signer || !account || !isSupportedChain) {
      setResearchaTokenBalance('0');
      return;
    }
    
    try {
      setIsLoadingBalance(true);
      
      // This is a placeholder for actual token balance fetching
      // In a real implementation, you would use the token contract ABI and address
      // For now, we'll just set a dummy balance
      
      // Simulate a delay for loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set a dummy balance
      setResearchaTokenBalance('1000.00');
      
      logger.info('Fetched RESEARKA token balance', {
        context: { account, balance: '1000.00' },
        category: LogCategory.BLOCKCHAIN
      });
    } catch (error: any) {
      logger.error('Error fetching RESEARKA token balance', {
        context: { error, account },
        category: LogCategory.ERROR
      });
      
      setResearchaTokenBalance('0');
    } finally {
      setIsLoadingBalance(false);
    }
  }, [signer, account, isSupportedChain]);
  
  // Fetch token balance when account or chain changes
  useEffect(() => {
    if (isConnected && account) {
      fetchTokenBalance();
    }
  }, [isConnected, account, chainId, fetchTokenBalance]);
  
  // Create the context value
  const contextValue: WalletContextType = {
    // Provider state
    provider,
    signer,
    account,
    chainId,
    network,
    
    // Connection state
    isConnected,
    isConnecting,
    isReady,
    error,
    
    // Network state
    isSupportedChain,
    supportedChainIds,
    
    // Methods
    connect,
    disconnect,
    switchChain,
    
    // RESEARKA token state
    researchaTokenBalance,
    isLoadingBalance
  };
  
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext;
