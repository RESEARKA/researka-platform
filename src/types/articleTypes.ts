/**
 * Article Types for Researka Platform
 * 
 * This file contains type definitions related to articles.
 */

// Article interface
export interface Article {
  id: string;
  title: string;
  abstract: string;
  fullText?: string;
  authors: Author[] | string[];
  publishedDate?: string;
  submittedDate: string;
  category: string;
  keywords: string[];
  citations?: number;
  views?: number;
  doi?: string;
  status: 'pending' | 'in_review' | 'revision_requested' | 'accepted' | 'rejected' | 'published';
  fileUrl?: string; // URL to the article file (PDF or other format)
  pdfUrl?: string; // URL to the PDF version of the article for Google Scholar indexing
  submittedBy: {
    id: string;
    name: string;
  };
  reviews?: any[];
  relatedArticles?: any[];
  revisionCount?: number;
  lastRevisedDate?: string;
  figures?: {url: string; caption: string}[];
}

// Author interface
export interface Author {
  id: string;
  name: string;
  institution?: string;
  email?: string;
  orcid?: string;
}
