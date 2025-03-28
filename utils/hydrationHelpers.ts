/**
 * Utility functions to help with hydration and SSR/CSR mismatches
 */

import { isClientSide } from './imageOptimizer';

/**
 * Safely access browser-only APIs
 * @param callback Function to execute only on the client side
 * @param fallbackValue Value to return during SSR
 * @returns Result of callback on client, fallbackValue on server
 */
export function safeClientSideOperation<T>(callback: () => T, fallbackValue: T): T {
  if (!isClientSide()) {
    return fallbackValue;
  }
  
  try {
    return callback();
  } catch (error) {
    console.error('Error in client-side operation:', error);
    return fallbackValue;
  }
}

/**
 * Check if code is running on the client side
 * Re-export from imageOptimizer for backward compatibility
 */
export { isClientSide };

/**
 * Get a consistent initial state value that works for both SSR and CSR
 * @param clientValue Value to use on the client side
 * @param serverValue Value to use on the server side
 * @returns Appropriate value based on current environment
 */
export function getConsistentInitialState<T>(clientValue: T, serverValue: T): T {
  return isClientSide() ? clientValue : serverValue;
}

/**
 * Create a serializable state object for hydration
 * This helps prevent hydration mismatches by ensuring the state
 * can be properly serialized and deserialized during SSR
 * @param state State object to make serializable
 * @returns Serializable version of the state
 */
export function makeSerializable<T extends Record<string, any>>(state: T): Record<string, any> {
  // Convert Date objects to ISO strings
  return Object.entries(state).reduce((acc, [key, value]) => {
    if (value instanceof Date) {
      acc[key] = value.toISOString();
    } else if (value === undefined) {
      acc[key] = null; // Replace undefined with null for serialization
    } else if (typeof value === 'object' && value !== null) {
      acc[key] = makeSerializable(value as Record<string, any>);
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Safely parse JSON with error handling
 * @param jsonString JSON string to parse
 * @param fallback Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}

/**
 * Create a stable key for lists to prevent hydration warnings
 * @param prefix Prefix for the key
 * @param id ID or unique identifier
 * @param index Fallback index if id is not available
 * @returns Stable key string
 */
export function createStableKey(prefix: string, id?: string | number, index?: number): string {
  if (id !== undefined && id !== null) {
    return `${prefix}-${id}`;
  }
  
  if (index !== undefined) {
    return `${prefix}-index-${index}`;
  }
  
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}
