// ORCID (Open Researcher and Contributor ID) service for handling ORCID verification and integration
// This service will be used to integrate with the ORCID API

/**
 * Interface for ORCID profile data
 */
export interface OrcidProfile {
  orcidId: string;
  name: string;
  biography?: string;
  email?: string;
  affiliations?: Array<{
    name: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    department?: string;
  }>;
  works?: Array<{
    title: string;
    type: string;
    publicationDate?: string;
    doi?: string;
    url?: string;
  }>;
  educations?: Array<{
    institution: string;
    department?: string;
    degree?: string;
    startDate?: string;
    endDate?: string;
  }>;
  isVerified: boolean;
}

/**
 * Interface for ORCID verification response
 */
export interface OrcidVerificationResponse {
  isValid: boolean;
  profile?: OrcidProfile;
  message?: string;
}

// Environment variables will be used for API keys in production
// For now, we'll use placeholder values
const ORCID_CLIENT_ID = 'placeholder_client_id';
const ORCID_CLIENT_SECRET = 'placeholder_client_secret';
const ORCID_API_URL = 'https://pub.orcid.org/v3.0';

/**
 * Validate an ORCID ID format
 * @param orcidId ORCID ID to validate
 * @returns boolean indicating if the format is valid
 */
export function isValidOrcidFormat(orcidId: string): boolean {
  // ORCID format validation regex
  // Format: 0000-0000-0000-0000 or 0000-0000-0000-000X
  const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
  return orcidRegex.test(orcidId);
}

/**
 * Verify an ORCID ID by checking if it exists and retrieving profile data
 * @param orcidId ORCID ID to verify
 * @returns Promise with verification response
 */
export async function verifyOrcid(orcidId: string): Promise<OrcidVerificationResponse> {
  try {
    // Validate ORCID format first
    if (!isValidOrcidFormat(orcidId)) {
      return {
        isValid: false,
        message: 'Invalid ORCID ID format. It should be in the format: 0000-0000-0000-0000'
      };
    }

    // For demo purposes, we're simulating an API call
    // In production, replace this with a real API call to ORCID API
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mock successful ORCID verification
    const mockProfile: OrcidProfile = {
      orcidId,
      name: 'Dr. Jane Researcher',
      biography: 'Researcher in computer science with focus on distributed systems and blockchain technology.',
      affiliations: [
        {
          name: 'Example University',
          role: 'Associate Professor',
          department: 'Computer Science',
          startDate: '2018-09-01'
        },
        {
          name: 'Research Institute',
          role: 'Visiting Researcher',
          startDate: '2020-01-01',
          endDate: '2020-12-31'
        }
      ],
      works: [
        {
          title: 'Blockchain Applications in Academic Publishing',
          type: 'journal-article',
          publicationDate: '2022-03-15',
          doi: '10.1234/example.doi.2022.03.001',
          url: 'https://example.org/papers/blockchain-publishing'
        },
        {
          title: 'Decentralized Peer Review Systems',
          type: 'conference-paper',
          publicationDate: '2021-06-22',
          url: 'https://example.org/conferences/decentralized-review'
        }
      ],
      educations: [
        {
          institution: 'Tech University',
          department: 'Computer Science',
          degree: 'PhD',
          startDate: '2012-09-01',
          endDate: '2016-06-30'
        },
        {
          institution: 'Science College',
          department: 'Computer Engineering',
          degree: 'MSc',
          startDate: '2010-09-01',
          endDate: '2012-06-30'
        }
      ],
      isVerified: true
    };
    
    return {
      isValid: true,
      profile: mockProfile
    };
  } catch (error) {
    console.error('ORCID verification error:', error);
    return {
      isValid: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred during ORCID verification'
    };
  }
}

/**
 * Get public profile data for an ORCID ID
 * @param orcidId ORCID ID to get profile for
 * @returns Promise with profile data or null if not found
 */
export async function getOrcidProfile(orcidId: string): Promise<OrcidProfile | null> {
  try {
    const verificationResponse = await verifyOrcid(orcidId);
    
    if (!verificationResponse.isValid || !verificationResponse.profile) {
      return null;
    }
    
    return verificationResponse.profile;
  } catch (error) {
    console.error('ORCID profile retrieval error:', error);
    return null;
  }
}

/**
 * Link an ORCID ID to a user account
 * @param userId User ID to link ORCID to
 * @param orcidId ORCID ID to link
 * @returns Promise with boolean indicating success
 */
export async function linkOrcidToUser(userId: string, orcidId: string): Promise<boolean> {
  try {
    // Validate ORCID format first
    if (!isValidOrcidFormat(orcidId)) {
      throw new Error('Invalid ORCID ID format');
    }
    
    // For demo purposes, we're simulating an API call
    // In production, replace this with a real API call to your backend
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock successful linking
    console.log(`Linked ORCID ${orcidId} to user ${userId}`);
    
    return true;
  } catch (error) {
    console.error('ORCID linking error:', error);
    return false;
  }
}

/**
 * Initiate ORCID OAuth authentication flow
 * This would redirect the user to ORCID for authentication
 */
export function initiateOrcidAuth(): void {
  // In production, this would redirect to ORCID OAuth endpoint
  // For demo purposes, we're just logging the action
  console.log('Initiating ORCID OAuth authentication flow');
  
  // Example of how this would work in production:
  // const redirectUri = encodeURIComponent(`${window.location.origin}/orcid-callback`);
  // const scope = encodeURIComponent('/authenticate');
  // window.location.href = `https://orcid.org/oauth/authorize?client_id=${ORCID_CLIENT_ID}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}`;
}

/**
 * Handle ORCID OAuth callback
 * @param authCode Authorization code from ORCID OAuth
 * @returns Promise with ORCID profile or null if authentication failed
 */
export async function handleOrcidAuthCallback(authCode: string): Promise<OrcidProfile | null> {
  try {
    // For demo purposes, we're simulating an API call
    // In production, replace this with a real API call to exchange auth code for token
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful authentication
    const mockProfile: OrcidProfile = {
      orcidId: '0000-0002-1825-0097',
      name: 'Dr. John Researcher',
      biography: 'Researcher in biology with focus on genomics.',
      affiliations: [
        {
          name: 'Biology University',
          role: 'Professor',
          department: 'Genomics',
          startDate: '2015-09-01'
        }
      ],
      isVerified: true
    };
    
    return mockProfile;
  } catch (error) {
    console.error('ORCID authentication error:', error);
    return null;
  }
}
