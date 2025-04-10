/**
 * Types related to content moderation
 */

export type FlagCategory = 
  | 'misinformation' 
  | 'offensive' 
  | 'plagiarism' 
  | 'spam' 
  | 'other';

export type FlagStatus = 'pending' | 'accepted' | 'rejected' | 'reviewed' | 'dismissed';

export type ModerationStatus = 'active' | 'under_review' | 'reinstated' | 'removed';

export type ModerationAction = 'approve' | 'reject';

/**
 * Flag interface representing a user report on content
 */
export interface Flag {
  id: string;
  articleId: string;
  reportedBy: string; // userId
  reason: string;
  category: FlagCategory;
  timestamp: Date | any; // Firestore Timestamp
  status: FlagStatus;
  resolvedBy?: string; // adminId
  resolvedAt?: Date | any; // Firestore Timestamp
  reviewedBy?: string; // adminId
  reviewNotes?: string;
}

/**
 * FlaggedArticle interface for the moderation queue
 */
export interface FlaggedArticle {
  id: string;
  title: string;
  author: string;
  authorId: string;
  abstract?: string;
  content?: string;
  category?: string;
  keywords?: string[];
  views?: number;
  date?: Date | any; // Publication date
  authorName?: string;
  flagCount: number;
  flaggedBy?: string[];
  flags?: Flag[]; // For the moderation action modal
  moderationStatus: ModerationStatus;
  lastFlaggedAt: Date | any; // Firestore Timestamp
  createdAt?: Date | any; // Firestore Timestamp
  moderatedBy?: string; // adminId
  moderatedAt?: Date | any; // Firestore Timestamp
  moderationNotes?: string;
}
