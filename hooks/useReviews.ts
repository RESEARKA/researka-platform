import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

// Types
export interface ReviewResponse {
  id?: string;
  content: string;
  authorId: string;
  authorName?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface Review {
  id: string;
  title?: string;
  articleTitle: string;
  content: string;
  date: string;
  reviewerId: string;
  articleId: string;
  createdAt: any; // Keep as 'any' to accommodate different timestamp formats
  score?: number;
  recommendation?: string;
  reviewerName?: string;
  responses?: ReviewResponse[];
  authorId?: string; // The ID of the article author
}

export interface ReviewsResponse {
  reviews: Review[];
  totalPages: number;
  totalCount?: number; // Total number of reviews (across all pages)
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export type SortOption = 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc';

export interface FilterOptions {
  recommendation?: string;
  minScore?: number;
  maxScore?: number;
  dateFrom?: string;
  dateTo?: string;
}

// Fetch reviews from Firestore
const fetchReviews = async (
  userId: string | undefined,
  page = 1,
  itemsPerPage = 5,
  sortBy: SortOption = 'date_desc',
  filters: FilterOptions = {}
): Promise<ReviewsResponse> => {
  // Return empty response if no userId
  if (!userId) {
    console.log('useReviews: No userId provided, returning empty response');
    return {
      reviews: [],
      totalPages: 0,
      totalCount: 0,
      lastVisible: null,
      hasMore: false
    };
  }

  console.log(`useReviews: Fetching reviews for user: ${userId}, page: ${page}, itemsPerPage: ${itemsPerPage}, sortBy: ${sortBy}`);
  console.log('useReviews: Filters:', filters);
  
  try {
    // Import getUserReviews from reviewService
    const { getUserReviews } = await import('../services/reviewService');
    
    // Use the getUserReviews function to get all reviews for the user
    const allReviews = await getUserReviews(userId);
    
    // Ensure all reviews have an id (required by our Review interface)
    const validReviews = allReviews
      .filter(review => review.id) // Filter out any reviews without an id
      .map(review => ({
        ...review,
        id: review.id as string, // Cast to ensure it's a string
        // Ensure other required fields have default values if missing
        articleTitle: review.articleTitle || 'Untitled Article',
        content: review.content || '',
        date: review.date || new Date().toISOString().split('T')[0],
        reviewerId: review.reviewerId || userId,
        articleId: review.articleId || '',
        createdAt: review.createdAt || Timestamp.now(), // Ensure createdAt is always present
      })) as Review[]; // Cast the entire array to Review[]
    
    // Apply filters
    let filteredReviews = validReviews;
    
    if (filters.recommendation) {
      filteredReviews = filteredReviews.filter(review => 
        review.recommendation === filters.recommendation
      );
    }
    
    if (filters.minScore !== undefined) {
      filteredReviews = filteredReviews.filter(review => 
        (review.score || 0) >= (filters.minScore || 0)
      );
    }
    
    if (filters.maxScore !== undefined) {
      filteredReviews = filteredReviews.filter(review => 
        (review.score || 0) <= (filters.maxScore || 0)
      );
    }
    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom).getTime();
      filteredReviews = filteredReviews.filter(review => {
        const reviewDate = review.date ? new Date(review.date).getTime() : 0;
        return reviewDate >= fromDate;
      });
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo).getTime();
      filteredReviews = filteredReviews.filter(review => {
        const reviewDate = review.date ? new Date(review.date).getTime() : 0;
        return reviewDate <= toDate;
      });
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'date_asc':
        filteredReviews.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case 'score_desc':
        filteredReviews.sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
      case 'score_asc':
        filteredReviews.sort((a, b) => (a.score || 0) - (b.score || 0));
        break;
      case 'date_desc':
      default:
        filteredReviews.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }
    
    // Calculate pagination
    const totalItems = filteredReviews.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);
    
    console.log(`useReviews: Found ${filteredReviews.length} reviews for user ${userId}, returning page ${page} with ${paginatedReviews.length} reviews`);
    
    return {
      reviews: paginatedReviews,
      totalPages,
      totalCount: totalItems,
      lastVisible: null, // Not needed with client-side pagination
      hasMore: page < totalPages
    };
  } catch (error) {
    console.error('useReviews: Error fetching reviews:', error);
    throw new Error('Failed to fetch reviews');
  }
};

// React Query hook
export const useReviews = (
  userId?: string,
  page = 1,
  itemsPerPage = 5,
  sortBy: SortOption = 'date_desc',
  filters: FilterOptions = {}
): UseQueryResult<ReviewsResponse, Error> => {
  const { currentUser } = useAuth();
  
  // Use provided userId if available, otherwise use currentUser.uid
  const targetUserId = userId || currentUser?.uid;
  
  return useQuery({
    queryKey: ['reviews', targetUserId, page, itemsPerPage, sortBy, filters],
    queryFn: () => fetchReviews(targetUserId, page, itemsPerPage, sortBy, filters),
    enabled: !!targetUserId,
    placeholderData: (previousData) => previousData, // This replaces keepPreviousData
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
};
