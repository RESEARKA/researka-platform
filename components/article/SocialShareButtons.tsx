import React, { useCallback } from 'react';
import { 
  HStack, 
  IconButton, 
  Tooltip,
  Box,
  Text,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Button,
  VStack,
  Divider,
  useDisclosure,
  VisuallyHidden,
  Spinner
} from '@chakra-ui/react';
import { 
  FiTwitter, 
  FiLinkedin, 
  FiMail, 
  FiLink,
  FiShare2,
  FiFacebook,
  FiInstagram
} from 'react-icons/fi';
import { ShareMetrics } from '../../utils/shareMetrics';
import { useShareLinks, SharePlatform } from '../../hooks';

interface SocialShareButtonsProps {
  title: string;
  url: string;
  description?: string;
  showShareCount?: boolean;
  compact?: boolean;
  onShare?: (platform: SharePlatform) => void;
  initialCounts?: Partial<ShareMetrics>;
  articleId?: string;
}

/**
 * SocialShareButtons component
 * 
 * A component for sharing content on various social media platforms
 * Supports Twitter, LinkedIn, Facebook, Email, and Copy Link functionality
 * 
 * @param title - The title of the content to share
 * @param url - The URL to share
 * @param description - Optional description for email sharing
 * @param showShareCount - Whether to show share counts
 * @param compact - Whether to show a compact version with popover
 * @param onShare - Optional callback when content is shared
 * @param initialCounts - Initial share counts (optional)
 * @param articleId - ID of the article for tracking shares (optional)
 */
