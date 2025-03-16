import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@chakra-ui/react';

// Create the context with default values
const WalletContext = createContext<{
  isConnected: boolean;
  walletAddress: string | null;
  balance: string;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
  error: string | null;
}>({
  isConnected: false,
  walletAddress: null,
  balance: '0',
  provider: null,
  signer: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isLoading: false,
  error: null
});

// Custom hook to use the wallet context
export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Connect wallet function - only called when user explicitly requests it
  const connectWallet = useCallback(async () => {
    if (!isClient) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          // Create provider and signer
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
          const walletSigner = web3Provider.getSigner();
          
          // Get balance
          const walletBalance = await web3Provider.getBalance(address);
          
          // Update state
          setProvider(web3Provider);
          setSigner(walletSigner);
          setWalletAddress(address);
          setBalance(ethers.utils.formatEther(walletBalance));
          setIsConnected(true);
          
          toast({
            title: 'Wallet Connected',
            description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          
          // Set up event listeners only after successful connection
          if (window.ethereum) {
            window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
              if (newAccounts.length === 0) {
                disconnectWallet();
              } else {
                setWalletAddress(newAccounts[0]);
              }
            });
            
            window.ethereum.on('chainChanged', () => {
              window.location.reload();
            });
          }
        }
      } else {
        setError('No Ethereum wallet found. Please install MetaMask.');
        toast({
          title: 'Connection Error',
          description: 'No Ethereum wallet found. Please install MetaMask.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      toast({
        title: 'Connection Error',
        description: err.message || 'Failed to connect wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [isClient, toast]);

  // Disconnect wallet function
  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setWalletAddress(null);
    setBalance('0');
    setIsConnected(false);
    
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  }, [toast]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAddress,
        balance,
        provider,
        signer,
        connectWallet,
        disconnectWallet,
        isLoading,
        error
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
