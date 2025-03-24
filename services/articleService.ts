import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  DocumentData,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { Article } from '../types/article';

// Pagination result interface
export interface PaginatedArticles {
  articles: Article[];
  lastVisible: DocumentSnapshot | null;
  hasMore: boolean;
  totalCount?: number;
}

// Pagination options interface
export interface PaginationOptions {
  pageSize?: number;
  startAfterDoc?: DocumentSnapshot | null;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  category?: string;
  searchQuery?: string;
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
 * @deprecated Use getPaginatedArticles instead for better performance with large collections
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
        conflicts: data.conflicts,
        license: data.license
      });
    });
    
    return articles;
  } catch (error) {
    console.error('ArticleService: Error getting all articles:', error);
    throw new Error(`Failed to get articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Fetch paginated articles with standardized category handling
 */
export async function fetchPaginatedArticles(
  category: string,
  lastVisible: any,
  pageSize: number = 10,
  sortField: string = 'createdAt',
  sortDirection: 'asc' | 'desc' = 'desc',
  searchQuery: string = ''
) {
  try {
    console.log('ArticleService: Fetching paginated articles with parameters:', {
      category, 
      pageSize, 
      sortField, 
      sortDirection, 
      searchQuery,
      lastVisible: lastVisible ? 'exists' : 'null'
    });
    
    const articlesCollection = collection(db, 'articles');

    const queryConstraints = [];
    // If a category filter is applied and not "all", use an exact match query with lowercase
    if (category && category !== 'all') {
      console.log(`Adding category filter: category == "${category.toLowerCase()}"`);
      queryConstraints.push(where('category', '==', category.toLowerCase()));
    }
    
    // Always order by a field to ensure pagination works as expected
    console.log(`Adding sort: orderBy("${sortField}", "${sortDirection}")`);
    queryConstraints.push(orderBy(sortField, sortDirection));
    
    // Add pagination
    if (lastVisible) {
      console.log('Adding pagination: startAfter(lastVisible)');
      queryConstraints.push(startAfter(lastVisible));
    }
    
    // Add limit (get one extra to check if there are more)
    console.log(`Adding limit: ${pageSize + 1}`);
    queryConstraints.push(limit(pageSize + 1));
    
    const q = query(articlesCollection, ...queryConstraints);
    console.log('Executing Firestore query with constraints:', JSON.stringify(queryConstraints.map(c => c.type)));
    
    // Execute the query
    console.time('Firestore query execution');
    const snapshot = await getDocs(q);
    console.timeEnd('Firestore query execution');
    
    console.log(`Query returned ${snapshot.size} documents from Firestore`);
    
    // Check if there are more results
    const hasMore = snapshot.size > pageSize;
    
    // Get the last visible document for next pagination
    const lastVisibleDoc = snapshot.size > 0 
      ? snapshot.docs[Math.min(pageSize - 1, snapshot.docs.length - 1)] 
      : null;
    
    // Convert to array of articles (limit to pageSize)
    const articles: Article[] = [];
    
    // For debugging - print document data
    if (snapshot.size === 0) {
      console.warn('No documents returned from Firestore query');
    } else {
      // Log the first document structure to help debug
      const firstDoc = snapshot.docs[0];
      console.log('First document data structure:', JSON.stringify(firstDoc.data(), null, 2));
    }
    
    snapshot.docs.slice(0, pageSize).forEach((doc) => {
      const data = doc.data();
      
      // Skip if it doesn't match search query (client-side filtering for now)
      if (searchQuery) {
        const matchesSearch = 
          data.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          data.abstract?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof data.author === 'string' && data.author.toLowerCase().includes(searchQuery.toLowerCase()));
        
        if (!matchesSearch) {
          console.log(`Document ${doc.id} skipped - doesn't match search query "${searchQuery}"`);
          return;
        }
      }
      
      // Handle different category formats
      let categoryValue: string = '';
      if (typeof data.category === 'string') {
        categoryValue = data.category;
      } else if (Array.isArray(data.category) && data.category.length > 0) {
        categoryValue = data.category[0];
        console.log(`Document ${doc.id} has array category, using first value: ${categoryValue}`);
      }
      
      articles.push({
        id: doc.id,
        title: data.title || '',
        abstract: data.abstract || '',
        category: categoryValue,
        keywords: data.keywords || [],
        author: data.author || 'Unknown',
        authorId: data.authorId || '',
        date: data.date || '',
        compensation: data.compensation || '',
        status: data.status || '',
        createdAt: data.createdAt,
        views: data.views || 0,
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
    
    console.log(`ArticleService: Processed ${articles.length} articles after filtering, hasMore: ${hasMore}`);
    
    if (articles.length === 0) {
      console.warn(`No articles match criteria after processing. Category: "${category}", Search: "${searchQuery}"`);
    }
    
    return {
      articles,
      lastVisible: lastVisibleDoc,
      hasMore
    };
  } catch (error) {
    console.error('ArticleService: Error getting paginated articles:', error);
    // Return empty results instead of throwing to avoid infinite loading states
    return { 
      articles: [], 
      lastVisible: null, 
      hasMore: false 
    };
  }
};

