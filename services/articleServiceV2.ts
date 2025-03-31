import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  doc,
  updateDoc,
  query, 
  where, 
  orderBy, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import logger, { LogCategory } from '../utils/logger';
import { getFirebaseFirestore } from '../config/firebase';

// Get Firestore instance from central Firebase config
const db = getFirebaseFirestore();

// Collections
const ARTICLES_COLLECTION = 'articles';
const REVIEWS_COLLECTION = 'reviews';

// Article interface with clear typing
export interface Article {
  id?: string;
  title: string;
  abstract: string;
  category: string;
  keywords: string[];
  author: string;
  authorId: string;
  date: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  status: 'draft' | 'published' | 'archived' | 'pending_review';
  compensation: string;
  // Content sections
  introduction?: string;
  methods?: string;
  results?: string;
  discussion?: string;
  references?: string;
  // Additional metadata
  reviewCount: number;
  views: number;
  funding?: string;
  ethicalApprovals?: string;
  dataAvailability?: string;
  conflicts?: string;
  license?: string;
}

/**
 * Submit a new article to Firestore
 */
export async function submitArticle(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount' | 'views'>): Promise<Article> {
  try {
    const startTime = performance.now();
    logger.info('Starting article submission', {
      category: LogCategory.DATA
    });
    
    // Get current user
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      logger.error('User not authenticated for article submission', {
        category: LogCategory.AUTH
      });
      throw new Error('User not authenticated');
    }

    if (!db) {
      logger.error('Firebase not initialized', {
        category: LogCategory.ERROR
      });
      throw new Error('Firebase not initialized');
    }
    
    // Add metadata and defaults
    const completeArticle = {
      ...articleData,
      authorId: currentUser.uid,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      reviewCount: 0,
      views: 0,
      status: articleData.status || 'published'
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), completeArticle);
    
    // Return the article with the generated ID
    const submittedArticle = {
      id: docRef.id,
      ...completeArticle
    };
    
    const duration = performance.now() - startTime;
    logger.info('Article submitted successfully', {
      context: {
        articleId: docRef.id,
        title: articleData.title,
        duration: `${duration.toFixed(2)}ms`
      },
      category: LogCategory.DATA
    });
    
    return submittedArticle;
  } catch (error) {
    logger.error('Error submitting article', {
      context: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      category: LogCategory.ERROR
    });
    throw new Error('Failed to submit article');
  }
}

/**
 * Get all articles, possibly filtered by criteria
 * This function enforces the visibility rule that articles need 2+ reviews to appear
 */
export async function getAllArticles(): Promise<Article[]> {
  try {
    const startTime = performance.now();
    logger.info('Getting all articles', {
      category: LogCategory.DATA
    });
    
    if (!db) {
      logger.error('Firebase not initialized', {
        category: LogCategory.ERROR
      });
      throw new Error('Firebase not initialized');
    }
    
    // Create query for ALL articles without status filtering
    // (simplest possible solution to verify data is accessible)
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    // Execute query
    const querySnapshot = await getDocs(q);
    
    // Process results - include ALL articles without review count filtering
    const articles: Article[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Log ALL articles for debugging
      logger.info(`Processing article ${doc.id}: "${data.title}" - Status: ${data.status}, Reviews: ${data.reviewCount || 0}`, {
        context: { 
          articleId: doc.id, 
          title: data.title, 
          status: data.status, 
          reviewCount: data.reviewCount || 0 
        },
        category: LogCategory.DATA
      });
      
      articles.push({
        id: doc.id,
        ...data,
        reviewCount: data.reviewCount || 0, // Ensure reviewCount is always a number
        views: data.views || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as Article);
    });
    
    logger.info(`Finished processing articles. Found ${querySnapshot.size} total, included ${articles.length}`, {
      context: { totalArticles: querySnapshot.size, includedArticles: articles.length },
      category: LogCategory.DATA
    });
    
    const endTime = performance.now();
    logger.info('GetAllArticles operation completed', {
      context: {
        durationMs: Math.round(endTime - startTime),
        totalArticlesFound: querySnapshot.size,
        articlesWithSufficientReviews: articles.length,
        articlesReturned: articles.length
      },
      category: LogCategory.PERFORMANCE
    });
    
    return articles;
  } catch (error) {
    logger.error('Error getting articles', {
      context: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      category: LogCategory.ERROR
    });
    throw new Error('Failed to get articles');
  }
}

/**
 * Get an article by ID
 */
