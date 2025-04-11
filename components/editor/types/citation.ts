/**
 * Types for the citation system
 */

export interface Author {
  given: string;
  family: string;
  orcid?: string;
}

export interface Citation {
  id: string;
  doi?: string;
  url?: string;
  title: string;
  authors: Author[];
  journal?: string;
  publisher?: string;
  year: number;
  volume?: string;
  issue?: string;
  pages?: string;
  type: 'article' | 'book' | 'chapter' | 'conference' | 'website' | 'other';
  addedAt: number;
}

export type CitationFormat = 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee';

export interface CitationAttributes {
  id: string;
  format?: CitationFormat;
}
