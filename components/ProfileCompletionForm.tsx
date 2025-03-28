// This is a transitional component that uses the new modular architecture
// while maintaining backward compatibility with existing code
import React from 'react';
import { UserProfile } from '../hooks/useProfileData';
import { ProfileFormStepper } from './profile-form';
import { createLogger, LogCategory } from '../utils/logger';

// Create a logger instance for this component
const logger = createLogger('ProfileCompletionForm');

/**
 * ProfileCompletionForm component
 * A wrapper around the ProfileFormStepper component for backward compatibility
 */
const ProfileCompletionForm: React.FC<{
  onSave: (profileData: Partial<UserProfile>) => Promise<boolean>;
  initialData?: UserProfile;
  isEditMode?: boolean;
  onCancel?: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}> = (props) => {
  logger.debug('ProfileCompletionForm rendered with props', {
    context: {
      hasInitialData: !!props.initialData,
      isEditMode: props.isEditMode,
      isDisabled: props.isDisabled,
      isLoading: props.isLoading
    },
    category: LogCategory.UI
  });
  
  return <ProfileFormStepper {...props} />;
};

export default ProfileCompletionForm;
