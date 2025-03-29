import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
} from 'firebase/firestore';

// Define review interface
export interface Review {
  id?: string;
  articleId: string;
  articleTitle: string;
  reviewerId: string;
  reviewerName: string;
  score: number;
  recommendation: 'accept' | 'minor_revisions' | 'major_revisions' | 'reject';
  content: string;
  date?: string;
  createdAt?: Timestamp;
}

// Collection reference
const reviewsCollection = 'reviews';

/**
 * Submit a new review to Firestore
 */
export const submitReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'date'>): Promise<Review> => {
  try {
    console.log('ReviewService: Starting submitReview');
    
    // Add timestamp and get current user ID from auth
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('ReviewService: User not authenticated');
      throw new Error('User not authenticated');
    }
    
    if (!db) {
      console.error('ReviewService: Firestore not initialized');
      throw new Error('Firestore not initialized');
    }
    
    // Ensure reviewerId is set to current user
    const reviewWithTimestamp = {
      ...reviewData,
      reviewerId: currentUser.uid,
      date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      createdAt: Timestamp.now()
    };
    
    console.log('ReviewService: Review prepared for submission:', reviewWithTimestamp);
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, reviewsCollection), reviewWithTimestamp);
    
    console.log('ReviewService: Review submitted with ID:', docRef.id);
    
    // Return the review with the generated ID
    return {
      id: docRef.id,
      ...reviewData,
      reviewerId: currentUser.uid,
      date: new Date().toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('ReviewService: Error submitting review:', error);
    throw new Error('Failed to submit review');
  }
};

/**
 * Get all reviews for a specific article
 */
export const getReviewsForArticle = async (articleId: string): Promise<Review[]> => {
  try {
    console.log('ReviewService: Starting getReviewsForArticle for article:', articleId);
    
    if (!db) {
      console.error('ReviewService: Firestore not initialized');
      throw new Error('Firestore not initialized');
    }
    
    // Query reviews for the specific article
    const reviewsRef = collection(db, reviewsCollection);
    
    try {
      // First try with ordering (which requires an index)
      const q = query(
        reviewsRef,
        where('articleId', '==', articleId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt,
          date: data.date || data.createdAt?.toDate().toISOString().split('T')[0]
        } as Review);
      });
      
      console.log(`ReviewService: Found ${reviews.length} reviews for article ${articleId}`);
      
      return reviews;
    } catch (indexError) {
      // If the index doesn't exist, fall back to a simpler query without ordering
      console.warn('ReviewService: Index error, falling back to simple query:', indexError);
      
      const simpleQ = query(
        reviewsRef,
        where('articleId', '==', articleId)
      );
      
      const simpleQuerySnapshot = await getDocs(simpleQ);
      const reviews: Review[] = [];
      
      simpleQuerySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt,
          date: data.date || data.createdAt?.toDate().toISOString().split('T')[0]
        } as Review);
      });
      
      console.log(`ReviewService: Found ${reviews.length} reviews for article ${articleId} (simple query)`);
      
      return reviews;
    }
  } catch (error) {
    console.error('ReviewService: Error getting reviews for article:', error);
    throw new Error('Failed to get reviews for article');
  }
};

/**
 * Debug function to log all reviews for the current user
 */
export const logUserReviews = async (): Promise<void> => {
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('ReviewService: User not authenticated');
      return;
    }
    
    if (!db) {
      console.error('ReviewService: Firestore not initialized');
      return;
    }
    
    // Query reviews for the current user
    const reviewsRef = collection(db, reviewsCollection);
    const q = query(
      reviewsRef,
      where('reviewerId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`ReviewService: Found ${querySnapshot.docs.length} reviews for user ${currentUser.uid}`);
    
    querySnapshot.forEach((doc) => {
      console.log(`ReviewService: Review ${doc.id}:`, doc.data());
    });
  } catch (error) {
    console.error('ReviewService: Error logging user reviews:', error);
  }
};

/**
 * Get all reviews for a specific user
 * @param userId - The ID of the user whose reviews to fetch
 * @returns Promise<Review[]> - Array of reviews
 */
export const getUserReviews = async (userId: string): Promise<Review[]> => {
  try {
    console.log('ReviewService: Starting getUserReviews for user:', userId);
    
    if (!db) {
      console.error('ReviewService: Firestore not initialized');
      throw new Error('Firestore not initialized');
    }
    
    if (!userId) {
      console.error('ReviewService: Invalid userId provided:', userId);
      throw new Error('Invalid userId provided');
    }
    
    // Query reviews for the specific user
    const reviewsRef = collection(db, reviewsCollection);
    
    try {
      // First try with ordering (which requires an index)
      const q = query(
        reviewsRef,
        where('reviewerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      console.log(`ReviewService: Executing query for user ${userId} with ordering`);
      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`ReviewService: Processing review ${doc.id}:`, data);
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt,
          date: data.date || data.createdAt?.toDate().toISOString().split('T')[0]
        } as Review);
      });
      
      console.log(`ReviewService: Found ${reviews.length} reviews for user ${userId}`);
      
      return reviews;
    } catch (indexError) {
      // If the index doesn't exist, fall back to a simpler query without ordering
      console.warn('ReviewService: Index error, falling back to simple query:', indexError);
      
      const simpleQ = query(
        reviewsRef,
        where('reviewerId', '==', userId)
      );
      
      console.log(`ReviewService: Executing simple query for user ${userId} without ordering`);
      const simpleQuerySnapshot = await getDocs(simpleQ);
      const reviews: Review[] = [];
      
      simpleQuerySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`ReviewService: Processing review ${doc.id} (simple query):`, data);
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt,
          date: data.date || data.createdAt?.toDate().toISOString().split('T')[0]
        } as Review);
      });
      
      console.log(`ReviewService: Found ${reviews.length} reviews for user ${userId} (simple query)`);
      
      // If still no reviews found, try a different approach - check if reviewerId field might be stored differently
      if (reviews.length === 0) {
        console.log(`ReviewService: No reviews found with standard query, trying alternative approach`);
        
        // Get all reviews and filter client-side
        const allReviewsQuery = query(reviewsRef);
        const allReviewsSnapshot = await getDocs(allReviewsQuery);
        
        allReviewsSnapshot.forEach((doc) => {
          const data = doc.data();
          // Check for reviewerId in different formats or fields
          if (data.reviewerId === userId || 
              data.reviewer_id === userId || 
              data.authorId === userId) {
            console.log(`ReviewService: Found review ${doc.id} with alternative field matching:`, data);
            reviews.push({
              id: doc.id,
              ...data,
              reviewerId: userId, // Ensure consistent field
              createdAt: data.createdAt,
              date: data.date || data.createdAt?.toDate().toISOString().split('T')[0]
            } as Review);
          }
        });
        
        console.log(`ReviewService: Found ${reviews.length} reviews after alternative search for user ${userId}`);
      }
      
      return reviews;
    }
  } catch (error) {
    console.error('ReviewService: Error getting reviews for user:', error);
    throw new Error('Failed to get reviews for user');
  }
};
