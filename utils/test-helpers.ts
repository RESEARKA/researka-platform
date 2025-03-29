import { db } from '../config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Review } from '../services/reviewService';

/**
 * Add a test review to Firestore for development purposes
 * @param articleId The ID of the article to add a review for
 * @returns Promise<string> The ID of the created review
 */
export const addTestReview = async (articleId: string): Promise<string> => {
  try {
    if (!db) {
      console.error('Firestore not initialized');
      throw new Error('Firestore not initialized');
    }
    
    // Create a test review
    const testReview: Omit<Review, 'id'> = {
      articleId,
      articleTitle: 'Test Article',
      reviewerId: 'test-reviewer-id',
      reviewerName: 'Test Reviewer',
      score: 4.5,
      recommendation: 'accept',
      content: 'This is a test review to verify Firestore functionality.',
      date: new Date().toISOString().split('T')[0],
      createdAt: Timestamp.now()
    };
    
    // Add to Firestore
    const reviewsCollection = 'reviews';
    const docRef = await addDoc(collection(db, reviewsCollection), testReview);
    
    console.log('Test review added with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding test review:', error);
    throw new Error('Failed to add test review');
  }
};
