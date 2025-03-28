/**
 * Centralized logging utility for DecentraJournal
 * 
 * This utility provides standardized logging across the application with:
 * - Consistent log formatting
 * - Log levels (debug, info, warn, error)
 * - Module/component tagging
 * - Performance tracking
 * - Environment-aware behavior (more verbose in development)
 */

import * as Sentry from '@sentry/nextjs';

// Log levels in order of severity
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// Log categories for better filtering
export enum LogCategory {
  AUTH = 'auth',
  DATA = 'data',
  UI = 'ui',
  NETWORK = 'network',
  PERFORMANCE = 'performance',
  LIFECYCLE = 'lifecycle',
  SYSTEM = 'system',
  ERROR = 'error'
}

interface LogOptions {
  // Additional context data to include with the log
  context?: Record<string, any>;
  // Whether to send this log to Sentry (only for WARN and ERROR levels)
  sendToSentry?: boolean;
  // Log category for filtering
  category?: LogCategory;
  // User ID if available
  userId?: string;
}

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

/**
 * Core logging function
 */
function logWithLevel(
  level: LogLevel,
  module: string,
  message: string,
  options: LogOptions = {}
) {
  const { context = {}, sendToSentry = level === LogLevel.ERROR, category = LogCategory.SYSTEM, userId } = options;
  
  // Create timestamp
  const timestamp = new Date().toISOString();
  
  // Format the log message
  const formattedContext = context ? ` | context: ${JSON.stringify(context)}` : '';
  const formattedUserId = userId ? ` | user: ${userId}` : '';
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] [${category}] [${module}] ${message}${formattedUserId}${formattedContext}`;
  
  // Log to console based on level
  switch (level) {
    case LogLevel.DEBUG:
      if (isDev) console.debug(formattedMessage);
      break;
    case LogLevel.INFO:
      console.info(formattedMessage);
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage);
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage);
      break;
  }
  
  // Send to Sentry for WARN and ERROR levels if enabled
  if (sendToSentry && (level === LogLevel.ERROR || level === LogLevel.WARN)) {
    try {
      Sentry.withScope((scope) => {
        // Add context to Sentry scope
        scope.setTag('module', module);
        scope.setTag('category', category);
        
        if (userId) {
          scope.setUser({ id: userId });
        }
        
        // Add all context as extras
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        
        // Capture message or exception
        if (level === LogLevel.ERROR) {
          if (context.error instanceof Error) {
            Sentry.captureException(context.error);
          } else {
            Sentry.captureMessage(message, 'error');
          }
        } else {
          Sentry.captureMessage(message, 'warning');
        }
      });
    } catch (e) {
      // Fallback if Sentry logging fails
      console.error(`Failed to log to Sentry: ${e}`);
    }
  }
}

/**
 * Create a logger instance for a specific module
 */
export function createLogger(module: string) {
  return {
    /**
     * Log a debug message (only visible in development)
     */
    debug: (message: string, options?: LogOptions) => 
      logWithLevel(LogLevel.DEBUG, module, message, options),
    
    /**
     * Log an informational message
     */
    info: (message: string, options?: LogOptions) => 
      logWithLevel(LogLevel.INFO, module, message, options),
    
    /**
     * Log a warning message
     */
    warn: (message: string, options?: LogOptions) => 
      logWithLevel(LogLevel.WARN, module, message, options),
    
    /**
     * Log an error message
     */
    error: (message: string, options?: LogOptions) => 
      logWithLevel(LogLevel.ERROR, module, message, options),
    
    /**
     * Track the performance of a function
     */
    trackPerformance: async <T>(
      operationName: string, 
      fn: () => Promise<T> | T,
      options?: Omit<LogOptions, 'category'>
    ): Promise<T> => {
      const start = performance.now();
      try {
        const result = await fn();
        const duration = performance.now() - start;
        
        logWithLevel(
          duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG, 
          module, 
          `${operationName} completed in ${duration.toFixed(2)}ms`,
          { 
            ...options,
            category: LogCategory.PERFORMANCE,
            context: {
              ...options?.context,
              operationName,
              durationMs: duration
            }
          }
        );
        
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        
        logWithLevel(
          LogLevel.ERROR, 
          module, 
          `${operationName} failed after ${duration.toFixed(2)}ms`,
          { 
            ...options,
            category: LogCategory.PERFORMANCE,
            context: {
              ...options?.context,
              operationName,
              durationMs: duration,
              error
            }
          }
        );
        
        throw error;
      }
    }
  };
}

// Default logger for imports without creating a specific logger
export default createLogger('app');
