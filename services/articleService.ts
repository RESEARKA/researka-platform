import { getFirebaseFirestore } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { createLogger, LogCategory } from '../utils/logger';

// Create a logger instance for article service
const logger = createLogger('articleService');

// Define article interface
export interface Article {
  id?: string;
  title: string;
  abstract: string;
  category: string;
  keywords: string[];
  author: string;
  authorId?: string;
  date: string;
  compensation: string;
  status: string;
  createdAt?: Timestamp;
  views?: number;
  // Additional fields for the full article
  content?: string;
  introduction?: string;
  methods?: string;
  results?: string;
  discussion?: string;
  references?: string;
  funding?: string;
  ethicalApprovals?: string;
  dataAvailability?: string;
  conflicts?: string;
  license?: string;
}

// Collection reference
const articlesCollection = 'articles';

/**
 * Submit a new article to Firestore
 */
export const submitArticle = async (articleData: Omit<Article, 'id' | 'createdAt'>): Promise<Article> => {
  try {
    logger.info('Starting article submission process', {
      context: { 
        title: articleData.title,
        category: articleData.category,
        keywordsCount: articleData.keywords.length
      },
      category: LogCategory.DATA
    });
    
    // Get Firestore instance
    const firestore = await getFirebaseFirestore();
    if (!firestore) {
      logger.error('Article submission failed - Firestore not initialized', {
        category: LogCategory.DATA,
      });
      throw new Error('Firestore not initialized');
    }
    
    // Add timestamp and get current user ID from auth
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      logger.error('Article submission failed - user not authenticated', {
        category: LogCategory.AUTH
      });
      throw new Error('User not authenticated');
    }
    
    // Ensure status is set to pending_review
    const articleWithTimestamp = {
      ...articleData,
      authorId: currentUser.uid,
      status: 'pending_review', // Ensure status is explicitly set
      createdAt: Timestamp.now()
    };
    
    logger.debug('Article prepared for submission', {
      context: { 
        authorId: currentUser.uid,
        contentLength: articleData.content?.length || 0,
        hasIntroduction: !!articleData.introduction,
        hasMethods: !!articleData.methods,
        hasResults: !!articleData.results,
        hasDiscussion: !!articleData.discussion
      },
      category: LogCategory.DATA
    });
    
    const startTime = performance.now();
    
    // Add to Firestore
    const docRef = await addDoc(collection(firestore, articlesCollection), articleWithTimestamp);
    
    const duration = performance.now() - startTime;
    
    logger.info('Article submitted successfully', {
      context: { 
        articleId: docRef.id,
        duration: `${duration.toFixed(2)}ms`
      },
      category: LogCategory.DATA
    });
    
    // Return the article with the generated ID
    return {
      id: docRef.id,
      ...articleData,
      status: 'pending_review', // Ensure status is set in the returned object
      authorId: currentUser.uid
    };
  } catch (error) {
    logger.error('Error submitting article', {
      context: { error },
      category: LogCategory.ERROR
    });
    throw new Error('Failed to submit article');
  }
};

/**
 * Get all articles for review
 */
