import React, { useState } from 'react';
import { 
  HStack, 
  IconButton, 
  Tooltip,
  useClipboard,
  useToast,
  Box,
  Text,
  Flex,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Button,
  VStack,
  Divider,
  useDisclosure
} from '@chakra-ui/react';
import { 
  FiTwitter, 
  FiLinkedin, 
  FiMail, 
  FiLink,
  FiShare2,
  FiFacebook,
  FiMessageSquare
} from 'react-icons/fi';

interface SocialShareButtonsProps {
  title: string;
  url: string;
  description?: string;
  showShareCount?: boolean;
  compact?: boolean;
  onShare?: (platform: string) => void;
}

/**
 * SocialShareButtons component
 * 
 * A component for sharing content on various social media platforms
 * Supports Twitter, LinkedIn, Facebook, Email, and Copy Link functionality
 */
export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({ 
  title, 
  url,
  description = '',
  showShareCount = false,
  compact = false,
  onShare
}) => {
  const { hasCopied, onCopy } = useClipboard(url);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Mock share counts - in a real implementation, these would come from API calls
  const [shareCounts, setShareCounts] = useState({
    twitter: 12,
    linkedin: 8,
    facebook: 15,
    email: 3,
    total: 38
  });
  
  // Colors for better dark/light mode support
  const buttonBg = useColorModeValue('gray.100', 'gray.700');
  const buttonHoverBg = useColorModeValue('gray.200', 'gray.600');
  const iconColor = useColorModeValue('gray.700', 'gray.200');
  const countBg = useColorModeValue('blue.50', 'blue.900');
  const countColor = useColorModeValue('blue.600', 'blue.200');
  
  const handleCopyLink = () => {
    onCopy();
    toast({
      title: "Link copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    if (onShare) onShare('copy');
  };
  
  const handleShare = (platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + url)}`;
        break;
      default:
        return;
    }
    
    // Open in new window
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    
    // Update share count (in a real app, this would be an API call)
    if (showShareCount) {
      setShareCounts(prev => ({
        ...prev,
        [platform]: prev[platform] + 1,
        total: prev.total + 1
      }));
    }
    
    // Call onShare callback if provided
    if (onShare) onShare(platform);
    
    // Close popover if in compact mode
    if (compact) onClose();
  };
  
  // Compact version with popover
  if (compact) {
    return (
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        placement="bottom"
        closeOnBlur={true}
      >
        <PopoverTrigger>
          <Button
            leftIcon={<FiShare2 />}
            size="sm"
            colorScheme="blue"
            variant="outline"
            aria-label="Share this article"
          >
            {showShareCount ? `Share (${shareCounts.total})` : 'Share'}
          </Button>
        </PopoverTrigger>
        <PopoverContent width="240px">
          <PopoverArrow />
          <PopoverBody p={3}>
            <VStack spacing={2} align="stretch">
              <Text fontWeight="medium" mb={1}>Share this article</Text>
              <Divider />
              <Button
                leftIcon={<FiTwitter />}
                justifyContent="flex-start"
                variant="ghost"
                size="sm"
                onClick={() => handleShare('twitter')}
                aria-label="Share on Twitter"
              >
                Twitter
                {showShareCount && (
                  <Text ml="auto" fontSize="xs" bg={countBg} color={countColor} px={2} py={1} borderRadius="full">
                    {shareCounts.twitter}
                  </Text>
                )}
              </Button>
              <Button
                leftIcon={<FiLinkedin />}
                justifyContent="flex-start"
                variant="ghost"
                size="sm"
                onClick={() => handleShare('linkedin')}
                aria-label="Share on LinkedIn"
              >
                LinkedIn
                {showShareCount && (
                  <Text ml="auto" fontSize="xs" bg={countBg} color={countColor} px={2} py={1} borderRadius="full">
                    {shareCounts.linkedin}
                  </Text>
                )}
              </Button>
              <Button
                leftIcon={<FiFacebook />}
                justifyContent="flex-start"
                variant="ghost"
                size="sm"
                onClick={() => handleShare('facebook')}
                aria-label="Share on Facebook"
              >
                Facebook
                {showShareCount && (
                  <Text ml="auto" fontSize="xs" bg={countBg} color={countColor} px={2} py={1} borderRadius="full">
                    {shareCounts.facebook}
                  </Text>
                )}
              </Button>
              <Button
                leftIcon={<FiMail />}
                justifyContent="flex-start"
                variant="ghost"
                size="sm"
                onClick={() => handleShare('email')}
                aria-label="Share via Email"
              >
                Email
                {showShareCount && (
                  <Text ml="auto" fontSize="xs" bg={countBg} color={countColor} px={2} py={1} borderRadius="full">
                    {shareCounts.email}
                  </Text>
                )}
              </Button>
              <Divider />
              <Button
                leftIcon={<FiLink />}
                justifyContent="flex-start"
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                aria-label="Copy link"
              >
                Copy link
              </Button>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  }
  
  // Full version with individual buttons
  return (
    <Box>
      {showShareCount && (
        <Text fontSize="sm" mb={2} color="gray.500">
          Shared {shareCounts.total} times
        </Text>
      )}
      <HStack spacing={2}>
        <Tooltip label="Share on Twitter" hasArrow>
          <IconButton
            aria-label="Share on Twitter"
            icon={<FiTwitter />}
            size="md"
            colorScheme="twitter"
            onClick={() => handleShare('twitter')}
            position="relative"
          >
            {showShareCount && shareCounts.twitter > 0 && (
              <Box
                position="absolute"
                top="-8px"
                right="-8px"
                bg={countBg}
                color={countColor}
                fontSize="xs"
                fontWeight="bold"
                px={2}
                py={0.5}
                borderRadius="full"
                boxShadow="sm"
              >
                {shareCounts.twitter}
              </Box>
            )}
          </IconButton>
        </Tooltip>
        
        <Tooltip label="Share on LinkedIn" hasArrow>
          <IconButton
            aria-label="Share on LinkedIn"
            icon={<FiLinkedin />}
            size="md"
            colorScheme="linkedin"
            onClick={() => handleShare('linkedin')}
            position="relative"
          >
            {showShareCount && shareCounts.linkedin > 0 && (
              <Box
                position="absolute"
                top="-8px"
                right="-8px"
                bg={countBg}
                color={countColor}
                fontSize="xs"
                fontWeight="bold"
                px={2}
                py={0.5}
                borderRadius="full"
                boxShadow="sm"
              >
                {shareCounts.linkedin}
              </Box>
            )}
          </IconButton>
        </Tooltip>
        
        <Tooltip label="Share on Facebook" hasArrow>
          <IconButton
            aria-label="Share on Facebook"
            icon={<FiFacebook />}
            size="md"
            colorScheme="facebook"
            onClick={() => handleShare('facebook')}
            position="relative"
          >
            {showShareCount && shareCounts.facebook > 0 && (
              <Box
                position="absolute"
                top="-8px"
                right="-8px"
                bg={countBg}
                color={countColor}
                fontSize="xs"
                fontWeight="bold"
                px={2}
                py={0.5}
                borderRadius="full"
                boxShadow="sm"
              >
                {shareCounts.facebook}
              </Box>
            )}
          </IconButton>
        </Tooltip>
        
        <Tooltip label="Share via Email" hasArrow>
          <IconButton
            aria-label="Share via Email"
            icon={<FiMail />}
            size="md"
            colorScheme="gray"
            onClick={() => handleShare('email')}
            position="relative"
          >
            {showShareCount && shareCounts.email > 0 && (
              <Box
                position="absolute"
                top="-8px"
                right="-8px"
                bg={countBg}
                color={countColor}
                fontSize="xs"
                fontWeight="bold"
                px={2}
                py={0.5}
                borderRadius="full"
                boxShadow="sm"
              >
                {shareCounts.email}
              </Box>
            )}
          </IconButton>
        </Tooltip>
        
        <Tooltip label={hasCopied ? "Copied!" : "Copy Link"} hasArrow>
          <IconButton
            aria-label="Copy Link"
            icon={<FiLink />}
            size="md"
            colorScheme="blue"
            onClick={handleCopyLink}
          />
        </Tooltip>
      </HStack>
    </Box>
  );
};

export default SocialShareButtons;
