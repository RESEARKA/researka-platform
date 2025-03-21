import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs, startAfter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// Types
export interface Review {
  id: string;
  title: string;
  content: string;
  date: string;
  reviewerId: string;
  articleId: string;
  createdAt: any;
}

export interface ReviewsResponse {
  reviews: Review[];
  totalPages: number;
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

// Fetch reviews from Firestore
const fetchReviews = async (
  userId: string | undefined,
  page = 1,
  itemsPerPage = 5,
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<ReviewsResponse> => {
  // Return empty response if no userId
  if (!userId) {
    return {
      reviews: [],
      totalPages: 0,
      lastVisible: null,
      hasMore: false
    };
  }

  try {
    const reviewsCollection = 'reviews';
    let reviewsQuery;

    // First page query
    if (page === 1 || !lastVisible) {
      reviewsQuery = query(
        collection(db, reviewsCollection),
        where('reviewerId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(itemsPerPage)
      );
    } else {
      // Pagination query with startAfter
      reviewsQuery = query(
        collection(db, reviewsCollection),
        where('reviewerId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(itemsPerPage)
      );
    }

    const reviewsSnapshot = await getDocs(reviewsQuery);
    const lastVisibleDoc = reviewsSnapshot.docs[reviewsSnapshot.docs.length - 1] || null;
    const hasMore = reviewsSnapshot.docs.length === itemsPerPage;

    // Convert Firestore documents to Review objects
    const reviews = reviewsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.articleTitle || 'Review of Article',
        content: data.content || 'No review content provided',
        date: data.createdAt?.toDate?.() 
          ? new Date(data.createdAt.toDate()).toLocaleDateString() 
          : new Date().toLocaleDateString(),
        reviewerId: data.reviewerId || '',
        articleId: data.articleId || '',
        createdAt: data.createdAt
      };
    });

    return {
      reviews,
      totalPages: hasMore ? page + 1 : page,
      lastVisible: lastVisibleDoc,
      hasMore
    };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// React Query hook
export const useReviews = (
  page = 1,
  itemsPerPage = 5
): UseQueryResult<ReviewsResponse, Error> => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  return useQuery({
    queryKey: ['reviews', userId, page, itemsPerPage],
    queryFn: () => fetchReviews(userId, page, itemsPerPage),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};
