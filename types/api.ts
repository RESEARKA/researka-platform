/**
 * API Types
 * 
 * This file contains API-related types for the RESEARKA platform.
 */

/**
 * Base API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMetadata;
}

/**
 * API error interface
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * API metadata interface for pagination and other metadata
 */
export interface ApiMetadata {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  timestamp?: number;
}

/**
 * API pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * API filter parameters
 */
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * API query parameters
 */
export interface QueryParams extends PaginationParams, FilterParams {}

/**
 * API request options
 */
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: QueryParams;
  timeout?: number;
  withCredentials?: boolean;
}

/**
 * API request methods
 */
export enum ApiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}
