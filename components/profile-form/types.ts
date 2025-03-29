import { UserProfile } from '../../hooks/useProfileData';
import { verifyEmailDomain } from '../../utils/universityDomains';

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
  isExistingProfile?: boolean; // Flag to indicate if this is an existing profile
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
  isEditMode?: boolean;
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
 * @param formData Form data to convert
 * @param isEditMode Whether the form is in edit mode
 * @returns Partial user profile data
 */
export function formDataToUserProfile(formData: ProfileFormData, isEditMode = false): Partial<UserProfile> {
  // Create a base profile object
  const profile: Partial<UserProfile> = {
    researchInterests: formData.researchInterests || [],
    role: formData.role || '',
    wantsToBeEditor: formData.wantsToBeEditor || false
  };

  // Only include these fields if not in edit mode
  // This prevents these fields from being updated when editing a profile
  if (!isEditMode) {
    profile.name = `${formData.firstName} ${formData.lastName}`.trim();
    profile.email = formData.email;
    profile.institution = formData.institution;
    profile.department = formData.department;
    profile.profileComplete = true;
  }

  // Always include optional fields
  if (formData.twitter) profile.twitter = formData.twitter;
  if (formData.linkedin) profile.linkedin = formData.linkedin;
  if (formData.personalWebsite) profile.personalWebsite = formData.personalWebsite;
  if (formData.orcidId) profile.orcidId = formData.orcidId;

  // Include position only if it's provided and not in edit mode
  if (formData.position && !isEditMode) {
    profile.position = formData.position;
  }

  // Verify email domain for prestigious universities
  if (!isEditMode && formData.institution && formData.email) {
    const isDomainValid = verifyEmailDomain(formData.email, formData.institution);
    if (!isDomainValid) {
      throw new Error(`Email domain doesn't match the expected domain for ${formData.institution}`);
    }
  }

  return profile;
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
    researchInterests: Array.isArray(profile.researchInterests) ? profile.researchInterests : [],
    role: profile.role || 'Researcher',
    // Optional fields
    personalWebsite: profile.personalWebsite || '',
    orcidId: profile.orcidId || '',
    twitter: profile.twitter || '',
    linkedin: profile.linkedin || '',
    wantsToBeEditor: profile.wantsToBeEditor || false
  };
}
