import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppError, ErrorType, logError } from '../utils/errorHandling';
import { 
  fetchCitationCount, 
  getPaginatedCitations,
  Citation
} from '../services/citationService';

interface ArticleCitationsProps {
  doi?: string;
  publishedDate?: string;
  className?: string;
  onCitationCountUpdate?: (count: number) => void;
}

/**
 * ArticleCitations component displays citation data for an article
 * using the OpenCitations API.
 * 
 * @param doi - The DOI of the article
 * @param publishedDate - The publication date of the article
 * @param className - Optional CSS class name
 * @param onCitationCountUpdate - Optional callback to update parent component with citation count
 */
export function ArticleCitations({ doi, publishedDate, className = '', onCitationCountUpdate }: ArticleCitationsProps) {
  const [citationCount, setCitationCount] = useState<number | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  // Check if this is a new article (no DOI or published less than 30 days ago)
  const isNewArticle = useMemo(() => {
    if (!doi) return true;
    if (!publishedDate) return true;
    
    const pubDate = new Date(publishedDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return pubDate > thirtyDaysAgo;
  }, [doi, publishedDate]);

  // Fetch citation data
  const fetchCitationData = useCallback(async () => {
    if (!doi) {
      setIsLoading(false);
      setError('No DOI available for this article');
      setErrorType(ErrorType.VALIDATION);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch citation count
      const countData = await fetchCitationCount(doi);
      setCitationCount(countData.count);
      
      // If there are citations, fetch them with pagination
      if (countData.count > 0) {
        const paginatedData = await getPaginatedCitations(doi, page, pageSize);
        setCitations(paginatedData.citations);
        setTotalPages(paginatedData.totalPages);
      } else {
        setCitations([]);
        setTotalPages(0);
      }
      
      setIsLoading(false);
      setError(null);
      setErrorType(null);
    } catch (err) {
      const appError = err instanceof AppError 
        ? err 
        : new AppError('Failed to load citation data', ErrorType.UNKNOWN);
      
      logError(appError, { doi, component: 'ArticleCitations' });
      
      setIsLoading(false);
      setErrorType(appError.type);
      
      // Set user-friendly error message based on error type
      switch (appError.type) {
        case ErrorType.NETWORK:
          setError('Network error. Please check your connection and try again.');
          break;
        case ErrorType.AUTHENTICATION:
          setError('Authentication error. Please check your API credentials.');
          break;
        case ErrorType.RATE_LIMIT:
          setError('Too many requests. Please try again later.');
          break;
        case ErrorType.NOT_FOUND:
          setError('Citation data not found for this article.');
          break;
        default:
          setError('Failed to load citation data. Please try again later.');
      }
    }
  }, [doi, page, pageSize]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Fetch data when component mounts or when dependencies change
  useEffect(() => {
    if (!isNewArticle) {
      fetchCitationData();
    } else {
      setIsLoading(false);
    }
  }, [fetchCitationData, isNewArticle]);

  // Update parent component with citation count when it changes
  useEffect(() => {
    if (onCitationCountUpdate && citationCount !== null) {
      onCitationCountUpdate(citationCount);
    }
  }, [citationCount, onCitationCountUpdate]);

  if (isLoading) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <h3 className="text-xl font-semibold mb-2">Article Citations</h3>
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading citation data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <h3 className="text-xl font-semibold mb-2">Article Citations</h3>
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
          {errorType === ErrorType.NETWORK && (
            <button 
              className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 py-1 px-2 rounded"
              onClick={() => fetchCitationData()}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isNewArticle) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <h3 className="text-xl font-semibold mb-2">Article Citations</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-blue-700 text-sm">
            Citation data will be available once this article has been indexed (typically 30 days after publication).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <h3 className="text-xl font-semibold mb-2 text-center">Article Citations</h3>
      
      <div className="flex flex-col items-center mb-4">
        <div className="relative group">
          <div className="text-3xl font-bold text-blue-600 mb-1 cursor-help border-b border-dotted border-blue-400">
            {citationCount || 0}
          </div>
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
            Data from OpenCitations
          </span>
        </div>
        <div className="text-sm text-gray-600">Total Citations</div>
      </div>

      {citations.length > 0 ? (
        <div className="w-full">
          <h4 className="text-md font-medium mb-2 text-center">Recent Citations</h4>
          <ul className="divide-y divide-gray-200">
            {citations.map((citation, index) => {
              // Format the citing DOI for display
              const citingDoi = citation.citing.replace(/^https?:\/\/doi.org\//, '');
              
              return (
                <li key={index} className="py-2">
                  <a 
                    href={`https://doi.org/${citation.citing}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {citingDoi}
                  </a>
                  <p className="text-xs text-gray-500">
                    Published: {new Date(citation.creation).toLocaleDateString()}
                  </p>
                </li>
              );
            })}
          </ul>
          
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className={`px-2 py-1 rounded text-sm ${
                  page === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-600">
                Page {page + 1} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                className={`px-2 py-1 rounded text-sm ${
                  page === totalPages - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-4">
          No citations found for this article yet
        </div>
      )}
    </div>
  );
}
