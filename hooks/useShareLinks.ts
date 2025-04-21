import { useCallback, useState, useEffect } from 'react';
import { useClipboard, useToast } from '@chakra-ui/react';
import { getShareMetrics, recordShareEvent, ShareMetrics } from '../utils/shareMetrics';
import { createLogger, LogCategory } from '../utils/logger';

// Define share platform types
export type SharePlatform = 'twitter' | 'linkedin' | 'facebook' | 'email' | 'instagram' | 'copy';

const logger = createLogger('use-share-links');

/**
 * Custom hook for managing social sharing functionality
 * 
 * @param title - The title of the content to share
 * @param url - The URL to share
 * @param options - Additional options for sharing
 * @returns Object containing share-related state and functions
 */
export function useShareLinks(
  title: string,
  url: string,
  options: {
    description?: string;
    showShareCount?: boolean;
    onShare?: (platform: SharePlatform) => void;
    initialCounts?: Partial<ShareMetrics>;
    articleId?: string;
  } = {}
) {
  const {
    description = '',
    showShareCount = false,
    onShare,
    initialCounts = {},
    articleId
  } = options;

  const { hasCopied, onCopy } = useClipboard(url);
  const toast = useToast();
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
  
  // Generate share URLs for different platforms
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
  
  // Handle copying link to clipboard
  const handleCopyLink = useCallback(() => {
    setLoadingPlatform('copy');
    onCopy();
    
    // Show toast notification for consistent feedback
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
    setLoadingPlatform(null);
    
    return true;
  }, [onCopy, toast, onShare, showShareCount]);
  
  // Handle sharing on social platforms
  const handleShare = useCallback(async (platform: SharePlatform) => {
    if (platform === 'copy') {
      return handleCopyLink();
    }
    
    setIsLoading(true);
    setLoadingPlatform(platform);
    
    const shareUrl = getShareUrl(platform);
    if (!shareUrl) {
      setIsLoading(false);
      setLoadingPlatform(null);
      return false;
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
    
    setIsLoading(false);
    setLoadingPlatform(null);
    
    return true;
  }, [getShareUrl, onShare, showShareCount, articleId, handleCopyLink]);
  
  return {
    // State
    shareCounts,
    isLoading,
    loadingPlatform,
    hasCopied,
    
    // Methods
    handleShare,
    handleCopyLink,
    getShareUrl
  };
}

export default useShareLinks;
