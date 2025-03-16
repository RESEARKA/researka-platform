import React, { useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { ethers } from 'ethers';

// Simple component that only accesses window.ethereum when the button is clicked
export function ConnectWalletButton() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const toast = useToast();

  const connectWallet = async () => {
    // Only run this function when the button is clicked
    setIsConnecting(true);
    
    try {
      // Check if we're in a browser environment and if ethereum is available
      if (typeof window !== 'undefined' && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        
        setWalletAddress(address);
        
        toast({
          title: 'Wallet Connected',
          description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
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
      toast({
        title: 'Connection Error',
        description: err.message || 'Failed to connect wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button
      colorScheme="blue"
      isLoading={isConnecting}
      onClick={connectWallet}
    >
      {walletAddress 
        ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
        : 'Connect Wallet'}
    </Button>
  );
}
