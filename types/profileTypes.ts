/**
 * Types and enums for profile management
 */

/**
 * Profile update state enum
 * Used to track the current state of profile update operations
 */
export enum ProfileUpdateState {
  IDLE = 'idle',
  LOADING = 'loading',         // Initial data loading
  UPDATING = 'updating',       // Update in progress
  SAVING = 'saving',           // Saving to database
  SUCCESS = 'success',         // Update completed successfully
  ERROR = 'error',             // Error occurred
  TIMEOUT = 'timeout',         // Operation timed out
  RETRYING = 'retrying'        // Retry in progress
}

/**
 * Profile update operation type enum
 * Used for logging and debugging
 */
export enum ProfileOperation {
  FETCH = 'fetch',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}

/**
 * Profile update log entry
 * Used for detailed logging of profile operations
 */
export interface ProfileUpdateLog {
  timestamp: number;
  operation: ProfileOperation;
  state: ProfileUpdateState;
  message: string;
  data?: any;
  error?: Error | null;
}
