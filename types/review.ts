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
  dateSubmitted?: string;
  status?: 'pending' | 'under_review' | 'accepted' | 'rejected';
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
}
