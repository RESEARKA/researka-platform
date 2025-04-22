import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs, startAfter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// Types
export interface Article {
  id: string;
  title: string;
  abstract: string;
  status: string;
  date: string;
  authorId: string;
  createdAt: any;
}

export interface ArticlesResponse {
  articles: Article[];
  totalPages: number;
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

// Fetch articles from Firestore
const fetchArticles = async (
  userId: string | undefined,
  page = 1,
  itemsPerPage = 5,
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<ArticlesResponse> => {
  // Return empty response if no userId
  if (!userId) {
    return {
      articles: [],
      totalPages: 0,
      lastVisible: null,
      hasMore: false
    };
  }

  try {
    // Get Firestore instance
    const db = await getFirebaseFirestore();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // Create a reference to the articles collection
    const articlesRef = collection(db, 'articles');
    
    // Create a query against the collection
    let articlesQuery;
    
    if (lastVisible) {
      // If we have a lastVisible document, start after it
      articlesQuery = query(
        articlesRef,
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(itemsPerPage)
      );
    } else {
      // First page query
      articlesQuery = query(
        articlesRef,
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(itemsPerPage)
      );
    }
    
    // Execute the query
    const articlesSnapshot = await getDocs(articlesQuery);
    
    // Check if there are any documents
    if (articlesSnapshot.empty) {
      console.log('useArticles: No articles found for user:', userId);
      return {
        articles: [],
        totalPages: 0,
        lastVisible: null,
        hasMore: false
      };
    }
    
    // Get the last visible document for pagination
    const lastVisibleDoc = articlesSnapshot.docs[articlesSnapshot.docs.length - 1];
    
    // Check if there are more documents
    const nextQuery = query(
      articlesRef,
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc'),
      startAfter(lastVisibleDoc),
      limit(1)
    );
    
    const nextSnapshot = await getDocs(nextQuery);
    const hasMore = !nextSnapshot.empty;
    
    // Map the documents to an array of articles
    const articles = articlesSnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title || 'Untitled Article',
      abstract: doc.data().abstract || 'No abstract provided',
      status: doc.data().status || 'draft',
      date: doc.data().createdAt?.toDate?.() 
        ? new Date(doc.data().createdAt.toDate()).toLocaleDateString() 
        : new Date().toLocaleDateString(),
      authorId: doc.data().authorId || '',
      createdAt: doc.data().createdAt
    }));
    
    console.log(`useArticles: Fetched ${articles.length} articles for user:`, userId);
    
    // Calculate total pages (this is an approximation)
    const totalPages = page + (hasMore ? 1 : 0);
    
    return {
      articles,
      totalPages,
      lastVisible: lastVisibleDoc,
      hasMore
    };
  } catch (error: any) {
    // Check for specific error types
    if (error?.name === 'FirebaseError') {
      if (error.code === 'failed-precondition') {
        console.error('useArticles: Missing required index for query. Follow these steps to create the index:');
        console.error('1. Go to Firebase Console: https://console.firebase.google.com/project/_/firestore/indexes');
        console.error('2. Click "Add Index" and select the "articles" collection');
        console.error('3. Add these fields in this order:');
        console.error('   - authorId (Ascending)');
        console.error('   - createdAt (Descending)');
        console.error('4. Click "Create"');
        console.error('The full error message is:', error.message);
        
        // Extract the direct link from the error message if available
        const linkMatch = error.message.match(/https:\/\/console\.firebase\.google\.com\/[^\s"]+/);
        if (linkMatch && linkMatch[0]) {
          console.error('Direct link to create index:', linkMatch[0]);
        }
      } else {
        console.error('useArticles: Firebase error fetching articles:', error.code, error.message);
      }
    } else {
      console.error('useArticles: Error fetching articles:', error);
    }
    
    // Return empty data instead of throwing
    return {
      articles: [],
      totalPages: 0,
      lastVisible: null,
      hasMore: false
    };
  }
};

// React Query hook
export const useArticles = (
  page = 1,
  itemsPerPage = 5
): UseQueryResult<ArticlesResponse, Error> => {
  const { currentUser, authIsInitialized } = useAuth();
  const userId = currentUser?.uid;

  return useQuery({
    queryKey: ['articles', userId, page, itemsPerPage],
    queryFn: () => fetchArticles(userId, page, itemsPerPage),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!userId && authIsInitialized === true,
    retry: 3
  });
};
