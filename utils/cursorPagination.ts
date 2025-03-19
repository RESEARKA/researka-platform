import { Article } from '../data/articles';

/**
 * Cursor-based pagination implementation for articles
 * This is more efficient than offset-based pagination and maintains consistency when data changes
 */

// Define the cursor type
export interface PaginationCursor {
  id: string;
  timestamp: number;
}

// Define pagination result type
export interface PaginationResult<T> {
  items: T[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor: PaginationCursor | null;
  previousCursor: PaginationCursor | null;
}

/**
 * Get a page of articles using cursor-based pagination
 * @param articles The full list of articles
 * @param limit Number of items per page
 * @param cursor Current cursor position (null for first page)
 * @param direction 'next' or 'previous'
 * @returns Pagination result with items and cursor information
 */
export function getArticlesWithCursor(
  articles: Article[],
  limit: number,
  cursor: PaginationCursor | null,
  direction: 'next' | 'previous' = 'next'
): PaginationResult<Article> {
  // Make sure we have a valid limit
  const validLimit = Math.max(1, Math.min(limit, 50));
  
  // Sort articles by timestamp (newest first)
  const sortedArticles = [...articles].sort((a, b) => {
    const timestampA = new Date(a.publishedAt || a.createdAt || Date.now()).getTime();
    const timestampB = new Date(b.publishedAt || b.createdAt || Date.now()).getTime();
    return timestampB - timestampA; // Descending order (newest first)
  });
  
  // If no cursor, return the first page
  if (!cursor) {
    const items = sortedArticles.slice(0, validLimit);
    const lastItem = items[items.length - 1];
    
    const nextCursor = items.length < validLimit ? null : {
      id: lastItem.id,
      timestamp: new Date(lastItem.publishedAt || lastItem.createdAt || Date.now()).getTime()
    };
    
    return {
      items,
      hasNextPage: nextCursor !== null,
      hasPreviousPage: false,
      nextCursor,
      previousCursor: null
    };
  }
  
  // Find the index of the cursor in the sorted array
  const cursorIndex = sortedArticles.findIndex(article => article.id === cursor.id);
  
  // If cursor not found, return first page
  if (cursorIndex === -1) {
    return getArticlesWithCursor(articles, limit, null);
  }
  
  // Get items based on direction
  let items: Article[] = [];
  let nextCursor: PaginationCursor | null = null;
  let previousCursor: PaginationCursor | null = null;
  
  if (direction === 'next') {
    // Get items after the cursor
    items = sortedArticles.slice(cursorIndex + 1, cursorIndex + 1 + validLimit);
    
    // Set next cursor if there are more items
    if (cursorIndex + 1 + validLimit < sortedArticles.length) {
      const lastItem = items[items.length - 1];
      nextCursor = {
        id: lastItem.id,
        timestamp: new Date(lastItem.publishedAt || lastItem.createdAt || Date.now()).getTime()
      };
    }
    
    // Set previous cursor
    previousCursor = cursor;
  } else {
    // Get items before the cursor
    const startIndex = Math.max(0, cursorIndex - validLimit);
    items = sortedArticles.slice(startIndex, cursorIndex);
    
    // Set previous cursor if there are more items before
    if (startIndex > 0) {
      const firstItem = sortedArticles[startIndex - 1];
      previousCursor = {
        id: firstItem.id,
        timestamp: new Date(firstItem.publishedAt || firstItem.createdAt || Date.now()).getTime()
      };
    }
    
    // Set next cursor
    nextCursor = cursor;
  }
  
  return {
    items,
    hasNextPage: nextCursor !== null,
    hasPreviousPage: previousCursor !== null,
    nextCursor,
    previousCursor
  };
}

/**
 * Get a specific page by page number using cursor-based pagination under the hood
 * This provides a familiar API while using the more efficient cursor-based implementation
 * 
 * @param articles The full list of articles
 * @param pageNumber The page number to retrieve (1-based)
 * @param pageSize Number of items per page
 * @returns Pagination result with items and page information
 */
export function getArticlesByPageNumber(
  articles: Article[],
  pageNumber: number,
  pageSize: number
): {
  items: Article[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
} {
  // Validate inputs
  const validPageSize = Math.max(1, Math.min(pageSize, 50));
  const validPageNumber = Math.max(1, pageNumber);
  
  // Sort articles by timestamp (newest first)
  const sortedArticles = [...articles].sort((a, b) => {
    const timestampA = new Date(a.publishedAt || a.createdAt || Date.now()).getTime();
    const timestampB = new Date(b.publishedAt || b.createdAt || Date.now()).getTime();
    return timestampB - timestampA; // Descending order (newest first)
  });
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(sortedArticles.length / validPageSize));
  
  // Adjust page number if it exceeds total pages
  const adjustedPageNumber = Math.min(validPageNumber, totalPages);
  
  // Calculate start and end indices
  const startIndex = (adjustedPageNumber - 1) * validPageSize;
  const endIndex = Math.min(startIndex + validPageSize, sortedArticles.length);
  
  // Get items for the current page
  const items = sortedArticles.slice(startIndex, endIndex);
  
  return {
    items,
    currentPage: adjustedPageNumber,
    totalPages,
    hasNextPage: adjustedPageNumber < totalPages,
    hasPreviousPage: adjustedPageNumber > 1
  };
}
