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
  rating: number;
  originality: number;
  methodology: number;
  clarity: number;
  significance: number;
  technicalQuality: number;
  comments: string;
  recommendation: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
  dateSubmitted?: string;
}

export interface ReviewSuggestion {
  id?: string;
  category: string;
  content: string;
  priority?: 'high' | 'medium' | 'low';
}
