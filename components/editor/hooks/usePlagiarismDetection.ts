import { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('use-plagiarism-detection');

export interface PlagiarismMatch {
  sourceId: string;
  sourceTitle: string;
  similarity: number;
  matchedSections: Array<{
    startIndex: number;
    endIndex: number;
    text: string;
  }>;
}

export interface PlagiarismCheckResult {
  isLoading: boolean;
  isChecked: boolean;
  overallSimilarity: number;
  matches: PlagiarismMatch[];
  status: 'clean' | 'suspicious' | 'plagiarized' | null;
  error: string | null;
}

interface UsePlagiarismDetectionOptions {
  articleId: string;
  debounceMs?: number;
  minTextLength?: number;
  autoCheck?: boolean;
}

/**
 * Hook for detecting plagiarism in editor content
 */
export function usePlagiarismDetection({
  articleId,
  debounceMs = 2000,
  minTextLength = 100,
  autoCheck = true
}: UsePlagiarismDetectionOptions) {
  const [result, setResult] = useState<PlagiarismCheckResult>({
    isLoading: false,
    isChecked: false,
    overallSimilarity: 0,
    matches: [],
    status: null,
    error: null
  });

  /**
   * Check text for plagiarism
   */
  const checkPlagiarism = useCallback(async (text: string) => {
    if (!text || text.length < minTextLength) {
      return;
    }
    
    setResult(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/plagiarism/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, articleId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Plagiarism check failed');
      }
      
      const data = await response.json();
      
      setResult({
        isLoading: false,
        isChecked: true,
        overallSimilarity: data.results.overallSimilarity || 0,
        matches: data.results.matches || [],
        status: determineStatus(data.results.overallSimilarity || 0),
        error: null
      });
      
      logger.info('Plagiarism check completed', {
        context: {
          articleId,
          similarity: data.results.overallSimilarity,
          matchCount: data.results.matches?.length || 0
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setResult(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      logger.error('Plagiarism check failed', {
        context: { articleId, error: errorMessage }
      });
    }
  }, [articleId, minTextLength]);
  
  /**
   * Debounced version of checkPlagiarism to avoid too many API calls
   */
  const debouncedCheckPlagiarism = useCallback(
    debounce(checkPlagiarism, debounceMs),
    [checkPlagiarism, debounceMs]
  );
  
  /**
   * Determine plagiarism status based on similarity percentage
   */
  function determineStatus(similarity: number): 'clean' | 'suspicious' | 'plagiarized' {
    if (similarity < 10) return 'clean';
    if (similarity < 30) return 'suspicious';
    return 'plagiarized';
  }

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedCheckPlagiarism.cancel();
    };
  }, [debouncedCheckPlagiarism]);

  return {
    ...result,
    checkPlagiarism: autoCheck ? debouncedCheckPlagiarism : checkPlagiarism,
    checkPlagiarismNow: checkPlagiarism // Non-debounced version for immediate checking
  };
}
