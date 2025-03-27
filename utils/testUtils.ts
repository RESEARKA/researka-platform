/**
 * Test utilities for profile flow testing
 * 
 * This file contains helper functions to test the user profile flow,
 * including signup, profile completion, and profile editing.
 */

import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile } from '../hooks/useProfileData';

/**
 * Clears the current user session by signing out
 */
export const clearUserSession = async (): Promise<void> => {
  try {
    const auth = getAuth();
    await signOut(auth);
    console.log('[TestUtils] User signed out successfully');
    
    // Clear any local storage or cookies related to the session
    localStorage.clear();
    sessionStorage.clear();
    
    // Wait for a moment to ensure all auth state changes are processed
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error('[TestUtils] Error signing out:', error);
    throw error;
  }
};

/**
 * Checks if a user profile exists in Firestore
 * @param userId The user ID to check
 * @returns True if the profile exists, false otherwise
 */
export const checkUserProfileExists = async (userId: string): Promise<boolean> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists();
  } catch (error) {
    console.error('[TestUtils] Error checking user profile:', error);
    return false;
  }
};

/**
 * Gets the current user profile from Firestore
 * @param userId The user ID to get the profile for
 * @returns The user profile or null if it doesn't exist
 */
export const getCurrentUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('[TestUtils] Error getting user profile:', error);
    return null;
  }
};

/**
 * Creates a test user profile in Firestore
 * @param userId The user ID to create the profile for
 * @param profileData The profile data to set
 */
export const createTestUserProfile = async (
  userId: string, 
  profileData: Partial<UserProfile>
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    
    // Create default profile with required fields
    const defaultProfile: UserProfile = {
      name: 'Test User',
      email: 'test@example.edu',
      institution: 'Test University',
      department: 'Computer Science',
      position: 'Researcher',
      researchInterests: ['AI', 'Machine Learning'],
      role: 'Researcher',
      hasChangedName: false,
      hasChangedInstitution: false,
      articles: 0,
      reviews: 0,
      reputation: 0,
      profileComplete: true,
      ...profileData
    };
    
    await setDoc(userDocRef, defaultProfile);
    console.log('[TestUtils] Test user profile created successfully');
  } catch (error) {
    console.error('[TestUtils] Error creating test user profile:', error);
    throw error;
  }
};

/**
 * Deletes a test user profile from Firestore
 * @param userId The user ID to delete the profile for
 */
export const deleteTestUserProfile = async (userId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
    console.log('[TestUtils] Test user profile deleted successfully');
  } catch (error) {
    console.error('[TestUtils] Error deleting test user profile:', error);
    throw error;
  }
};

/**
 * Simulates a profile completion flow
 * @param userId The user ID to complete the profile for
 * @param profileData The profile data to set
 */
export const simulateProfileCompletion = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<void> => {
  try {
    // First check if the user profile exists
    const exists = await checkUserProfileExists(userId);
    
    if (!exists) {
      // Create a new profile with the provided data
      await createTestUserProfile(userId, {
        ...profileData,
        profileComplete: true
      });
    } else {
      // Update the existing profile
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        ...profileData,
        profileComplete: true
      }, { merge: true });
    }
    
    console.log('[TestUtils] Profile completion simulated successfully');
  } catch (error) {
    console.error('[TestUtils] Error simulating profile completion:', error);
    throw error;
  }
};

/**
 * Logs the current state of the profile flow
 * @param userId The user ID to log the state for
 */
export const logProfileFlowState = async (userId: string | null): Promise<void> => {
  console.log('[TestUtils] Profile Flow State:');
  console.log('- User ID:', userId);
  
  if (!userId) {
    console.log('- No user is currently signed in');
    return;
  }
  
  try {
    const profile = await getCurrentUserProfile(userId);
    console.log('- Profile exists:', !!profile);
    
    if (profile) {
      console.log('- Profile data:', profile);
      console.log('- Profile complete:', profile.profileComplete);
      console.log('- Has changed name:', profile.hasChangedName);
      console.log('- Has changed institution:', profile.hasChangedInstitution);
    }
  } catch (error) {
    console.error('[TestUtils] Error logging profile flow state:', error);
  }
};
