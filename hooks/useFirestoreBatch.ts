/**
 * useFirestoreBatch Hook
 * 
 * Custom hook for managing Firestore batch operations.
 * This hook helps improve performance and reduce billing costs by batching multiple write operations.
 */

import { useState, useCallback } from 'react';
import {
  writeBatch,
  WriteBatch,
  DocumentReference,
  Firestore,
  setDoc,
  updateDoc,
  deleteDoc,
  DocumentData
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';
import { createLogger, LogCategory } from '../utils/logger';

// Create a logger instance for this hook
const logger = createLogger('useFirestoreBatch');

// Maximum number of operations in a single batch
const MAX_BATCH_SIZE = 500;

/**
 * Batch operation types
 */
export enum BatchOperationType {
  SET = 'set',
  UPDATE = 'update',
  DELETE = 'delete'
}

/**
 * Batch operation interface
 */
export interface BatchOperation {
  type: BatchOperationType;
  ref: DocumentReference;
  data?: DocumentData;
  options?: { merge?: boolean };
}

/**
 * Batch result interface
 */
export interface BatchResult {
  success: boolean;
  operationsCount: number;
  error?: Error;
}

/**
 * Custom hook for managing Firestore batch operations
 * @returns Batch operations utilities
 */
export function useFirestoreBatch() {
  // Get Firestore instance
  const db = getFirebaseFirestore();
  
  // State for tracking operations and batches
  const [operations, setOperations] = useState<BatchOperation[]>([]);
  const [batches, setBatches] = useState<WriteBatch[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);
  
  /**
   * Initialize a new batch
   */
  const initBatch = useCallback(() => {
    if (!db) {
      logger.error('Cannot initialize batch - Firestore not initialized', {
        category: LogCategory.ERROR
      });
      return null;
    }
    
    const batch = writeBatch(db);
    setBatches(prev => [...prev, batch]);
    return batch;
  }, [db]);
  
  /**
   * Get the current batch or create a new one if needed
   */
  const getCurrentBatch = useCallback(() => {
    if (batches.length === 0 || operations.length % MAX_BATCH_SIZE === 0) {
      return initBatch();
    }
    
    return batches[batches.length - 1];
  }, [batches, operations.length, initBatch]);
  
  /**
   * Add a set operation to the batch
   */
  const set = useCallback((
    ref: DocumentReference,
    data: DocumentData,
    options?: { merge?: boolean }
  ) => {
    if (!db) {
      logger.error('Cannot add set operation - Firestore not initialized', {
        category: LogCategory.ERROR
      });
      return;
    }
    
    const batch = getCurrentBatch();
    if (!batch) return;
    
    batch.set(ref, data, options);
    
    setOperations(prev => [
      ...prev,
      { type: BatchOperationType.SET, ref, data, options }
    ]);
    
    logger.debug('Added set operation to batch', {
      context: { path: ref.path, dataKeys: Object.keys(data) },
      category: LogCategory.DATA
    });
  }, [db, getCurrentBatch]);
  
  /**
   * Add an update operation to the batch
   */
  const update = useCallback((
    ref: DocumentReference,
    data: DocumentData
  ) => {
    if (!db) {
      logger.error('Cannot add update operation - Firestore not initialized', {
        category: LogCategory.ERROR
      });
      return;
    }
    
    const batch = getCurrentBatch();
    if (!batch) return;
    
    batch.update(ref, data);
    
    setOperations(prev => [
      ...prev,
      { type: BatchOperationType.UPDATE, ref, data }
    ]);
    
    logger.debug('Added update operation to batch', {
      context: { path: ref.path, dataKeys: Object.keys(data) },
      category: LogCategory.DATA
    });
  }, [db, getCurrentBatch]);
  
  /**
   * Add a delete operation to the batch
   */
  const del = useCallback((
    ref: DocumentReference
  ) => {
    if (!db) {
      logger.error('Cannot add delete operation - Firestore not initialized', {
        category: LogCategory.ERROR
      });
      return;
    }
    
    const batch = getCurrentBatch();
    if (!batch) return;
    
    batch.delete(ref);
    
    setOperations(prev => [
      ...prev,
      { type: BatchOperationType.DELETE, ref }
    ]);
    
    logger.debug('Added delete operation to batch', {
      context: { path: ref.path },
      category: LogCategory.DATA
    });
  }, [db, getCurrentBatch]);
  
  /**
   * Commit all batches
   */
  const commit = useCallback(async (): Promise<BatchResult> => {
    if (!db) {
      const error = new Error('Cannot commit batch - Firestore not initialized');
      logger.error('Cannot commit batch - Firestore not initialized', {
        category: LogCategory.ERROR
      });
      return { success: false, operationsCount: 0, error };
    }
    
    if (batches.length === 0) {
      logger.info('No operations to commit', {
        category: LogCategory.DATA
      });
      return { success: true, operationsCount: 0 };
    }
    
    try {
      setIsCommitting(true);
      
      logger.info('Committing batch operations', {
        context: { 
          batchCount: batches.length, 
          operationsCount: operations.length 
        },
        category: LogCategory.DATA
      });
      
      // Commit all batches in sequence
      for (const batch of batches) {
        await batch.commit();
      }
      
      logger.info('Batch operations committed successfully', {
        context: { 
          batchCount: batches.length, 
          operationsCount: operations.length 
        },
        category: LogCategory.DATA
      });
      
      // Reset state
      setBatches([]);
      setOperations([]);
      
      return { 
        success: true, 
        operationsCount: operations.length 
      };
    } catch (error: any) {
      logger.error('Error committing batch operations', {
        context: { 
          error, 
          batchCount: batches.length, 
          operationsCount: operations.length 
        },
        category: LogCategory.ERROR
      });
      
      return { 
        success: false, 
        operationsCount: operations.length,
        error
      };
    } finally {
      setIsCommitting(false);
    }
  }, [db, batches, operations]);
  
  /**
   * Clear all pending operations
   */
  const clear = useCallback(() => {
    setBatches([]);
    setOperations([]);
    
    logger.info('Cleared all pending batch operations', {
      category: LogCategory.DATA
    });
  }, []);
  
  /**
   * Execute a function with batch operations and automatically commit
   */
  const withBatch = useCallback(async <T>(
    fn: (batchUtils: { set: typeof set, update: typeof update, delete: typeof del }) => Promise<T>
  ): Promise<{ result: T, batchResult: BatchResult }> => {
    try {
      // Clear any existing operations
      clear();
      
      // Execute the function with batch operations
      const result = await fn({ set, update, delete: del });
      
      // Commit the batch
      const batchResult = await commit();
      
      return { result, batchResult };
    } catch (error: any) {
      logger.error('Error in withBatch operation', {
        context: { error },
        category: LogCategory.ERROR
      });
      
      // Clear operations on error
      clear();
      
      throw error;
    }
  }, [set, update, del, commit, clear]);
  
  return {
    set,
    update,
    delete: del,
    commit,
    clear,
    withBatch,
    operations,
    operationsCount: operations.length,
    isCommitting,
    db
  };
}

/**
 * Helper function to perform batch operations on a collection
 * @param db Firestore instance
 * @param operations Batch operations to perform
 * @returns Promise with batch result
 */
export async function performBatchOperations(
  db: Firestore,
  operations: BatchOperation[]
): Promise<BatchResult> {
  if (!db) {
    const error = new Error('Cannot perform batch operations - Firestore not initialized');
    logger.error('Cannot perform batch operations - Firestore not initialized', {
      category: LogCategory.ERROR
    });
    return { success: false, operationsCount: 0, error };
  }
  
  if (operations.length === 0) {
    logger.info('No operations to perform', {
      category: LogCategory.DATA
    });
    return { success: true, operationsCount: 0 };
  }
  
  try {
    logger.info('Performing batch operations', {
      context: { operationsCount: operations.length },
      category: LogCategory.DATA
    });
    
    // Split operations into batches of MAX_BATCH_SIZE
    const batches: WriteBatch[] = [];
    for (let i = 0; i < operations.length; i += MAX_BATCH_SIZE) {
      batches.push(writeBatch(db));
    }
    
    // Add operations to batches
    operations.forEach((operation, index) => {
      const batchIndex = Math.floor(index / MAX_BATCH_SIZE);
      const batch = batches[batchIndex];
      
      switch (operation.type) {
        case BatchOperationType.SET:
          batch.set(operation.ref, operation.data || {}, operation.options);
          break;
        case BatchOperationType.UPDATE:
          batch.update(operation.ref, operation.data || {});
          break;
        case BatchOperationType.DELETE:
          batch.delete(operation.ref);
          break;
      }
    });
    
    // Commit all batches in sequence
    for (const batch of batches) {
      await batch.commit();
    }
    
    logger.info('Batch operations performed successfully', {
      context: { 
        batchCount: batches.length, 
        operationsCount: operations.length 
      },
      category: LogCategory.DATA
    });
    
    return { 
      success: true, 
      operationsCount: operations.length 
    };
  } catch (error: any) {
    logger.error('Error performing batch operations', {
      context: { 
        error, 
        operationsCount: operations.length 
      },
      category: LogCategory.ERROR
    });
    
    return { 
      success: false, 
      operationsCount: operations.length,
      error
    };
  }
}