/**
 * Get paginated articles from Firestore
 */
export const getPaginatedArticles = async (options: PaginationOptions = {}): Promise<PaginatedArticles> => {
  try {
    console.log('ArticleService: Getting paginated articles with options:', options);
    
    const {
      pageSize = 10,
      startAfterDoc = null,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      category = '',
      searchQuery = ''
    } = options;
    
    // Start building the query
    let articlesQuery = collection(db, articlesCollection);
    let queryConstraints = [];
    
    // Add category filter if specified - handle both string and array category types
    if (category && category !== 'all') {
      // We'll use an OR query to handle both string and array types
      // First, we'll query for articles where category matches exactly (for string type)
      queryConstraints.push(where('category', '==', category));
    }
    
    // Add sorting
    queryConstraints.push(orderBy(sortBy, sortDirection));
    
    // Add pagination
    if (startAfterDoc) {
      queryConstraints.push(startAfter(startAfterDoc));
    }
    
    // Add limit
    queryConstraints.push(limit(pageSize + 1)); // Get one extra to check if there are more
    
    // Execute the query
    const q = query(articlesQuery, ...queryConstraints);
    console.log('Executing Firestore query:', JSON.stringify(queryConstraints));
    
    const querySnapshot = await getDocs(q);
    console.log(`Query returned ${querySnapshot.size} documents`);
    
    // Check if there are more results
    const hasMore = querySnapshot.size > pageSize;
    
    // Get the last visible document for next pagination
    const lastVisible = querySnapshot.size > 0 
      ? querySnapshot.docs[Math.min(pageSize - 1, querySnapshot.docs.length - 1)] 
      : null;
    
    // Convert to array of articles (limit to pageSize)
    const articles: Article[] = querySnapshot.docs.slice(0, pageSize).map((doc) => {
      const data = doc.data();
      
      // Skip if it doesn't match search query (client-side filtering for now)
      if (searchQuery) {
        const matchesSearch = 
          data.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          data.abstract?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof data.author === 'string' && data.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (Array.isArray(data.author) && data.author.some(author => 
            author.toLowerCase().includes(searchQuery.toLowerCase())
          ));
        
        if (!matchesSearch) return null;
      }
      
      // If we're filtering by category and the article has an array category,
      // check if it includes our category
      if (category && category !== 'all' && Array.isArray(data.category)) {
        const categoryMatches = data.category.some(cat => 
          cat.toLowerCase() === category.toLowerCase()
        );
        if (!categoryMatches) return null;
      }
      
      // Ensure we have at least the required fields
      if (!data.title || !data.abstract) {
        console.warn(`ArticleService: Article ${doc.id} is missing required fields`);
        return null; // Skip this article
      }
      
      return {
        id: doc.id,
        title: data.title,
        abstract: data.abstract,
        category: data.category,
        keywords: data.keywords || [],
        author: data.author || 'Unknown',
        authorId: data.authorId || '',
        date: data.date || '',
        compensation: data.compensation || '',
        status: data.status || '',
        createdAt: data.createdAt,
        views: data.views || 0,
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
    }).filter(article => article !== null);
    
    console.log(`ArticleService: Returning ${articles.length} paginated articles, hasMore: ${hasMore}`);
    
    // If we got no articles but executed the query successfully, return an empty array
    // instead of potentially throwing an error
    return {
      articles,
      lastVisible,
      hasMore
    };
  } catch (error) {
    console.error('ArticleService: Error getting paginated articles:', error);
    // Return empty results instead of throwing to avoid infinite loading states
    return {
      articles: [],
      lastVisible: null,
      hasMore: false
    };
  }
};
