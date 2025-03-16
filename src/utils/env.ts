/**
 * Environment variable utilities for Researka
 * 
 * This module provides type-safe access to environment variables and
 * validates their presence at runtime.
 */

/**
 * Gets an environment variable with validation
 * @param key The environment variable key
 * @param required Whether the variable is required (throws error if missing)
 * @param defaultValue Optional default value if not required and missing
 * @returns The environment variable value
 */
export function getEnvVariable(
  key: string, 
  required: boolean = true,
  defaultValue: string = ''
): string {
  const value = import.meta.env[key];
  
  if (required && (value === undefined || value === '')) {
    console.error(`Environment variable ${key} is required but not set.`);
    throw new Error(`Environment variable ${key} is required but not set.`);
  }
  
  return value || defaultValue;
}

/**
 * Environment variables used in the application
 */
export const ENV = {
  /**
   * OpenCitations API token for fetching citation data
   */
  get OPENCITATIONS_API_TOKEN(): string {
    return getEnvVariable('VITE_OPENCITATIONS_API_TOKEN', false, 'demo-token');
  },
  
  /**
   * Check if we're in development mode
   */
  get IS_DEV(): boolean {
    return import.meta.env.MODE === 'development';
  },
  
  /**
   * Check if we're in production mode
   */
  get IS_PROD(): boolean {
    return import.meta.env.MODE === 'production';
  },
  
  /**
   * Current environment (development, production, etc.)
   */
  get NODE_ENV(): string {
    return import.meta.env.MODE || 'development';
  },
  
  /**
   * Whether to use mock data when APIs fail
   */
  get USE_MOCK_DATA(): string {
    return getEnvVariable('VITE_USE_MOCK_DATA', false, 'true');
  }
};
