import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton, Box, Text, Alert, AlertIcon, Button, Flex } from '@chakra-ui/react';
import { FiExternalLink } from 'react-icons/fi';

// Feature flag for token integration
const ENABLE_TOKEN_FEATURES = process.env.NEXT_PUBLIC_ENABLE_TOKEN_FEATURES === 'true';
const EXTERNAL_TOKEN_WEBSITE = process.env.NEXT_PUBLIC_EXTERNAL_TOKEN_WEBSITE || 'https://researka.io/token';

// Create null or dynamic components based on feature flag
// These imports only happen when the feature flag is true
// This enables proper tree-shaking during build
export const TokenBalance = ENABLE_TOKEN_FEATURES
  ? dynamic(() => import('../components/token/TokenBalance'), {
      ssr: false,
      loading: () => <Skeleton height="100px" />
    })
  : () => (
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

export const TokenTransactions = ENABLE_TOKEN_FEATURES
  ? dynamic(() => import('../components/token/TokenTransactions'), {
      ssr: false,
      loading: () => <Skeleton height="300px" />
    })
  : () => null;

export const StakingPositions = ENABLE_TOKEN_FEATURES
  ? dynamic(() => import('../components/token/StakingPositions'), {
      ssr: false,
      loading: () => <Skeleton height="300px" />
    })
  : () => null;

// A dashboard component that acts as a container 
// (doesn't actually import anything but renders its own content)
export const TokenDashboard: React.FC = () => (
  <Box
    borderWidth="1px"
    borderRadius="lg"
    p={8}
    boxShadow="lg"
    bg="white"
    textAlign="center"
  >
    <Alert status="info" mb={6} borderRadius="md">
      <AlertIcon />
      RESEARKA token functionality is now available on a separate dedicated platform.
    </Alert>
    
    <Text fontSize="lg" mb={6}>
      For token features including balance checking, staking, and transfers,
      please visit the official RESEARKA token platform.
    </Text>
    
    <Flex justifyContent="center">
      <Button 
        as="a" 
        href={EXTERNAL_TOKEN_WEBSITE} 
        target="_blank" 
        rel="noopener noreferrer"
        size="lg"
        colorScheme="green" 
        rightIcon={<FiExternalLink />}
      >
        Visit RESEARKA Token Website
      </Button>
    </Flex>
  </Box>
);
