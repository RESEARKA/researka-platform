/**
 * Hook for managing user access levels
 * 
 * This hook provides a way to check a user's access level and determine
 * if they have access to specific features.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserAccessLevel, getUserAccessLevel, hasAccess } from '../utils/accessLevels';
import { createLogger, LogCategory } from '../utils/logger';

// Create a logger instance for this hook
const logger = createLogger('useUserAccess');

interface UseUserAccessReturn {
  accessLevel: UserAccessLevel;
  isLoading: boolean;
  error: string | null;
  hasAccess: (requiredLevel: UserAccessLevel) => boolean;
  checkAccess: () => Promise<void>;
}

/**
 * Hook for checking and managing user access levels
 * 
 * @returns Object with access level information and utility functions
 */
export function useUserAccess(): UseUserAccessReturn {
  const { currentUser, getUserProfile } = useAuth();
  const [accessLevel, setAccessLevel] = useState<UserAccessLevel>(UserAccessLevel.BASIC);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if the user has access to a feature requiring a specific access level
   * 
   * @param requiredLevel The access level required for the feature
   * @returns True if the user has sufficient access, false otherwise
   */
  const checkHasAccess = (requiredLevel: UserAccessLevel): boolean => {
    return hasAccess(requiredLevel, accessLevel);
  };

  /**
   * Check the user's access level
   */
  const checkAccess = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      logger.debug('Checking user access level', {
        category: LogCategory.AUTH
      });

      // If no user is logged in, set to basic access
      if (!currentUser) {
        logger.debug('No user logged in, setting BASIC access', {
          category: LogCategory.AUTH
        });
        setAccessLevel(UserAccessLevel.BASIC);
        setIsLoading(false);
        return;
      }

      // Get the user's profile
      const profile = await getUserProfile();
      
      // Log the full profile for debugging
      logger.debug('Retrieved user profile for access check', {
        context: { 
          profile: JSON.stringify(profile),
          uid: currentUser.uid,
          email: currentUser.email
        },
        category: LogCategory.AUTH
      });
      
      if (!profile) {
        logger.warn('No profile found for logged in user, setting BASIC access', {
          context: { uid: currentUser.uid },
          category: LogCategory.AUTH
        });
        setAccessLevel(UserAccessLevel.BASIC);
        setIsLoading(false);
        return;
      }
      
      // Determine the user's access level
      const level = getUserAccessLevel(profile);
      setAccessLevel(level);
      
      logger.debug(`User access level set to ${level}`, {
        context: { 
          level,
          profileComplete: profile.profileComplete,
          isComplete: profile.isComplete,
          name: profile.name,
          role: profile.role,
          institution: profile.institution
        },
        category: LogCategory.AUTH
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check user access';
      logger.error('Error checking user access', {
        context: { error: err },
        category: LogCategory.ERROR
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Check access level when component mounts or user changes
  useEffect(() => {
    checkAccess();
  }, [currentUser]);

  return {
    accessLevel,
    isLoading,
    error,
    hasAccess: checkHasAccess,
    checkAccess
  };
}
