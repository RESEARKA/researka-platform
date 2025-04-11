import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { trackUserActivity, ActivityType } from '../utils/activityTracker';
import { createLogger } from '../utils/logger';

const logger = createLogger('search-tracking');

/**
 * Hook for tracking search activities
 * @param searchQuery The search query string
 * @param filters Optional filters applied to the search
 * @returns Object containing tracking status
 */
export function useSearchTracking(
  searchQuery?: string,
  filters?: Record<string, string>
) {
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isTracked, setIsTracked] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only track if we have a valid search query
    if (!searchQuery || searchQuery.trim().length < 2) {
      return;
    }

    // Prevent duplicate tracking
    if (isTracked || isTracking) {
      return;
    }

    const trackSearch = async () => {
      try {
        setIsTracking(true);
        setError(null);

        // Prepare metadata
        const metadata = {
          query: searchQuery.trim(),
          timestamp: Date.now()
        };

        // Add any filters if provided
        if (filters && Object.keys(filters).length > 0) {
          metadata.filters = filters;
        }

        // Track the search activity
        await trackUserActivity(
          user?.uid || 'anonymous',
          ActivityType.SEARCH,
          undefined,
          metadata
        );

        setIsTracked(true);
        logger.info('Search tracked successfully', { 
          context: { query: searchQuery, hasFilters: !!filters }
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error tracking search'));
        logger.error('Failed to track search', { 
          context: { error: err, query: searchQuery }
        });
      } finally {
        setIsTracking(false);
      }
    };

    trackSearch();
  }, [searchQuery, filters, user, isTracked, isTracking]);

  return {
    isTracking,
    isTracked,
    error
  };
}