export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({ 
  title, 
  url,
  description = '',
  showShareCount = false,
  compact = false,
  onShare,
  initialCounts = {},
  articleId
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Use our custom hook for sharing logic
  const {
    shareCounts,
    isLoading,
    loadingPlatform,
    hasCopied,
    handleShare,
    handleCopyLink
  } = useShareLinks(title, url, {
    description,
    showShareCount,
    onShare,
    initialCounts,
    articleId
  });
  
  // Colors for the UI
  const countBg = useColorModeValue('blue.50', 'blue.900');
  const countColor = useColorModeValue('blue.600', 'blue.200');
  
  // ShareButton component to reduce repetition and improve performance
  const ShareButton = React.memo(({ 
    platform, 
    icon, 
    label, 
    count, 
    onClick 
  }: { 
    platform: SharePlatform; 
    icon: React.ReactElement; 
    label: string; 
    count?: number; 
    onClick: () => void; 
  }) => {
    // Memoize the click handler to prevent recreating on each render
    const handleClick = useCallback(() => {
      onClick();
    }, [onClick]);
    
    const isButtonLoading = loadingPlatform === platform;
    
    if (compact) {
      return (
        <Button
          leftIcon={isButtonLoading ? undefined : icon}
          justifyContent="flex-start"
          variant="ghost"
          size="sm"
          onClick={handleClick}
          aria-label={`Share on ${label}`}
          role="menuitem"
          py={2}
          width="100%"
          aria-haspopup={platform === 'email' ? 'dialog' : undefined}
          isDisabled={isLoading}
          isLoading={isButtonLoading}
          loadingText={`Sharing on ${label}...`}
        >
          {!isButtonLoading && label}
          {!isButtonLoading && showShareCount && count !== undefined && count > 0 && (
            <Text 
              ml="auto" 
              fontSize="xs" 
              bg={countBg} 
              color={countColor} 
              px={2} 
              py={1} 
              borderRadius="full"
              aria-live="polite"
            >
              {count}
              <VisuallyHidden> shares</VisuallyHidden>
            </Text>
          )}
        </Button>
      );
    }
    
    return (
      <Tooltip label={`Share on ${label}`} hasArrow openDelay={300}>
        <IconButton
          aria-label={`Share on ${label}`}
          icon={isButtonLoading ? <Spinner size="sm" /> : icon}
          size={{ base: "md", md: "md" }}
          colorScheme={platform === 'email' ? 'gray' : 'green'}
          onClick={handleClick}
          position="relative"
          minW="40px"
          height="40px"
          aria-haspopup={platform === 'email' ? 'dialog' : undefined}
          isDisabled={isLoading}
          isLoading={isButtonLoading}
        >
          {!isButtonLoading && !isLoading && showShareCount && count !== undefined && count > 0 && (
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
              aria-live="polite"
            >
              {count}
              <VisuallyHidden> shares</VisuallyHidden>
            </Box>
          )}
        </IconButton>
      </Tooltip>
    );
  });
  
  // Prevent unnecessary re-renders
  ShareButton.displayName = 'ShareButton';
  
  // Compact version with popover
  if (compact) {
    return (
      <Popover
        isOpen={isOpen}
        onOpen={() => {
          onOpen();
          // Focus first item when opened
          setTimeout(() => {
            const firstMenuItem = document.querySelector('[role="menuitem"]');
            if (firstMenuItem instanceof HTMLElement) {
              firstMenuItem.focus();
            }
          }, 100);
        }}
        onClose={onClose}
        placement="bottom"
        closeOnBlur={true}
        gutter={8}
        returnFocusOnClose={true}
      >
        <PopoverTrigger>
          <Button
            leftIcon={<FiShare2 />}
            size="sm"
            colorScheme="green"
            variant="outline"
            aria-label="Share this article"
            px={4}
            py={2}
          >
            {showShareCount && shareCounts.total > 0 ? `Share (${shareCounts.total})` : 'Share'}
          </Button>
        </PopoverTrigger>
        <PopoverContent width={{ base: "260px", md: "280px" }} role="menu">
          <PopoverArrow />
          <PopoverBody p={3}>
            <VStack spacing={2} align="stretch" role="group">
              <Text fontWeight="medium" mb={1}>Share this article</Text>
              <Divider />
              <ShareButton
                platform="twitter"
                icon={<FiTwitter />}
                label="Twitter"
                count={shareCounts.twitter}
                onClick={() => handleShare('twitter')}
              />
              <ShareButton
                platform="linkedin"
                icon={<FiLinkedin />}
                label="LinkedIn"
                count={shareCounts.linkedin}
                onClick={() => handleShare('linkedin')}
              />
              <ShareButton
                platform="facebook"
                icon={<FiFacebook />}
                label="Facebook"
                count={shareCounts.facebook}
                onClick={() => handleShare('facebook')}
              />
              <ShareButton
                platform="instagram"
                icon={<FiInstagram />}
                label="Instagram"
                count={shareCounts.instagram}
                onClick={() => handleShare('instagram')}
              />
              <ShareButton
                platform="email"
                icon={<FiMail />}
                label="Email"
                count={shareCounts.email}
                onClick={() => handleShare('email')}
              />
              <Divider />
              <Button
                leftIcon={<FiLink />}
                justifyContent="flex-start"
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                aria-label="Copy link"
                role="menuitem"
                py={2}
                isLoading={loadingPlatform === 'copy'}
                loadingText="Copying..."
              >
                {loadingPlatform !== 'copy' && 'Copy link'}
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
      {showShareCount && shareCounts.total > 0 && (
        <Text 
          fontSize="sm" 
          mb={2} 
          color="gray.500"
          aria-live="polite"
        >
          Shared {shareCounts.total} times
        </Text>
      )}
      <HStack spacing={2}>
        <ShareButton
          platform="twitter"
          icon={<FiTwitter />}
          label="Twitter"
          count={shareCounts.twitter}
          onClick={() => handleShare('twitter')}
        />
        
        <ShareButton
          platform="linkedin"
          icon={<FiLinkedin />}
          label="LinkedIn"
          count={shareCounts.linkedin}
          onClick={() => handleShare('linkedin')}
        />
        
        <ShareButton
          platform="facebook"
          icon={<FiFacebook />}
          label="Facebook"
          count={shareCounts.facebook}
          onClick={() => handleShare('facebook')}
        />
        
        <ShareButton
          platform="instagram"
          icon={<FiInstagram />}
          label="Instagram"
          count={shareCounts.instagram}
          onClick={() => handleShare('instagram')}
        />
        
        <ShareButton
          platform="email"
          icon={<FiMail />}
          label="Email"
          count={shareCounts.email}
          onClick={() => handleShare('email')}
        />
        
        <Tooltip label={hasCopied ? "Copied!" : "Copy Link"} hasArrow openDelay={300}>
          <IconButton
            aria-label="Copy Link"
            icon={loadingPlatform === 'copy' ? <Spinner size="sm" /> : <FiLink />}
            size={{ base: "md", md: "md" }}
            colorScheme="green"
            onClick={handleCopyLink}
            minW="40px"
            height="40px"
            isLoading={loadingPlatform === 'copy'}
          />
        </Tooltip>
      </HStack>
    </Box>
  );
};

export default SocialShareButtons;
