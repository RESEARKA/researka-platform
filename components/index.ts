/**
 * Components barrel file
 * 
 * This file exports all components to simplify imports.
 * Instead of importing from individual files, you can import from this barrel file.
 * 
 * Example: import { NavBar, LoginModal } from '../components';
 */

// Core components
export { default as NavBar } from './NavBar';
export { default as Footer } from './Footer';
export { default as LoginModal } from './LoginModal';
export { default as SignupModal } from './SignupModal';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as DocumentUploader } from './DocumentUploader';
export { default as LoadingSpinner } from './LoadingSpinner';

// UI components
export * from './ui';

// Navbar components
export * from './navbar/exports';

// Article components
export * from './article';

// Auth components
export * from './auth';

// Profile components
export * from './profile/exports';
export * from './profile-form';

// Editor components
export * from './editor/components';

// Review components
export * from './review';

// Admin components
export * from './admin';

// Common components
export * from './common';
