// Article and Author type definitions
export interface Author {
  id: string;
  name: string;
  institution: string;
  email?: string;
  orcid?: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  date: string;
  content: string;
  rating: number;
  decision: 'accept' | 'reject' | 'revise';
}

export interface Article {
  id: string;
  title: string;
  abstract: string;
  fullText: string;
  authors: Author[];
  publishedDate: string;
  category?: string; // For backward compatibility
  mainCategory?: string;
  subCategory?: string;
  keywords: string[];
  citations: number;
  views: number;
  doi: string;
  reviews: Review[];
  relatedArticles: Article[];
  
  // New fields for enhanced article detail
  sections?: ArticleSection[];
  references?: Reference[];
  figures?: Figure[];
  metrics?: ArticleMetrics;
  supplementaryMaterials?: SupplementaryMaterial[];
  
  // File URLs for Google Scholar and citation data
  pdfUrl?: string;
  fileUrl?: string;
}

export interface ArticleSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Reference {
  id: string;
  authors: string[];
  title: string;
  journal?: string;
  year: string;
  doi?: string;
  url?: string;
  citationText: string;
}

export interface Figure {
  id: string;
  caption: string;
  url: string;
  altText: string;
}

export interface ArticleMetrics {
  downloads: number;
  shares: number;
  altmetric?: number;
}

export interface SupplementaryMaterial {
  id: string;
  title: string;
  description: string;
  fileType: string;
  url: string;
  size: string;
}

// Flag types for content moderation
export type FlagReason = 
  | 'inappropriate_content'
  | 'copyright_violation'
  | 'plagiarism'
  | 'misinformation'
  | 'spam'
  | 'other';

export interface Flag {
  id: string;
  articleId: string;
  reason: FlagReason;
  description: string;
  createdAt: string;
  createdBy: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedAt?: string;
  reviewedBy?: string;
  resolution?: string;
}

// Category types for the hierarchical structure
export type MainCategory = 
  | 'Physical Sciences'
  | 'Life Sciences & Biomedicine'
  | 'Technology & Engineering'
  | 'Social Sciences'
  | 'Arts & Humanities'
  | 'Multidisciplinary';

export interface CategoryStructure {
  [key: string]: string[];
}

// Define the hierarchical category structure
export const categoryStructure: CategoryStructure = {
  'Physical Sciences': [
    'Physics',
    'Chemistry',
    'Mathematics',
    'Earth & Environmental Sciences',
    'Astronomy & Astrophysics'
  ],
  'Life Sciences & Biomedicine': [
    'Biology',
    'Medicine & Health Sciences',
    'Neuroscience',
    'Genetics',
    'Ecology & Conservation'
  ],
  'Technology & Engineering': [
    'Computer Science',
    'Electrical & Electronic Engineering',
    'Mechanical Engineering',
    'Materials Science',
    'Artificial Intelligence',
    'Blockchain & Distributed Systems'
  ],
  'Social Sciences': [
    'Economics',
    'Psychology',
    'Sociology',
    'Political Science',
    'Education',
    'Business & Management'
  ],
  'Arts & Humanities': [
    'Philosophy',
    'Literature',
    'History',
    'Cultural Studies',
    'Linguistics',
    'Visual & Performing Arts'
  ],
  'Multidisciplinary': [
    'Sustainability',
    'Data Science',
    'Cognitive Science',
    'Public Policy',
    'Ethics'
  ]
};
