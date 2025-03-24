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
export const getArticlesForReview = async (): Promise<Article[]> => {
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
    
    console.log(`ArticleService: Returning ${articles.length} articles`);
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
  try {
    // Create query for all articles, ordered by creation date
    const q = query(
      collection(db, articlesCollection),
      orderBy('createdAt', 'desc')
    );
    
    // Execute query
    const querySnapshot = await getDocs(q);
    
    // Convert to array of articles
    const articles: Article[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
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
        conflicts: data.conflictsOfInterest,
        license: data.license
      });
    });
    
    return articles;
  } catch (error) {
    console.error('Error getting all articles:', error);
    throw new Error('Failed to get articles');
  }
};
