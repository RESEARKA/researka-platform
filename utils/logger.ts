/**
 * Centralized logging utility for DecentraJournal
 * 
 * This utility provides standardized logging across the application with:
 * - Consistent log formatting
 * - Log levels (debug, info, warn, error)
 * - Module/component tagging
 * - Performance tracking
 * - Environment-aware behavior (more verbose in development)
 * - External service integration (Sentry)
 * - Console wrapping to prevent leaks in production
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
  ERROR = 'error',
  DOCUMENT = 'document',
  FORM = 'form',
  USER_ACTION = 'user_action'
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
  // Tags for better categorization in external services
  tags?: Record<string, string>;
  // Additional metadata for external services
  metadata?: Record<string, any>;
}

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development';
// Set minimum log level based on environment and configuration
const MIN_LOG_LEVEL = (() => {
  const configLevel = process.env.NEXT_PUBLIC_LOG_LEVEL;
  if (configLevel && Object.values(LogLevel).includes(configLevel as LogLevel)) {
    return configLevel as LogLevel;
  }
  return isDev ? LogLevel.DEBUG : LogLevel.INFO;
})();

// Enable/disable console logging in production
const ENABLE_PROD_CONSOLE = process.env.NEXT_PUBLIC_ENABLE_PROD_LOGS === 'true';

// Map log levels to numeric values for comparison
const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3
};

// Performance tracking
const performanceMarks: Record<string, number> = {};

/**
 * Safe console wrapper to prevent accidental console leaks in production
 */
export const safeConsole = {
  debug: (...args: any[]) => {
    if (isDev || ENABLE_PROD_CONSOLE) {
      console.debug(...args);
    }
  },
  log: (...args: any[]) => {
    if (isDev || ENABLE_PROD_CONSOLE) {
      console.log(...args);
    }
  },
  info: (...args: any[]) => {
    if (isDev || ENABLE_PROD_CONSOLE) {
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDev || ENABLE_PROD_CONSOLE) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors to console, even in production
    console.error(...args);
  },
  group: (...args: any[]) => {
    if (isDev || ENABLE_PROD_CONSOLE) {
      console.group(...args);
    }
  },
  groupEnd: () => {
    if (isDev || ENABLE_PROD_CONSOLE) {
      console.groupEnd();
    }
  },
  table: (data: any, columns?: string[]) => {
    if (isDev || ENABLE_PROD_CONSOLE) {
      console.table(data, columns);
    }
  }
};

/**
 * Core logging function
 */
function logWithLevel(
  level: LogLevel,
  module: string,
  message: string,
  options: LogOptions = {}
) {
  const { 
    context = {}, 
    sendToSentry = level === LogLevel.ERROR, 
    category = LogCategory.SYSTEM, 
    userId,
    tags = {},
    metadata = {}
  } = options;
  
  // Skip logging if below minimum level
  if (LOG_LEVEL_SEVERITY[level] < LOG_LEVEL_SEVERITY[MIN_LOG_LEVEL]) {
    return;
  }
  
  // Create timestamp
  const timestamp = new Date().toISOString();
  
  // Format the log message
  const formattedContext = context ? ` | context: ${JSON.stringify(context)}` : '';
  const formattedUserId = userId ? ` | user: ${userId}` : '';
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] [${category}] [${module}] ${message}${formattedUserId}${formattedContext}`;
  
  // Log to console based on level
  switch (level) {
    case LogLevel.DEBUG:
      safeConsole.debug(formattedMessage);
      break;
    case LogLevel.INFO:
      safeConsole.info(formattedMessage);
      break;
    case LogLevel.WARN:
      safeConsole.warn(formattedMessage);
      break;
    case LogLevel.ERROR:
      safeConsole.error(formattedMessage);
      break;
  }
  
  // Send to Sentry for WARN and ERROR levels if enabled
  if (sendToSentry && (level === LogLevel.ERROR || level === LogLevel.WARN)) {
    try {
      // Set Sentry user context if available
      if (userId) {
        Sentry.setUser({ id: userId });
      }
      
      // Set Sentry tags
      Object.entries({ ...tags, category, module }).forEach(([key, value]) => {
        Sentry.setTag(key, value);
      });
      
      // Set Sentry context
      Sentry.setContext('log_details', {
        ...context,
        ...metadata,
        timestamp,
        level
      });
      
      if (level === LogLevel.ERROR) {
        if (context.error instanceof Error) {
          Sentry.captureException(context.error);
        } else {
          Sentry.captureMessage(message, 'error');
        }
      } else if (level === LogLevel.WARN) {
        Sentry.captureMessage(message, 'warning');
      }
    } catch (sentryError) {
      // Fallback to console if Sentry fails
      safeConsole.error(`Failed to send log to Sentry: ${sentryError}`);
    }
  }
}

/**
 * Create a logger instance for a specific module
 */
export function createLogger(module: string) {
  return {
    /**
     * Log a debug message
     * @param message The message to log
     * @param options Additional options for the log
     */
    debug: (message: string, options: LogOptions = {}) => {
      logWithLevel(LogLevel.DEBUG, module, message, options);
    },
    
    /**
     * Log an info message
     * @param message The message to log
     * @param options Additional options for the log
     */
    info: (message: string, options: LogOptions = {}) => {
      logWithLevel(LogLevel.INFO, module, message, options);
    },
    
    /**
     * Log a warning message
     * @param message The message to log
     * @param options Additional options for the log
     */
    warn: (message: string, options: LogOptions = {}) => {
      logWithLevel(LogLevel.WARN, module, message, options);
    },
    
    /**
     * Log an error message
     * @param message The message to log
     * @param options Additional options for the log
     */
    error: (message: string, options: LogOptions = {}) => {
      logWithLevel(LogLevel.ERROR, module, message, options);
    },
    
    /**
     * Start a performance measurement
     * @param label The label for the performance measurement
     */
    startPerformance: (label: string) => {
      performanceMarks[`${module}:${label}:start`] = performance.now();
    },
    
    /**
     * End a performance measurement and log the result
     * @param label The label for the performance measurement
     * @param options Additional options for the log
     */
    endPerformance: (label: string, options: LogOptions = {}) => {
      const startKey = `${module}:${label}:start`;
      const startTime = performanceMarks[startKey];
      
      if (!startTime) {
        logWithLevel(LogLevel.WARN, module, `Performance measurement "${label}" was never started`, {
          ...options,
          category: LogCategory.PERFORMANCE
        });
        return;
      }
      
      const duration = performance.now() - startTime;
      delete performanceMarks[startKey];
      
      logWithLevel(LogLevel.INFO, module, `Performance: ${label} took ${duration.toFixed(2)}ms`, {
        ...options,
        context: { ...options.context, duration },
        category: LogCategory.PERFORMANCE
      });
      
      return duration;
    },
    
    /**
     * Log a user action
     * @param action The action performed by the user
     * @param options Additional options for the log
     */
    userAction: (action: string, options: LogOptions = {}) => {
      logWithLevel(LogLevel.INFO, module, `User action: ${action}`, {
        ...options,
        category: LogCategory.USER_ACTION
      });
    }
  };
}

// Default logger for imports without creating a specific logger
export default createLogger('app');
