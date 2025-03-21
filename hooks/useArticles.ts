import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs, startAfter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
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
    const articlesCollection = 'articles';
    let articlesQuery;

    // First page query
    if (page === 1 || !lastVisible) {
      articlesQuery = query(
        collection(db, articlesCollection),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(itemsPerPage)
      );
    } else {
      // Pagination query with startAfter
      articlesQuery = query(
        collection(db, articlesCollection),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(itemsPerPage)
      );
    }

    const articlesSnapshot = await getDocs(articlesQuery);
    const lastVisibleDoc = articlesSnapshot.docs[articlesSnapshot.docs.length - 1] || null;
    const hasMore = articlesSnapshot.docs.length === itemsPerPage;

    // Convert Firestore documents to Article objects
    const articles = articlesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Article',
        abstract: data.abstract || 'No abstract provided',
        status: data.status || 'draft',
        date: data.createdAt?.toDate?.() 
          ? new Date(data.createdAt.toDate()).toLocaleDateString() 
          : new Date().toLocaleDateString(),
        authorId: data.authorId || '',
        createdAt: data.createdAt
      };
    });

    return {
      articles,
      totalPages: hasMore ? page + 1 : page,
      lastVisible: lastVisibleDoc,
      hasMore
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

// React Query hook
export const useArticles = (
  page = 1,
  itemsPerPage = 5
): UseQueryResult<ArticlesResponse, Error> => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  return useQuery({
    queryKey: ['articles', userId, page, itemsPerPage],
    queryFn: () => fetchArticles(userId, page, itemsPerPage),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};
