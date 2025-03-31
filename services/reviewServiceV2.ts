import { 
  collection, 
  getDocs, 
  getDoc,
  doc,
  query, 
  where, 
  orderBy, 
  Timestamp,
  runTransaction,
  serverTimestamp,
  increment,
  limit,
  Firestore,
  Transaction
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import logger, { LogCategory } from '../utils/logger';
import { getFirebaseFirestore } from '../config/firebase';

// Get Firestore instance from central Firebase config
const db = getFirebaseFirestore() as Firestore;

if (!db) {
  logger.error('Firebase not initialized', {
    category: LogCategory.ERROR
  });
  throw new Error('Firebase not initialized');
}

// Collections
const ARTICLES_COLLECTION = 'articles';
const REVIEWS_COLLECTION = 'reviews';

// Review interface with clear typing
export interface Review {
  id?: string;
  articleId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerInstitution?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  // Review criteria
  novelty: number;
  methodology: number;
  clarity: number;
  significance: number;
  // Text feedback
  strengths: string;
  weaknesses: string;
  comments: string;
  // Status tracking
  status: 'submitted' | 'revised' | 'rejected';
}

/**
 * Submit a review for an article
 * This uses a transaction to ensure the reviewCount is properly incremented
 */
export async function submitReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'reviewerId' | 'reviewerName' | 'reviewerInstitution'>): Promise<Review> {
  try {
    const startTime = performance.now();
    logger.info('Starting review submission', {
      category: LogCategory.DATA
    });
    
    // Get current user
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      logger.error('User not authenticated for review submission', {
        category: LogCategory.AUTH
      });
      throw new Error('User not authenticated');
    }
    
    // Get user's profile info (use display name if available)
    const userId = currentUser.uid;
    
    // Check if user has already reviewed this article
    const existingReviewQuery = query(
      collection(db, REVIEWS_COLLECTION),
      where('articleId', '==', reviewData.articleId),
      where('reviewerId', '==', userId)
    );
    
    const existingReviewSnapshot = await getDocs(existingReviewQuery);
    
    if (!existingReviewSnapshot.empty) {
      logger.error('User has already reviewed this article', {
        context: { 
          userId,
          articleId: reviewData.articleId
        },
        category: LogCategory.DATA
      });
      throw new Error('You have already reviewed this article');
    }
    
    // Check if the article exists
    const articleRef = doc(db, ARTICLES_COLLECTION, reviewData.articleId);
    const articleSnapshot = await getDoc(articleRef);
    
    if (!articleSnapshot.exists()) {
      logger.error('Article not found for review', {
        context: { articleId: reviewData.articleId },
        category: LogCategory.DATA
      });
      throw new Error('Article not found');
    }
    
    // Validate review data
    const scores = [
      reviewData.novelty,
      reviewData.methodology,
      reviewData.clarity,
      reviewData.significance
    ];
    
    if (scores.some(score => score < 1 || score > 5)) {
      logger.error('Invalid review scores', {
        context: { scores },
        category: LogCategory.DATA
      });
      throw new Error('Review scores must be between 1 and 5');
    }
    
    // Create a new review record
    const reviewId = `${reviewData.articleId}-${currentUser.uid}`;
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    
    const review: Omit<Review, 'createdAt' | 'updatedAt'> & { 
      createdAt: any, 
      updatedAt: any 
    } = {
      id: reviewId,
      reviewerId: currentUser.uid,
      reviewerName: currentUser.displayName || 'Anonymous',
      status: 'submitted',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      articleId: reviewData.articleId,
      novelty: reviewData.novelty,
      methodology: reviewData.methodology,
      clarity: reviewData.clarity,
      significance: reviewData.significance,
      strengths: reviewData.strengths,
      weaknesses: reviewData.weaknesses,
      comments: reviewData.comments
    };
    
    // Submit the review using a transaction
    await runTransaction(db, async (transaction: Transaction) => {
      // Add the review document
      transaction.set(reviewRef, review);
      
      // Update the article's review count
      transaction.update(articleRef, {
        reviewCount: increment(1),
        updatedAt: serverTimestamp()
      });
    });
    
    // Return the completed review
    const submittedReview: Review = {
      id: reviewId,
      ...review
    };
    
    const duration = performance.now() - startTime;
    logger.info('Review submitted successfully', {
      context: {
        reviewId: reviewId,
        articleId: reviewData.articleId,
        duration: `${duration.toFixed(2)}ms`
      },
      category: LogCategory.DATA
    });
    
    return submittedReview;
  } catch (error) {
    logger.error('Error submitting review', {
      context: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        articleId: reviewData.articleId
      },
      category: LogCategory.ERROR
    });
    throw new Error('Failed to submit review');
  }
}

/**
 * Get all reviews for an article
 */
