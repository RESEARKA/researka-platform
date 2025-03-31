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
  // Create a complete profile object with ALL fields from the form
  // This ensures nothing is lost during the conversion
  const profile: Partial<UserProfile> = {
    // Always include these fields regardless of edit mode
    name: `${formData.firstName} ${formData.lastName}`.trim(),
    email: formData.email,
    institution: formData.institution,
    department: formData.department,
    position: formData.position,
    researchInterests: formData.researchInterests || [],
    role: formData.role || '',
    
    // Include optional fields if they exist
    twitter: formData.twitter || undefined,
    linkedin: formData.linkedin || undefined,
    personalWebsite: formData.personalWebsite || undefined,
    orcidId: formData.orcidId || undefined,
    wantsToBeEditor: formData.wantsToBeEditor || false,
    
    // Always set profileComplete flag to ensure it's saved
    profileComplete: true,
    isComplete: true
  };

  // Remove undefined fields to avoid overwriting with undefined
  Object.keys(profile).forEach(key => {
    if (profile[key as keyof typeof profile] === undefined) {
      delete profile[key as keyof typeof profile];
    }
  });

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
  
  // Check if this is an existing profile that has been saved to the database
  // A profile with uid, createdAt, and a non-empty name is considered existing
  const isExistingProfile = !!(profile.uid && profile.createdAt && profile.name && profile.name.trim() !== '');
  
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
    wantsToBeEditor: profile.wantsToBeEditor || false,
    isExistingProfile: isExistingProfile
  };
}
