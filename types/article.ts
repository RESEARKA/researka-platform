/**
 * Article Types
 * 
 * This file contains all article-related types for the RESEARKA platform.
 */

import { User } from './auth';

/**
 * Article interface representing a research article in the RESEARKA platform
 */
export interface Article {
  id: string;
  title: string;
  abstract: string;
  content: string;
  authors: ArticleAuthor[];
  keywords: string[];
  doi?: string;
  publishedDate?: Date;
  updatedDate?: Date;
  status: ArticleStatus;
  views: number;
  citations: number;
  shares: ShareMetrics;
  category?: string;
  tags?: string[];
  references?: Reference[];
  isPublic: boolean;
  isDeleted?: boolean;
}

/**
 * Article author interface
 */
export interface ArticleAuthor {
  id: string;
  name: string;
  email?: string;
  orcid?: string;
  affiliation?: string;
  isCorresponding?: boolean;
  bio?: string;
  profileImage?: string;
}

/**
 * Article status enum
 */
export enum ArticleStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  REVISION_REQUIRED = 'revision_required',
  ACCEPTED = 'accepted',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

/**
 * Share metrics interface
 */
export interface ShareMetrics {
  twitter?: number;
  facebook?: number;
  linkedin?: number;
  email?: number;
  total: number;
}

/**
 * Reference interface for article citations
 */
export interface Reference {
  id: string;
  title: string;
  authors: string[];
  journal?: string;
  year?: number;
  doi?: string;
  url?: string;
}

/**
 * Article filter options
 */
export interface ArticleFilterOptions {
  category?: string;
  tag?: string;
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: ArticleStatus;
}

/**
 * Article sort options
 */
export enum ArticleSortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  MOST_VIEWED = 'most_viewed',
  MOST_CITED = 'most_cited',
  MOST_SHARED = 'most_shared'
}

/**
 * Article pagination options
 */
export interface ArticlePaginationOptions {
  page: number;
  limit: number;
  sort?: ArticleSortOption;
  filters?: ArticleFilterOptions;
}
