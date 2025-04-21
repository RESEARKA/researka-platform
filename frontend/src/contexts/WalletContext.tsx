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
      
      // Ensure function always returns a value
      return undefined;
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
        
        // Ensure function always returns a value
        return undefined;
      };

      // Handle chain changes
      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
        
        // Ensure function always returns a value
        return undefined;
      };

      // Subscribe to events
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [account, provider]);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('No Ethereum wallet detected. Please install MetaMask or another wallet.');
    }

    setIsConnecting(true);

    try {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      const accounts = await ethProvider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setSigner(ethProvider.getSigner());
        
        const network = await ethProvider.getNetwork();
        setChainId(network.chainId);
        
        setProvider(ethProvider);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      throw new Error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setAccount(null);
    setSigner(null);
  }, []);

  // Switch to zkSync network
  const switchToZkSync = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('No Ethereum wallet detected');
    }

    try {
      // Try to switch to zkSync Era
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORKS.ZKSYNC_MAINNET.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${NETWORKS.ZKSYNC_MAINNET.toString(16)}`,
                chainName: 'zkSync Era Mainnet',
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
        } catch (addError: any) {
          throw new Error(addError.message || 'Failed to add zkSync network');
        }
      } else {
        throw new Error(switchError.message || 'Failed to switch to zkSync network');
      }
    }
  }, []);

  const value = {
    account,
    chainId,
    provider,
    signer,
    connect,
    disconnect,
    switchToZkSync,
    isConnecting,
    isCorrectNetwork,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

// Add this declaration to make window.ethereum available
declare global {
  interface Window {
    ethereum: any;
  }
}