export async function getReviewsForArticle(articleId: string): Promise<Review[]> {
  try {
    const startTime = performance.now();
    logger.info('Getting reviews for article', {
      context: { articleId },
      category: LogCategory.DATA
    });
    
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('articleId', '==', articleId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Process results
    const reviews: Review[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reviews.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as Review);
    });
    
    const duration = performance.now() - startTime;
    logger.info('Reviews retrieved successfully', {
      context: {
        articleId,
        count: reviews.length,
        duration: `${duration.toFixed(2)}ms`
      },
      category: LogCategory.DATA
    });
    
    return reviews;
  } catch (error) {
    logger.error('Error getting reviews for article', {
      context: {
        articleId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      category: LogCategory.ERROR
    });
    throw new Error(`Failed to get reviews for article: ${articleId}`);
  }
}

/**
 * Calculate average review scores for an article
 */
export async function getArticleReviewStats(articleId: string): Promise<{
  averageScores: {
    novelty: number;
    methodology: number;
    clarity: number;
    significance: number;
    overall: number;
  };
  reviewCount: number;
} | null> {
  try {
    const startTime = performance.now();
    logger.info('Getting review stats for article', {
      context: { articleId },
      category: LogCategory.DATA
    });
    
    const reviews = await getReviewsForArticle(articleId);
    
    if (reviews.length === 0) {
      return null;
    }
    
    // Calculate average scores
    let totalNovelty = 0;
    let totalMethodology = 0;
    let totalClarity = 0;
    let totalSignificance = 0;
    
    reviews.forEach(review => {
      totalNovelty += review.novelty;
      totalMethodology += review.methodology;
      totalClarity += review.clarity;
      totalSignificance += review.significance;
    });
    
    const reviewCount = reviews.length;
    
    const averageNovelty = totalNovelty / reviewCount;
    const averageMethodology = totalMethodology / reviewCount;
    const averageClarity = totalClarity / reviewCount;
    const averageSignificance = totalSignificance / reviewCount;
    
    // Calculate overall average
    const overall = (averageNovelty + averageMethodology + averageClarity + averageSignificance) / 4;
    
    const averageScores = {
      novelty: parseFloat(averageNovelty.toFixed(1)),
      methodology: parseFloat(averageMethodology.toFixed(1)),
      clarity: parseFloat(averageClarity.toFixed(1)),
      significance: parseFloat(averageSignificance.toFixed(1)),
      overall: parseFloat(overall.toFixed(1))
    };
    
    const duration = performance.now() - startTime;
    logger.info('Retrieved article review stats', {
      context: {
        articleId,
        reviewCount,
        duration: `${duration.toFixed(2)}ms`
      },
      category: LogCategory.DATA
    });
    
    return {
      averageScores,
      reviewCount
    };
  } catch (error) {
    logger.error('Failed to get article review stats', {
      context: {
        articleId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      category: LogCategory.ERROR
    });
    throw new Error(`Failed to get article review stats: ${articleId}`);
  }
}

/**
 * Get reviews submitted by the current user
 */
export async function getUserReviews(): Promise<Review[]> {
  try {
    const startTime = performance.now();
    logger.info('Getting user reviews', {
      category: LogCategory.DATA
    });
    
    // Get current user
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      logger.error('User not authenticated for getting user reviews', {
        category: LogCategory.AUTH
      });
      throw new Error('User not authenticated');
    }
    
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('reviewerId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Process results
    const reviews: Review[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reviews.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as Review);
    });
    
    const duration = performance.now() - startTime;
    logger.info('User reviews retrieved successfully', {
      context: {
        userId: currentUser.uid,
        count: reviews.length,
        duration: `${duration.toFixed(2)}ms`
      },
      category: LogCategory.DATA
    });
    
    return reviews;
  } catch (error) {
    logger.error('Error getting user reviews', {
      context: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      category: LogCategory.ERROR
    });
    throw new Error('Failed to get user reviews');
  }
}

/**
 * Check if user has already reviewed an article
 */
export async function hasUserReviewedArticle(articleId: string): Promise<boolean> {
  try {
    const startTime = performance.now();
    logger.info('Checking if user has reviewed article', {
      context: { articleId },
      category: LogCategory.DATA
    });
    
    // Get current user
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      logger.error('User not authenticated for checking review status', {
        category: LogCategory.AUTH
      });
      throw new Error('User not authenticated');
    }
    
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('articleId', '==', articleId),
      where('reviewerId', '==', currentUser.uid),
      limit(1)
    );
    
    const reviewsSnapshot = await getDocs(q);
    const hasReviewed = !reviewsSnapshot.empty;
    
    const duration = performance.now() - startTime;
    logger.info('Checked user review status', {
      context: {
        articleId,
        hasReviewed,
        duration: `${duration.toFixed(2)}ms`
      },
      category: LogCategory.DATA
    });
    
    return hasReviewed;
  } catch (error) {
    logger.error('Failed to check if user has reviewed article', {
      context: {
        articleId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      category: LogCategory.ERROR
    });
    throw new Error(`Failed to check review status for article: ${articleId}`);
  }
}
