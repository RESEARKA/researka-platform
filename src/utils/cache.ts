/**
 * Cache utilities for Researka
 * 
 * This module provides a simple caching mechanism for API responses
 * to reduce unnecessary API calls and improve performance.
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

/**
 * A simple in-memory cache for API responses
 */
class ApiCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  /**
   * Gets an item from the cache
   * 
   * @param key The cache key
   * @returns The cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if the item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }
  
  /**
   * Sets an item in the cache
   * 
   * @param key The cache key
   * @param data The data to cache
   * @param ttlMs Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    const timestamp = Date.now();
    const expiry = timestamp + ttlMs;
    
    this.cache.set(key, {
      data,
      timestamp,
      expiry
    });
  }
  
  /**
   * Removes an item from the cache
   * 
   * @param key The cache key
   */
  remove(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clears all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Gets the number of items in the cache
   */
  get size(): number {
    return this.cache.size;
  }
  
  /**
   * Removes all expired items from the cache
   * 
   * @returns The number of items removed
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    return removed;
  }
}

// Create a singleton instance of the cache
export const apiCache = new ApiCache();

/**
 * Wraps an async function with caching
 * 
 * @param fn The async function to wrap
 * @param keyFn Function to generate a cache key from the arguments
 * @param ttlMs Time to live in milliseconds
 * @returns A wrapped function that uses the cache
 */
export function withCache<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  keyFn: (...args: Args) => string,
  ttlMs: number = 5 * 60 * 1000
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const cacheKey = keyFn(...args);
    const cachedData = apiCache.get<T>(cacheKey);
    
    if (cachedData !== null) {
      return cachedData;
    }
    
    const result = await fn(...args);
    apiCache.set(cacheKey, result, ttlMs);
    return result;
  };
}
