/**
 * Types related to article reviews and AI suggestions
 */

export interface Article {
  id: string;
  title: string;
  abstract: string;
  content?: string;
  category?: string;
  author?: string;
  authorId?: string;
  dateSubmitted?: string;
  date?: string;
  compensation?: string;
  status?: 'pending' | 'under_review' | 'accepted' | 'rejected';
  createdAt?: any; // Firestore Timestamp
  views?: number;
  keywords?: string[];
  // Additional fields for structured content
  introduction?: string;
  methods?: string;
  results?: string;
  discussion?: string;
  references?: string;
  funding?: string;
  ethicalApprovals?: string;
  dataAvailability?: string;
  conflicts?: string;
  license?: string;
  // Moderation fields
  flagCount?: number;
  flaggedBy?: string[]; // Array of user IDs who flagged this article
  moderationStatus?: 'active' | 'under_review' | 'reinstated' | 'removed';
  lastFlaggedAt?: any; // Firestore Timestamp
}

export interface Review {
  id?: string;
  articleId: string;
  reviewerId?: string;
  ratings: {
    originality: number;
    methodology: number;
    clarity: number;
    significance: number;
    references: number;
  };
  comments: string;
  privateComments?: string;
  decision: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
  dateSubmitted?: string;
}

export interface ReviewSuggestion {
  id: string; // Ensure this is always present and unique
  category: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  articleId?: string; // Optional article ID to associate the suggestion with a specific article
}
