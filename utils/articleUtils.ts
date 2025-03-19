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

// Paginate articles
export function paginateArticles(articles: Article[], page: number, perPage: number): Article[] {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return articles.slice(start, end);
}

// Get total number of pages
export function getTotalPages(totalItems: number, perPage: number): number {
  return Math.ceil(totalItems / perPage);
}
