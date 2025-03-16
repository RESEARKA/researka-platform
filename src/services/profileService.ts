import { User } from './authService';
import { verifyOrcid } from './orcidService';

// Profile data interface
export interface ProfileData {
  name: string;
  institution: string;
  bio: string;
  orcid: string;
  profilePicture?: File | null;
}

// Extended user profile interface
export interface UserProfile extends User {
  name: string;
  institution: string;
  bio: string;
  orcid: string;
  orcidVerified: boolean;
  orcidLastVerified?: string;
  joinDate: string;
  publications: number;
  reviews: number;
  profilePictureUrl?: string;
}

/**
 * Get the current user's profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  try {
    // For demo purposes, we're simulating an API call
    // In production, replace this with a real API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock user profile data
    const mockProfile: UserProfile = {
      id: '123456789',
      username: 'drjanesmith',
      email: 'jane.smith@university.edu',
      role: 'reviewer',
      name: 'Dr. Jane Smith',
      walletAddress: '0xabc1...def2',
      institution: 'University of Blockchain Science',
      joinDate: '2024-11-15',
      bio: 'Researcher in decentralized systems and blockchain applications in academia.',
      orcid: '0000-0001-2345-6789',
      orcidVerified: true,
      orcidLastVerified: '2024-12-10',
      publications: 5,
      reviews: 12,
      profilePictureUrl: undefined,
      isVerified: true,
      verificationStatus: 'verified'
    };
    
    return mockProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

/**
 * Update the user's profile
 */
export async function updateProfile(profileData: ProfileData): Promise<UserProfile> {
  try {
    // For demo purposes, we're simulating an API call
    // In production, replace this with a real API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if ORCID was updated and verify it if needed
    let orcidVerified = false;
    let orcidLastVerified: string | undefined = undefined;
    
    if (profileData.orcid) {
      try {
        const verification = await verifyOrcid(profileData.orcid);
        orcidVerified = verification.isValid;
        if (orcidVerified) {
          orcidLastVerified = new Date().toISOString().split('T')[0];
        }
      } catch (err) {
        console.error('ORCID verification error:', err);
        // Continue with profile update even if ORCID verification fails
      }
    }
    
    // Mock updated profile
    const mockUpdatedProfile: UserProfile = {
      id: '123456789',
      username: 'drjanesmith',
      email: 'jane.smith@university.edu',
      role: 'reviewer',
      name: profileData.name,
      walletAddress: '0xabc1...def2',
      institution: profileData.institution,
      joinDate: '2024-11-15',
      bio: profileData.bio,
      orcid: profileData.orcid,
      orcidVerified,
      orcidLastVerified,
      publications: 5,
      reviews: 12,
      profilePictureUrl: profileData.profilePicture ? URL.createObjectURL(profileData.profilePicture) : undefined,
      isVerified: true,
      verificationStatus: 'verified'
    };
    
    return mockUpdatedProfile;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Verify ORCID ID
 */
export async function verifyUserOrcid(orcidId: string): Promise<{success: boolean; message: string}> {
  try {
    const verification = await verifyOrcid(orcidId);
    
    if (verification.isValid) {
      return {
        success: true,
        message: 'ORCID ID verified successfully'
      };
    } else {
      return {
        success: false,
        message: verification.message || 'ORCID verification failed'
      };
    }
  } catch (error) {
    console.error('Error verifying ORCID:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred during verification'
    };
  }
}

/**
 * Upload a profile picture
 */
export async function uploadProfilePicture(file: File): Promise<string> {
  try {
    // For demo purposes, we're simulating an API call
    // In production, replace this with a real API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a temporary URL for the uploaded file
    const imageUrl = URL.createObjectURL(file);
    
    return imageUrl;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
}
