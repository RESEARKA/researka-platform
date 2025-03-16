import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../contexts/WalletContext';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Skeleton,
  useToast,
  Flex,
  Heading,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import ResearchaTreasuryABI from '../../abis/ResearchaTreasury.json';

interface StakingPosition {
  id: number;
  amount: string;
  startTime: Date;
  endTime: Date;
  lastClaimTime: Date;
  active: boolean;
  estimatedRewards: string;
}

interface StakingPositionsProps {
  treasuryAddress: string;
}

const StakingPositions: React.FC<StakingPositionsProps> = ({ treasuryAddress }) => {
  const { account, provider, signer } = useWallet();
  const [positions, setPositions] = useState<StakingPosition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalStaked, setTotalStaked] = useState<string>('0');
  const [totalRewards, setTotalRewards] = useState<string>('0');
  const [selectedPosition, setSelectedPosition] = useState<StakingPosition | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const fetchStakingPositions = async () => {
      if (account && provider && treasuryAddress) {
        try {
          setIsLoading(true);
          const treasuryContract = new ethers.Contract(
            treasuryAddress,
            ResearchaTreasuryABI.abi,
            provider
          );
          
          // Get staking position IDs for the account
          const positionIds = await treasuryContract.getStakerPositions(account);
          
          // Fetch details for each position
          const positionPromises = positionIds.map(async (id: number) => {
            const position = await treasuryContract.stakingPositions(id);
            const rewards = await treasuryContract.calculateStakingReward(id);
            
            return {
              id: id.toString(),
              amount: ethers.utils.formatUnits(position.amount, 18),
              startTime: new Date(position.startTime.toNumber() * 1000),
              endTime: new Date(position.endTime.toNumber() * 1000),
              lastClaimTime: new Date(position.lastClaimTime.toNumber() * 1000),
              active: position.active,
              estimatedRewards: ethers.utils.formatUnits(rewards, 18)
            };
          });
          
          const fetchedPositions = await Promise.all(positionPromises);
          setPositions(fetchedPositions);
          
          // Calculate totals
          let stakedSum = 0;
          let rewardsSum = 0;
          
          fetchedPositions.forEach(position => {
            if (position.active) {
              stakedSum += parseFloat(position.amount);
              rewardsSum += parseFloat(position.estimatedRewards);
            }
          });
          
          setTotalStaked(stakedSum.toFixed(2));
          setTotalRewards(rewardsSum.toFixed(2));
        } catch (error) {
          console.error('Error fetching staking positions:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch staking positions',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchStakingPositions();
    
    // Refresh every 60 seconds
    const intervalId = setInterval(fetchStakingPositions, 60000);
    
    return () => clearInterval(intervalId);
  }, [account, provider, treasuryAddress, toast]);

  const handleClaimRewards = async (position: StakingPosition) => {
    if (!signer) {
      toast({
        title: 'Error',
        description: 'Wallet not connected',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setSelectedPosition(position);
    setIsProcessing(true);
    
    try {
      const treasuryContract = new ethers.Contract(
        treasuryAddress,
        ResearchaTreasuryABI.abi,
        signer
      );
      
      // Claim rewards
      const tx = await treasuryContract.claimStakingReward(position.id);
      
      toast({
        title: 'Transaction Submitted',
        description: 'Claiming rewards...',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
      
      // Wait for transaction to be mined
      await tx.wait();
      
      toast({
        title: 'Rewards Claimed',
        description: `Successfully claimed ${position.estimatedRewards} RSKA tokens`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh positions
      const updatedPositions = [...positions];
      const index = updatedPositions.findIndex(p => p.id === position.id);
      
      if (index !== -1) {
        // Update last claim time and reset estimated rewards
        updatedPositions[index] = {
          ...updatedPositions[index],
          lastClaimTime: new Date(),
          estimatedRewards: '0'
        };
        
        setPositions(updatedPositions);
        
        // Update total rewards
        const newTotalRewards = parseFloat(totalRewards) - parseFloat(position.estimatedRewards);
        setTotalRewards(Math.max(0, newTotalRewards).toFixed(2));
      }
    } catch (error: any) {
      console.error('Error claiming rewards:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to claim rewards',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  const handleWithdraw = async (position: StakingPosition) => {
    if (!signer) {
      toast({
        title: 'Error',
        description: 'Wallet not connected',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Check if staking period has ended
    const now = new Date();
    if (now < position.endTime) {
      toast({
        title: 'Cannot Withdraw',
        description: 'Staking period has not ended yet',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setSelectedPosition(position);
    setIsProcessing(true);
    
    try {
      const treasuryContract = new ethers.Contract(
        treasuryAddress,
        ResearchaTreasuryABI.abi,
        signer
      );
      
      // Close staking position
      const tx = await treasuryContract.closeStakingPosition(position.id);
      
      toast({
        title: 'Transaction Submitted',
        description: 'Withdrawing staked tokens...',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
      
      // Wait for transaction to be mined
      await tx.wait();
      
      const totalAmount = (parseFloat(position.amount) + parseFloat(position.estimatedRewards)).toFixed(2);
      
      toast({
        title: 'Withdrawal Successful',
        description: `Successfully withdrawn ${totalAmount} RSKA tokens`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh positions
      const updatedPositions = [...positions];
      const index = updatedPositions.findIndex(p => p.id === position.id);
      
      if (index !== -1) {
        // Mark position as inactive
        updatedPositions[index] = {
          ...updatedPositions[index],
          active: false
        };
        
        setPositions(updatedPositions);
        
        // Update totals
        const newTotalStaked = parseFloat(totalStaked) - parseFloat(position.amount);
        const newTotalRewards = parseFloat(totalRewards) - parseFloat(position.estimatedRewards);
        
        setTotalStaked(Math.max(0, newTotalStaked).toFixed(2));
        setTotalRewards(Math.max(0, newTotalRewards).toFixed(2));
      }
    } catch (error: any) {
      console.error('Error withdrawing stake:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to withdraw staked tokens',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (!account) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
        <Text>Connect your wallet to view staking positions</Text>
      </Box>
    );
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <Heading size="md" mb={4}>Your Staking Positions</Heading>
      
      <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
        <Stat bg="blue.50" p={3} borderRadius="md" flex="1">
          <StatLabel>Total Staked</StatLabel>
          <StatNumber>{totalStaked} RSKA</StatNumber>
          <StatHelpText>≈ ${(parseFloat(totalStaked) * 0.10).toFixed(2)} USD</StatHelpText>
        </Stat>
        
        <Stat bg="green.50" p={3} borderRadius="md" flex="1">
          <StatLabel>Pending Rewards</StatLabel>
          <StatNumber>{totalRewards} RSKA</StatNumber>
          <StatHelpText>≈ ${(parseFloat(totalRewards) * 0.10).toFixed(2)} USD</StatHelpText>
        </Stat>
      </Flex>
      
      <Divider mb={4} />
      
      <Skeleton isLoaded={!isLoading}>
        {positions.length > 0 ? (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Amount</Th>
                  <Th>Start Date</Th>
                  <Th>End Date</Th>
                  <Th>Status</Th>
                  <Th>Rewards</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {positions.map((position) => (
                  <Tr key={position.id}>
                    <Td>{position.id}</Td>
                    <Td>{parseFloat(position.amount).toFixed(2)} RSKA</Td>
                    <Td>{formatDate(position.startTime)}</Td>
                    <Td>{formatDate(position.endTime)}</Td>
                    <Td>
                      {position.active ? (
                        <Badge colorScheme="green">
                          Active ({getDaysRemaining(position.endTime)} days left)
                        </Badge>
                      ) : (
                        <Badge colorScheme="gray">Closed</Badge>
                      )}
                    </Td>
                    <Td>{parseFloat(position.estimatedRewards).toFixed(4)} RSKA</Td>
                    <Td>
                      <HStack spacing={2}>
                        {position.active && parseFloat(position.estimatedRewards) > 0 && (
                          <Button
                            size="xs"
                            colorScheme="green"
                            onClick={() => {
                              setSelectedPosition(position);
                              onOpen();
                            }}
                          >
                            Claim
                          </Button>
                        )}
                        
                        {position.active && new Date() >= position.endTime && (
                          <Button
                            size="xs"
                            colorScheme="blue"
                            onClick={() => {
                              setSelectedPosition(position);
                              onOpen();
                            }}
                          >
                            Withdraw
                          </Button>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        ) : (
          <VStack spacing={4} align="center" py={8}>
            <Text>You don't have any staking positions yet.</Text>
            <Text fontSize="sm" color="gray.500">
              Stake your RSKA tokens to earn rewards and participate in governance.
            </Text>
          </VStack>
        )}
      </Skeleton>
      
      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedPosition && new Date() >= selectedPosition.endTime
              ? 'Withdraw Staked Tokens'
              : 'Claim Staking Rewards'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPosition && (
              <VStack align="stretch" spacing={4}>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text mb={2}>Position Details:</Text>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Amount Staked:</Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {parseFloat(selectedPosition.amount).toFixed(2)} RSKA
                    </Text>
                  </HStack>
                  <HStack justify="space-between" mt={1}>
                    <Text fontSize="sm">Staking Period:</Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {formatDate(selectedPosition.startTime)} - {formatDate(selectedPosition.endTime)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" mt={1}>
                    <Text fontSize="sm">Rewards Available:</Text>
                    <Text fontSize="sm" fontWeight="bold" color="green.500">
                      {parseFloat(selectedPosition.estimatedRewards).toFixed(4)} RSKA
                    </Text>
                  </HStack>
                </Box>
                
                <Text>
                  {selectedPosition && new Date() >= selectedPosition.endTime
                    ? `Are you sure you want to withdraw your staked tokens and rewards? This will close your staking position.`
                    : `Are you sure you want to claim your staking rewards? You can continue earning rewards on your staked tokens.`}
                </Text>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isProcessing}>
              Cancel
            </Button>
            <Button
              colorScheme={selectedPosition && new Date() >= selectedPosition.endTime ? 'blue' : 'green'}
              isLoading={isProcessing}
              loadingText={selectedPosition && new Date() >= selectedPosition.endTime ? 'Withdrawing' : 'Claiming'}
              onClick={() => {
                if (selectedPosition) {
                  if (new Date() >= selectedPosition.endTime) {
                    handleWithdraw(selectedPosition);
                  } else {
                    handleClaimRewards(selectedPosition);
                  }
                }
              }}
            >
              {selectedPosition && new Date() >= selectedPosition.endTime ? 'Withdraw' : 'Claim'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default StakingPositions;
