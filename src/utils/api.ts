/**
 * API utilities for Researka
 */
import { AppError, ErrorType, parseApiError, handleNetworkError } from './errorHandling';

interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  retryStatusCodes?: number[];
}

/**
 * Fetches data from an API with retry logic for transient errors
 * 
 * @param url The URL to fetch
 * @param options Fetch options with retry configuration
 * @returns Promise with the response data
 * @throws AppError if all retries fail
 */
export async function fetchWithRetry<T>(
  url: string, 
  options: FetchWithRetryOptions = {}
): Promise<T> {
  const { 
    retries = 3, 
    retryDelay = 1000, 
    retryStatusCodes = [408, 429, 500, 502, 503, 504],
    ...fetchOptions 
  } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        // If the status code is in our retry list and we have attempts left
        if (retryStatusCodes.includes(response.status) && attempt < retries) {
          const error = await parseApiError(response);
          lastError = error;
          
          // Log the retry attempt
          console.warn(`API call failed with status ${response.status}, retrying (${attempt + 1}/${retries})...`);
          
          // Wait before retrying with exponential backoff
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          continue;
        }
        
        // If we're not retrying or out of retries, throw the error
        throw await parseApiError(response);
      }
      
      return await response.json() as T;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      // Handle network errors (offline, timeout, etc.)
      const networkError = handleNetworkError(error);
      lastError = networkError;
      
      // Only retry network errors if we have attempts left
      if (attempt < retries && networkError.type === ErrorType.NETWORK) {
        console.warn(`Network error, retrying (${attempt + 1}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        continue;
      }
      
      throw networkError;
    }
  }
  
  // This should never happen, but TypeScript needs it
  throw lastError || new AppError('Unknown error occurred', ErrorType.UNKNOWN);
}

/**
 * Creates a cache key for API responses
 * 
 * @param url The API URL
 * @param params Additional parameters to include in the cache key
 * @returns A string cache key
 */
export function createCacheKey(url: string, params: Record<string, any> = {}): string {
  const paramString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join('&');
    
  return `${url}${paramString ? `?${paramString}` : ''}`;
}
