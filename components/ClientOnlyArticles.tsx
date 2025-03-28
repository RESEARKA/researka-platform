import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { Article } from '../services/articleService';
import { validateCollectionReadAccess } from '../utils/firestoreRuleValidator';
import useFirebaseInitialized from '../hooks/useFirebaseInitialized';
import { isClientSide } from '../utils/imageOptimizer';

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
  
  // Use our new dedicated hook to ensure Firebase is initialized
  const isFirebaseReady = useFirebaseInitialized();
  
  // Track if we've shown fallback content
  const [hasFallbackContent, setHasFallbackContent] = useState(false);

  // Function to get fallback articles when Firebase fails
  const getFallbackArticles = useCallback((): Article[] => {
    console.log('ClientOnlyArticles: Using fallback articles');
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

  // Process articles for featured and recent sections
  const processArticles = useCallback((articles: Article[]) => {
    if (!Array.isArray(articles) || articles.length === 0) {
      onArticlesLoaded([], null, []);
      return;
    }
    
    // Process articles for featured and recent sections
    const sortedByViews = [...articles].sort((a, b) => {
      const aViews = typeof a.views === 'number' ? a.views : 0;
      const bViews = typeof b.views === 'number' ? b.views : 0;
      return bViews - aViews;
    });
    
    const featuredArticle = sortedByViews[0] || null;
    
    const remainingArticles = featuredArticle 
      ? articles.filter(article => article.id !== featuredArticle.id) 
      : articles;
    
    // Shuffle remaining articles for the recent section
    const shuffled = [...remainingArticles].sort(() => 0.5 - Math.random());
    const recentArticles = shuffled.slice(0, 3);
    
    // Update parent component with loaded articles
    onArticlesLoaded(articles, featuredArticle, recentArticles);
  }, [onArticlesLoaded]);

  // Function to retry loading articles
  const retryLoadArticles = useCallback(() => {
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current++;
      loadingStateRef.current = ArticleLoadingState.RETRYING;
      console.log(`ClientOnlyArticles: Retrying article load (${retryCountRef.current}/${maxRetries})`);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Add a small delay before retrying
      delayedLoadRef.current = setTimeout(() => {
        loadArticles();
      }, 1000);
    } else {
      console.error(`ClientOnlyArticles: Maximum retries (${maxRetries}) reached, using fallback content`);
      loadingStateRef.current = ArticleLoadingState.FALLBACK;
      
      // Use fallback content after max retries
      const fallbackArticles = getFallbackArticles();
      processArticles(fallbackArticles);
      
      if (isMounted.current) {
        onError('Failed to load articles after multiple attempts. Showing fallback content.');
        
        toast({
          title: 'Loading Error',
          description: 'Could not load articles from the database. Showing sample content instead.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  }, [getFallbackArticles, onError, toast, processArticles]);

  // Load articles from Firestore
  const loadArticles = useCallback(async () => {
    // Prevent duplicate loading
    if (isLoadingRef.current) {
      console.log('ClientOnlyArticles: Already loading articles, skipping duplicate request');
      return;
    }
    
    // Skip if component is unmounted
    if (!isMounted.current) return;

    // Set loading state
    isLoadingRef.current = true;
    loadingStateRef.current = ArticleLoadingState.INITIALIZING;
    loadStartTimeRef.current = Date.now();
    console.log('ClientOnlyArticles: Starting article load process');
    onLoadingChange(true);
    onError(null);
    
    // Set a timeout to prevent infinite loading
    // Progressive timeout - increases with each retry
    const timeoutDuration = 8000 + (retryCountRef.current * 2000);
    
    timeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        console.error(`ClientOnlyArticles: Loading timeout after ${timeoutDuration/1000} seconds`);
        
        // Only reset loading state if we're not retrying
        if (retryCountRef.current < maxRetries) {
          retryLoadArticles();
        } else {
          isLoadingRef.current = false;
          onLoadingChange(false);
          
          if (!hasFallbackContent) {
            onError('Loading took too long. Showing fallback content.');
            
            // Use fallback content
            const fallbackArticles = getFallbackArticles();
            processArticles(fallbackArticles);
          }
        }
      }
    }, timeoutDuration);
    
    try {
      // For testing/development, return mock articles if Firebase fails
      let firebaseArticles: Article[] = [];
      
      try {
        // Dynamically import Firebase modules to ensure client-side only execution
        console.log('ClientOnlyArticles: Importing Firebase modules');
        const firebaseModule = await import('../config/firebase');
        
        // Initialize Firebase if needed
        if (isClientSide() && !isFirebaseReady) {
          console.log('ClientOnlyArticles: Firebase not initialized, initializing now...');
          const initialized = await firebaseModule.initializeFirebase();
          
          if (!initialized) {
            throw new Error('Failed to initialize Firebase');
          }
        }
        
        loadingStateRef.current = ArticleLoadingState.LOADING;
        console.log('ClientOnlyArticles: Firebase initialized, loading articles...');
        
        // Check if Firestore is accessible by getting the instance
        const db = firebaseModule.getFirebaseFirestore();
        if (!db) {
          throw new Error('Firestore instance is not available');
        }
        
        // Validate Firestore security rules for articles collection
        console.log('ClientOnlyArticles: Validating Firestore security rules for articles collection');
        const validationResult = await validateCollectionReadAccess('articles');
        
        if (!validationResult.success) {
          console.error('ClientOnlyArticles: Firestore security rule validation failed:', validationResult);
          throw new Error(`Firestore security rules prevent reading articles: ${validationResult.error}`);
        }
        
        console.log('ClientOnlyArticles: Firestore security rules validation successful, proceeding to load articles');
        
        // Import and call the article service
        const articleService = await import('../services/articleService');
        
        // Start loading articles with performance tracking
        const startTime = performance.now();
        firebaseArticles = await articleService.getAllArticles();
        const endTime = performance.now();
        
        console.log(`ClientOnlyArticles: Articles loaded from Firebase in ${(endTime - startTime).toFixed(2)}ms:`, {
          count: firebaseArticles?.length || 0,
          hasData: Array.isArray(firebaseArticles) && firebaseArticles.length > 0,
          firstArticleId: firebaseArticles?.[0]?.id || 'none'
        });
        
        // Check if we received valid data
        if (!Array.isArray(firebaseArticles)) {
          console.error('ClientOnlyArticles: Invalid data format received from Firestore:', firebaseArticles);
          throw new Error('Invalid data format received from Firestore');
        }
        
        loadingStateRef.current = ArticleLoadingState.SUCCESS;
      } catch (firebaseError) {
        console.error('ClientOnlyArticles: Error with Firebase:', firebaseError);
        
        // Check for specific Firestore permission errors
        const errorMessage = firebaseError instanceof Error ? firebaseError.message : String(firebaseError);
        const isPermissionError = errorMessage.includes('permission-denied') || 
                                 errorMessage.includes('Missing or insufficient permissions');
        
        if (isPermissionError) {
          console.error('ClientOnlyArticles: Firestore permission error detected. Check security rules.');
          // Log detailed error information for debugging
          console.error({
            errorType: 'permission-denied',
            message: errorMessage,
            timestamp: new Date().toISOString(),
            retryCount: retryCountRef.current
          });
          
          // Show a more specific error message for permission issues
          toast({
            title: "Firestore Permission Error",
            description: "You don't have permission to access articles. Please check Firestore security rules.",
            status: "error",
            duration: 7000,
            isClosable: true,
          });
        }
        
        // Check if we should retry or use fallback
        if (retryCountRef.current < maxRetries) {
          throw firebaseError; // This will trigger the retry in the catch block
        }
        
        // Use fallback mock articles after exhausting retries
        firebaseArticles = getFallbackArticles();
        console.log('ClientOnlyArticles: Using fallback mock articles:', firebaseArticles.length);
      }
      
      // Check if component is still mounted before updating state
      if (!isMounted.current) return;
      
      // Handle empty articles array
      if (!Array.isArray(firebaseArticles) || firebaseArticles.length === 0) {
        console.warn('ClientOnlyArticles: No articles found or empty array returned');
        onArticlesLoaded([], null, []);
        
        if (isMounted.current) {
          isLoadingRef.current = false;
          onLoadingChange(false);
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
        
        return;
      }
      
      // Process the articles
      processArticles(firebaseArticles);
      
    } catch (error) {
      // Handle errors
      console.error("ClientOnlyArticles: Error loading articles:", error);
      
      if (isMounted.current) {
        // Retry if we haven't reached the max retries
        if (retryCountRef.current < maxRetries) {
          retryLoadArticles();
          return;
        }
        
        // If we've exhausted retries, show error and fallback content
        const errorMessage = error instanceof Error ? error.message : "Failed to load articles";
        console.error('ClientOnlyArticles: Error details:', {
          message: errorMessage,
          stack: error instanceof Error ? error.stack : 'No stack trace available',
          loadingTime: Date.now() - loadStartTimeRef.current,
          loadingState: loadingStateRef.current
        });
        
        onError(errorMessage);
        
        // Use fallback content
        if (!hasFallbackContent) {
          const fallbackArticles = getFallbackArticles();
          processArticles(fallbackArticles);
        }
        
        toast({
          title: "Error",
          description: "Failed to load articles from the database. Showing sample content instead.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      // Clean up and reset loading state
      if (isMounted.current) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        const loadDuration = Date.now() - loadStartTimeRef.current;
        console.log(`ClientOnlyArticles: Article loading process completed in ${loadDuration}ms with state: ${loadingStateRef.current}`);
        
        isLoadingRef.current = false;
        onLoadingChange(false);
      }
    }
  }, [getFallbackArticles, hasFallbackContent, onArticlesLoaded, onError, onLoadingChange, processArticles, retryLoadArticles, toast]);

  // Set up and clean up the isMounted ref
  useEffect(() => {
    console.log('ClientOnlyArticles: Component mounted');
    isMounted.current = true;
    
    // Start loading articles when Firebase is ready
    if (isFirebaseReady) {
      console.log('ClientOnlyArticles: Firebase is ready, starting delayed load');
      loadArticles();
    }
    
    return () => {
      console.log('ClientOnlyArticles: Component unmounting');
      isMounted.current = false;
      
      // Clean up any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (delayedLoadRef.current) {
        clearTimeout(delayedLoadRef.current);
        delayedLoadRef.current = null;
      }
    };
  }, [isFirebaseReady, loadArticles]); // Add isFirebaseReady as a dependency to reload when Firebase becomes ready

  // This component doesn't render anything itself
  return null;
};

export default ClientOnlyArticles;
