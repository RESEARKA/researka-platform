import React, { useState } from 'react';
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
import { FiTrendingUp, FiSend, FiExternalLink } from 'react-icons/fi';
import { ethers } from 'ethers';

// Feature flag for token integration
const ENABLE_TOKEN_FEATURES = process.env.NEXT_PUBLIC_ENABLE_TOKEN_FEATURES === 'true';
const EXTERNAL_TOKEN_WEBSITE = process.env.NEXT_PUBLIC_EXTERNAL_TOKEN_WEBSITE || 'https://researka.io/token';

interface TokenBalanceProps {
  tokenAddress: string;
}

interface HandleTransferProps {
  recipientAddress: string;
  amount: string;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({ tokenAddress }) => {
  const { account, isConnected }: { account: string | null; isConnected: boolean } = useWallet();
  const toast = useToast();
  const tokenContract = useTokenContract(true, tokenAddress);
  const { balance, isLoading: isBalanceLoading, refetch: refetchBalance, symbol }: { balance: string; isLoading: boolean; refetch: () => void; symbol: string } = useTokenBalance(account || '');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
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

  // Handle token transfer logic
  const handleTransfer = async ({ recipientAddress, amount }: HandleTransferProps) => {
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
    
    if (parseFloat(amount) > parseFloat(balance || '0')) {
      setTransferError('Insufficient balance');
      return;
    }
    
    if (!account || !tokenContract) {
      setTransferError('Wallet not connected');
      return;
    }
    
    setIsTransferring(true);

    try {
      // Convert amount to wei (use token decimals from contract)
      const decimals = await tokenContract.decimals();
      const amountWei = ethers.utils.parseUnits(amount, decimals);

      // Send transaction
      const tx = await tokenContract.transfer(recipientAddress, amountWei);
      
      // Show pending toast
      toast({
        title: 'Processing Transfer',
        description: `Transfer of ${amount} ${symbol} tokens is processing...`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
      
      await tx.wait();
      
      // Show success toast
      toast({
        title: 'Transfer Successful',
        description: `Successfully transferred ${amount} ${symbol} tokens to ${recipientAddress.substring(0, 6)}...${recipientAddress.substring(recipientAddress.length - 4)}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setRecipientAddress('');
      setAmount('');
      onClose();
      
      // Refresh balance
      if (refetchBalance) {
        refetchBalance();
      }
    } catch (error: any) {
      console.error('Error transferring tokens:', error);
      setTransferError(error.message || 'Failed to transfer tokens. Please try again.');
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
                {balance} {symbol}
              </StatNumber>
            )}
            
            <StatHelpText display="flex" alignItems="center">
              <FiTrendingUp color="green.400" style={{ marginRight: '5px' }} />
              <Text color="green.400">${(parseFloat(balance || '0') * 0.10).toFixed(2)} USD</Text>
            </StatHelpText>
          </Stat>
          
          <Button 
            leftIcon={<FiSend />} 
            colorScheme="blue" 
            onClick={onOpen}
            isDisabled={isBalanceLoading || parseFloat(balance || '0') <= 0}
          >
            Send
          </Button>
        </Flex>
      </Box>
      
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transfer {symbol} Tokens</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={6}>
            <FormControl isRequired>
              <FormLabel>Recipient Address</FormLabel>
              <Input 
                placeholder="0x..." 
                value={recipientAddress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipientAddress(e.target.value)}
              />
            </FormControl>
            
            <FormControl mt={4} isRequired isInvalid={!!transferError}>
              <FormLabel>Amount</FormLabel>
              <InputGroup>
                <Input 
                  type="number" 
                  placeholder="0.0" 
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                />
                <InputRightAddon>{symbol}</InputRightAddon>
              </InputGroup>
              {transferError && <FormErrorMessage>{transferError}</FormErrorMessage>}
            </FormControl>
            
            <Text fontSize="sm" color="gray.500" mt={2}>
              Available Balance: {balance} {symbol}
            </Text>
          </ModalBody>
          
          <ModalFooter>
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={() => handleTransfer({ recipientAddress, amount })}
              isLoading={isTransferring}
              loadingText="Transferring"
            >
              Send
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TokenBalance;
