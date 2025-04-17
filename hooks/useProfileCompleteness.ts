import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useProfileData } from './useProfileData';
import { createLogger, LogCategory } from '../utils/logger';

const logger = createLogger('profile-completeness-hook');

interface ProfileFieldStatus {
  key: string;
  label: string;
  isComplete: boolean;
}

/**
 * Hook to check profile completeness and handle ORCID import
 */
export const useProfileCompleteness = () => {
  const { user } = useAuth();
  const { profile, updateProfile, isLoading } = useProfileData();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [fieldStatus, setFieldStatus] = useState<ProfileFieldStatus[]>([]);
  
  // Define required fields for a complete profile
  const requiredFields = [
    { key: 'name', label: 'Full Name' },
    { key: 'affiliation', label: 'University/Institution' },
    { key: 'orcidId', label: 'ORCID ID' },
    { key: 'bio', label: 'Short Bio' }
  ];
  
  useEffect(() => {
    if (!profile || isLoading) return;
    
    // Check each field's completion status
    const statusFields = requiredFields.map(field => {
      const value = profile[field.key as keyof typeof profile];
      const isComplete = Boolean(value) && (typeof value === 'string' ? value.trim() !== '' : true);
      
      return {
        ...field,
        isComplete
      };
    });
    
    setFieldStatus(statusFields);
    
    // Calculate completion percentage
    const completedCount = statusFields.filter(field => field.isComplete).length;
    const percentage = Math.round((completedCount / requiredFields.length) * 100);
    setCompletionPercentage(percentage);
    
  }, [profile, isLoading]);
  
  /**
   * Import data from ORCID and update profile
   * @param orcidData Data imported from ORCID
   */
  const importFromOrcid = async (orcidData: { name?: string; affiliation?: string }) => {
    if (!user) return;
    
    try {
      const updates: Record<string, any> = {};
      
      if (orcidData.name) {
        updates.name = orcidData.name;
      }
      
      if (orcidData.affiliation) {
        updates.affiliation = orcidData.affiliation;
      }
      
      // Only update if we have data to update
      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
        
        logger.debug('Profile updated from ORCID', {
          context: { updates },
          category: LogCategory.AUTH
        });
      }
    } catch (error) {
      logger.error('Failed to update profile from ORCID', {
        context: { error },
        category: LogCategory.ERROR
      });
      throw error;
    }
  };
  
  return {
    completionPercentage,
    fieldStatus,
    importFromOrcid,
    isLoading
  };
};
