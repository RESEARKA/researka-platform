import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../contexts/WalletContext';
import { Button, Box, Text, Flex, useToast, Menu, MenuButton, MenuList, MenuItem, Spinner } from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';

const WalletConnect: React.FC = () => {
  const { 
    account, 
    connect, 
    disconnect, 
    chainId, 
    switchToZkSync,
    isConnecting
  } = useWallet();
  const [balance, setBalance] = useState<string>('');
  const toast = useToast();

  useEffect(() => {
    const fetchBalance = async () => {
      if (account) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const ethBalance = await provider.getBalance(account);
          setBalance(ethers.utils.formatEther(ethBalance).substring(0, 6));
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };

    fetchBalance();
  }, [account]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error: any) {
      toast({
        title: 'Connection Error',
        description: error.message || 'Failed to connect wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: 'Wallet Disconnected',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToZkSync();
    } catch (error: any) {
      toast({
        title: 'Network Switch Error',
        description: error.message || 'Failed to switch network',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Format account address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Check if on the correct network (zkSync)
  const isCorrectNetwork = chainId === 324 || chainId === 280; // 324 = zkSync mainnet, 280 = zkSync testnet

  return (
    <Box>
      {!account ? (
        <Button
          onClick={handleConnect}
          colorScheme="blue"
          isLoading={isConnecting}
          loadingText="Connecting"
        >
          Connect Wallet
        </Button>
      ) : (
        <Flex align="center">
          {!isCorrectNetwork && (
            <Button
              onClick={handleSwitchNetwork}
              colorScheme="orange"
              size="sm"
              mr={2}
            >
              Switch to zkSync
            </Button>
          )}
          
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<FiChevronDown />}
              colorScheme="blue"
              variant="outline"
            >
              <Flex align="center">
                <Text>{formatAddress(account)}</Text>
                {balance && (
                  <Text ml={2} fontSize="sm">
                    {balance} ETH
                  </Text>
                )}
              </Flex>
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => navigator.clipboard.writeText(account)}>
                Copy Address
              </MenuItem>
              <MenuItem onClick={handleDisconnect}>Disconnect</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      )}
    </Box>
  );
};

export default WalletConnect;
