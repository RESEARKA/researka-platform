/**
 * User-related type definitions for DecentraJournal
 */

/**
 * User profile interface
 * Contains all the fields that make up a user's profile
 */
export interface UserProfile {
  // Basic user information
  uid?: string;
  email?: string;
  name?: string;
  role?: string;
  institution?: string;
  
  // Profile completion flags
  profileComplete?: boolean;
  isComplete?: boolean;
  
  // Additional profile fields
  bio?: string;
  expertise?: string[];
  interests?: string[];
  publications?: string[];
  website?: string;
  orcid?: string;
  twitter?: string;
  
  // System fields
  createdAt?: string;
  updatedAt?: string;
  
  // Any additional fields
  [key: string]: any;
}

/**
 * User authentication state interface
 */
export interface UserAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
}

/**
 * User settings interface
 */
export interface UserSettings {
  emailNotifications: boolean;
  darkMode: boolean;
  language: string;
  [key: string]: any;
}

/**
 * User role enum
 */
export enum UserRole {
  READER = 'reader',
  AUTHOR = 'author',
  REVIEWER = 'reviewer',
  EDITOR = 'editor',
  ADMIN = 'admin'
}
