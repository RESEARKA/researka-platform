/**
 * Citation Helper Utilities
 * 
 * Provides functions to convert article data to citation format
 * and handle author information with ORCID IDs.
 */

import { v4 as uuidv4 } from 'uuid';
import { Citation, Author } from '../components/editor/types/citation';
import { Article } from './recommendationEngine';
import { createLogger, LogCategory } from './logger';

const logger = createLogger('citation-helper');

/**
 * Author information interface with ORCID support
 */
export interface AuthorInfo {
  name: string;
  orcid?: string;
  email?: string;
  affiliation?: string;
  isCorresponding?: boolean;
  userId?: string;
}

/**
 * Parse author string into given and family names
 * @param authorName Full author name
 * @returns Object with given and family name
 */
export function parseAuthorName(authorName: string): { given: string; family: string } {
  try {
    // Handle common name formats
    const nameParts = authorName.trim().split(/\s+/);
    
    if (nameParts.length === 1) {
      // Only one name provided
      return { given: '', family: nameParts[0] };
    } else if (nameParts.length === 2) {
      // Simple case: First Last
      return { given: nameParts[0], family: nameParts[1] };
    } else {
      // Multiple parts - assume last part is family name, rest is given name
      const family = nameParts.pop() || '';
      const given = nameParts.join(' ');
      return { given, family };
    }
  } catch (error) {
    logger.error('Error parsing author name', {
      context: { authorName, error },
      category: LogCategory.ERROR
    });
    // Return a safe default
    return { given: '', family: authorName || 'Unknown' };
  }
}

/**
 * Convert author information to Author type with ORCID support
 * @param authorInfo Author information
 * @returns Author object
 */
export function convertToAuthor(authorInfo: AuthorInfo): Author {
  try {
    const { name, orcid } = authorInfo;
    const { given, family } = parseAuthorName(name);
    
    return {
      given,
      family,
      orcid: orcid ? orcid.replace(/^https?:\/\/orcid\.org\//i, '') : undefined
    };
  } catch (error) {
    logger.error('Error converting author info', {
      context: { authorInfo, error },
      category: LogCategory.ERROR
    });
    // Return a safe default
    return { given: '', family: authorInfo.name || 'Unknown' };
  }
}

/**
 * Convert article data to citation format
 * @param article Article data
 * @param authors Optional array of author information
 * @returns Citation object
 */
export function articleToCitation(
  article: Article, 
  authors: AuthorInfo[] = []
): Citation {
  try {
    // If no authors are provided, create a default author from authorId
    const citationAuthors = authors.length > 0 
      ? authors.map(convertToAuthor)
      : [parseAuthorName(article.authorId)];
    
    // Extract DOI if present in the article data
    let doi: string | undefined;
    if (article.references && article.references.length > 0) {
      // Try to find a DOI in the references
      const doiRef = article.references.find(ref => ref.includes('doi.org'));
      if (doiRef) {
        const doiMatch = doiRef.match(/doi\.org\/([^\/\s]+)/i);
        if (doiMatch && doiMatch[1]) {
          doi = doiMatch[1];
        }
      }
    }
    
    return {
      id: article.id || uuidv4(),
      title: article.title,
      authors: citationAuthors,
      year: article.publishedDate 
        ? new Date(article.publishedDate).getFullYear() 
        : new Date().getFullYear(),
      journal: 'DecentraJournal',
      doi,
      type: 'article',
      addedAt: Date.now()
    };
  } catch (error) {
    logger.error('Error converting article to citation', {
      context: { article, authors, error },
      category: LogCategory.ERROR
    });
    // Return a minimal valid citation
    return {
      id: article.id || uuidv4(),
      title: article.title || 'Unknown Title',
      authors: [{ given: '', family: 'Unknown Author' }],
      year: new Date().getFullYear(),
      type: 'article',
      addedAt: Date.now()
    };
  }
}
