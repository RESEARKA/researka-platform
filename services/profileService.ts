import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';
import { UserProfile } from '../hooks/useProfileData';
import { createLogger, LogCategory } from '../utils/logger';

// Create logger instance for this service
const logger = createLogger('profileService');

/**
 * Service for simplified profile management
 * Provides direct Firestore operations without complex state management
 */

/**
 * Saves a user profile directly to Firestore with minimal processing
 * This is a streamlined version that focuses on reliability for new users
 * 
 * @param userId The user's UID
 * @param profileData The profile data to save
 * @returns A promise that resolves to true if successful
 */
export async function saveUserProfile(
  userId: string,
  profileData: Partial<UserProfile>
): Promise<boolean> {
  try {
    // Log operation start
    logger.info(`Starting simplified profile save for user ${userId}`, {
      category: LogCategory.LIFECYCLE
    });

    // Validate inputs
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get Firestore instance
    const db = getFirebaseFirestore();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // Get the user document reference
    const userDocRef = doc(db, 'users', userId);
    
    // Check if the user document already exists
    const userDocSnapshot = await getDoc(userDocRef);
    
    // Prepare the data to save
    const now = new Date().toISOString();
    
    const dataToSave: Partial<UserProfile> = {
      ...profileData,
      uid: userId,                  // Ensure UID is set
      updatedAt: now,               // Always update the timestamp
      
      // Set completion flags based on essential fields
      isComplete: true,             // Mark as complete
      profileComplete: true,        // For backward compatibility
    };
    
    // Add createdAt only for new documents
    if (!userDocSnapshot.exists()) {
      dataToSave.createdAt = now;
      dataToSave.articleCount = 0;
      dataToSave.reviewCount = 0;
      dataToSave.reputation = 0;
    }
    
    // Log the data being saved
    logger.debug('Profile data being saved to Firestore', {
      context: { 
        isNewUser: !userDocSnapshot.exists(),
        fields: Object.keys(dataToSave)
      },
      category: LogCategory.DATA
    });
    
    // Write to Firestore - using setDoc with merge for robustness
    await setDoc(userDocRef, dataToSave, { merge: true });
    
    logger.info(`Successfully saved profile for user ${userId}`, {
      category: LogCategory.LIFECYCLE
    });
    
    return true;
  } catch (error) {
    // Log detailed error information
    logger.error('Error saving user profile', {
      context: { 
        userId, 
        error 
      },
      category: LogCategory.ERROR
    });
    
    return false;
  }
}

/**
 * Gets a user profile directly from Firestore
 * 
 * @param userId The user's UID
 * @returns The user profile or null if not found
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // Log operation start
    logger.info(`Getting profile for user ${userId}`, {
      category: LogCategory.LIFECYCLE
    });

    // Validate inputs
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get Firestore instance
    const db = getFirebaseFirestore();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // Get the user document reference
    const userDocRef = doc(db, 'users', userId);
    
    // Get the user document
    const userDocSnapshot = await getDoc(userDocRef);
    
    if (userDocSnapshot.exists()) {
      // User document exists, return the data
      return userDocSnapshot.data() as UserProfile;
    } else {
      // User document doesn't exist
      logger.info(`No profile found for user ${userId}`, {
        category: LogCategory.LIFECYCLE
      });
      return null;
    }
  } catch (error) {
    // Log detailed error information
    logger.error('Error getting user profile', {
      context: { 
        userId, 
        error 
      },
      category: LogCategory.ERROR
    });
    
    return null;
  }
}
