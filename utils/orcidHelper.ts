/**
 * Utility functions for working with the ORCID API
 */

/**
 * Interface for ORCID profile data
 */
export interface OrcidProfile {
  orcid: string;
  name: string;
  familyName: string;
  givenName: string;
  email?: string;
  affiliation?: string;
  biography?: string;
  works?: any[];
}

/**
 * Fetch a user's ORCID profile using their ORCID iD and access token
 * 
 * @param orcid - The ORCID identifier
 * @param accessToken - The OAuth access token
 * @returns The parsed ORCID profile data
 */
export async function fetchOrcidProfile(orcid: string, accessToken: string): Promise<OrcidProfile> {
  try {
    // Fetch the person data
    const personResponse = await fetch(`https://pub.orcid.org/v3.0/${orcid}/person`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!personResponse.ok) {
      throw new Error(`Failed to fetch ORCID profile: ${personResponse.statusText}`);
    }

    const personData = await personResponse.json();
    
    // Extract name components
    const givenName = personData.name?.['given-names']?.value || '';
    const familyName = personData.name?.['family-name']?.value || '';
    const fullName = `${givenName} ${familyName}`.trim();
    
    // Extract email if available and public
    let email = '';
    if (personData.emails && personData.emails.email && personData.emails.email.length > 0) {
      const primaryEmail = personData.emails.email.find(e => e.primary) || personData.emails.email[0];
      email = primaryEmail.email || '';
    }
    
    // Extract biography if available
    const biography = personData.biography?.content || '';
    
    // Extract affiliation information
    let affiliation = '';
    if (personData.employments && 
        personData.employments['employment-summary'] && 
        personData.employments['employment-summary'].length > 0) {
      const latestEmployment = personData.employments['employment-summary'][0];
      affiliation = latestEmployment.organization?.name || '';
    }
    
    // Return the parsed profile data
    return {
      orcid,
      name: fullName,
      givenName,
      familyName,
      email,
      affiliation,
      biography
    };
  } catch (error) {
    console.error('Error fetching ORCID profile:', error);
    throw error;
  }
}

/**
 * Fetch a user's works/publications from ORCID
 * 
 * @param orcid - The ORCID identifier
 * @param accessToken - The OAuth access token
 * @returns Array of works/publications
 */
export async function fetchOrcidWorks(orcid: string, accessToken: string): Promise<any[]> {
  try {
    const worksResponse = await fetch(`https://pub.orcid.org/v3.0/${orcid}/works`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!worksResponse.ok) {
      throw new Error(`Failed to fetch ORCID works: ${worksResponse.statusText}`);
    }

    const worksData = await worksResponse.json();
    
    // Extract and parse works data
    const works = worksData.group || [];
    
    // Transform the works data into a more usable format
    return works.map(group => {
      const workSummary = group['work-summary']?.[0] || {};
      
      return {
        title: workSummary.title?.title?.value || 'Untitled Work',
        type: workSummary.type || 'unknown',
        publicationDate: workSummary['publication-date'] ? {
          year: workSummary['publication-date'].year?.value,
          month: workSummary['publication-date'].month?.value,
          day: workSummary['publication-date'].day?.value
        } : null,
        url: workSummary.url?.value || '',
        externalIds: workSummary['external-ids']?.['external-id'] || [],
        source: workSummary.source?.['source-name']?.value || 'Unknown Source'
      };
    });
  } catch (error) {
    console.error('Error fetching ORCID works:', error);
    throw error;
  }
}

/**
 * Format an ORCID iD for display
 * 
 * @param orcid - The ORCID identifier
 * @returns Formatted ORCID iD with proper spacing
 */
export function formatOrcidId(orcid: string): string {
  if (!orcid) return '';
  
  // Remove any non-alphanumeric characters
  const cleanOrcid = orcid.replace(/[^0-9X]/gi, '');
  
  // Format with proper spacing
  if (cleanOrcid.length === 16) {
    return `${cleanOrcid.slice(0, 4)}-${cleanOrcid.slice(4, 8)}-${cleanOrcid.slice(8, 12)}-${cleanOrcid.slice(12, 16)}`;
  }
  
  return orcid;
}
