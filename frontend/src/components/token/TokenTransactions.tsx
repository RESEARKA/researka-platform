import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../contexts/WalletContext';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  VStack,
  HStack,
  Select,
  useToast,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightAddon,
} from '@chakra-ui/react';
import ResearkaTokenABI from '../../abis/ResearkaToken.json';
import ResearchaTreasuryABI from '../../abis/ResearchaTreasury.json';

interface TokenTransactionsProps {
  tokenAddress: string;
  treasuryAddress: string;
}

const TokenTransactions: React.FC<TokenTransactionsProps> = ({ tokenAddress, treasuryAddress }) => {
  const { account, signer } = useWallet();
  const toast = useToast();

  // Transfer state
  const [transferTo, setTransferTo] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState<boolean>(false);

  // Staking state
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [stakePeriod, setStakePeriod] = useState<string>('30');
  const [isStaking, setIsStaking] = useState<boolean>(false);

  // Validation state
  const [transferError, setTransferError] = useState<string>('');
  const [stakeError, setStakeError] = useState<string>('');

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

    if (!signer) {
      setTransferError('Wallet not connected');
      return;
    }

    setIsTransferring(true);

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ResearkaTokenABI.abi,
        signer
      );

      // Convert amount to wei (18 decimals)
      const amountWei = ethers.utils.parseUnits(transferAmount, 18);

      // Send transaction
      const tx = await tokenContract.transfer(transferTo, amountWei);
      
      // Show pending toast
      toast({
        title: 'Transaction Submitted',
        description: `Transfer of ${transferAmount} RSKA tokens is processing...`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      // Wait for transaction to be mined
      await tx.wait();

      // Show success toast
      toast({
        title: 'Transfer Successful',
        description: `Successfully transferred ${transferAmount} RSKA tokens to ${transferTo.substring(0, 6)}...${transferTo.substring(transferTo.length - 4)}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setTransferTo('');
      setTransferAmount('');
    } catch (error: any) {
      console.error('Transfer error:', error);
      setTransferError(error.message || 'Failed to transfer tokens');
      
      toast({
        title: 'Transfer Failed',
        description: error.message || 'Failed to transfer tokens',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsTransferring(false);
    }
  };

  // Handle token staking
  const handleStake = async () => {
    // Reset error
    setStakeError('');

    // Validate inputs
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setStakeError('Please enter a valid amount');
      return;
    }

    if (!signer) {
      setStakeError('Wallet not connected');
      return;
    }

    setIsStaking(true);

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ResearkaTokenABI.abi,
        signer
      );

      const treasuryContract = new ethers.Contract(
        treasuryAddress,
        ResearchaTreasuryABI.abi,
        signer
      );

      // Convert amount to wei (18 decimals)
      const amountWei = ethers.utils.parseUnits(stakeAmount, 18);

      // First approve treasury to spend tokens
      const approveTx = await tokenContract.approve(treasuryAddress, amountWei);
      
      toast({
        title: 'Approval Submitted',
        description: 'Approving tokens for staking...',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      // Wait for approval to be mined
      await approveTx.wait();

      // Calculate staking period in seconds
      const stakingPeriodSeconds = parseInt(stakePeriod) * 24 * 60 * 60; // days to seconds

      // Now create staking position
      const stakeTx = await treasuryContract.createStakingPosition(amountWei, stakingPeriodSeconds);
      
      toast({
        title: 'Staking Transaction Submitted',
        description: `Staking ${stakeAmount} RSKA tokens for ${stakePeriod} days...`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      // Wait for staking transaction to be mined
      await stakeTx.wait();

      // Show success toast
      toast({
        title: 'Staking Successful',
        description: `Successfully staked ${stakeAmount} RSKA tokens for ${stakePeriod} days`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setStakeAmount('');
    } catch (error: any) {
      console.error('Staking error:', error);
      setStakeError(error.message || 'Failed to stake tokens');
      
      toast({
        title: 'Staking Failed',
        description: error.message || 'Failed to stake tokens',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsStaking(false);
    }
  };

  if (!account) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
        <Text>Connect your wallet to perform token transactions</Text>
      </Box>
    );
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <Tabs isFitted variant="enclosed" colorScheme="blue">
        <TabList mb="1em">
          <Tab>Transfer</Tab>
          <Tab>Stake</Tab>
        </TabList>
        
        <TabPanels>
          {/* Transfer Panel */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="medium">Send RSKA Tokens</Text>
              
              {transferError && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {transferError}
                </Alert>
              )}
              
              <FormControl isRequired>
                <FormLabel>Recipient Address</FormLabel>
                <Input
                  placeholder="0x..."
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Amount</FormLabel>
                <InputGroup>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <InputRightAddon>RSKA</InputRightAddon>
                </InputGroup>
              </FormControl>
              
              <Button
                colorScheme="blue"
                isLoading={isTransferring}
                loadingText="Transferring"
                onClick={handleTransfer}
                mt={2}
              >
                Send Tokens
              </Button>
            </VStack>
          </TabPanel>
          
          {/* Stake Panel */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="medium">Stake RSKA Tokens</Text>
              <Text fontSize="sm" color="gray.600">
                Earn rewards by staking your RSKA tokens. Longer staking periods earn higher rewards.
              </Text>
              
              {stakeError && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {stakeError}
                </Alert>
              )}
              
              <FormControl isRequired>
                <FormLabel>Stake Amount</FormLabel>
                <InputGroup>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <InputRightAddon>RSKA</InputRightAddon>
                </InputGroup>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Staking Period</FormLabel>
                <Select
                  value={stakePeriod}
                  onChange={(e) => setStakePeriod(e.target.value)}
                >
                  <option value="30">30 Days (15% APY)</option>
                  <option value="90">90 Days (16.5% APY)</option>
                  <option value="180">180 Days (18% APY)</option>
                  <option value="365">365 Days (21% APY)</option>
                </Select>
              </FormControl>
              
              <Box p={3} bg="blue.50" borderRadius="md">
                <HStack justify="space-between">
                  <Text fontSize="sm">Estimated Annual Yield:</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {parseInt(stakePeriod) <= 30
                      ? '15.0%'
                      : parseInt(stakePeriod) <= 90
                      ? '16.5%'
                      : parseInt(stakePeriod) <= 180
                      ? '18.0%'
                      : '21.0%'}
                  </Text>
                </HStack>
                <HStack justify="space-between" mt={1}>
                  <Text fontSize="sm">Lock Period:</Text>
                  <Text fontSize="sm" fontWeight="bold">{stakePeriod} days</Text>
                </HStack>
              </Box>
              
              <Button
                colorScheme="blue"
                isLoading={isStaking}
                loadingText="Staking"
                onClick={handleStake}
                mt={2}
              >
                Stake Tokens
              </Button>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default TokenTransactions;
