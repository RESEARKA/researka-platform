/**
 * Review Types for Researka Platform
 * 
 * This file contains type definitions related to the review system.
 */

// Review status types
export enum ReviewStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

// Review tier options
export enum ReviewTier {
  STANDARD = 'standard',
  PREMIUM = 'premium',
  EXPERT = 'expert'
}

// Available article interface
export interface AvailableArticle {
  id: string;
  title: string;
  abstract: string;
  category: string;
  submittedDate: string;
  tier: ReviewTier;
  tokenReward: number;
}
