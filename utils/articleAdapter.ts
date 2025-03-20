import { Article as FirebaseArticle } from '../services/articleService';

// Interface for the articles page
export interface PageArticle {
  id: number | string;
  title: string;
  authors: string[];
  abstract: string;
  date: string;
  views: number;
  categories: string[];
  imageUrl?: string;
  description?: string;
  image?: string;
}

/**
 * Convert a Firebase article to the format expected by the articles page
 */
export const convertToPageArticle = (firebaseArticle: FirebaseArticle): PageArticle => {
  return {
    id: firebaseArticle.id || Date.now(),
    title: firebaseArticle.title,
    authors: [firebaseArticle.author],
    abstract: firebaseArticle.abstract,
    date: firebaseArticle.date,
    views: Math.floor(Math.random() * 1000), // Random view count for now
    categories: [firebaseArticle.category.toUpperCase()],
    imageUrl: `https://via.placeholder.com/400x200?text=${encodeURIComponent(firebaseArticle.category)}+Research`
  };
};

/**
 * Convert multiple Firebase articles to the format expected by the articles page
 */
export const convertToPageArticles = (firebaseArticles: FirebaseArticle[]): PageArticle[] => {
  return firebaseArticles.map(convertToPageArticle);
};
