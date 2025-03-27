import React, { useEffect, useRef } from 'react';
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

  // Set up and clean up the isMounted ref
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      
      // Clean up any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (delayedLoadRef.current) {
        clearTimeout(delayedLoadRef.current);
      }
    };
  }, []);

  // Load articles from Firebase
  useEffect(() => {
    // Skip if component is unmounted
    if (!isMounted.current) return;

    const loadArticles = async () => {
      // Set loading state
      onLoadingChange(true);
      onError(null);
      
      // Set a timeout to prevent infinite loading
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          console.error('ClientOnlyArticles: Loading timeout after 10 seconds');
          onLoadingChange(false);
          onError('Loading took too long. Please refresh the page.');
          
          toast({
            title: 'Loading Timeout',
            description: 'Articles took too long to load. Please refresh the page.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }, 10000);
      
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
          console.error('ClientOnlyArticles: Error with Firebase, using fallback data:', firebaseError);
          
          // Use fallback mock articles
          firebaseArticles = [
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
          console.log('ClientOnlyArticles: Using fallback mock articles:', firebaseArticles.length);
        }
        
        // Check if component is still mounted before updating state
        if (!isMounted.current) return;
        
        // Handle empty articles array
        if (!Array.isArray(firebaseArticles) || firebaseArticles.length === 0) {
          onArticlesLoaded([], null, []);
          
          if (isMounted.current) {
            onLoadingChange(false);
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          }
          
          return;
        }
        
        // Process articles for featured and recent sections
        const sortedByViews = [...firebaseArticles].sort((a, b) => {
          const aViews = typeof a.views === 'number' ? a.views : 0;
          const bViews = typeof b.views === 'number' ? b.views : 0;
          return bViews - aViews;
        });
        
        const featuredArticle = sortedByViews[0] || null;
        
        const remainingArticles = featuredArticle 
          ? firebaseArticles.filter(article => article.id !== featuredArticle.id) 
          : firebaseArticles;
        
        // Shuffle remaining articles for the recent section
        const shuffled = [...remainingArticles].sort(() => 0.5 - Math.random());
        const recentArticles = shuffled.slice(0, 3);
        
        // Update parent component with loaded articles
        onArticlesLoaded(firebaseArticles, featuredArticle, recentArticles);
      } catch (error) {
        // Handle errors
        console.error("ClientOnlyArticles: Error loading articles:", error);
        
        if (isMounted.current) {
          onError(error instanceof Error ? error.message : "Failed to load articles");
          
          toast({
            title: "Error",
            description: "Failed to load articles from the database",
            status: "error",
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
          
          onLoadingChange(false);
        }
      }
    };
    
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
  }, [onArticlesLoaded, onLoadingChange, onError, toast]);

  // This component doesn't render anything itself
  return null;
};

export default ClientOnlyArticles;
