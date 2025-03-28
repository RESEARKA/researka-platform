/**
 * Utility to validate Firestore security rules by attempting test operations
 * This helps diagnose permission issues early and provides clear error messages
 */

import { collection, getDocs, query, limit, addDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { getFirebaseFirestore, initializeFirebase } from '../config/firebase';
import { isClientSide } from './imageOptimizer';

/**
 * Result of a Firestore rule validation test
 */
export interface RuleValidationResult {
  collection: string;
  operation: 'read' | 'write' | 'update' | 'delete';
  success: boolean;
  error?: string;
  timestamp: string;
}

/**
 * Test if the current user has read access to a collection
 * @param collectionPath The Firestore collection path to test
 * @returns Validation result with success status and error details if applicable
 */
export async function validateCollectionReadAccess(collectionPath: string): Promise<RuleValidationResult> {
  console.log(`FirestoreRuleValidator: Testing read access to collection '${collectionPath}'`);
  const result: RuleValidationResult = {
    collection: collectionPath,
    operation: 'read',
    success: false,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Ensure Firebase is initialized
    if (!isClientSide()) {
      result.error = 'Cannot validate Firestore rules on server side';
      return result;
    }
    
    // Initialize Firebase if needed
    const initialized = initializeFirebase();
    if (!initialized) {
      result.error = 'Failed to initialize Firebase';
      return result;
    }
    
    // Get Firestore instance
    const db = getFirebaseFirestore();
    if (!db) {
      result.error = 'Firestore not initialized';
      return result;
    }
    
    // Create a query that only gets one document to minimize data transfer
    const q = query(collection(db, collectionPath), limit(1));
    
    // Execute query
    const startTime = performance.now();
    await getDocs(q);
    const endTime = performance.now();
    
    // If we get here, the read was successful
    result.success = true;
    console.log(`FirestoreRuleValidator: Successfully read from '${collectionPath}' in ${(endTime - startTime).toFixed(2)}ms`);
    
    return result;
  } catch (error) {
    // Check for permission errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.error = errorMessage;
    
    if (errorMessage.includes('permission-denied') || errorMessage.includes('Missing or insufficient permissions')) {
      console.error(`FirestoreRuleValidator: Permission denied reading from '${collectionPath}'`, {
        error: errorMessage,
        collection: collectionPath,
        timestamp: result.timestamp
      });
      
      // Log detailed security rule information
      console.error(`
        Firestore Security Rule Issue:
        ------------------------------
        Collection: ${collectionPath}
        Operation: read
        Error: ${errorMessage}
        
        Current Security Rule (from firestore.rules):
        ${collectionPath === 'articles' ? 
          "match /articles/{articleId} { allow read: if true; }" : 
          "Unknown - check firestore.rules file"}
        
        Possible solutions:
        1. Ensure the security rules are deployed to Firebase
        2. Check if the collection path is correct
        3. Verify authentication state if read requires authentication
      `);
    }
    
    return result;
  }
}

/**
 * Validate all critical Firestore collections for the application
 * @returns Object with validation results for each collection
 */
export async function validateCriticalCollections(): Promise<Record<string, RuleValidationResult>> {
  console.log('FirestoreRuleValidator: Starting validation of critical collections');
  
  const results: Record<string, RuleValidationResult> = {};
  
  // Test articles collection (should be publicly readable)
  results.articles = await validateCollectionReadAccess('articles');
  
  // Add more collections as needed
  
  // Log overall results
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`FirestoreRuleValidator: Validation complete - ${successCount}/${totalCount} collections accessible`);
  
  if (successCount < totalCount) {
    console.error('FirestoreRuleValidator: Some collections are not accessible. Check the logs for details.');
  }
  
  return results;
}
