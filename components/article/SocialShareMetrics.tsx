import React from 'react';
import { 
  HStack, Icon, Text, Tooltip, 
  Box, VStack, Divider 
} from '@chakra-ui/react';
import { 
  FiShare2, FiTwitter, FiFacebook, 
  FiLinkedin, FiMail 
} from 'react-icons/fi';

interface ShareCounts {
  total: number;
  twitter?: number;
  facebook?: number;
  linkedin?: number;
  email?: number;
}

interface SocialShareMetricsProps {
  shares: ShareCounts;
  showDetailed?: boolean;
}

/**
 * A component that displays social share metrics for an article
 * Can show either a simple total or a detailed breakdown by platform
 */
export const SocialShareMetrics: React.FC<SocialShareMetricsProps> = ({ 
  shares, 
  showDetailed = false 
}) => {
  // Simple version - just shows total shares
  if (!showDetailed) {
    return (
      <Tooltip label="Total shares">
        <HStack spacing={1}>
          <Icon as={FiShare2} color="blue.500" />
          <Text fontSize="sm" color="gray.600">{shares.total}</Text>
        </HStack>
      </Tooltip>
    );
  }
  
  // Detailed version - shows breakdown by platform
  return (
    <Box>
      <HStack spacing={1} mb={2}>
        <Icon as={FiShare2} color="blue.500" />
        <Text fontWeight="medium">{shares.total} Shares</Text>
      </HStack>
      
      <Divider mb={2} />
      
      <VStack align="stretch" spacing={1}>
        {shares.twitter !== undefined && (
          <HStack justify="space-between">
            <HStack>
              <Icon as={FiTwitter} color="twitter.500" />
              <Text fontSize="sm">Twitter</Text>
            </HStack>
            <Text fontSize="sm">{shares.twitter}</Text>
          </HStack>
        )}
        
        {shares.facebook !== undefined && (
          <HStack justify="space-between">
            <HStack>
              <Icon as={FiFacebook} color="facebook.500" />
              <Text fontSize="sm">Facebook</Text>
            </HStack>
            <Text fontSize="sm">{shares.facebook}</Text>
          </HStack>
        )}
        
        {shares.linkedin !== undefined && (
          <HStack justify="space-between">
            <HStack>
              <Icon as={FiLinkedin} color="linkedin.500" />
              <Text fontSize="sm">LinkedIn</Text>
            </HStack>
            <Text fontSize="sm">{shares.linkedin}</Text>
          </HStack>
        )}
        
        {shares.email !== undefined && (
          <HStack justify="space-between">
            <HStack>
              <Icon as={FiMail} color="gray.500" />
              <Text fontSize="sm">Email</Text>
            </HStack>
            <Text fontSize="sm">{shares.email}</Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

export default SocialShareMetrics;