export const getArticlesForReview = async (userId?: string): Promise<Article[]> => {
  try {
    logger.info('Fetching articles for review', {
      context: { currentUserId: userId },
      category: LogCategory.DATA
    });
    
    // Get Firestore instance
    const firestore = await getFirebaseFirestore();
    if (!firestore) {
      logger.error('Failed to get articles - Firestore not initialized', {
        category: LogCategory.DATA,
      });
      throw new Error('Firestore not initialized');
    }
    
    // If no userId is provided, we can't filter by user's reviews
    if (!userId) {
      logger.warn('No userId provided, returning all articles without filtering user reviews', {
        category: LogCategory.DATA
      });
      
      // Create query for all articles, ordered by creation date
      const q = query(
        collection(firestore, articlesCollection),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return processQueryResults(querySnapshot);
    }
    
    // First, get the user's reviews to know which articles they've already reviewed
    logger.info('Getting user reviews to filter articles', {
      context: { userId },
      category: LogCategory.DATA
    });
    
    // Import the review service
    const { getUserReviews } = await import('./reviewService');
    
    // Get all reviews by this user
    const userReviews = await getUserReviews(userId);
    
    // Extract the articleIds that the user has already reviewed
    const reviewedArticleIds = new Set(userReviews.map(review => review.articleId));
    
    logger.info('User has already reviewed articles', {
      context: { 
        userId,
        reviewCount: userReviews.length,
        reviewedArticleIds: Array.from(reviewedArticleIds)
      },
      category: LogCategory.DATA
    });
    
    // Create query for all articles, ordered by creation date
    const q = query(
      collection(firestore, articlesCollection),
      orderBy('createdAt', 'desc')
    );
    
    logger.debug('Executing query for articles', {
      category: LogCategory.DATA
    });
    
    const startTime = performance.now();
    
    // Execute query
    const querySnapshot = await getDocs(q);
    
    const duration = performance.now() - startTime;
    
    logger.info('Articles query executed', {
      context: { 
        count: querySnapshot.size,
        duration: `${duration.toFixed(2)}ms`
      },
      category: LogCategory.DATA
    });
    
    // Convert to array of articles
    const articles: Article[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logger.debug('Processing article document', {
        context: { 
          id: doc.id, 
          title: data.title, 
          status: data.status 
        },
        category: LogCategory.DATA
      });
      
      // Skip articles authored by the current user
      if (data.authorId === userId) {
        logger.debug('Skipping user\'s own article', {
          context: { 
            articleId: doc.id, 
            authorId: data.authorId 
          },
          category: LogCategory.DATA
        });
        return; // Skip this article
      }
      
      // Skip articles that the user has already reviewed
      if (reviewedArticleIds.has(doc.id)) {
        logger.debug('Skipping already reviewed article', {
          context: { 
            articleId: doc.id, 
            reviewerId: userId 
          },
          category: LogCategory.DATA
        });
        return; // Skip this article
      }
      
      articles.push({
        id: doc.id,
        title: data.title,
        abstract: data.abstract,
        category: data.category,
        keywords: data.keywords,
        author: data.author,
        authorId: data.authorId,
        date: data.date,
        compensation: data.compensation,
        status: data.status,
        createdAt: data.createdAt,
        content: data.content,
        introduction: data.introduction,
        methods: data.methods,
        results: data.results,
        discussion: data.discussion,
        references: data.references,
        funding: data.funding,
        ethicalApprovals: data.ethicalApprovals,
        dataAvailability: data.dataAvailability,
        conflicts: data.conflicts,
        license: data.license
      });
    });
    
    // Now perform a second round of filtering to exclude articles that already have 2+ reviews
    logger.info('Checking review counts to enforce 2-review limit', {
      category: LogCategory.DATA
    });
    
    // Get the review counts for all articles
    const { getReviewsForArticle } = await import('./reviewService');
    const reviewCountPromises = articles.map(async (article) => {
      const reviews = await getReviewsForArticle(article.id!);
      return { 
        articleId: article.id, 
        reviewCount: reviews.length 
      };
    });
    
    const reviewCounts = await Promise.all(reviewCountPromises);
    
    // Create a map for efficient lookup
    const reviewCountMap = new Map();
    reviewCounts.forEach(item => {
      reviewCountMap.set(item.articleId, item.reviewCount);
      logger.debug('Article review count', {
        context: { 
          articleId: item.articleId, 
          reviewCount: item.reviewCount 
        },
        category: LogCategory.DATA
      });
    });
    
    // Filter out articles with 2+ reviews
    const finalArticles = articles.filter(article => {
      const reviewCount = reviewCountMap.get(article.id) || 0;
      const hasLessThanTwoReviews = reviewCount < 2;
      
      if (!hasLessThanTwoReviews) {
        logger.info('Excluding article with 2+ reviews from review list', {
          context: { 
            articleId: article.id, 
            reviewCount 
          },
          category: LogCategory.DATA
        });
      }
      
      return hasLessThanTwoReviews;
    });
    
    logger.info('Returning fully filtered articles for review (enforcing 2-review limit)', {
      context: { 
        originalCount: articles.length,
        finalCount: finalArticles.length,
        removedDueToReviewLimit: articles.length - finalArticles.length
      },
      category: LogCategory.DATA
    });
    
    return finalArticles;
  } catch (error) {
    logger.error('Error getting articles for review', {
      context: { error },
      category: LogCategory.ERROR
    });
    throw new Error('Failed to get articles for review');
  }
};

/**
 * Get a specific article by ID
 */
