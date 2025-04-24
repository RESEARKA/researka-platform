import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { NETWORKS, RPC_URLS } from '../config/contracts';

interface WalletContextType {
  account: string | null;
  chainId: number | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToZkSync: () => Promise<void>;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  chainId: null,
  provider: null,
  signer: null,
  connect: async () => {},
  disconnect: () => {},
  switchToZkSync: async () => {},
  isConnecting: false,
  isCorrectNetwork: false,
  isConnected: false,
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if on the correct network (zkSync)
  const isCorrectNetwork = useMemo(() => {
    if (!chainId) return false;
    return chainId === NETWORKS.ZKSYNC_MAINNET || chainId === NETWORKS.ZKSYNC_TESTNET;
  }, [chainId]);

  // Check if wallet is connected
  const isConnected = useMemo(() => {
    return !!account && !!provider;
  }, [account, provider]);

  // Initialize provider from window.ethereum if available
  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        try {
          // Add DNS prefetch for zkSync resources
          const linkEl = document.createElement('link');
          linkEl.rel = 'dns-prefetch';
          linkEl.href = 'https://mainnet.era.zksync.io';
          document.head.appendChild(linkEl);
          
          const ethProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
          setProvider(ethProvider);
          
          // Check if already connected
          const accounts = await ethProvider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setSigner(ethProvider.getSigner());
            
            const network = await ethProvider.getNetwork();
            setChainId(network.chainId);
          }
        } catch (error) {
          console.error("Failed to initialize provider", error);
        }
      }
    };

    initProvider();
    
    return () => {
      // Clean up DNS prefetch
      const prefetchLink = document.querySelector('link[rel="dns-prefetch"][href="https://mainnet.era.zksync.io"]');
      if (prefetchLink && prefetchLink.parentNode) {
        prefetchLink.parentNode.removeChild(prefetchLink);
      }
    };
  }, []);

  // Setup event listeners for wallet changes
  useEffect(() => {
    if (window.ethereum) {
      // Handle account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnect();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          if (provider) {
            setSigner(provider.getSigner());
          }
        }
      };

      // Handle chain changes
      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup listeners on unmount
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, provider]);

  // Connect wallet function
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      window.open('https://metamask.io/download.html', '_blank');
      return;
    }

    try {
      setIsConnecting(true);
      
      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        // Get provider and signer
        const ethProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        setProvider(ethProvider);
        setSigner(ethProvider.getSigner());
        
        // Get chain ID
        const network = await ethProvider.getNetwork();
        setChainId(network.chainId);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet function
  const disconnect = useCallback(() => {
    setAccount(null);
    setSigner(null);
    // Note: We keep the provider instance for reconnection
  }, []);

  // Switch to zkSync network
  const switchToZkSync = useCallback(async () => {
    if (!window.ethereum || !provider) return;
    
    const targetChainId = `0x${NETWORKS.ZKSYNC_MAINNET.toString(16)}`;
    
    try {
      // Try to switch to the zkSync network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: targetChainId,
                chainName: 'zkSync Mainnet',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [RPC_URLS[NETWORKS.ZKSYNC_MAINNET]],
                blockExplorerUrls: ['https://explorer.zksync.io'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding zkSync network to MetaMask:', addError);
        }
      } else {
        console.error('Error switching to zkSync network:', switchError);
      }
    }
  }, [provider]);

  // Create memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    account,
    chainId,
    provider,
    signer,
    connect,
    disconnect,
    switchToZkSync,
    isConnecting,
    isCorrectNetwork,
    isConnected,
  }), [
    account,
    chainId,
    provider,
    signer,
    connect,
    disconnect,
    switchToZkSync,
    isConnecting,
    isCorrectNetwork,
    isConnected,
  ]);

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Add this declaration to make window.ethereum available
declare global {
  interface Window {
    ethereum: any;
  }
}
