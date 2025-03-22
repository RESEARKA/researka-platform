import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  DocumentData
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
  } catch (error) {
    console.error('ReviewService: Error getting reviews for article:', error);
    throw new Error('Failed to get reviews for article');
  }
};
