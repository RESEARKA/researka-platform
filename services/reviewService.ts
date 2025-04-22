import { getFirebaseFirestore } from '../config/firebase';
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
  scores?: {
    originality: number;
    methodology: number;
    clarity: number;
    significance: number;
    technicalQuality: number;
  };
  recommendation: 'accept' | 'minor_revisions' | 'major_revisions' | 'reject';
  content: string;
  date?: string;
  createdAt?: Timestamp;
  aiAssisted?: boolean;
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
    
    // Get Firestore instance
    const firestore = await getFirebaseFirestore();
    if (!firestore) {
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
    const docRef = await addDoc(collection(firestore, reviewsCollection), reviewWithTimestamp);
    
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
    
    // Get Firestore instance
    const firestore = await getFirebaseFirestore();
    if (!firestore) {
      console.error('ReviewService: Firestore not initialized');
      throw new Error('Firestore not initialized');
    }
    
    // Query reviews for the specific article
    const reviewsRef = collection(firestore, reviewsCollection);
    
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
    
    // Get Firestore instance
    const firestore = await getFirebaseFirestore();
    if (!firestore) {
      console.error('ReviewService: Firestore not initialized');
      return;
    }
    
    // Query reviews for the current user
    const reviewsRef = collection(firestore, reviewsCollection);
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
    
    if (!userId) {
      console.error('ReviewService: No userId provided');
      return [];
    }

    // Get Firestore instance
    const firestore = await getFirebaseFirestore();
    if (!firestore) {
      console.error('ReviewService: Firestore not initialized');
      throw new Error('Firestore not initialized');
    }

    // Query reviews for the specific user
    const reviewsRef = collection(firestore, reviewsCollection);
    const reviews: Review[] = [];
    
    // Try multiple query approaches to ensure we find all reviews
    // First approach: Direct query with reviewerId
    try {
      console.log(`ReviewService: Querying reviews with reviewerId == ${userId}`);
      
      // First try with ordering (which requires an index)
      const q = query(
        reviewsRef,
        where('reviewerId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`ReviewService: Query returned ${querySnapshot.size} documents`);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`ReviewService: Found review ${doc.id}:`, data);
        
        // Validate required fields and provide defaults for missing data
        if (!data.articleTitle) {
          console.warn(`ReviewService: Review ${doc.id} missing articleTitle, adding default`);
        }
        
        reviews.push({
          id: doc.id,
          ...data,
          articleTitle: data.articleTitle || 'Untitled Article',
          content: data.content || '',
          reviewerId: userId, // Ensure consistent reviewerId
          createdAt: data.createdAt || Timestamp.now(),
          date: data.date || data.createdAt?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          score: typeof data.score === 'number' ? data.score : 0,
          recommendation: data.recommendation || 'accept'
        } as Review);
      });
      
      console.log(`ReviewService: Found ${reviews.length} reviews with query for user ${userId}`);
    } catch (error) {
      console.error('ReviewService: Error with primary query:', error);
    }
    
    // If no reviews found, try a different approach - check if reviewerId field might be stored differently
    if (reviews.length === 0) {
      console.log(`ReviewService: No reviews found with standard query, trying alternative approach`);
      
      // Get all reviews and filter client-side (less efficient but more thorough)
      try {
        const allReviewsQuery = query(reviewsRef);
        const allReviewsSnapshot = await getDocs(allReviewsQuery);
        console.log(`ReviewService: All reviews query returned ${allReviewsSnapshot.size} documents`);
        
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
              articleTitle: data.articleTitle || 'Untitled Article',
              content: data.content || '',
              reviewerId: userId, // Ensure consistent reviewerId
              createdAt: data.createdAt || Timestamp.now(),
              date: data.date || data.createdAt?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
              score: typeof data.score === 'number' ? data.score : 0,
              recommendation: data.recommendation || 'accept'
            } as Review);
          }
        });
      } catch (error) {
        console.error('ReviewService: Error with alternative query:', error);
      }
    }
    
    // Additional check: Log all reviews to help debug
    console.log(`ReviewService: Final review count for user ${userId}: ${reviews.length}`);
    reviews.forEach((review, index) => {
      console.log(`ReviewService: Review ${index + 1}:`, {
        id: review.id,
        articleTitle: review.articleTitle,
        reviewerId: review.reviewerId,
        date: review.date,
        title: review.articleTitle || '[No Title]'
      });
    });
    
    return reviews;
  } catch (error) {
    console.error('ReviewService: Error getting reviews for user:', error);
    // Return empty array instead of throwing to prevent breaking the UI
    return [];
  }
};

/**
 * Migrate reviews to use consistent reviewerId format
 * This function will update all reviews for a user to use the consistent Firebase user ID format
 */
export const migrateUserReviews = async (userId: string, oldReviewerIds: string[]): Promise<number> => {
  try {
    console.log('ReviewService: Starting migrateUserReviews for user:', userId);
    console.log('ReviewService: Old reviewer IDs:', oldReviewerIds);
    
    if (!userId || oldReviewerIds.length === 0) {
      console.error('ReviewService: Invalid parameters for migration');
      return 0;
    }

    // Get Firestore instance
    const firestore = await getFirebaseFirestore();
    if (!firestore) {
      console.error('ReviewService: Firestore not initialized');
      throw new Error('Firestore not initialized');
    }

    // Import necessary Firestore functions
    const { doc, updateDoc, getDocs, query, where } = await import('firebase/firestore');
    
    let migratedCount = 0;
    
    // For each old reviewer ID, find reviews and update them
    for (const oldId of oldReviewerIds) {
      if (!oldId) continue;
      
      console.log(`ReviewService: Looking for reviews with old reviewerId: ${oldId}`);
      
      // Query reviews with the old reviewer ID
      const reviewsRef = collection(firestore, reviewsCollection);
      const q = query(reviewsRef, where('reviewerId', '==', oldId));
      
      const querySnapshot = await getDocs(q);
      console.log(`ReviewService: Found ${querySnapshot.size} reviews with old reviewerId: ${oldId}`);
      
      // Update each review with the new reviewer ID
      for (const docSnapshot of querySnapshot.docs) {
        try {
          console.log(`ReviewService: Updating review ${docSnapshot.id} to use new reviewerId: ${userId}`);
          
          await updateDoc(doc(firestore, reviewsCollection, docSnapshot.id), {
            reviewerId: userId
          });
          
          migratedCount++;
          console.log(`ReviewService: Successfully updated review ${docSnapshot.id}`);
        } catch (updateError) {
          console.error(`ReviewService: Error updating review ${docSnapshot.id}:`, updateError);
        }
      }
    }
    
    console.log(`ReviewService: Migration complete. Updated ${migratedCount} reviews.`);
    return migratedCount;
  } catch (error) {
    console.error('ReviewService: Error migrating reviews:', error);
    throw new Error('Failed to migrate reviews');
  }
};
