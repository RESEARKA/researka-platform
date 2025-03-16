/**
 * Citation service for Researka
 * 
 * This service handles fetching and caching citation data from the OpenCitations API.
 * For development and fallback purposes, it can also use mock data when the API is unavailable.
 */
import { fetchWithRetry } from '../utils/api';
import { ENV } from '../utils/env';
import { apiCache, withCache } from '../utils/cache';
import { AppError, ErrorType } from '../utils/errorHandling';

// Types for citation data
export interface Citation {
  citing: string;
  cited: string;
  creation: string;
  timespan: string;
  title?: string;
  author?: string;
  journal?: string;
  year?: string;
}

export interface CitationCount {
  count: number;
}

// Cache TTL constants (in milliseconds)
const CACHE_TTL = {
  CITATION_COUNT: 30 * 60 * 1000, // 30 minutes
  CITATIONS: 30 * 60 * 1000,      // 30 minutes
};

// Mock data for development and fallback
const MOCK_CITATIONS: Record<string, Citation[]> = {
  'default': [
    {
      citing: '10.1234/example-citation-1',
      cited: '',
      creation: '2024-01-15',
      timespan: '0',
      title: 'Recent Advances in Decentralized Academic Publishing',
      author: 'Smith, J., Johnson, A.',
      journal: 'Journal of Blockchain Applications',
      year: '2024'
    },
    {
      citing: '10.1234/example-citation-2',
      cited: '',
      creation: '2024-02-20',
      timespan: '0',
      title: 'Peer Review in the Age of Web3',
      author: 'Garcia, M., Lee, S.',
      journal: 'Digital Humanities Quarterly',
      year: '2024'
    },
    {
      citing: '10.1234/example-citation-3',
      cited: '',
      creation: '2024-03-05',
      timespan: '0',
      title: 'Blockchain-Based Academic Credentialing',
      author: 'Williams, R., Brown, T.',
      journal: 'Technology & Innovation',
      year: '2024'
    }
  ]
};

/**
 * Formats a DOI for use with the OpenCitations API
 * @param doi The DOI to format
 * @returns Formatted DOI
 */
function formatDoi(doi: string): string {
  // Remove any URL prefix
  return doi.replace(/^https?:\/\/doi.org\//, '');
}

/**
 * Fetches citation count for an article from OpenCitations
 * @param doi The DOI of the article
 * @returns Promise with citation count data
 */
async function fetchCitationCountRaw(doi: string): Promise<CitationCount> {
  try {
    const formattedDoi = formatDoi(doi);
    const accessToken = ENV.OPENCITATIONS_API_TOKEN;
    
    const countData = await fetchWithRetry<Array<{count: number}>>(
      `https://opencitations.net/index/api/v2/citation-count/${encodeURIComponent(formattedDoi)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!countData || countData.length === 0) {
      return { count: 0 };
    }
    
    return { count: countData[0].count };
  } catch (error) {
    console.warn('Failed to fetch citation count from OpenCitations API, using mock data', error);
    
    // For development/demo purposes, return mock citation count
    const useMockData = ENV.NODE_ENV !== 'production' || ENV.USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      // Generate a random but consistent count based on the DOI
      const mockCount = (doi.length % 10) + 1; // 1-10 based on DOI length
      return { count: mockCount };
    }
    
    // In production with no mock data, propagate the error
    throw new AppError('Failed to fetch citation count', ErrorType.NETWORK);
  }
}

/**
 * Fetches citations for an article from OpenCitations
 * @param doi The DOI of the article
 * @returns Promise with citation data
 */
async function fetchCitationsRaw(doi: string): Promise<Citation[]> {
  try {
    const formattedDoi = formatDoi(doi);
    const accessToken = ENV.OPENCITATIONS_API_TOKEN;
    
    const citationData = await fetchWithRetry<Citation[]>(
      `https://opencitations.net/index/api/v2/citations/${encodeURIComponent(formattedDoi)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!citationData || citationData.length === 0) {
      return [];
    }
    
    return citationData;
  } catch (error) {
    console.warn('Failed to fetch citations from OpenCitations API, using mock data', error);
    
    // For development/demo purposes, return mock citations
    const useMockData = ENV.NODE_ENV !== 'production' || ENV.USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      return MOCK_CITATIONS.default;
    }
    
    // In production with no mock data, propagate the error
    throw new AppError('Failed to fetch citations', ErrorType.NETWORK);
  }
}

// Cached versions of the API functions
export const fetchCitationCount = withCache(
  fetchCitationCountRaw,
  (doi: string) => `citation-count:${formatDoi(doi)}`,
  CACHE_TTL.CITATION_COUNT
);

export const fetchCitations = withCache(
  fetchCitationsRaw,
  (doi: string) => `citations:${formatDoi(doi)}`,
  CACHE_TTL.CITATIONS
);

/**
 * Gets paginated citations for an article
 * @param doi The DOI of the article
 * @param page The page number (0-based)
 * @param pageSize The number of citations per page
 * @returns Promise with paginated citation data
 */
export async function getPaginatedCitations(
  doi: string,
  page: number = 0,
  pageSize: number = 5
): Promise<{ 
  citations: Citation[],
  total: number,
  page: number,
  pageSize: number,
  totalPages: number
}> {
  const allCitations = await fetchCitations(doi);
  const total = allCitations.length;
  const totalPages = Math.ceil(total / pageSize);
  
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCitations = allCitations.slice(startIndex, endIndex);
  
  return {
    citations: paginatedCitations,
    total,
    page,
    pageSize,
    totalPages
  };
}

/**
 * Clears the citation cache for a specific DOI
 * @param doi The DOI to clear cache for
 */
export function clearCitationCache(doi: string): void {
  const formattedDoi = formatDoi(doi);
  apiCache.remove(`citation-count:${formattedDoi}`);
  apiCache.remove(`citations:${formattedDoi}`);
}

/**
 * Clears all citation caches
 */
export function clearAllCitationCaches(): void {
  // Clear all citation-related cache entries
  apiCache.clear();
}
