import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { Article } from '../services/articleService';

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
 */
const ClientOnlyArticles: React.FC<ClientOnlyArticlesProps> = ({ 
  onArticlesLoaded, 
  onLoadingChange, 
  onError 
}) => {
  const toast = useToast();
  const isMounted = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const delayedLoadRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const isLoadingRef = useRef(false);
  
  // Track if we've shown fallback content
  const [hasFallbackContent, setHasFallbackContent] = useState(false);

  // Set up and clean up the isMounted ref
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
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
  }, []);

  // Function to get fallback articles when Firebase fails
  const getFallbackArticles = useCallback((): Article[] => {
    console.log('ClientOnlyArticles: Using fallback articles');
    setHasFallbackContent(true);
    
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

  // Function to retry loading articles
  const retryLoadArticles = useCallback(() => {
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current++;
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
  }, [getFallbackArticles, onError, toast]);

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

  // Load articles from Firebase
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
        const firebaseModule = await import('../config/firebase');
        
        // Initialize Firebase if needed
        if (typeof window !== 'undefined' && !firebaseModule.isFirebaseInitialized()) {
          console.log('ClientOnlyArticles: Firebase not initialized, initializing now...');
          const initialized = firebaseModule.initializeFirebase();
          
          if (!initialized) {
            throw new Error('Failed to initialize Firebase');
          }
        }
        
        // Import and call the article service
        const articleService = await import('../services/articleService');
        firebaseArticles = await articleService.getAllArticles();
        
        console.log('ClientOnlyArticles: Articles loaded from Firebase:', firebaseArticles?.length || 0);
      } catch (firebaseError) {
        console.error('ClientOnlyArticles: Error with Firebase:', firebaseError);
        
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
        onError(error instanceof Error ? error.message : "Failed to load articles");
        
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
        
        isLoadingRef.current = false;
        onLoadingChange(false);
      }
    }
  }, [getFallbackArticles, hasFallbackContent, onArticlesLoaded, onError, onLoadingChange, processArticles, retryLoadArticles, toast]);
  
  // Start loading articles with a small delay
  useEffect(() => {
    // Add a small delay before loading to ensure the component is fully mounted
    delayedLoadRef.current = setTimeout(() => {
      loadArticles();
    }, 100);
    
    // Clean up function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (delayedLoadRef.current) {
        clearTimeout(delayedLoadRef.current);
      }
    };
  }, [loadArticles]);

  // This component doesn't render anything itself
  return null;
};

export default ClientOnlyArticles;
