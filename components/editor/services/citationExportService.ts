/**
 * Citation Export Service
 * 
 * Provides functionality to export citations in various formats
 * with support for ORCID identifiers.
 */

import { Citation, Author } from '../types/citation';
import { createLogger, LogCategory } from '../../../utils/logger';

// Create a logger for this service
const logger = createLogger('citation-export');

// Constants
const DEFAULT_JOURNAL = 'DecentraJournal';
const DEFAULT_PUBLISHER = 'DecentraJournal Publishing';

// Validation helper
function validateCitation(citation: Citation): void {
  if (!citation.id) {
    throw new Error('Citation must have an ID');
  }
  if (!citation.title) {
    throw new Error('Citation must have a title');
  }
  if (!citation.year) {
    throw new Error('Citation must have a year');
  }
  if (!citation.authors || citation.authors.length === 0) {
    throw new Error('Citation must have at least one author');
  }
}

// Helper for formatting optional fields
function formatOptionalField(value: string | undefined, prefix: string): string {
  return value ? `${prefix} = {${value}},\n  ` : '';
}

/**
 * Export citation to BibTeX format with ORCID support
 * @param citation Citation to export
 * @returns BibTeX formatted citation
 */
export function exportToBibTeX(citation: Citation): string {
  try {
    validateCitation(citation);
    
    const authors = citation.authors
      .map(author => {
        const orcidStr = author.orcid ? `, orcid = {${author.orcid}}` : '';
        return `${author.family}, ${author.given}${orcidStr}`;
      })
      .join(' and ');
      
    return `@article{${citation.id},
  author = {${authors}},
  title = {${citation.title}},
  journal = {${citation.journal || DEFAULT_JOURNAL}},
  year = {${citation.year}},
  ${formatOptionalField(citation.volume, 'volume')}${formatOptionalField(citation.issue, 'issue')}${formatOptionalField(citation.doi, 'doi')}${formatOptionalField(citation.url, 'url')}
}`;
  } catch (error) {
    logger.error('Error generating BibTeX', {
      context: { error },
      category: LogCategory.ERROR
    });
    throw error;
  }
}

/**
 * Export citation to RIS format with ORCID support
 * @param citation Citation to export
 * @returns RIS formatted citation
 */
export function exportToRIS(citation: Citation): string {
  try {
    validateCitation(citation);
    
    let ris = `TY  - JOUR\n`;
    
    // Add authors with ORCID
    citation.authors.forEach(author => {
      ris += `AU  - ${author.family}, ${author.given}\n`;
      if (author.orcid) {
        ris += `AI  - ${author.orcid}\n`; // AI tag for ORCID in RIS format
      }
    });
    
    // Required fields
    ris += `TI  - ${citation.title}\n`;
    ris += `JO  - ${citation.journal || DEFAULT_JOURNAL}\n`;
    ris += `PY  - ${citation.year}\n`;
    
    // Optional fields
    if (citation.volume) ris += `VL  - ${citation.volume}\n`;
    if (citation.issue) ris += `IS  - ${citation.issue}\n`;
    if (citation.doi) ris += `DO  - ${citation.doi}\n`;
    if (citation.url) ris += `UR  - ${citation.url}\n`;
    if (citation.publisher) ris += `PB  - ${citation.publisher}\n`;
    else ris += `PB  - ${DEFAULT_PUBLISHER}\n`;
    
    ris += `ER  - \n`;
    
    return ris;
  } catch (error) {
    logger.error('Error generating RIS', {
      context: { error },
      category: LogCategory.ERROR
    });
    throw error;
  }
}

/**
 * Export citation to CSL-JSON format with ORCID support
 * @param citation Citation to export
 * @returns CSL-JSON formatted citation
 */
export function exportToCSLJSON(citation: Citation): string {
  try {
    validateCitation(citation);
    
    const cslJson = {
      id: citation.id,
      type: 'article-journal',
      title: citation.title,
      'container-title': citation.journal || DEFAULT_JOURNAL,
      issued: { 'date-parts': [[citation.year]] },
      author: citation.authors.map(author => ({
        family: author.family,
        given: author.given,
        ORCID: author.orcid
      })),
      volume: citation.volume,
      issue: citation.issue,
      DOI: citation.doi,
      URL: citation.url,
      publisher: citation.publisher || DEFAULT_PUBLISHER
    };
    
    return JSON.stringify(cslJson, null, 2);
  } catch (error) {
    logger.error('Error generating CSL-JSON', {
      context: { error },
      category: LogCategory.ERROR
    });
    throw error;
  }
}

/**
 * Export citation to plain text format with ORCID links
 * @param citation Citation to export
 * @returns Plain text formatted citation with ORCID information
 */
export function exportToPlainText(citation: Citation): string {
  try {
    validateCitation(citation);
    
    // Format authors with ORCID IDs
    const authorText = citation.authors.map(author => {
      const name = `${author.family}, ${author.given.charAt(0)}.`;
      const orcid = author.orcid ? ` (ORCID: ${author.orcid})` : '';
      return name + orcid;
    }).join(', ');
    
    // Build the citation text
    let text = `${authorText} (${citation.year}). ${citation.title}. `;
    
    if (citation.journal) {
      text += `${citation.journal}`;
      if (citation.volume) text += `, ${citation.volume}`;
      if (citation.issue) text += `(${citation.issue})`;
      text += '. ';
    }
    
    if (citation.doi) {
      text += `https://doi.org/${citation.doi}`;
    } else if (citation.url) {
      text += citation.url;
    }
    
    return text;
  } catch (error) {
    logger.error('Error generating plain text citation', {
      context: { error },
      category: LogCategory.ERROR
    });
    throw error;
  }
}
