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
  
  // For existing users with complete profiles, always grant COMPLETE access
  // This ensures backward compatibility
  if (profile.profileComplete === true || profile.isComplete === true) {
    return UserAccessLevel.COMPLETE;
  }
  
  // Use a lenient check: only require 'name' and 'role'
  const essentialComplete = typeof profile.name === 'string' && profile.name.trim() !== '' &&
                          typeof profile.role === 'string' && profile.role.trim() !== '';
  
  // If the essential fields are complete, grant REVIEWER access
  if (essentialComplete) {
    logger.debug('User granted REVIEWER access based on essential fields', {
      context: { 
        name: !!profile.name,
        role: !!profile.role
      },
      category: LogCategory.DATA
    });
    return UserAccessLevel.REVIEWER;
  }
  
  // Otherwise, grant only basic access
  return UserAccessLevel.BASIC;
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
