/**
 * Access levels utility for DecentraJournal
 * 
 * This utility provides a tiered access system to control feature access
 * based on the completeness of a user's profile.
 */
import { UserProfile } from '../types/user';
import { createLogger, LogCategory } from './logger';

// Create a logger instance for this utility
const logger = createLogger('accessLevels');

/**
 * Enum representing different user access levels
 */
export enum UserAccessLevel {
  BASIC = 'basic',         // Can view content only
  REVIEWER = 'reviewer',   // Can review articles
  SUBMITTER = 'submitter', // Can submit articles
  COMPLETE = 'complete'    // Has full profile completion
}

/**
 * Determines a user's access level based on their profile
 * 
 * @param profile The user's profile object
 * @returns The appropriate access level
 */
export function getUserAccessLevel(profile: UserProfile | null): UserAccessLevel {
  // No profile means basic access only
  if (!profile) {
    return UserAccessLevel.BASIC;
  }
  
  // Instead of checking strict profileComplete flag,
  // we use our lenient check for review access.
  const isComplete = profile.profileComplete || checkProfileComplete(profile);
  
  return isComplete ? UserAccessLevel.COMPLETE : UserAccessLevel.REVIEWER;
}

/**
 * Checks if a profile is considered complete based on required fields
 * Updated to be more lenient - only requiring name and role fields
 */
function checkProfileComplete(profileData: UserProfile | null): boolean {
  if (!profileData) return false;

  // Only require essential fields for review access
  const requiredFields: (keyof UserProfile)[] = ['name', 'role'];
  return requiredFields.every(field => {
    const value = profileData[field];
    return typeof value === 'string' && value.trim().length > 0;
  });
}

/**
 * Ensures all profile fields have proper defaults
 * 
 * @param profile The user's profile object
 * @returns A profile object with all fields properly initialized
 */
export function ensureProfileFields(profile: UserProfile): UserProfile {
  // Ensure all fields exist with proper defaults
  const ensuredProfile = {
    ...profile,
    name: profile.name || '',
    role: profile.role || '',
    institution: profile.institution || '',
    profileComplete: profile.profileComplete || false,
    isComplete: profile.isComplete || false,
    // Add other fields as needed
  };
  
  logger.debug('Ensured profile fields', {
    context: {
      before: profile,
      after: ensuredProfile
    },
    category: LogCategory.DATA
  });
  
  return ensuredProfile;
}

/**
 * Checks if a user has access to a specific feature
 * 
 * @param requiredLevel The access level required for the feature
 * @param userLevel The user's current access level
 * @returns True if the user has sufficient access, false otherwise
 */
export function hasAccess(requiredLevel: UserAccessLevel, userLevel: UserAccessLevel): boolean {
  // Define the hierarchy of access levels
  const accessHierarchy = [
    UserAccessLevel.BASIC,
    UserAccessLevel.REVIEWER,
    UserAccessLevel.SUBMITTER,
    UserAccessLevel.COMPLETE
  ];
  
  // Get the numeric values of the access levels
  const requiredValue = accessHierarchy.indexOf(requiredLevel);
  const userValue = accessHierarchy.indexOf(userLevel);
  
  // Check if user's access level is sufficient
  const hasAccess = userValue >= requiredValue;
  
  logger.debug('Access check', {
    context: {
      requiredLevel,
      userLevel,
      hasAccess
    },
    category: LogCategory.AUTH
  });
  
  return hasAccess;
}
