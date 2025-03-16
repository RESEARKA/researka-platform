import React, { useState } from 'react';
import {
  Box,
  Button,
  Text,
  Heading,
  VStack,
  HStack,
  Divider,
  Badge,
  Flex,
  useColorModeValue,
  Tooltip,
  Icon,
  Skeleton,
  Alert,
  AlertIcon,
  useToast
} from '@chakra-ui/react';
import { FiExternalLink, FiCopy, FiRefreshCw } from 'react-icons/fi';
import { useWallet } from '../WalletProvider';
import { ethers } from 'ethers';

export default function WalletSection() {
  const { 
    isConnected, 
    walletAddress, 
    balance, 
    connectWallet, 
    disconnectWallet, 
    isLoading,
    error
  } = useWallet();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  // Function to copy wallet address to clipboard
  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Function to view wallet on blockchain explorer
  const viewOnExplorer = () => {
    if (walletAddress) {
      // Using zkSync Era explorer
      window.open(`https://explorer.zksync.io/address/${walletAddress}`, '_blank');
    }
  };

  // Function to refresh wallet balance
  const refreshBalance = async () => {
    if (!isConnected) return;
    
    setIsRefreshing(true);
    try {
      // Reconnect wallet to refresh balance
      await connectWallet();
      toast({
        title: 'Balance Updated',
        description: 'Your wallet balance has been refreshed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error refreshing balance:', err);
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh wallet balance',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Box 
      p={5} 
      borderWidth="1px" 
      borderRadius="lg" 
      bg={bgColor} 
      borderColor={borderColor}
    >
      <Heading size="md" mb={4}>Wallet</Heading>
      
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {!isConnected ? (
        <VStack spacing={4} align="stretch">
          <Text>Connect your wallet to access token features and earn rewards for your research contributions.</Text>
          <Button 
            colorScheme="blue" 
            isLoading={isLoading} 
            onClick={connectWallet}
            leftIcon={<Icon as={FiExternalLink} />}
          >
            Connect Wallet
          </Button>
        </VStack>
      ) : (
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between" wrap="wrap">
            <Badge colorScheme="green" p={2} borderRadius="md">Connected</Badge>
            <Button 
              size="sm" 
              variant="outline" 
              colorScheme="red" 
              onClick={disconnectWallet}
            >
              Disconnect
            </Button>
          </HStack>
          
          <Box>
            <Text fontSize="sm" color="gray.500">Wallet Address</Text>
            <HStack>
              <Text fontFamily="mono" isTruncated>
                {walletAddress}
              </Text>
              <Tooltip label="Copy Address">
                <Button size="xs" variant="ghost" onClick={copyToClipboard}>
                  <Icon as={FiCopy} />
                </Button>
              </Tooltip>
              <Tooltip label="View on Explorer">
                <Button size="xs" variant="ghost" onClick={viewOnExplorer}>
                  <Icon as={FiExternalLink} />
                </Button>
              </Tooltip>
            </HStack>
          </Box>
          
          <Divider />
          
          <Box>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">Balance</Text>
              <Button 
                size="xs" 
                variant="ghost" 
                onClick={refreshBalance} 
                isLoading={isRefreshing}
                leftIcon={<Icon as={FiRefreshCw} />}
              >
                Refresh
              </Button>
            </HStack>
            <HStack align="baseline">
              <Text fontSize="2xl" fontWeight="bold">
                {parseFloat(balance).toFixed(4)}
              </Text>
              <Text>ETH</Text>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              ≈ ${(parseFloat(balance) * 3500).toFixed(2)} USD
            </Text>
          </Box>
          
          <Divider />
          
          <Box>
            <Text fontSize="sm" color="gray.500">Researka Tokens</Text>
            <HStack align="baseline">
              <Text fontSize="2xl" fontWeight="bold">0.0000</Text>
              <Text>RSKA</Text>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              ≈ $0.00 USD
            </Text>
          </Box>
          
          <Button 
            colorScheme="blue" 
            variant="outline" 
            mt={2}
            isDisabled={true}
          >
            Manage Tokens
          </Button>
        </VStack>
      )}
    </Box>
  );
}