export const getArticleById = async (articleId: string): Promise<Article | null> => {
  try {
    logger.info('Fetching article by ID', {
      context: { articleId },
      category: LogCategory.DATA
    });
    
    // Get Firestore instance
    const firestore = await getFirebaseFirestore();
    if (!firestore) {
      logger.error('Failed to get article - Firestore not initialized', {
        category: LogCategory.DATA,
      });
      throw new Error('Firestore not initialized');
    }
    
    if (!articleId) {
      logger.error('Failed to get article - Article ID is required', {
        category: LogCategory.DATA
      });
      throw new Error('Article ID is required');
    }
    
    const articleRef = doc(firestore, articlesCollection, articleId);
    const docSnap = await getDoc(articleRef);
    
    const duration = performance.now() - performance.now();
    
    logger.info(`Article fetch took ${duration.toFixed(2)}ms`, {
      category: LogCategory.PERFORMANCE,
      context: { articleId },
    });
    
    if (docSnap.exists()) {
      const articleData = docSnap.data();
      return {
        id: docSnap.id,
        ...articleData,
        date: articleData.date,
        createdAt: articleData.createdAt,
      } as Article;
    } else {
      logger.warn(`Article not found: ${articleId}`, {
        category: LogCategory.DATA,
      });
      return null;
    }
  } catch (error) {
    logger.error(`Error getting article ${articleId}`, {
      context: { error },
      category: LogCategory.ERROR,
    });
    throw new Error('Failed to get article');
  }
};

/**
 * Get all articles from Firestore
 */
export const getAllArticles = async (): Promise<Article[]> => {
  const startTime = performance.now();
  
  try {
    logger.info('Fetching all articles', { category: LogCategory.DATA });
    
    // Get Firestore instance
    const firestore = await getFirebaseFirestore();
    if (!firestore) {
      logger.error('Failed to get articles - Firestore not initialized', {
        category: LogCategory.DATA,
      });
      throw new Error('Firestore not initialized');
    }
    
    const q = query(collection(firestore, articlesCollection), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const processingStartTime = performance.now();
    const articles = processQueryResults(querySnapshot);
    const processingDuration = performance.now() - processingStartTime;
    const totalDuration = performance.now() - startTime;
    
    logger.info(`Fetched ${articles.length} articles successfully`, {
      category: LogCategory.DATA,
      context: {
        totalTime: `${totalDuration.toFixed(2)}ms`,
        queryTime: `${(processingStartTime - startTime).toFixed(2)}ms`,
        processingTime: `${processingDuration.toFixed(2)}ms`,
      },
    });
    
    return articles;
  } catch (error) {
    const totalDuration = performance.now() - startTime;
    logger.error('Error getting all articles', {
      category: LogCategory.ERROR,
      context: {
        error,
        totalTime: `${totalDuration.toFixed(2)}ms`,
      },
    });
    throw new Error('Failed to get articles');
  }
};

/**
 * Process query results and return articles
 */
function processQueryResults(querySnapshot: any): Article[] {
  // If no articles found, return empty array
  if (querySnapshot.empty) {
    logger.debug('No articles found in the database', {
      category: LogCategory.DATA
    });
    return [];
  }
  
  // Convert to array of articles
  const articles: Article[] = [];
  querySnapshot.forEach((doc: any) => {
    const data = doc.data();
    
    // Skip documents with missing required fields
    if (!data.title) {
      logger.warn('Document is missing a title, skipping', {
        context: { 
          id: doc.id
        },
        category: LogCategory.DATA
      });
      return;
    }
    
    // Use fallback values for missing fields
    const article: Article = {
      id: doc.id,
      title: data.title || 'Untitled Article',
      abstract: data.abstract || 'No abstract provided',
      category: data.category || 'Uncategorized',
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      author: data.author || 'Anonymous',
      authorId: data.authorId || '',
      date: data.date || new Date().toISOString(),
      compensation: data.compensation || '',
      status: data.status || 'draft',
      views: typeof data.views === 'number' ? data.views : 0
    };
    
    // Add optional fields if they exist
    if (data.createdAt) article.createdAt = data.createdAt;
    if (data.content) article.content = data.content;
    if (data.introduction) article.introduction = data.introduction;
    if (data.methods) article.methods = data.methods;
    if (data.results) article.results = data.results;
    if (data.discussion) article.discussion = data.discussion;
    if (data.references) article.references = data.references;
    if (data.funding) article.funding = data.funding;
    if (data.ethicalApprovals) article.ethicalApprovals = data.ethicalApprovals;
    if (data.dataAvailability) article.dataAvailability = data.dataAvailability;
    if (data.conflictsOfInterest) article.conflicts = data.conflictsOfInterest;
    if (data.license) article.license = data.license;
    
    articles.push(article);
  });
  
  logger.info('Processed valid articles', {
    context: { 
      count: articles.length
    },
    category: LogCategory.DATA
  });
  
  return articles;
}
