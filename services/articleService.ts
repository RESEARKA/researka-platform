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
    console.log('ArticleService: Starting submitArticle');
    
    // Add timestamp and get current user ID from auth
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('ArticleService: User not authenticated');
      throw new Error('User not authenticated');
    }
    
    if (!db) {
      console.error('ArticleService: Firestore not initialized');
      throw new Error('Firestore not initialized');
    }
    
    // Ensure status is set to pending_review
    const articleWithTimestamp = {
      ...articleData,
      authorId: currentUser.uid,
      status: 'pending_review', // Ensure status is explicitly set
      createdAt: Timestamp.now()
    };
    
    console.log('ArticleService: Article prepared for submission:', articleWithTimestamp);
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, articlesCollection), articleWithTimestamp);
    
    console.log('ArticleService: Article submitted with ID:', docRef.id);
    
    // Return the article with the generated ID
    return {
      id: docRef.id,
      ...articleData,
      status: 'pending_review', // Ensure status is set in the returned object
      authorId: currentUser.uid
    };
  } catch (error) {
    console.error('ArticleService: Error submitting article:', error);
    throw new Error('Failed to submit article');
  }
};

/**
 * Get all articles for review
 */
export const getArticlesForReview = async (userId?: string): Promise<Article[]> => {
  try {
    console.log('ArticleService: Starting getArticlesForReview');
    
    if (!db) {
      console.error('ArticleService: Firestore not initialized');
      throw new Error('Firestore not initialized');
    }
    
    // Create query for all articles, ordered by creation date
    // Temporarily removing the status filter to see all articles
    const q = query(
      collection(db, articlesCollection),
      orderBy('createdAt', 'desc')
    );
    
    console.log('ArticleService: Query created for all articles, executing...');
    
    // Execute query
    const querySnapshot = await getDocs(q);
    
    console.log(`ArticleService: Query executed, found ${querySnapshot.size} documents`);
    
    // Convert to array of articles
    const articles: Article[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`ArticleService: Processing document ${doc.id}, title: ${data.title}, status: ${data.status}`);
      
      // Skip articles authored by the current user if userId is provided
      if (userId && data.authorId === userId) {
        console.log(`ArticleService: Skipping article ${doc.id} because it was authored by the current user (${userId})`);
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
    
    console.log(`ArticleService: Returning ${articles.length} articles (after filtering out user's own submissions)`);
    return articles;
  } catch (error) {
    console.error('ArticleService: Error getting articles for review:', error);
    throw new Error('Failed to get articles for review');
  }
};

/**
 * Get a specific article by ID
 */
export const getArticleById = async (articleId: string): Promise<Article | null> => {
  try {
    console.log(`ArticleService: Getting article by ID: ${articleId}`);
    
    if (!db) {
      console.error('ArticleService: Firestore not initialized');
      throw new Error('Firestore not initialized');
    }
    
    if (!articleId) {
      console.error('ArticleService: Article ID is undefined or empty');
      throw new Error('Article ID is required');
    }
    
    // Create query for the specific article
    const q = query(
      collection(db, articlesCollection),
      where('__name__', '==', articleId)
    );
    
    console.log(`ArticleService: Query created for article ID: ${articleId}`);
    
    // Execute query
    const querySnapshot = await getDocs(q);
    
    console.log(`ArticleService: Query executed, found ${querySnapshot.size} documents`);
    
    if (querySnapshot.empty) {
      console.log(`ArticleService: No article found with ID: ${articleId}`);
      return null;
    }
    
    // Get the first (and only) document
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    console.log(`ArticleService: Found article with title: ${data.title}`);
    
    // Check if all required fields are present
    if (!data.title || !data.abstract || !data.category) {
      console.warn(`ArticleService: Article ${articleId} is missing required fields`);
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
    console.error(`ArticleService: Error getting article by ID ${articleId}:`, error);
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
    console.log('ArticleService: Starting getAllArticles');
    
    // Check if we're on the server
    if (typeof window === 'undefined') {
      console.error('ArticleService: getAllArticles called on server side');
      return [];
    }
    
    // Import Firebase functions to get Firestore
    console.log('ArticleService: Importing Firebase modules');
    const { getFirebaseFirestore, initializeFirebase } = await import('../config/firebase');
    
    // Get Firestore instance
    console.log('ArticleService: Getting Firestore instance');
    const db = getFirebaseFirestore();
    if (!db) {
      console.error('ArticleService: Firestore not initialized');
      
      // Try to initialize Firebase again
      console.log('ArticleService: Attempting to initialize Firebase');
      const initialized = await initializeFirebase();
      
      if (!initialized) {
        console.error('ArticleService: Failed to initialize Firebase after retry');
        
        // In development, return mock data
        if (process.env.NODE_ENV === 'development') {
          console.log('ArticleService: Returning mock data due to initialization failure');
          return getMockArticles();
        }
        
        throw new Error('Firestore not initialized');
      }
      
      // Get Firestore instance again after initialization
      const dbRetry = getFirebaseFirestore();
      if (!dbRetry) {
        console.error('ArticleService: Firestore still not initialized after retry');
        
        // In development, return mock data
        if (process.env.NODE_ENV === 'development') {
          console.log('ArticleService: Returning mock data due to initialization failure');
          return getMockArticles();
        }
        
        throw new Error('Firestore not initialized after retry');
      }
      
      // Create query for all articles, ordered by creation date
      console.log('ArticleService: Creating Firestore query after retry');
      const q = query(
        collection(dbRetry, articlesCollection),
        orderBy('createdAt', 'desc')
      );
      
      console.log('ArticleService: Executing query after retry...');
      
      // Execute query with timing
      const queryStartTime = performance.now();
      try {
        const querySnapshot = await getDocs(q);
        queryExecutionTime = performance.now() - queryStartTime;
        
        console.log(`ArticleService: Query executed after retry in ${queryExecutionTime.toFixed(2)}ms, found ${querySnapshot.size} documents`);
        
        // Process results with timing
        const processingStartTime = performance.now();
        const results = processQueryResults(querySnapshot);
        processingTime = performance.now() - processingStartTime;
        
        console.log(`ArticleService: Results processed in ${processingTime.toFixed(2)}ms`);
        
        return results;
      } catch (queryError) {
        // Check for permission errors specifically
        const errorMessage = queryError instanceof Error ? queryError.message : String(queryError);
        
        if (errorMessage.includes('permission-denied') || errorMessage.includes('Missing or insufficient permissions')) {
          console.error('ArticleService: Firestore permission error. Check security rules:', {
            collection: articlesCollection,
            error: errorMessage,
            timestamp: new Date().toISOString()
          });
          
          // Log the security rule issue with more details
          console.error(`
            Potential Firestore Security Rule Issue:
            --------------------------------------
            Collection: ${articlesCollection}
            Operation: read (getDocs)
            Error: ${errorMessage}
            
            Possible solutions:
            1. Check if your Firestore security rules allow reading the '${articlesCollection}' collection
            2. Verify that you're properly authenticated if authentication is required
            3. Ensure the collection exists and is spelled correctly
          `);
        }
        
        throw queryError;
      }
    }
    
    // Create query for all articles, ordered by creation date
    console.log('ArticleService: Creating Firestore query');
    const q = query(
      collection(db, articlesCollection),
      orderBy('createdAt', 'desc')
    );
    
    console.log('ArticleService: Executing query...');
    
    // Execute query with timing
    const queryStartTime = performance.now();
    try {
      const querySnapshot = await getDocs(q);
      queryExecutionTime = performance.now() - queryStartTime;
      
      console.log(`ArticleService: Query executed in ${queryExecutionTime.toFixed(2)}ms, found ${querySnapshot.size} documents`);
      
      // Process results with timing
      const processingStartTime = performance.now();
      const results = processQueryResults(querySnapshot);
      processingTime = performance.now() - processingStartTime;
      
      console.log(`ArticleService: Results processed in ${processingTime.toFixed(2)}ms`);
      
      return results;
    } catch (queryError) {
      // Check for permission errors specifically
      const errorMessage = queryError instanceof Error ? queryError.message : String(queryError);
      
      if (errorMessage.includes('permission-denied') || errorMessage.includes('Missing or insufficient permissions')) {
        console.error('ArticleService: Firestore permission error. Check security rules:', {
          collection: articlesCollection,
          error: errorMessage,
          timestamp: new Date().toISOString()
        });
        
        // Log the security rule issue with more details
        console.error(`
          Potential Firestore Security Rule Issue:
          --------------------------------------
          Collection: ${articlesCollection}
          Operation: read (getDocs)
          Error: ${errorMessage}
          
          Possible solutions:
          1. Check if your Firestore security rules allow reading the '${articlesCollection}' collection
          2. Verify that you're properly authenticated if authentication is required
          3. Ensure the collection exists and is spelled correctly
        `);
      }
      
      throw queryError;
    }
    
  } catch (error) {
    const totalTime = performance.now() - startTime;
    console.error('ArticleService: Error getting all articles:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      totalTime: `${totalTime.toFixed(2)}ms`,
      queryTime: `${queryExecutionTime.toFixed(2)}ms`,
      processingTime: `${processingTime.toFixed(2)}ms`
    });
    
    // In development, return mock data on error
    if (process.env.NODE_ENV === 'development') {
      console.log('ArticleService: Returning mock data due to error');
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
    console.log('ArticleService: No articles found in the database');
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('ArticleService: No articles found, returning mock data for development');
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
      console.warn(`ArticleService: Document ${doc.id} is missing a title, skipping`);
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
  
  console.log(`ArticleService: Processed ${articles.length} valid articles`);
  
  // If no valid articles were found, return mock data for development
  if (articles.length === 0 && process.env.NODE_ENV === 'development') {
    console.log('ArticleService: No valid articles found, returning mock data for development');
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
