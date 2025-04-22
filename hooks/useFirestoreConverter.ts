/**
 * useFirestoreConverter Hook
 * 
 * Custom hook for creating and using typed Firestore document converters.
 * This hook helps enforce schema rules and avoid runtime shape errors when working with Firestore.
 */

import { 
  DocumentData, 
  FirestoreDataConverter, 
  QueryDocumentSnapshot, 
  SnapshotOptions, 
  Timestamp 
} from 'firebase/firestore';
import { createLogger, LogCategory } from '../utils/logger';

// Create a logger instance for this hook
const logger = createLogger('useFirestoreConverter');

/**
 * Default options for the converter
 */
export interface ConverterOptions<T> {
  // Function to validate the data before converting
  validate?: (data: any) => boolean;
  // Function to transform Firestore data to app model
  fromFirestore?: (data: DocumentData) => Partial<T>;
  // Function to transform app model to Firestore data
  toFirestore?: (model: T) => DocumentData;
  // Whether to include document ID in the model
  includeId?: boolean;
  // Whether to convert Firestore timestamps to Date objects
  convertTimestamps?: boolean;
  // Fields that should be converted from Timestamp to Date
  timestampFields?: string[];
  // Default values for missing fields
  defaultValues?: Partial<T>;
}

/**
 * Custom hook for creating typed Firestore document converters
 * @param options Converter options
 * @returns Firestore data converter
 */
export function useFirestoreConverter<T extends { id?: string }>(
  options: ConverterOptions<T> = {}
): FirestoreDataConverter<T> {
  // Merge options with defaults
  const {
    validate = () => true,
    fromFirestore,
    toFirestore,
    includeId = true,
    convertTimestamps = true,
    timestampFields = ['createdAt', 'updatedAt', 'lastLogin', 'publishedDate', 'date'],
    defaultValues = {}
  } = options;

  /**
   * Convert Firestore timestamps to Date objects
   * @param data Firestore data
   * @returns Data with timestamps converted to Date objects
   */
  const convertTimestampsToDate = (data: DocumentData): DocumentData => {
    const result = { ...data };
    
    // Convert specified timestamp fields
    for (const field of timestampFields) {
      if (result[field] instanceof Timestamp) {
        result[field] = (result[field] as Timestamp).toDate();
      }
    }
    
    // Look for nested timestamps in objects
    for (const key in result) {
      if (result[key] && typeof result[key] === 'object' && !(result[key] instanceof Date)) {
        result[key] = convertTimestampsToDate(result[key]);
      }
    }
    
    return result;
  };

  /**
   * Convert Date objects to Firestore timestamps
   * @param data App data
   * @returns Data with Date objects converted to Firestore timestamps
   */
  const convertDatesToTimestamps = (data: DocumentData): DocumentData => {
    const result = { ...data };
    
    // Convert specified date fields
    for (const field of timestampFields) {
      if (result[field] instanceof Date) {
        result[field] = Timestamp.fromDate(result[field] as Date);
      }
    }
    
    // Look for nested dates in objects
    for (const key in result) {
      if (result[key] && typeof result[key] === 'object' && !(result[key] instanceof Timestamp)) {
        result[key] = convertDatesToTimestamps(result[key]);
      }
    }
    
    return result;
  };

  /**
   * Create the Firestore data converter
   */
  const converter: FirestoreDataConverter<T> = {
    /**
     * Convert Firestore data to app model
     */
    fromFirestore(
      snapshot: QueryDocumentSnapshot<DocumentData>,
      options?: SnapshotOptions
    ): T {
      try {
        // Get the data from the snapshot
        const data = snapshot.data(options);
        
        // Validate the data
        if (!validate(data)) {
          logger.warn('Invalid data from Firestore', {
            context: { path: snapshot.ref.path, data },
            category: LogCategory.DATA
          });
        }
        
        // Convert timestamps to Date objects if needed
        const processedData = convertTimestamps ? convertTimestampsToDate(data) : data;
        
        // Apply custom fromFirestore transformation if provided
        const transformedData = fromFirestore ? fromFirestore(processedData) : processedData;
        
        // Include document ID if needed
        const result = {
          ...defaultValues,
          ...transformedData,
          ...(includeId ? { id: snapshot.id } : {})
        } as T;
        
        return result;
      } catch (error) {
        logger.error('Error converting from Firestore', {
          context: { error, path: snapshot.ref.path },
          category: LogCategory.ERROR
        });
        
        // Return a basic object with ID in case of error
        return {
          ...defaultValues,
          ...(includeId ? { id: snapshot.id } : {})
        } as T;
      }
    },
    
    /**
     * Convert app model to Firestore data
     */
    toFirestore(modelObject: T): DocumentData {
      try {
        // Create a copy of the model object
        const model = { ...modelObject };
        
        // Remove the id field if it exists and includeId is false
        if (!includeId && 'id' in model) {
          delete model.id;
        }
        
        // Apply custom toFirestore transformation if provided
        const transformedData = toFirestore ? toFirestore(model) : model;
        
        // Convert Date objects to Firestore timestamps if needed
        const processedData = convertTimestamps ? convertDatesToTimestamps(transformedData) : transformedData;
        
        return processedData;
      } catch (error) {
        logger.error('Error converting to Firestore', {
          context: { error, model: modelObject },
          category: LogCategory.ERROR
        });
        
        // Return an empty object in case of error
        return {};
      }
    }
  };

  return converter;
}

/**
 * Create a Firestore converter for a specific model type
 * @param options Converter options
 * @returns Firestore data converter
 */
export function createFirestoreConverter<T extends { id?: string }>(
  options: ConverterOptions<T> = {}
): FirestoreDataConverter<T> {
  return useFirestoreConverter<T>(options);
}
