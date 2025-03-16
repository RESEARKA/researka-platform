import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Text, 
  Skeleton, 
  Link,
  Badge,
  HStack,
  Button,
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
  useToast,
  Icon
} from '@chakra-ui/react';
import { useTokenContract } from '../hooks/useContract';
import { useWallet } from '../contexts/WalletContext';
import { formatAddress, getTransactionUrl, parseTokenAmount, formatTokenAmount } from '../config/contracts';
import { FiExternalLink, FiArrowUpRight, FiArrowDownLeft } from 'react-icons/fi';
import { ethers } from 'ethers';

// Cache for transaction data
const transactionCache = new Map<string, any[]>();

const TokenTransactions: React.FC = () => {
  const { account, chainId, isCorrectNetwork } = useWallet();
  const tokenContract = useTokenContract();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const tokenContractWithSigner = useTokenContract(true);
  const toast = useToast();
  
  // Memoized fetch function to improve performance
  const fetchTransactions = useCallback(async () => {
    if (!tokenContract || !account || !chainId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Check cache first (StaleWhileRevalidate strategy)
      const cacheKey = `${account}-${chainId}`;
      if (transactionCache.has(cacheKey)) {
        setTransactions(transactionCache.get(cacheKey) || []);
        // Continue fetching in background
      }
      
      // Create filters for sent and received transactions
      const sentFilter = tokenContract.filters.Transfer(account, null);
      const receivedFilter = tokenContract.filters.Transfer(null, account);
      
      // Get the last 50 blocks for recent transactions
      const currentBlock = await tokenContract.provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 5000); // Last 5000 blocks
      
      // Get events
      const [sentEvents, receivedEvents] = await Promise.all([
        tokenContract.queryFilter(sentFilter, fromBlock),
        tokenContract.queryFilter(receivedFilter, fromBlock)
      ]);
      
      // Combine and sort events
      const allEvents = [...sentEvents, ...receivedEvents].sort((a, b) => {
        if (a.blockNumber === b.blockNumber) {
          return b.transactionIndex - a.transactionIndex;
        }
        return b.blockNumber - a.blockNumber;
      });
      
      // Format transactions
      const formattedTransactions = await Promise.all(
        allEvents.slice(0, 10).map(async (event) => {
          const block = await event.getBlock();
          return {
            hash: event.transactionHash,
            from: event.args?.[0],
            to: event.args?.[1],
            value: formatTokenAmount(event.args?.[2]),
            timestamp: new Date(block.timestamp * 1000),
            type: event.args?.[0] === account ? 'sent' : 'received'
          };
        })
      );
      
      // Update cache
      transactionCache.set(cacheKey, formattedTransactions);
      
      setTransactions(formattedTransactions);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setIsLoading(false);
    }
  }, [tokenContract, account, chainId]);
  
  useEffect(() => {
    fetchTransactions();
    
    // Set up event listeners for new transactions
    if (tokenContract && account) {
      const sentFilter = tokenContract.filters.Transfer(account, null);
      const receivedFilter = tokenContract.filters.Transfer(null, account);
      
      tokenContract.on(sentFilter, fetchTransactions);
      tokenContract.on(receivedFilter, fetchTransactions);
      
      return () => {
        tokenContract.off(sentFilter, fetchTransactions);
        tokenContract.off(receivedFilter, fetchTransactions);
      };
    }
  }, [tokenContract, account, fetchTransactions]);
  
  const handleSendTokens = async () => {
    if (!tokenContractWithSigner || !recipient || !amount) return;
    
    try {
      setIsSending(true);
      
      // Validate recipient address
      if (!ethers.utils.isAddress(recipient)) {
        throw new Error('Invalid recipient address');
      }
      
      // Parse amount to wei
      const amountWei = parseTokenAmount(amount);
      
      // Send transaction
      const tx = await tokenContractWithSigner.transfer(recipient, amountWei);
      await tx.wait();
      
      toast({
        title: 'Transfer Successful',
        description: `Successfully sent ${amount} RSK tokens to ${formatAddress(recipient)}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
      setRecipient('');
      setAmount('');
      
      // Refresh transactions
      fetchTransactions();
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: 'Transfer Failed',
        description: 'Failed to send tokens. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSending(false);
    }
  };
  
  if (!account) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
        <Text textAlign="center" color="gray.500">Connect your wallet to view your transactions</Text>
      </Box>
    );
  }
  
  if (!isCorrectNetwork) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
        <Text textAlign="center" color="orange.500">Switch to zkSync network to view your transactions</Text>
      </Box>
    );
  }
  
  return (
    <>
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
        <HStack justifyContent="space-between" mb={4}>
          <Text fontWeight="bold">Recent Transactions</Text>
          <Button size="sm" colorScheme="blue" onClick={onOpen}>Send Tokens</Button>
        </HStack>
        
        {isLoading ? (
          <Skeleton height="200px" />
        ) : transactions.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={4}>
            No transactions found
          </Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Type</Th>
                  <Th>Amount</Th>
                  <Th>From/To</Th>
                  <Th>Time</Th>
                  <Th>Tx Hash</Th>
                </Tr>
              </Thead>
              <Tbody>
                {transactions.map((tx) => (
                  <Tr key={tx.hash}>
                    <Td>
                      <Badge 
                        colorScheme={tx.type === 'received' ? 'green' : 'blue'}
                        display="flex"
                        alignItems="center"
                      >
                        <Icon 
                          as={tx.type === 'received' ? FiArrowDownLeft : FiArrowUpRight} 
                          mr={1} 
                        />
                        {tx.type === 'received' ? 'Received' : 'Sent'}
                      </Badge>
                    </Td>
                    <Td fontWeight="medium">{tx.value} RSK</Td>
                    <Td>
                      {tx.type === 'received' 
                        ? formatAddress(tx.from) 
                        : formatAddress(tx.to)
                      }
                    </Td>
                    <Td>{tx.timestamp.toLocaleString()}</Td>
                    <Td>
                      <Link 
                        href={chainId ? getTransactionUrl(tx.hash, chainId) : '#'} 
                        isExternal
                        color="blue.500"
                        display="flex"
                        alignItems="center"
                      >
                        {formatAddress(tx.hash)}
                        <Icon as={FiExternalLink} ml={1} />
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
      
      {/* Send Tokens Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send RSK Tokens</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Recipient Address</FormLabel>
              <Input 
                value={recipient} 
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSendTokens}
              isLoading={isSending}
              loadingText="Sending"
              isDisabled={!recipient || !amount || parseFloat(amount) <= 0}
            >
              Send Tokens
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TokenTransactions;
