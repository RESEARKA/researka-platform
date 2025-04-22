import React from 'react';
import {
  Box,
  VStack,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import ArticleReviewStatus from '../../ArticleReviewStatus';
import ArticleReviewers from '../../ArticleReviewers';
import ReadCountDisplay from '../ReadCountDisplay';
import CitationBadge from '../CitationBadge';
import SocialShareMetrics from '../SocialShareMetrics';
import { ArticleCitation } from '../ArticleCitation';
import SocialShareButtons from '../SocialShareButtons';
import FlagArticleButton from '../../moderation/FlagArticleButton';
import { Article } from '../../../utils/recommendationEngine';
import { articleToCitation } from '../../../utils/citationHelper';

interface ArticleSidebarProps {
  article: Article | null;
  reviews: any[];
  metrics: {
    readCount: number;
    citationCount: number;
    shareCount: Record<string, number>;
  };
  recordShare: (platform: string) => void;
  isLoading: boolean;
}

/**
 * ArticleSidebar component displays review status, metrics, 
 * citation information, and social sharing options
 */
const ArticleSidebar: React.FC<ArticleSidebarProps> = ({ 
  article,
  reviews,
  metrics,
  recordShare,
  isLoading 
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (isLoading) {
    return (
      <Box 
        bg={bgColor} 
        p={6} 
        borderRadius="md" 
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
        height="350px"
      />
    );
  }

  if (!article) {
    return null;
  }

  // Format share counts for SocialShareMetrics component
  const formattedShareCounts = {
    total: Object.values(metrics.shareCount).reduce((a, b) => a + b, 0),
    ...metrics.shareCount
  };

  // Generate citation data for ArticleCitation component
  const citationData = article ? articleToCitation(article) : null;

  return (
    <VStack spacing={6} align="stretch">
      {/* Review Status */}
      <Box 
        bg={bgColor} 
        p={6} 
        borderRadius="md" 
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading as="h3" size="md" mb={4}>
          Review Status
        </Heading>
        <ArticleReviewStatus 
          article={article} 
        />
      </Box>

      {/* Metrics */}
      <Box 
        bg={bgColor} 
        p={6} 
        borderRadius="md" 
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading as="h3" size="md" mb={4}>
          Article Metrics
        </Heading>
        <VStack spacing={4} align="stretch">
          <ReadCountDisplay count={metrics.readCount} />
          <CitationBadge count={metrics.citationCount} />
          <SocialShareMetrics shares={formattedShareCounts} />
        </VStack>
      </Box>

      {/* Citation */}
      <Box 
        bg={bgColor} 
        p={6} 
        borderRadius="md" 
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading as="h3" size="md" mb={4}>
          Citation
        </Heading>
        {citationData && <ArticleCitation citation={citationData} />}
      </Box>

      {/* Share */}
      <Box 
        bg={bgColor} 
        p={6} 
        borderRadius="md" 
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading as="h3" size="md" mb={4}>
          Share
        </Heading>
        <SocialShareButtons 
          title={article.title || 'Research Article'} 
          url={typeof window !== 'undefined' ? window.location.href : ''}
          onShare={recordShare}
        />
      </Box>

      {/* Flag */}
      <Box mt={2}>
        <FlagArticleButton 
          articleId={article.id || ''} 
        />
      </Box>

      {/* Reviewers */}
      {reviews && reviews.length > 0 && (
        <Box 
          bg={bgColor} 
          p={6} 
          borderRadius="md" 
          boxShadow="sm"
          borderWidth="1px"
          borderColor={borderColor}
          mt={4}
        >
          <Heading as="h3" size="md" mb={4}>
            Reviewers
          </Heading>
          <ArticleReviewers 
            articleId={article.id || ''}
            reviews={reviews} 
          />
        </Box>
      )}
    </VStack>
  );
};

export default ArticleSidebar;
