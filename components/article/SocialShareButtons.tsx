import React, { useCallback, useState, useEffect } from 'react';
import { 
  HStack, 
  IconButton, 
  Tooltip,
  useClipboard,
  useToast,
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
import { getShareMetrics, recordShareEvent, ShareMetrics } from '../../utils/shareMetrics';
import { createLogger, LogCategory } from '../../utils/logger';

const logger = createLogger('social-share-buttons');

export type SharePlatform = 'twitter' | 'linkedin' | 'facebook' | 'email' | 'instagram' | 'copy';

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
  const { hasCopied, onCopy } = useClipboard(url);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlatform, setLoadingPlatform] = useState<SharePlatform | null>(null);
  
  // Initialize share counts with zeros or provided initial values
  const [shareCounts, setShareCounts] = useState<ShareMetrics>({
    twitter: initialCounts.twitter || 0,
    linkedin: initialCounts.linkedin || 0,
    facebook: initialCounts.facebook || 0,
    email: initialCounts.email || 0,
    instagram: initialCounts.instagram || 0,
    total: initialCounts.total || 
           (initialCounts.twitter || 0) + 
           (initialCounts.linkedin || 0) + 
           (initialCounts.facebook || 0) + 
           (initialCounts.email || 0) + 
           (initialCounts.instagram || 0)
  });
  
  // Fetch share metrics on mount if articleId is provided
  useEffect(() => {
    if (articleId && showShareCount) {
      const fetchShareMetrics = async () => {
        try {
          const metrics = await getShareMetrics(articleId);
          setShareCounts(metrics);
        } catch (error) {
          logger.error('Failed to fetch share metrics', {
            context: { articleId, error },
            category: LogCategory.DATA
          });
        }
      };
      
      fetchShareMetrics();
    }
  }, [articleId, showShareCount]);
  
  // Colors for the UI
  const countBg = useColorModeValue('blue.50', 'blue.900');
  const countColor = useColorModeValue('blue.600', 'blue.200');
  
  // Extract URL generation to utility function
  const getShareUrl = useCallback((platform: SharePlatform): string => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case 'email':
        return `mailto:?subject=${encodedTitle}&body=${encodedDescription ? encodedDescription + '%0A%0A' : ''}${encodedUrl}`;
      case 'instagram':
        // Instagram doesn't have a direct web sharing API, so we'll open a new tab with instructions
        return `https://www.instagram.com/`;
      default:
        return '';
    }
  }, [url, title, description]);
  
  const handleCopyLink = useCallback(() => {
    setLoadingPlatform('copy');
    onCopy();
    
    // Show toast notification regardless of mode for consistent feedback
    toast({
      title: "Link copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    
    // Update local share count
    if (showShareCount) {
      setShareCounts(prev => ({
        ...prev,
        total: prev.total + 1
      }));
    }
    
    if (onShare) onShare('copy');
    if (compact) onClose();
    setLoadingPlatform(null);
  }, [onCopy, toast, onShare, compact, onClose, showShareCount]);
  
  const handleShare = useCallback(async (platform: SharePlatform) => {
    if (platform === 'copy') {
      handleCopyLink();
      return;
    }
    
    setIsLoading(true);
    setLoadingPlatform(platform);
    
    const shareUrl = getShareUrl(platform);
    if (!shareUrl) {
      setIsLoading(false);
      setLoadingPlatform(null);
      return;
    }
    
    // Open in new window with proper security attributes
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    
    // Record share event in production
    if (articleId) {
      try {
        const updatedMetrics = await recordShareEvent(
          articleId, 
          platform as Exclude<SharePlatform, 'copy'>
        );
        
        // Update local state with server response
        if (showShareCount) {
          setShareCounts(updatedMetrics);
        }
      } catch (error) {
        logger.error('Failed to record share event', {
          context: { articleId, platform, error },
          category: LogCategory.DATA
        });
        
        // Still update local state for better UX
        if (showShareCount) {
          setShareCounts(prev => ({
            ...prev,
            [platform]: prev[platform] + 1,
            total: prev.total + 1
          }));
        }
      }
    } else if (showShareCount) {
      // Local-only update if no articleId is provided
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
    
    setIsLoading(false);
    setLoadingPlatform(null);
  }, [getShareUrl, onShare, compact, onClose, showShareCount, articleId, handleCopyLink]);
  
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
          colorScheme={platform === 'email' ? 'gray' : platform}
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
            colorScheme="blue"
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
            colorScheme="blue"
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
