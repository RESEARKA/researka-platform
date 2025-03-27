import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, orderBy, limit, getDocs, DocumentData } from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';
import { Article } from './useArticles';
import { Review } from './useReviews';

// Define pagination state interface
interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

// Define content types
export type ContentType = 'articles' | 'reviews';

/**
 * Custom hook for fetching profile content (articles and reviews)
 * Separates data fetching logic from UI components
 */
export function useProfileContent(userId: string, contentType: ContentType) {
  // State for content data
  const [items, setItems] = useState<Article[] | Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
    totalItems: 0
  });
  
  // Refs to prevent duplicate operations
  const isLoadingData = useRef<boolean>(false);
  const lastFetchTime = useRef<number>(0);
  
  // Helper function for logging
  const logOperation = useCallback((message: string, level: 'log' | 'warn' | 'error' = 'log') => {
    const prefix = `[ProfileContent:${contentType}]`;
    switch (level) {
      case 'warn':
        console.warn(`${prefix} ${message}`);
        break;
      case 'error':
        console.error(`${prefix} ${message}`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }, [contentType]);
  
  // Function to fetch content data
  const fetchContent = useCallback(async (page: number = 1) => {
    // Skip if already loading or no user ID
    if (isLoadingData.current || !userId) {
      logOperation('Fetch skipped - already loading or no user ID');
      return;
    }
    
    // Prevent rapid refetching
    const now = Date.now();
    if (now - lastFetchTime.current < 2000) {
      logOperation('Fetch skipped - too soon after last fetch');
      return;
    }
    
    lastFetchTime.current = now;
    
    try {
      // Set loading state
      isLoadingData.current = true;
      setIsLoading(true);
      setError(null);
      
      logOperation(`Fetching ${contentType} for user ${userId.substring(0, 8)}...`);
      
      // Get Firestore instance
      const db = getFirebaseFirestore();
      if (!db) {
        throw new Error('Firestore not initialized');
      }
      
      // Determine collection to query
      const collectionName = contentType === 'articles' ? 'articles' : 'reviews';
      
      // Calculate pagination
      const itemsPerPage = pagination.itemsPerPage;
      const startIndex = (page - 1) * itemsPerPage;
      
      // Create query
      const contentQuery = query(
        collection(db, collectionName),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(itemsPerPage)
      );
      
      // Execute query
      const querySnapshot = await getDocs(contentQuery);
      
      // Process results
      const fetchedItems: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Update state
      setItems(fetchedItems as any[]);
      
      // Update pagination
      // In a real implementation, you would get the total count from Firestore
      // For now, we'll estimate based on the returned items
      const totalItems = fetchedItems.length >= itemsPerPage ? 
        fetchedItems.length + itemsPerPage : fetchedItems.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
      
      setPagination({
        currentPage: page,
        totalPages,
        itemsPerPage,
        totalItems
      });
      
      logOperation(`Fetched ${fetchedItems.length} ${contentType}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logOperation(`Error fetching ${contentType}: ${errorMessage}`, 'error');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      isLoadingData.current = false;
    }
  }, [userId, contentType, pagination.itemsPerPage, logOperation]);
  
  // Function to change page
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > pagination.totalPages) {
      return;
    }
    
    logOperation(`Changing page to ${page}`);
    fetchContent(page);
  }, [fetchContent, pagination.totalPages, logOperation]);
  
  // Fetch content when user ID changes
  useEffect(() => {
    if (userId) {
      fetchContent(1);
    }
  }, [userId, fetchContent]);
  
  return {
    items,
    isLoading,
    error,
    pagination,
    handlePageChange,
    refresh: () => fetchContent(pagination.currentPage)
  };
}
