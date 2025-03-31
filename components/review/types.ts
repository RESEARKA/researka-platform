import { Dispatch, SetStateAction } from 'react';

// Define interface for review articles
export interface ReviewArticle {
  id?: string | number;
  title: string;
  abstract: string;
  category: string;
  keywords: string[];
  author: string;
  date: string;
  compensation: string;
  status: string;
  createdAt?: any; // For Firebase Timestamp
}

export interface ReviewContentProps {
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  categoryFilter: string;
  setCategoryFilter: Dispatch<SetStateAction<string>>;
  sortBy: string;
  setSortBy: Dispatch<SetStateAction<string>>;
  filteredArticles: ReviewArticle[];
  bgColor?: string;
  borderColor?: string;
}