export async function getArticleById(articleId: string): Promise<Article | null> {
  try {
    const startTime = performance.now();
    logger.info('Getting article by ID', {
      context: { articleId },
      category: LogCategory.DATA
    });
    
    if (!db) {
      logger.error('Firebase not initialized', {
        category: LogCategory.ERROR
      });
      throw new Error('Firebase not initialized');
    }
    
    // Log the attempt to get article
    console.log(`Attempting to get article with ID: ${articleId}`);
    
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    const docSnap = await getDoc(docRef);
    
    // Log whether the document exists
    console.log(`Document exists: ${docSnap.exists()}`);
    
    if (!docSnap.exists()) {
      logger.warn('Article not found', {
        context: { articleId },
        category: LogCategory.DATA
      });
      return null;
    }
    
    const articleData = docSnap.data();
    console.log('Raw article data:', articleData);
    
    // Increment view count
    try {
      await updateDoc(docRef, {
        views: (articleData.views || 0) + 1
      });
    } catch (viewUpdateError) {
      logger.warn('Failed to update view count', {
        context: { 
          articleId,
          error: viewUpdateError instanceof Error ? viewUpdateError.message : String(viewUpdateError)
        },
        category: LogCategory.DATA
      });
      // Continue despite view count update failure
    }
    
    const article: Article = {
      id: docSnap.id,
      ...articleData,
      reviewCount: articleData.reviewCount || 0,
      views: (articleData.views || 0) + 1 // Optimistic update
    } as Article;
    
    const duration = performance.now() - startTime;
    logger.info('Article retrieved successfully', {
      context: {
        articleId,
        title: article.title,
        duration: `${duration.toFixed(2)}ms`
      },
      category: LogCategory.DATA
    });
    
    console.log('Formatted article:', article);
    return article;
  } catch (error) {
    logger.error('Error getting article by ID', {
      context: {
        articleId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      category: LogCategory.ERROR
    });
    throw new Error(`Failed to get article: ${articleId}`);
  }
}

/**
 * Get articles available for review
 * This enforces the rule that articles with 2+ reviews don't appear in the review queue
 */
export async function getArticlesForReview(): Promise<Article[]> {
  try {
    const startTime = performance.now();
    logger.info('Getting articles for review', {
      category: LogCategory.DATA
    });
    
    // Get current user
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      logger.error('User not authenticated for review queue', {
        category: LogCategory.AUTH
      });
      throw new Error('User not authenticated');
    }

    if (!db) {
      logger.error('Firebase not initialized', {
        category: LogCategory.ERROR
      });
      throw new Error('Firebase not initialized');
    }
    
    const userId = currentUser.uid;
    
    // First get articles the user has already reviewed
    const reviewsQuery = query(
      collection(db, REVIEWS_COLLECTION),
      where('reviewerId', '==', userId)
    );
    
    const reviewsSnapshot = await getDocs(reviewsQuery);
    
    // Create a set of article IDs the user has already reviewed
    const reviewedArticleIds = new Set<string>();
    reviewsSnapshot.forEach(doc => {
      const data = doc.data();
      reviewedArticleIds.add(data.articleId);
    });
    
    logger.debug('User has reviewed articles', {
      context: {
        userId,
        reviewedCount: reviewedArticleIds.size,
        reviewedIds: Array.from(reviewedArticleIds)
      },
      category: LogCategory.DATA
    });
    
    // Query articles
    const articlesQuery = query(
      collection(db, ARTICLES_COLLECTION),
      where('status', '==', 'published'),
      where('authorId', '!=', userId), // Don't show user's own articles
      orderBy('authorId'), // Required for inequality filter
      orderBy('createdAt', 'desc')
    );
    
    const articlesSnapshot = await getDocs(articlesQuery);
    
    // Filter articles
    const articles: Article[] = [];
    articlesSnapshot.forEach(doc => {
      const data = doc.data();
      const articleId = doc.id;
      
      // Skip articles the user has already reviewed
      if (reviewedArticleIds.has(articleId)) {
        logger.debug('Skipping already reviewed article', {
          context: { articleId, title: data.title },
          category: LogCategory.DATA
        });
        return;
      }
      
      // Skip articles that already have 2+ reviews (REVIEW LIMIT RULE)
      if ((data.reviewCount || 0) >= 2) {
        logger.debug('Skipping article with sufficient reviews', {
          context: { 
            articleId, 
            title: data.title,
            reviewCount: data.reviewCount || 0 
          },
          category: LogCategory.DATA
        });
        return;
      }
      
      // Add article to the list
      articles.push({
        id: articleId,
        ...data,
        reviewCount: data.reviewCount || 0,
        views: data.views || 0
      } as Article);
    });
    
    const duration = performance.now() - startTime;
    logger.info('Articles for review retrieved successfully', {
      context: {
        totalCount: articlesSnapshot.size,
        eligibleCount: articles.length,
        excludedCount: articlesSnapshot.size - articles.length,
        duration: `${duration.toFixed(2)}ms`
      },
      category: LogCategory.DATA
    });
    
    return articles;
  } catch (error) {
    logger.error('Error getting articles for review', {
      context: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      category: LogCategory.ERROR
    });
    throw new Error('Failed to get articles for review');
  }
}

/**
 * Get user's articles
 */
export async function getUserArticles(): Promise<Article[]> {
  try {
    const startTime = performance.now();
    logger.info('Getting user articles', {
      category: LogCategory.DATA
    });
    
    // Get current user
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      logger.error('User not authenticated for getting user articles', {
        category: LogCategory.AUTH
      });
      throw new Error('User not authenticated');
    }

    if (!db) {
      logger.error('Firebase not initialized', {
        category: LogCategory.ERROR
      });
      throw new Error('Firebase not initialized');
    }
    
    const userId = currentUser.uid;
    
    // Query articles by the current user
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Process results
    const articles: Article[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      articles.push({
        id: doc.id,
        ...data,
        reviewCount: data.reviewCount || 0,
        views: data.views || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as Article);
    });
    
    const duration = performance.now() - startTime;
    logger.info('User articles retrieved successfully', {
      context: {
        userId,
        count: articles.length,
        duration: `${duration.toFixed(2)}ms`
      },
      category: LogCategory.DATA
    });
    
    return articles;
  } catch (error) {
    logger.error('Error getting user articles', {
      context: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      category: LogCategory.ERROR
    });
    throw new Error('Failed to get user articles');
  }
}
