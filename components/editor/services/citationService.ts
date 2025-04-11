import { Cite } from 'citation-js';
import { v4 as uuidv4 } from 'uuid';
import { Citation, CitationFormat, Author } from '../types/citation';
import { createLogger, LogCategory } from '../../../utils/logger';

const logger = createLogger('citation-service');

/**
 * Fetch citation data from a DOI
 * @param doi Digital Object Identifier
 * @returns Promise resolving to a Citation object
 */
export async function fetchCitationFromDOI(doi: string): Promise<Citation> {
  try {
    // Clean the DOI - remove any prefixes like https://doi.org/
    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//i, '');
    
    // Use Citation.js to fetch the metadata
    const cite = await Cite.async(cleanDoi);
    if (!cite) {
      throw new Error('Failed to fetch citation data');
    }
    
    const data = cite.data[0];
    if (!data) {
      throw new Error('No citation data found');
    }
    
    // Map the Citation.js data to our Citation type
    const citation: Citation = {
      id: uuidv4(),
      doi: cleanDoi,
      title: data.title || 'Unknown Title',
      authors: mapAuthors(data.author),
      journal: data['container-title'] || data.journal,
      publisher: data.publisher,
      year: data.issued?.['date-parts']?.[0]?.[0] || new Date().getFullYear(),
      volume: data.volume,
      issue: data.issue,
      pages: data.page,
      type: mapResourceType(data.type),
      addedAt: Date.now()
    };
    
    return citation;
  } catch (error) {
    logger.error('Error fetching citation from DOI', {
      context: { doi, error },
      category: LogCategory.ERROR
    });
    throw new Error(`Failed to fetch citation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch citation data from a URL
 * @param url URL to fetch citation data from
 * @returns Promise resolving to a Citation object
 */
export async function fetchCitationFromURL(url: string): Promise<Citation> {
  try {
    // Use Citation.js to fetch the metadata
    const cite = await Cite.async(url);
    if (!cite) {
      throw new Error('Failed to fetch citation data');
    }
    
    const data = cite.data[0];
    if (!data) {
      throw new Error('No citation data found');
    }
    
    // If we couldn't get proper metadata, create a basic citation
    if (!data.title) {
      // Try to fetch the page title
      const response = await fetch(url);
      const html = await response.text();
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'Unknown Web Page';
      
      return {
        id: uuidv4(),
        url,
        title,
        authors: [],
        year: new Date().getFullYear(),
        type: 'website',
        addedAt: Date.now()
      };
    }
    
    // Map the Citation.js data to our Citation type
    const citation: Citation = {
      id: uuidv4(),
      url,
      title: data.title,
      authors: mapAuthors(data.author),
      publisher: data.publisher,
      year: data.issued?.['date-parts']?.[0]?.[0] || new Date().getFullYear(),
      type: mapResourceType(data.type),
      addedAt: Date.now()
    };
    
    return citation;
  } catch (error) {
    logger.error('Error fetching citation from URL', {
      context: { url, error },
      category: LogCategory.ERROR
    });
    throw new Error(`Failed to fetch citation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Format a citation according to the specified style
 * @param citation Citation object to format
 * @param format Citation format (APA, MLA, etc.)
 * @returns Formatted citation string
 */
export function formatCitation(citation: Citation, format: CitationFormat = 'apa'): string {
  try {
    // Create a Citation.js compatible object
    const citeData = {
      id: citation.id,
      type: citation.type === 'website' ? 'webpage' : citation.type,
      title: citation.title,
      author: citation.authors.map(author => ({
        given: author.given,
        family: author.family
      })),
      'container-title': citation.journal,
      publisher: citation.publisher,
      issued: { 'date-parts': [[citation.year]] },
      volume: citation.volume,
      issue: citation.issue,
      page: citation.pages,
      DOI: citation.doi,
      URL: citation.url
    };
    
    // Create a new Cite instance
    const cite = new Cite(citeData);
    
    // Map our format to Citation.js format
    const formatMap: Record<CitationFormat, string> = {
      apa: 'citation-apa',
      mla: 'citation-mla',
      chicago: 'citation-chicago',
      harvard: 'citation-harvard',
      ieee: 'citation-vancouver'
    };
    
    // Get the formatted citation
    return cite.format(formatMap[format], {
      format: 'text',
      template: 'text'
    });
  } catch (error) {
    logger.error('Error formatting citation', {
      context: { citation, format, error },
      category: LogCategory.ERROR
    });
    
    // Fallback to a basic format if Citation.js fails
    const authors = citation.authors.map(a => `${a.family}, ${a.given}`).join(', ');
    return `${authors} (${citation.year}). ${citation.title}. ${citation.journal || ''}`;
  }
}

/**
 * Create a manual citation entry
 * @param data Partial citation data
 * @returns Citation object
 */
export function createManualCitation(data: Partial<Citation>): Citation {
  return {
    id: uuidv4(),
    title: data.title || 'Untitled Reference',
    authors: data.authors || [],
    year: data.year || new Date().getFullYear(),
    journal: data.journal,
    publisher: data.publisher,
    volume: data.volume,
    issue: data.issue,
    pages: data.pages,
    doi: data.doi,
    url: data.url,
    type: data.type || 'other',
    addedAt: Date.now()
  };
}

// Helper functions

/**
 * Map author data from Citation.js to our Author type
 */
function mapAuthors(authors: any[] = []): Author[] {
  if (!authors || !Array.isArray(authors)) {
    return [];
  }
  
  return authors.map(author => ({
    given: author.given || '',
    family: author.family || '',
    orcid: author.ORCID
  }));
}

/**
 * Map resource type from Citation.js to our type
 */
function mapResourceType(type: string): Citation['type'] {
  const typeMap: Record<string, Citation['type']> = {
    'article-journal': 'article',
    'paper-conference': 'conference',
    'book': 'book',
    'chapter': 'chapter',
    'webpage': 'website'
  };
  
  return typeMap[type] || 'other';
}
