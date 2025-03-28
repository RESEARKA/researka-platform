import { UserProfile } from '../../hooks/useProfileData';

/**
 * Profile form data structure with strongly typed fields
 */
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  department: string;
  position: string;
  researchInterests: string[];
  role: string;
  twitter?: string;
  linkedin?: string;
  personalWebsite?: string;
  orcidId?: string;
  wantsToBeEditor?: boolean;
}

/**
 * Base props shared by all profile form components
 */
export interface BaseFormSectionProps {
  formData: ProfileFormData;
  errors: Record<string, string>;
  onChange: (name: string, value: any) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

/**
 * Form step definition
 */
export interface FormStep {
  title: string;
  description: string;
  key: string;
}

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Form section validation function type
 */
export type FormSectionValidator = (data: ProfileFormData) => ValidationResult;

/**
 * Convert profile form data to user profile data
 */
export function formDataToUserProfile(formData: ProfileFormData): Partial<UserProfile> {
  return {
    name: `${formData.firstName} ${formData.lastName}`.trim(),
    email: formData.email,
    institution: formData.institution,
    department: formData.department,
    position: formData.position,
    researchInterests: formData.researchInterests,
    role: formData.role,
    profileComplete: true,
    // Only include optional fields if they have values
    ...(formData.personalWebsite ? { personalWebsite: formData.personalWebsite } : {}),
    ...(formData.orcidId ? { orcidId: formData.orcidId } : {}),
    ...(formData.twitter ? { twitter: formData.twitter } : {}),
    ...(formData.linkedin ? { linkedin: formData.linkedin } : {}),
    wantsToBeEditor: formData.wantsToBeEditor || false
  };
}

/**
 * Convert user profile to form data
 */
export function userProfileToFormData(profile: UserProfile): ProfileFormData {
  // Parse name into first and last name
  const nameParts = (profile.name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return {
    firstName,
    lastName,
    email: profile.email || '',
    institution: profile.institution || '',
    department: profile.department || '',
    position: profile.position || '',
    researchInterests: profile.researchInterests || [],
    role: profile.role || 'Researcher',
    // Optional fields
    personalWebsite: profile.personalWebsite || '',
    orcidId: profile.orcidId || '',
    twitter: profile.twitter || '',
    linkedin: profile.linkedin || '',
    wantsToBeEditor: profile.wantsToBeEditor || false
  };
}
