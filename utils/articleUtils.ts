import { Article } from '../data/articles';
import { Article as MockArticle } from '../utils/recommendationEngine';
import { EXPANDED_MOCK_ARTICLES } from '../data/mockArticles';

// Convert mock articles to the format used in the articles page
export function convertMockArticlesToArticleFormat(mockArticles: MockArticle[]): Article[] {
  return mockArticles.map((mockArticle, index) => ({
    id: parseInt(mockArticle.id.replace(/[^0-9]/g, '')) || index + 1000,
    title: mockArticle.title,
    authors: [mockArticle.authorId],
    abstract: mockArticle.abstract,
    date: mockArticle.publishedDate || new Date().toISOString().split('T')[0],
    views: mockArticle.views || 0,
    categories: mockArticle.categories,
    imageUrl: getImageUrlForCategory(mockArticle.categories[0])
  }));
}

// Get image URL based on category
function getImageUrlForCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'physics': 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    'chemistry': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    'computer-science': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    'biology': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    'mathematics': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    'humanities': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    'social-sciences': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    'environmental-sciences': 'https://images.unsplash.com/photo-1500534623283-312aebe2eec9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    'engineering': 'https://images.unsplash.com/photo-1581092921461-7031e4f48f6d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80',
    'medical-sciences': 'https://images.unsplash.com/photo-1576671081837-49000212a370?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80'
  };
  
  // Find the best match for the category
  const bestMatch = Object.keys(categoryMap).find(key => 
    category.toLowerCase().includes(key) || key.includes(category.toLowerCase())
  );
  
  return bestMatch 
    ? categoryMap[bestMatch] 
    : 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80';
}

// Get random articles without repeats
export function getRandomArticles(articles: Article[], count: number): Article[] {
  const shuffled = [...articles].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Get all mock articles converted to Article format
export function getAllMockArticles(): Article[] {
  return convertMockArticlesToArticleFormat(EXPANDED_MOCK_ARTICLES);
}

// Paginate articles with improved error checking and defensive copying
export function paginateArticles(articles: Article[], page: number, perPage: number): Article[] {
  // Defensive copy to avoid modifying the original array
  const articlesCopy = [...articles];
  
  // Validate inputs
  if (!Array.isArray(articlesCopy)) {
    console.error('paginateArticles: articles is not an array');
    return [];
  }
  
  if (typeof page !== 'number' || page < 1) {
    console.error(`paginateArticles: invalid page number ${page}`);
    return articlesCopy.slice(0, perPage); // Return first page as fallback
  }
  
  if (typeof perPage !== 'number' || perPage < 1) {
    console.error(`paginateArticles: invalid perPage ${perPage}`);
    return articlesCopy.slice(0, 10); // Use default of 10 as fallback
  }
  
  const start = (page - 1) * perPage;
  const end = start + perPage;
  
  // Validate start index
  if (start >= articlesCopy.length) {
    console.error(`paginateArticles: start index ${start} is out of bounds for array of length ${articlesCopy.length}`);
    // Return last page as fallback
    const lastPageStart = Math.max(0, Math.floor((articlesCopy.length - 1) / perPage) * perPage);
    return articlesCopy.slice(lastPageStart, lastPageStart + perPage);
  }
  
  console.log(`Paginating: start=${start}, end=${end}, total=${articlesCopy.length}, perPage=${perPage}`);
  const result = articlesCopy.slice(start, end);
  console.log(`Paginated result length: ${result.length}`);
  
  return result;
}

// Get total number of pages with improved error checking
export function getTotalPages(totalItems: number, perPage: number): number {
  // Validate inputs
  if (typeof totalItems !== 'number' || totalItems < 0) {
    console.error(`getTotalPages: invalid totalItems ${totalItems}`);
    return 1; // Return at least 1 page as fallback
  }
  
  if (typeof perPage !== 'number' || perPage < 1) {
    console.error(`getTotalPages: invalid perPage ${perPage}`);
    return Math.ceil(totalItems / 10); // Use default of 10 as fallback
  }
  
  return Math.max(1, Math.ceil(totalItems / perPage)); // Ensure at least 1 page
}
