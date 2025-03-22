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
    console.log('useReviews: No userId provided, returning empty response');
    return {
      reviews: [],
      totalPages: 0,
      lastVisible: null,
      hasMore: false
    };
  }

  console.log(`useReviews: Fetching reviews for user: ${userId}, page: ${page}, itemsPerPage: ${itemsPerPage}`);
  
  try {
    // Create a reference to the reviews collection
    const reviewsRef = collection(db, 'reviews');
    
    // Create a query against the collection
    let reviewsQuery;
    
    if (lastVisible) {
      // If we have a lastVisible document, start after it
      reviewsQuery = query(
        reviewsRef,
        where('reviewerId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(itemsPerPage)
      );
      console.log('useReviews: Using pagination with lastVisible document');
    } else {
      // First page query
      reviewsQuery = query(
        reviewsRef,
        where('reviewerId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(itemsPerPage)
      );
      console.log('useReviews: First page query without lastVisible document');
    }
    
    // Execute the query
    console.log('useReviews: Executing query...');
    const reviewsSnapshot = await getDocs(reviewsQuery);
    console.log(`useReviews: Query executed, got ${reviewsSnapshot.docs.length} documents`);
    
    // Check if there are any documents
    if (reviewsSnapshot.empty) {
      console.log('useReviews: No reviews found for user:', userId);
      return {
        reviews: [],
        totalPages: 0,
        lastVisible: null,
        hasMore: false
      };
    }
    
    // Get the last visible document for pagination
    const lastVisibleDoc = reviewsSnapshot.docs[reviewsSnapshot.docs.length - 1];
    
    // Check if there are more documents
    const nextQuery = query(
      reviewsRef,
      where('reviewerId', '==', userId),
      orderBy('createdAt', 'desc'),
      startAfter(lastVisibleDoc),
      limit(1)
    );
    
    const nextSnapshot = await getDocs(nextQuery);
    const hasMore = !nextSnapshot.empty;
    
    // Map the documents to an array of reviews
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
    
    console.log(`useReviews: Fetched ${reviews.length} reviews for user:`, userId);
    
    // Calculate total pages (this is an approximation)
    const totalPages = page + (hasMore ? 1 : 0);
    
    return {
      reviews,
      totalPages,
      lastVisible: lastVisibleDoc,
      hasMore
    };
  } catch (error: any) {
    // Check for specific error types
    if (error?.name === 'FirebaseError') {
      if (error.code === 'permission-denied') {
        console.error('useReviews: Permission denied error. You need to update Firestore security rules:');
        console.error(`
        // Add this to your Firestore security rules
        match /reviews/{reviewId} {
          allow read: if request.auth != null;
          allow write: if request.auth != null && request.auth.uid == resource.data.reviewerId;
        }
        `);
        console.error('Visit the Firebase console to update security rules: https://console.firebase.google.com/project/_/firestore/rules');
      } else if (error.code === 'failed-precondition') {
        console.error('useReviews: Missing required index for query. You need to create a composite index on Firestore:');
        console.error('Collection: reviews');
        console.error('Fields to index: reviewerId (Ascending) and createdAt (Descending)');
        console.error('Visit the Firebase console to create this index: https://console.firebase.google.com/project/_/firestore/indexes');
      } else {
        console.error('useReviews: Firebase error fetching reviews:', error.code, error.message);
      }
    } else {
      console.error('useReviews: Error fetching reviews:', error);
    }
    
    // Return empty data instead of throwing
    return {
      reviews: [],
      totalPages: 0,
      lastVisible: null,
      hasMore: false
    };
  }
};

// React Query hook
export const useReviews = (
  page = 1,
  itemsPerPage = 5
): UseQueryResult<ReviewsResponse, Error> => {
  const { currentUser, authIsInitialized } = useAuth();
  const userId = currentUser?.uid;

  return useQuery({
    queryKey: ['reviews', userId, page, itemsPerPage],
    queryFn: () => fetchReviews(userId, page, itemsPerPage),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!userId && authIsInitialized === true,
    retry: 3
  });
};
