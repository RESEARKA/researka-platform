import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Button, 
  Badge, 
  Skeleton, 
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
  Select,
  useToast
} from '@chakra-ui/react';
import { useStakingPositions, useTreasuryContract, useTokenContract } from '../hooks/useContract';
import { useWallet } from '../contexts/WalletContext';
import { parseTokenAmount } from '../config/contracts';
import { ethers } from 'ethers';

const StakingPositions: React.FC = () => {
  const { account, isCorrectNetwork } = useWallet();
  const { positions, isLoading } = useStakingPositions();
  const treasuryContract = useTreasuryContract(true);
  const tokenContract = useTokenContract(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const toast = useToast();

  const handleStake = async () => {
    if (!treasuryContract || !tokenContract || !amount) return;
    
    try {
      setIsStaking(true);
      
      // Parse amount to wei
      const amountWei = parseTokenAmount(amount);
      
      // First approve the treasury contract to spend tokens
      const approveTx = await tokenContract.approve(
        treasuryContract.address,
        amountWei
      );
      await approveTx.wait();
      
      // Then stake the tokens
      const stakeTx = await treasuryContract.stake(
        amountWei,
        parseInt(duration)
      );
      await stakeTx.wait();
      
      toast({
        title: 'Staking Successful',
        description: `Successfully staked ${amount} RSK tokens for ${duration} days.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
      setAmount('');
      setDuration('30');
    } catch (error) {
      console.error('Staking error:', error);
      toast({
        title: 'Staking Failed',
        description: 'Failed to stake tokens. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async (positionId: number) => {
    if (!treasuryContract) return;
    
    try {
      setIsUnstaking(true);
      setSelectedPositionId(positionId);
      
      const unstakeTx = await treasuryContract.unstake(positionId);
      await unstakeTx.wait();
      
      toast({
        title: 'Unstaking Successful',
        description: 'Successfully unstaked your tokens.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Unstaking error:', error);
      toast({
        title: 'Unstaking Failed',
        description: 'Failed to unstake tokens. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUnstaking(false);
      setSelectedPositionId(null);
    }
  };

  if (!account) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
        <Text textAlign="center" color="gray.500">Connect your wallet to view your staking positions</Text>
      </Box>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
        <Text textAlign="center" color="orange.500">Switch to zkSync network to view your staking positions</Text>
      </Box>
    );
  }

  return (
    <>
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
        <HStack justifyContent="space-between" mb={4}>
          <Heading size="md">Your Staking Positions</Heading>
          <Button size="sm" colorScheme="blue" onClick={onOpen}>Stake Tokens</Button>
        </HStack>
        
        {isLoading ? (
          <VStack spacing={4} align="stretch">
            <Skeleton height="80px" />
            <Skeleton height="80px" />
          </VStack>
        ) : positions.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={4}>
            You don't have any active staking positions
          </Text>
        ) : (
          <VStack spacing={4} align="stretch">
            {positions.map((position) => (
              <Box 
                key={position.id} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg="gray.50"
              >
                <HStack justifyContent="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">{position.amount} RSK</Text>
                    <HStack>
                      <Badge colorScheme="green">
                        {position.apy}% APY
                      </Badge>
                      <Text fontSize="sm" color="gray.600">
                        Until {position.endTime.toLocaleDateString()}
                      </Text>
                    </HStack>
                  </VStack>
                  
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    isDisabled={!position.isUnstakable}
                    onClick={() => handleUnstake(position.id)}
                    isLoading={isUnstaking && selectedPositionId === position.id}
                    loadingText="Unstaking"
                  >
                    {position.isUnstakable ? 'Unstake' : 'Locked'}
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
      
      {/* Staking Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Stake RSK Tokens</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Amount to Stake</FormLabel>
                <Input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Staking Duration</FormLabel>
                <Select 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="30">30 days (15% APY)</option>
                  <option value="90">90 days (17% APY)</option>
                  <option value="180">180 days (19% APY)</option>
                  <option value="365">365 days (21% APY)</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleStake}
              isLoading={isStaking}
              loadingText="Staking"
              isDisabled={!amount || parseFloat(amount) <= 0}
            >
              Stake Tokens
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default StakingPositions;
