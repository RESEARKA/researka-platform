import { useState, useEffect } from 'react';
import { getArticleMetrics } from '../utils/articleMetrics';
import { createLogger, LogCategory } from '../utils/logger';

const logger = createLogger('article-metrics-hook');

interface ArticleMetrics {
  viewCount: number;
  shareCount: {
    total: number;
    twitter?: number;
    facebook?: number;
    linkedin?: number;
    email?: number;
  };
  citationCount: number;
}

/**
 * Hook to fetch and track article metrics
 * @param articleId The ID of the article
 */
export const useArticleMetrics = (articleId: string) => {
  const [metrics, setMetrics] = useState<ArticleMetrics>({
    viewCount: 0,
    shareCount: { total: 0 },
    citationCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMetrics = async () => {
      if (!articleId) return;

      try {
        setIsLoading(true);
        const data = await getArticleMetrics(articleId);
        
        if (isMounted) {
          setMetrics(data);
          setError(null);
        }
      } catch (err) {
        logger.error('Error fetching article metrics', {
          context: { articleId, error: err },
          category: LogCategory.DATA
        });
        
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMetrics();

    // Record view when component mounts
    const recordView = async () => {
      try {
        await fetch('/api/articles/view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ articleId }),
        });
      } catch (err) {
        logger.error('Failed to record view', {
          context: { articleId, error: err },
          category: LogCategory.DATA
        });
      }
    };

    recordView();

    return () => {
      isMounted = false;
    };
  }, [articleId]);

  /**
   * Record a social share
   * @param platform The platform where the article was shared
   */
  const recordShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'email') => {
    try {
      await fetch('/api/articles/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId, platform }),
      });

      // Optimistically update the UI
      setMetrics(prev => ({
        ...prev,
        shareCount: {
          ...prev.shareCount,
          [platform]: (prev.shareCount[platform] || 0) + 1,
          total: prev.shareCount.total + 1
        }
      }));
    } catch (err) {
      logger.error('Failed to record share', {
        context: { articleId, platform, error: err },
        category: LogCategory.DATA
      });
    }
  };

  return {
    metrics,
    isLoading,
    error,
    recordShare
  };
};
