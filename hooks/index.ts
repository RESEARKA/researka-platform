/**
 * Hooks barrel file
 * 
 * This file exports all custom hooks to simplify imports.
 * Instead of importing from individual files, you can import from this barrel file.
 * 
 * Example: import { useShareLinks } from '../hooks';
 */

export { default as useClient } from './useClient';
export { default as useShareLinks, type SharePlatform } from './useShareLinks';
