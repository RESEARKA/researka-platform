/**
 * WalletConnect Component
 * 
 * A component for connecting to Ethereum wallets using ethers.js v6.
 * This component uses the useWeb3Provider hook to abstract wallet connection logic.
 */

import React, { useState } from 'react';
import {
  Button,
  Text,
  VStack,
  HStack,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Icon,
  Tooltip,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { FaEthereum, FaWallet, FaExchangeAlt, FaExclamationTriangle } from 'react-icons/fa';
import { 
  useWeb3Provider, 
  WalletType, 
  ConnectionStatus 
} from '../../hooks/useWeb3Provider';
import { createLogger, LogCategory } from '../../utils/logger';

// Create a logger instance for this component
const logger = createLogger('WalletConnect');

// Props for the WalletConnect component
interface WalletConnectProps {
  onConnect?: (account: string) => void;
  onDisconnect?: () => void;
  buttonText?: string;
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  colorScheme?: string;
  showAddress?: boolean;
  showNetworkBadge?: boolean;
  showConnectModal?: boolean;
}

/**
 * WalletConnect component
 * A button for connecting to Ethereum wallets
 */
export const WalletConnect: React.FC<WalletConnectProps> = ({
  onConnect,
  onDisconnect,
  buttonText = 'Connect Wallet',
  variant = 'solid',
  size = 'md',
  colorScheme = 'green',
  showAddress = true,
  showNetworkBadge = true,
  showConnectModal = true
}) => {
  // State for wallet connection
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Modal for wallet selection
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Use our custom hook for wallet connection
  const {
    account,
    chainId,
    status,
    isConnected,
    connect,
    disconnect,
    switchChain,
    isMetaMaskInstalled,
    isSupportedChain,
    supportedChainIds
  } = useWeb3Provider({
    autoConnect: false
  });
  
  // Get network name and color based on chain ID
  const getNetworkInfo = (chainId: number | null) => {
    if (!chainId) return { name: 'Unknown', color: 'gray' };
    
    switch (chainId) {
      case 1:
        return { name: 'Ethereum', color: 'blue' };
      case 5:
        return { name: 'Goerli', color: 'teal' };
      case 137:
        return { name: 'Polygon', color: 'purple' };
      case 80001:
        return { name: 'Mumbai', color: 'purple' };
      case 324:
        return { name: 'zkSync Era', color: 'pink' };
      case 42161:
        return { name: 'Arbitrum', color: 'blue' };
      default:
        return { name: `Chain ${chainId}`, color: 'gray' };
    }
  };
  
  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Handle wallet connection
  const handleConnect = async (walletType: WalletType) => {
    try {
      setIsConnecting(true);
      
      logger.info('Connecting wallet', {
        context: { walletType },
        category: LogCategory.BLOCKCHAIN
      });
      
      const success = await connect(walletType);
      
      if (success && account) {
        logger.info('Wallet connected', {
          context: { account, walletType },
          category: LogCategory.BLOCKCHAIN
        });
        
        if (onConnect) {
          onConnect(account);
        }
        
        onClose();
      }
    } catch (error) {
      logger.error('Error connecting wallet', {
        context: { error, walletType },
        category: LogCategory.ERROR
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Handle wallet disconnection
  const handleDisconnect = async () => {
    try {
      logger.info('Disconnecting wallet', {
        context: { account },
        category: LogCategory.BLOCKCHAIN
      });
      
      await disconnect();
      
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (error) {
      logger.error('Error disconnecting wallet', {
        context: { error },
        category: LogCategory.ERROR
      });
    }
  };
  
  // Handle network switch
  const handleSwitchNetwork = async (chainId: number) => {
    try {
      logger.info('Switching network', {
        context: { chainId },
        category: LogCategory.BLOCKCHAIN
      });
      
      await switchChain(chainId);
    } catch (error) {
      logger.error('Error switching network', {
        context: { error, chainId },
        category: LogCategory.ERROR
      });
    }
  };
  
  // Get network information
  const networkInfo = getNetworkInfo(chainId);
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Render wallet connection button
  if (!isConnected) {
    return (
      <>
        <Button
          leftIcon={<FaWallet />}
          onClick={showConnectModal ? onOpen : () => handleConnect(WalletType.METAMASK)}
          variant={variant}
          size={size}
          colorScheme={colorScheme}
          isLoading={isConnecting || status === ConnectionStatus.CONNECTING}
          loadingText="Connecting"
        >
          {buttonText}
        </Button>
        
        {/* Wallet selection modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader color="brand.700">Connect Wallet</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Text>
                  Connect your wallet to interact with the RESEARKA platform.
                </Text>
                
                {/* MetaMask */}
                <Button
                  leftIcon={<FaEthereum />}
                  onClick={() => handleConnect(WalletType.METAMASK)}
                  isDisabled={!isMetaMaskInstalled}
                  colorScheme="orange"
                  variant="outline"
                  justifyContent="flex-start"
                  size="lg"
                  isLoading={isConnecting}
                >
                  MetaMask
                </Button>
                
                {/* Coinbase Wallet */}
                <Button
                  leftIcon={<Icon as={FaWallet} />}
                  onClick={() => handleConnect(WalletType.COINBASE)}
                  colorScheme="blue"
                  variant="outline"
                  justifyContent="flex-start"
                  size="lg"
                  isLoading={isConnecting}
                >
                  Coinbase Wallet
                </Button>
                
                {/* WalletConnect */}
                <Button
                  leftIcon={<Icon as={FaWallet} />}
                  onClick={() => handleConnect(WalletType.WALLET_CONNECT)}
                  colorScheme="purple"
                  variant="outline"
                  justifyContent="flex-start"
                  size="lg"
                  isLoading={isConnecting}
                >
                  WalletConnect
                </Button>
                
                {!isMetaMaskInstalled && (
                  <Text fontSize="sm" color="orange.500">
                    MetaMask not detected. Please install MetaMask to use this feature.
                  </Text>
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  }
  
  // Render connected wallet
  return (
    <Box
      borderWidth={1}
      borderRadius="md"
      borderColor={borderColor}
      bg={bgColor}
      p={2}
      boxShadow="sm"
    >
      <HStack spacing={2}>
        {/* Network badge */}
        {showNetworkBadge && (
          <Tooltip label={isSupportedChain ? 'Connected Network' : 'Unsupported Network'}>
            <Badge
              colorScheme={isSupportedChain ? networkInfo.color : 'red'}
              variant="solid"
              borderRadius="full"
              px={2}
              display="flex"
              alignItems="center"
            >
              {!isSupportedChain && (
                <Icon as={FaExclamationTriangle} mr={1} fontSize="xs" />
              )}
              {networkInfo.name}
            </Badge>
          </Tooltip>
        )}
        
        {/* Address */}
        {showAddress && account && (
          <Text fontSize="sm" fontWeight="medium">
            {formatAddress(account)}
          </Text>
        )}
        
        {/* Network switch button */}
        {!isSupportedChain && (
          <Tooltip label="Switch to a supported network">
            <Button
              size="xs"
              leftIcon={<FaExchangeAlt />}
              colorScheme="red"
              variant="ghost"
              onClick={() => handleSwitchNetwork(supportedChainIds[0])}
            >
              Switch
            </Button>
          </Tooltip>
        )}
        
        {/* Disconnect button */}
        <Button
          size="xs"
          colorScheme={colorScheme}
          variant="ghost"
          onClick={handleDisconnect}
        >
          Disconnect
        </Button>
      </HStack>
    </Box>
  );
};

export default WalletConnect;
