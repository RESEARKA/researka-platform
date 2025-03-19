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
  FormErrorMessage
} from '@chakra-ui/react';
import { useWallet } from '../../contexts/WalletContext';
import { useTokenContract, useTokenBalance } from '../../hooks/useContract';
import { formatTokenAmount } from '../../config/contracts';
import { FiTrendingUp, FiSend } from 'react-icons/fi';
import { ethers } from 'ethers';

interface TokenBalanceProps {
  tokenAddress: string;
}

// Cache for token balances
const balanceCache = new Map<string, string>();

const TokenBalance: React.FC<TokenBalanceProps> = ({ tokenAddress }) => {
  const { account, provider, signer } = useWallet();
  const [balance, setBalance] = useState<string>('0');
  const [tokenPrice, setTokenPrice] = useState<string>('0.10');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [usdValue, setUsdValue] = useState<string>('0');
  const toast = useToast();
  const tokenContract = useTokenContract(false, tokenAddress);
  const tokenContractWithSigner = useTokenContract(true, tokenAddress);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Transfer state
  const [transferTo, setTransferTo] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferError, setTransferError] = useState<string>('');
  
  // Memoized fetch function to improve performance
  const fetchTokenBalance = useCallback(async () => {
    if (account && provider && tokenAddress && tokenContract) {
      try {
        setIsLoading(true);
        
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
        const usdVal = (parseFloat(formattedBalance) * parseFloat(tokenPrice)).toFixed(2);
        setUsdValue(usdVal);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching token balance:', error);
        setIsLoading(false);
      }
    }
  }, [account, provider, tokenAddress, tokenContract, tokenPrice]);
  
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
    if (!transferTo || !ethers.utils.isAddress(transferTo)) {
      setTransferError('Please enter a valid Ethereum address');
      return;
    }

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setTransferError('Please enter a valid amount');
      return;
    }

    if (parseFloat(transferAmount) > parseFloat(balance)) {
      setTransferError('Insufficient balance');
      return;
    }

    if (!signer || !tokenContractWithSigner) {
      setTransferError('Wallet not connected');
      return;
    }

    setIsTransferring(true);

    try {
      // Convert amount to wei (6 decimals for RESKA)
      const amountWei = ethers.utils.parseUnits(transferAmount, 6);

      // Send transaction
      const tx = await tokenContractWithSigner.transfer(transferTo, amountWei);
      
      // Show pending toast
      toast({
        title: 'Transaction Submitted',
        description: `Transfer of ${transferAmount} RESKA tokens is processing...`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      // Wait for transaction to be mined
      await tx.wait();

      // Show success toast
      toast({
        title: 'Transfer Successful',
        description: `Successfully transferred ${transferAmount} RESKA tokens to ${transferTo.substring(0, 6)}...${transferTo.substring(transferTo.length - 4)}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setTransferTo('');
      setTransferAmount('');
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
  
  if (!account) {
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
            {isLoading ? (
              <Skeleton height="40px" mt={2} mb={2} />
            ) : (
              <StatNumber fontSize="3xl" fontWeight="bold" mt={1}>
                {balance} RESKA
              </StatNumber>
            )}
            
            <StatHelpText display="flex" alignItems="center">
              <FiTrendingUp color="green.400" style={{ marginRight: '5px' }} />
              <Text color="green.400">${usdValue} USD</Text>
            </StatHelpText>
          </Stat>
          
          <Button 
            leftIcon={<FiSend />} 
            colorScheme="blue" 
            onClick={onOpen}
            isDisabled={isLoading || parseFloat(balance) <= 0}
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
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
              />
            </FormControl>
            
            <FormControl isInvalid={!!transferError} mb={4}>
              <FormLabel>Amount</FormLabel>
              <InputGroup>
                <Input 
                  type="number" 
                  placeholder="0.0" 
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
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
