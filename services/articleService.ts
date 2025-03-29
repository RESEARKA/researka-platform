import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp
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
    
    if (!db) {
      logger.error('Article submission failed - Firestore not initialized', {
        category: LogCategory.DATA
      });
      throw new Error('Firestore not initialized');
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
    const docRef = await addDoc(collection(db, articlesCollection), articleWithTimestamp);
    
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
    
    if (!db) {
      logger.error('Failed to get articles - Firestore not initialized', {
        category: LogCategory.DATA
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
        collection(db, articlesCollection),
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
      collection(db, articlesCollection),
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
    
    logger.info('Returning filtered articles for review', {
      context: { 
        count: articles.length,
        filteredOut: querySnapshot.size - articles.length
      },
      category: LogCategory.DATA
    });
    
    return articles;
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
    
    if (!db) {
      logger.error('Failed to get article - Firestore not initialized', {
        category: LogCategory.DATA
      });
      throw new Error('Firestore not initialized');
    }
    
    if (!articleId) {
      logger.error('Failed to get article - Article ID is required', {
        category: LogCategory.DATA
      });
      throw new Error('Article ID is required');
    }
    
    // Create query for the specific article
    const q = query(
      collection(db, articlesCollection),
      where('__name__', '==', articleId)
    );
    
    logger.debug('Executing query for specific article', {
      context: { articleId },
      category: LogCategory.DATA
    });
    
    const startTime = performance.now();
    
    // Execute query
    const querySnapshot = await getDocs(q);
    
    const duration = performance.now() - startTime;
    
    logger.info('Article query executed', {
      context: { 
        found: !querySnapshot.empty,
        duration: `${duration.toFixed(2)}ms`
      },
      category: LogCategory.DATA
    });
    
    if (querySnapshot.empty) {
      logger.warn('Article not found', {
        context: { articleId },
        category: LogCategory.DATA
      });
      return null;
    }
    
    // Get the first (and only) document
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    logger.debug('Found article', {
      context: { 
        id: doc.id, 
        title: data.title 
      },
      category: LogCategory.DATA
    });
    
    // Check if all required fields are present
    if (!data.title || !data.abstract || !data.category) {
      logger.warn('Article is missing required fields', {
        context: { 
          id: doc.id, 
          missingFields: [
            !data.title ? 'title' : null,
            !data.abstract ? 'abstract' : null,
            !data.category ? 'category' : null
          ].filter(Boolean)
        },
        category: LogCategory.DATA
      });
    }
    
    return {
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
    };
  } catch (error) {
    logger.error('Error getting article by ID', {
      context: { error },
      category: LogCategory.ERROR
    });
    throw new Error(`Failed to get article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get all articles from Firestore
 */
export const getAllArticles = async (): Promise<Article[]> => {
  const startTime = performance.now();
  let queryExecutionTime = 0;
  let processingTime = 0;
  
  try {
    logger.info('Fetching all articles', {
      category: LogCategory.DATA
    });
    
    // Check if we're on the server
    if (typeof window === 'undefined') {
      logger.error('getAllArticles called on server side', {
        category: LogCategory.DATA
      });
      return [];
    }
    
    // Import Firebase functions to get Firestore
    logger.debug('Importing Firebase modules', {
      category: LogCategory.DATA
    });
    const { getFirebaseFirestore, initializeFirebase } = await import('../config/firebase');
    
    // Get Firestore instance
    logger.debug('Getting Firestore instance', {
      category: LogCategory.DATA
    });
    const db = getFirebaseFirestore();
    if (!db) {
      logger.error('Firestore not initialized', {
        category: LogCategory.DATA
      });
      
      // Try to initialize Firebase again
      logger.debug('Attempting to initialize Firebase', {
        category: LogCategory.DATA
      });
      const initialized = await initializeFirebase();
      
      if (!initialized) {
        logger.error('Failed to initialize Firebase after retry', {
          category: LogCategory.DATA
        });
        
        // In development, return mock data
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Returning mock data due to initialization failure', {
            category: LogCategory.DATA
          });
          return getMockArticles();
        }
        
        throw new Error('Firestore not initialized');
      }
      
      // Get Firestore instance again after initialization
      const dbRetry = getFirebaseFirestore();
      if (!dbRetry) {
        logger.error('Firestore still not initialized after retry', {
          category: LogCategory.DATA
        });
        
        // In development, return mock data
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Returning mock data due to initialization failure', {
            category: LogCategory.DATA
          });
          return getMockArticles();
        }
        
        throw new Error('Firestore not initialized after retry');
      }
      
      // Create query for all articles, ordered by creation date
      logger.debug('Creating Firestore query after retry', {
        category: LogCategory.DATA
      });
      const q = query(
        collection(dbRetry, articlesCollection),
        orderBy('createdAt', 'desc')
      );
      
      logger.debug('Executing query after retry...', {
        category: LogCategory.DATA
      });
      
      // Execute query with timing
      const queryStartTime = performance.now();
      try {
        const querySnapshot = await getDocs(q);
        queryExecutionTime = performance.now() - queryStartTime;
        
        logger.info('Query executed after retry', {
          context: { 
            count: querySnapshot.size,
            duration: `${queryExecutionTime.toFixed(2)}ms`
          },
          category: LogCategory.DATA
        });
        
        // Process results with timing
        const processingStartTime = performance.now();
        const results = processQueryResults(querySnapshot);
        processingTime = performance.now() - processingStartTime;
        
        logger.info('Results processed', {
          context: { 
            count: results.length,
            duration: `${processingTime.toFixed(2)}ms`
          },
          category: LogCategory.DATA
        });
        
        return results;
      } catch (queryError) {
        // Check for permission errors specifically
        const errorMessage = queryError instanceof Error ? queryError.message : String(queryError);
        
        if (errorMessage.includes('permission-denied') || errorMessage.includes('Missing or insufficient permissions')) {
          logger.error('Firestore permission error', {
            context: { 
              collection: articlesCollection,
              error: errorMessage
            },
            category: LogCategory.DATA
          });
          
          // Log the security rule issue with more details
          logger.error(`
            Potential Firestore Security Rule Issue:
            --------------------------------------
            Collection: ${articlesCollection}
            Operation: read (getDocs)
            Error: ${errorMessage}
            
            Possible solutions:
            1. Check if your Firestore security rules allow reading the '${articlesCollection}' collection
            2. Verify that you're properly authenticated if authentication is required
            3. Ensure the collection exists and is spelled correctly
          `, {
            category: LogCategory.DATA
          });
        }
        
        throw queryError;
      }
    }
    
    // Create query for all articles, ordered by creation date
    logger.debug('Creating Firestore query', {
      category: LogCategory.DATA
    });
    const q = query(
      collection(db, articlesCollection),
      orderBy('createdAt', 'desc')
    );
    
    logger.debug('Executing query...', {
      category: LogCategory.DATA
    });
    
    // Execute query with timing
    const queryStartTime = performance.now();
    try {
      const querySnapshot = await getDocs(q);
      queryExecutionTime = performance.now() - queryStartTime;
      
      logger.info('Query executed', {
        context: { 
          count: querySnapshot.size,
          duration: `${queryExecutionTime.toFixed(2)}ms`
        },
        category: LogCategory.DATA
      });
      
      // Process results with timing
      const processingStartTime = performance.now();
      const results = processQueryResults(querySnapshot);
      processingTime = performance.now() - processingStartTime;
      
      logger.info('Results processed', {
        context: { 
          count: results.length,
          duration: `${processingTime.toFixed(2)}ms`
        },
        category: LogCategory.DATA
      });
      
      return results;
    } catch (queryError) {
      // Check for permission errors specifically
      const errorMessage = queryError instanceof Error ? queryError.message : String(queryError);
      
      if (errorMessage.includes('permission-denied') || errorMessage.includes('Missing or insufficient permissions')) {
        logger.error('Firestore permission error', {
          context: { 
            collection: articlesCollection,
            error: errorMessage
          },
          category: LogCategory.DATA
        });
        
        // Log the security rule issue with more details
        logger.error(`
          Potential Firestore Security Rule Issue:
          --------------------------------------
          Collection: ${articlesCollection}
          Operation: read (getDocs)
          Error: ${errorMessage}
          
          Possible solutions:
          1. Check if your Firestore security rules allow reading the '${articlesCollection}' collection
          2. Verify that you're properly authenticated if authentication is required
          3. Ensure the collection exists and is spelled correctly
        `, {
          category: LogCategory.DATA
        });
      }
      
      throw queryError;
    }
    
  } catch (error) {
    const totalTime = performance.now() - startTime;
    logger.error('Error getting all articles', {
      context: { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        totalTime: `${totalTime.toFixed(2)}ms`,
        queryTime: `${queryExecutionTime.toFixed(2)}ms`,
        processingTime: `${processingTime.toFixed(2)}ms`
      },
      category: LogCategory.ERROR
    });
    
    // In development, return mock data on error
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Returning mock data due to error', {
        category: LogCategory.DATA
      });
      return getMockArticles();
    }
    
    throw new Error(error instanceof Error ? 
      `Failed to get articles: ${error.message}` : 
      'Failed to get articles');
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
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      logger.debug('No articles found, returning mock data for development', {
        category: LogCategory.DATA
      });
      return getMockArticles();
    }
    
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
  
  // If no valid articles were found, return mock data for development
  if (articles.length === 0 && process.env.NODE_ENV === 'development') {
    logger.debug('No valid articles found, returning mock data for development', {
      category: LogCategory.DATA
    });
    return getMockArticles();
  }
  
  return articles;
}

/**
 * Get mock articles for development and testing
 */
function getMockArticles(): Article[] {
  return [
    {
      id: 'mock-article-1',
      title: 'Advances in Quantum Computing',
      abstract: 'This paper explores recent advances in quantum computing and their implications for cryptography.',
      category: 'Computer Science',
      keywords: ['quantum computing', 'cryptography', 'algorithms'],
      author: 'Dr. Jane Smith',
      authorId: 'mock-author-1',
      date: new Date().toISOString(),
      compensation: 'Open Access',
      status: 'published',
      views: 1250
    },
    {
      id: 'mock-article-2',
      title: 'Climate Change Impact on Marine Ecosystems',
      abstract: 'A comprehensive study of how climate change affects marine biodiversity and ecosystem health.',
      category: 'Environmental Science',
      keywords: ['climate change', 'marine biology', 'ecosystems'],
      author: 'Prof. Michael Johnson',
      authorId: 'mock-author-2',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      compensation: 'Open Access',
      status: 'published',
      views: 843
    },
    {
      id: 'mock-article-3',
      title: 'Neural Networks in Medical Diagnosis',
      abstract: 'This research demonstrates how neural networks can improve accuracy in medical diagnostics.',
      category: 'Medicine',
      keywords: ['neural networks', 'AI', 'medical diagnosis'],
      author: 'Dr. Sarah Chen',
      authorId: 'mock-author-3',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      compensation: 'Open Access',
      status: 'published',
      views: 1567
    }
  ];
}
