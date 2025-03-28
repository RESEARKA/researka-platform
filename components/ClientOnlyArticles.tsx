import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { Article } from '../services/articleService';
import { validateCollectionReadAccess } from '../utils/firestoreRuleValidator';
import useFirebaseInitialized from '../hooks/useFirebaseInitialized';
import { isClientSide } from '../utils/imageOptimizer';
import { createLogger, LogCategory } from '../utils/logger';

// Create a logger instance for this component
const logger = createLogger('ClientOnlyArticles');

// Define loading states for better tracking
enum ArticleLoadingState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  LOADING = 'loading',
  RETRYING = 'retrying',
  SUCCESS = 'success',
  ERROR = 'error',
  FALLBACK = 'fallback'
}

export interface ClientOnlyArticlesProps {
  onArticlesLoaded: (
    articles: Article[], 
    featuredArticle: Article | null, 
    recentArticles: Article[]
  ) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onError: (error: string | null) => void;
}

/**
 * ClientOnlyArticles component ensures that articles are only loaded on the client side
 * This prevents Firebase initialization issues during SSR and handles loading states properly
 * Now using the dedicated useFirebaseInitialized hook for better initialization management
 */
const ClientOnlyArticles: React.FC<ClientOnlyArticlesProps> = ({ 
  onArticlesLoaded, 
  onLoadingChange, 
  onError 
}) => {
  const toast = useToast();
  const isMounted = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const delayedLoadRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const isLoadingRef = useRef(false);
  const loadingStateRef = useRef<ArticleLoadingState>(ArticleLoadingState.IDLE);
  const loadStartTimeRef = useRef<number>(0);
  
  // Use our enhanced dedicated hook to ensure Firebase is initialized
  const { initialized: isFirebaseReady, error: firebaseError, isTimedOut } = useFirebaseInitialized();
  
  // Track if we've shown fallback content
  const [hasFallbackContent, setHasFallbackContent] = useState(false);

  // Function to get fallback articles when Firebase fails
  const getFallbackArticles = useCallback((): Article[] => {
    logger.info('Using fallback articles due to Firebase issues', {
      category: LogCategory.DATA
    });
    
    setHasFallbackContent(true);
    loadingStateRef.current = ArticleLoadingState.FALLBACK;
    
    return [
      {
        id: 'mock-article-1',
        title: 'Advances in Quantum Computing',
        abstract: 'This paper explores recent advances in quantum computing and their implications for cryptography.',
        category: 'Computer Science',
        keywords: ['quantum computing', 'cryptography', 'algorithms'],
        author: 'Dr. Jane Smith',
        authorId: 'mock-author-1',
        date: new Date().toISOString(),
        compensation: 'Open Access',
        status: 'published',
        views: 1250
      },
      {
        id: 'mock-article-2',
        title: 'Climate Change Impact on Marine Ecosystems',
        abstract: 'A comprehensive study of how climate change affects marine biodiversity and ecosystem health.',
        category: 'Environmental Science',
        keywords: ['climate change', 'marine biology', 'ecosystems'],
        author: 'Prof. Michael Johnson',
        authorId: 'mock-author-2',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        compensation: 'Open Access',
        status: 'published',
        views: 843
      },
      {
        id: 'mock-article-3',
        title: 'Neural Networks in Medical Diagnosis',
        abstract: 'This research demonstrates how neural networks can improve accuracy in medical diagnostics.',
        category: 'Medicine',
        keywords: ['neural networks', 'AI', 'medical diagnosis'],
        author: 'Dr. Sarah Chen',
        authorId: 'mock-author-3',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        compensation: 'Open Access',
        status: 'published',
        views: 1567
      }
    ];
  }, []);

  // Function to load articles
  const loadArticles = useCallback(async () => {
    // Skip if not on client, already loading, or Firebase not ready
    if (!isClientSide() || isLoadingRef.current || !isFirebaseReady) {
      return;
    }

    try {
      // Set loading state
      isLoadingRef.current = true;
      loadingStateRef.current = ArticleLoadingState.LOADING;
      loadStartTimeRef.current = Date.now();
      onLoadingChange(true);
      onError(null);

      logger.info('Loading articles', {
        context: { 
          retryCount: retryCountRef.current,
          loadingState: loadingStateRef.current
        },
        category: LogCategory.DATA
      });

      // Import article service dynamically to avoid SSR issues
      const articleService = await import('../services/articleService');

      // Check if we have permission to read articles
      const hasAccess = await validateCollectionReadAccess('articles');
      
      if (!hasAccess) {
        throw new Error('You do not have permission to view articles');
      }

      // Get articles using the correct method names
      const articles = await articleService.getAllArticles();
      
      // Process articles for featured and recent sections
      const sortedByViews = [...articles].sort((a, b) => {
        const aViews = typeof a.views === 'number' ? a.views : 0;
        const bViews = typeof b.views === 'number' ? b.views : 0;
        return bViews - aViews;
      });
      
      // Select featured article (most viewed)
      const featuredArticle = sortedByViews[0] || null;
      
      // Get recent articles (excluding featured)
      const remainingArticles = featuredArticle 
        ? articles.filter(article => article.id !== featuredArticle.id) 
        : articles;
      
      // Sort by date for recent articles
      const recentArticles = [...remainingArticles]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

      // Only update state if component is still mounted
      if (isMounted.current) {
        // Calculate load time for performance monitoring
        const loadTime = Date.now() - loadStartTimeRef.current;
        
        logger.info('Articles loaded successfully', {
          context: { 
            articleCount: articles.length,
            hasFeatured: !!featuredArticle,
            recentCount: recentArticles.length,
            loadTimeMs: loadTime
          },
          category: LogCategory.PERFORMANCE
        });

        // Update loading state
        isLoadingRef.current = false;
        loadingStateRef.current = ArticleLoadingState.SUCCESS;
        onLoadingChange(false);

        // Pass articles to parent component
        onArticlesLoaded(articles, featuredArticle, recentArticles);
      }
    } catch (error) {
      // Only handle error if component is still mounted
      if (isMounted.current) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        logger.error('Error loading articles', {
          context: { 
            error: errorMessage,
            retryCount: retryCountRef.current,
            loadingState: loadingStateRef.current
          },
          category: LogCategory.ERROR
        });

        // Update loading state
        isLoadingRef.current = false;
        loadingStateRef.current = ArticleLoadingState.ERROR;
        onLoadingChange(false);
        onError(errorMessage);

        // Show error toast
        toast({
          title: 'Error loading articles',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });

        // Retry loading if we haven't exceeded max retries
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          loadingStateRef.current = ArticleLoadingState.RETRYING;
          
          logger.info(`Retrying article load (${retryCountRef.current}/${maxRetries})`, {
            category: LogCategory.DATA
          });

          // Retry after a delay
          delayedLoadRef.current = setTimeout(() => {
            if (isMounted.current) {
              loadArticles();
            }
          }, 2000);
        } else {
          // Use fallback articles if we've exceeded max retries
          const fallbackArticles = getFallbackArticles();
          onArticlesLoaded(fallbackArticles, fallbackArticles[0], fallbackArticles.slice(1));
        }
      }
    }
  }, [isFirebaseReady, onArticlesLoaded, onLoadingChange, onError, toast, getFallbackArticles]);

  // Effect to handle Firebase initialization and article loading
  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;
    
    // Log component mount
    logger.info('ClientOnlyArticles component mounted', {
      category: LogCategory.LIFECYCLE
    });
    
    // Set initial loading state
    loadingStateRef.current = ArticleLoadingState.INITIALIZING;
    onLoadingChange(true);
    
    // Log Firebase initialization status
    logger.info('Firebase initialization status', {
      context: { 
        isReady: isFirebaseReady,
        hasError: !!firebaseError,
        isTimedOut
      },
      category: LogCategory.SYSTEM
    });

    // Set timeout to detect slow loading
    timeoutRef.current = setTimeout(() => {
      if (isMounted.current && loadingStateRef.current !== ArticleLoadingState.SUCCESS) {
        logger.warn('Article loading is taking longer than expected', {
          context: {
            loadingState: loadingStateRef.current,
            firebaseReady: isFirebaseReady,
            elapsedTime: Date.now() - loadStartTimeRef.current
          },
          category: LogCategory.PERFORMANCE
        });
        
        // If Firebase has timed out or has an error, use fallback content
        if (isTimedOut || firebaseError) {
          const fallbackArticles = getFallbackArticles();
          onArticlesLoaded(fallbackArticles, fallbackArticles[0], fallbackArticles.slice(1));
          onLoadingChange(false);
        }
      }
    }, 8000); // 8 second timeout

    // Load articles when Firebase is ready
    if (isFirebaseReady) {
      // Slight delay to ensure Firebase is fully initialized
      delayedLoadRef.current = setTimeout(() => {
        if (isMounted.current) {
          loadArticles();
        }
      }, 100);
    } else if (firebaseError) {
      // If Firebase failed to initialize, use fallback content
      logger.error('Firebase initialization error, using fallback content', {
        context: { error: firebaseError },
        category: LogCategory.ERROR
      });
      
      const fallbackArticles = getFallbackArticles();
      onArticlesLoaded(fallbackArticles, fallbackArticles[0], fallbackArticles.slice(1));
      onLoadingChange(false);
    }

    // Clean up on unmount
    return () => {
      isMounted.current = false;
      
      // Clear timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (delayedLoadRef.current) {
        clearTimeout(delayedLoadRef.current);
        delayedLoadRef.current = null;
      }
      
      logger.info('ClientOnlyArticles component unmounted', {
        category: LogCategory.LIFECYCLE
      });
    };
  }, [isFirebaseReady, firebaseError, isTimedOut, loadArticles, onArticlesLoaded, onLoadingChange, getFallbackArticles]);

  // This component doesn't render anything directly
  // It just handles loading articles and passes them to the parent component
  return null;
};

export default ClientOnlyArticles;
