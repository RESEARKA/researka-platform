import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Text, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  Skeleton, 
  Flex, 
  Button, 
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  FormErrorMessage,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { useWallet } from '../../contexts/WalletContext';
import { useTokenContract, useTokenBalance } from '../../hooks/useContract';
import { formatTokenAmount } from '../../config/contracts';
import { FiTrendingUp, FiSend, FiExternalLink } from 'react-icons/fi';
import { ethers } from 'ethers';

// Feature flag for token integration
const ENABLE_TOKEN_FEATURES = process.env.NEXT_PUBLIC_ENABLE_TOKEN_FEATURES === 'true';
const EXTERNAL_TOKEN_WEBSITE = process.env.NEXT_PUBLIC_EXTERNAL_TOKEN_WEBSITE || 'https://researka.io/token';

interface TokenBalanceProps {
  tokenAddress: string;
}

// Cache for token balances
const balanceCache = new Map<string, string>();

const TokenBalance: React.FC<TokenBalanceProps> = ({ tokenAddress }) => {
  const { isConnected, account, provider, signer } = useWallet();
  const toast = useToast();
  const tokenContract = useTokenContract(true, tokenAddress);
  const { balance, symbol, isLoading: isBalanceLoading, refetch: refetchBalance } = useTokenBalance(account);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isAmountValid, setIsAmountValid] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // If token features are disabled, show a message directing users to the external token website
  if (!ENABLE_TOKEN_FEATURES) {
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={6}
        mb={6}
        boxShadow="md"
        bg="white"
      >
        <Alert status="info" mb={4}>
          <AlertIcon />
          RESEARKA token functionality is now available on a separate platform.
        </Alert>
        
        <Flex justifyContent="center" mt={4}>
          <Button 
            as="a" 
            href={EXTERNAL_TOKEN_WEBSITE} 
            target="_blank" 
            rel="noopener noreferrer"
            colorScheme="green" 
            rightIcon={<FiExternalLink />}
          >
            Visit RESEARKA Token Website
          </Button>
        </Flex>
      </Box>
    );
  }

  // Memoized fetch function to improve performance
  const fetchTokenBalance = useCallback(async () => {
    if (account && provider && tokenAddress && tokenContract) {
      try {
        // Check cache first (StaleWhileRevalidate strategy)
        const cacheKey = `${account}-${tokenAddress}`;
        if (balanceCache.has(cacheKey)) {
          setBalance(balanceCache.get(cacheKey) || '0');
          // Continue fetching in background
        }
        
        // Get token balance
        const rawBalance = await tokenContract.balanceOf(account);
        const formattedBalance = formatTokenAmount(rawBalance);
        
        // Update cache
        balanceCache.set(cacheKey, formattedBalance);
        
        // Update state
        setBalance(formattedBalance);
        
        // Calculate USD value (assuming $0.10 per token)
        const usdVal = (parseFloat(formattedBalance) * parseFloat('0.10')).toFixed(2);
        setUsdValue(usdVal);
      } catch (error) {
        console.error('Error fetching token balance:', error);
      }
    }
  }, [account, provider, tokenAddress, tokenContract]);

  useEffect(() => {
    fetchTokenBalance();
    
    // Set up event listener for token transfers
    if (tokenContract && account) {
      const receivedFilter = tokenContract.filters.Transfer(null, account);
      const sentFilter = tokenContract.filters.Transfer(account, null);
      
      tokenContract.on(receivedFilter, fetchTokenBalance);
      tokenContract.on(sentFilter, fetchTokenBalance);
      
      return () => {
        tokenContract.off(receivedFilter, fetchTokenBalance);
        tokenContract.off(sentFilter, fetchTokenBalance);
      };
    }
  }, [tokenContract, account, fetchTokenBalance]);

  // Handle token transfer
  const handleTransfer = async () => {
    // Reset error
    setTransferError('');

    // Validate inputs
    if (!recipientAddress || !ethers.utils.isAddress(recipientAddress)) {
      setTransferError('Please enter a valid Ethereum address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setTransferError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      setTransferError('Insufficient balance');
      return;
    }

    if (!signer || !tokenContract) {
      setTransferError('Wallet not connected');
      return;
    }

    setIsTransferring(true);

    try {
      // Convert amount to wei (6 decimals for RESKA)
      const amountWei = ethers.utils.parseUnits(amount, 6);

      // Send transaction
      const tx = await tokenContract.transfer(recipientAddress, amountWei);
      
      // Show pending toast
      toast({
        title: 'Transaction Submitted',
        description: `Transfer of ${amount} RESKA tokens is processing...`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      // Wait for transaction to be mined
      await tx.wait();

      // Show success toast
      toast({
        title: 'Transfer Successful',
        description: `Successfully transferred ${amount} RESKA tokens to ${recipientAddress.substring(0, 6)}...${recipientAddress.substring(recipientAddress.length - 4)}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setRecipientAddress('');
      setAmount('');
      onClose();
      
      // Refresh balance
      fetchTokenBalance();
    } catch (error) {
      console.error('Transfer error:', error);
      setTransferError('Transaction failed. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  if (!isConnected) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
        <Text textAlign="center" color="gray.500">Connect your wallet to view your token balance</Text>
      </Box>
    );
  }

  return (
    <>
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
        <Flex justifyContent="space-between" alignItems="center">
          <Stat>
            <StatLabel fontSize="md" color="gray.600">Your Token Balance</StatLabel>
            {isBalanceLoading ? (
              <Skeleton height="40px" mt={2} mb={2} />
            ) : (
              <StatNumber fontSize="3xl" fontWeight="bold" mt={1}>
                {balance} RESKA
              </StatNumber>
            )}
            
            <StatHelpText display="flex" alignItems="center">
              <FiTrendingUp color="green.400" style={{ marginRight: '5px' }} />
              <Text color="green.400">${(parseFloat(balance) * parseFloat('0.10')).toFixed(2)} USD</Text>
            </StatHelpText>
          </Stat>
          
          <Button 
            leftIcon={<FiSend />} 
            colorScheme="blue" 
            onClick={onOpen}
            isDisabled={isBalanceLoading || parseFloat(balance) <= 0}
          >
            Send
          </Button>
        </Flex>
      </Box>
      
      {/* Transfer Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send RESKA Tokens</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isInvalid={!!transferError} mb={4}>
              <FormLabel>Recipient Address</FormLabel>
              <Input 
                placeholder="0x..." 
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </FormControl>
            
            <FormControl isInvalid={!!transferError} mb={4}>
              <FormLabel>Amount</FormLabel>
              <InputGroup>
                <Input 
                  type="number" 
                  placeholder="0.0" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <InputRightAddon>RESKA</InputRightAddon>
              </InputGroup>
              {transferError && <FormErrorMessage>{transferError}</FormErrorMessage>}
            </FormControl>
            
            <Text fontSize="sm" color="gray.500">
              Available Balance: {balance} RESKA
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleTransfer}
              isLoading={isTransferring}
              loadingText="Sending"
            >
              Send Tokens
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TokenBalance;
