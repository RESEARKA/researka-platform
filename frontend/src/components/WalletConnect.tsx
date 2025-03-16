import React from 'react';
import { Button, Box, Text, HStack, useToast } from '@chakra-ui/react';
import { useWallet } from '../contexts/WalletContext';
import { formatAddress } from '../config/contracts';
import { FiChevronDown } from 'react-icons/fi';

const WalletConnect: React.FC = () => {
  const { account, connect, disconnect, isConnecting, chainId, switchToZkSync, isCorrectNetwork } = useWallet();
  const toast = useToast();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: 'Connection Failed',
        description: 'Could not connect to your wallet. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToZkSync();
    } catch (error) {
      console.error('Network switch error:', error);
      toast({
        title: 'Network Switch Failed',
        description: 'Could not switch to zkSync network. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!account) {
    return (
      <Button 
        colorScheme="blue" 
        onClick={handleConnect} 
        isLoading={isConnecting}
        loadingText="Connecting"
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <HStack spacing={4}>
      {!isCorrectNetwork && (
        <Button 
          colorScheme="orange" 
          size="sm" 
          onClick={handleSwitchNetwork}
        >
          Switch to zkSync
        </Button>
      )}
      <Box 
        borderWidth="1px" 
        borderRadius="md" 
        px={4} 
        py={2} 
        bg="gray.50"
      >
        <Text fontSize="sm" fontWeight="medium">
          {formatAddress(account)}
        </Text>
      </Box>
      <Button 
        size="sm" 
        variant="outline" 
        colorScheme="blue" 
        onClick={disconnect}
      >
        Disconnect
      </Button>
    </HStack>
  );
};

export default WalletConnect;
