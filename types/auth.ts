/**
 * Authentication Types
 * 
 * This file contains all authentication-related types for the RESEARKA platform.
 */

import { User as FirebaseUser } from 'firebase/auth';

/**
 * Extended User type that includes RESEARKA-specific fields
 * Extends the Firebase User type with additional application-specific fields
 */
export interface User extends FirebaseUser {
  // RESEARKA-specific fields
  role?: UserRole;
  isActive?: boolean;
  isDeleted?: boolean;
  profileComplete?: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User role enum for role-based access control
 */
export enum UserRole {
  USER = 'User',
  READER = 'Reader',
  AUTHOR = 'Author',
  REVIEWER = 'Reviewer',
  EDITOR = 'Editor',
  ADMIN = 'Admin'
}

/**
 * Authentication state interface
 */
export interface AuthState {
  currentUser: User | null;
  isLoading: boolean;
  authIsInitialized: boolean;
  error: AuthError | null;
}

/**
 * Authentication context interface
 */
export interface AuthContextType {
  currentUser: User | null;
  authIsInitialized: boolean;
  isLoading: boolean;
  error: AuthError | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, displayName?: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  getUserProfile: (uid: string) => Promise<any>;
  persistentUsername?: string;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Signup credentials interface
 */
export interface SignupCredentials extends LoginCredentials {
  displayName?: string;
}

/**
 * Auth error interface with additional fields for better error handling
 */
export interface AuthError extends Error {
  code?: string;
  category?: 'network' | 'credentials' | 'rate-limit' | 'auth' | 'other';
  retry?: boolean;
  name: string;
}
