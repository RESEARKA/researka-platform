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
    // Add timestamp and get current user ID from auth
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const articleWithTimestamp = {
      ...articleData,
      authorId: currentUser.uid,
      createdAt: Timestamp.now()
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, articlesCollection), articleWithTimestamp);
    
    console.log('Article submitted with ID:', docRef.id);
    
    // Return the article with the generated ID
    return {
      id: docRef.id,
      ...articleData,
      authorId: currentUser.uid
    };
  } catch (error) {
    console.error('Error submitting article:', error);
    throw new Error('Failed to submit article');
  }
};

/**
 * Get all articles for review
 */
export const getArticlesForReview = async (): Promise<Article[]> => {
  try {
    // Create query for pending review articles
    const q = query(
      collection(db, articlesCollection),
      where('status', '==', 'pending_review'),
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
        conflicts: data.conflicts,
        license: data.license
      });
    });
    
    return articles;
  } catch (error) {
    console.error('Error getting articles for review:', error);
    throw new Error('Failed to get articles for review');
  }
};

/**
 * Get a specific article by ID
 */
export const getArticleById = async (articleId: string): Promise<Article | null> => {
  try {
    // Create query for the specific article
    const q = query(
      collection(db, articlesCollection),
      where('__name__', '==', articleId)
    );
    
    // Execute query
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Get the first (and only) document
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
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
    console.error('Error getting article by ID:', error);
    throw new Error('Failed to get article');
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
