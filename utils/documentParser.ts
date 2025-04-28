/**
 * @deprecated Use the new module at utils/document-parser instead.
 *
 * Document Parser
 * This file now delegates to the new modular implementation while
 * maintaining the original API interface for backward compatibility.
 */

// Import only what we need for delegation
import { createLogger } from './logger';
import { parseDocument as parseDocumentNew } from './document-parser';
import type { ParserOptions } from './document-parser/types';

// Re-export original plugin interfaces for backward compatibility
import { IDocumentParserPlugin } from './plugins/IDocumentParserPlugin';
import { TextParserPlugin } from './plugins/TextParserPlugin';
import { PdfParserPlugin } from './plugins/PdfParserPlugin';
import { WordParserPlugin } from './plugins/WordParserPlugin';
import { PagesParserPlugin } from './plugins/PagesParserPlugin';

export { IDocumentParserPlugin };
export { TextParserPlugin };
export { PdfParserPlugin };
export { WordParserPlugin };
export { PagesParserPlugin };

const logger = createLogger('DocumentParser');

/**
 * @deprecated Use types from utils/document-parser/types instead
 */
export interface ParsedDocument {
  title?: string;
  abstract?: string;
  keywords?: string[];
  introduction?: string;
  literatureReview?: string;
  methods?: string;
  results?: string;
  discussion?: string;
  conclusion?: string;
  acknowledgments?: string;
  declarations?: {
    ethics?: string;
    conflictOfInterest?: string;
    funding?: string;
  };
  references?: string[];
  appendices?: string;
  supplementaryMaterial?: string;
  content?: string;
  error?: string;
  warnings?: string[];
}

/**
 * Parse a document file into structured content
 * 
 * @deprecated Use utils/document-parser module instead
 * @param file Document file to parse
 * @param options Options for controlling parsing behavior
 * @returns Structured document with extracted content
 */
export async function parseDocument(
  file: File, 
  options: { enhanceWithAI?: boolean } = {}
): Promise<ParsedDocument> {
  // Log deprecation warning in development only
  if (process.env.NODE_ENV !== 'production') {
    logger.warn(
      'utils/documentParser.ts is deprecated. ' +
      'Please migrate to the new utils/document-parser module.'
    );
  }
  
  try {
    // Map old options to new options
    const newOptions: ParserOptions = {
      enhanceWithAI: options.enhanceWithAI,
    };
    
    // Delegate to new implementation
    return await parseDocumentNew(file, newOptions);
  } catch (error) {
    logger.error('Error in document parsing', error);
    return {
      error: `Failed to parse document: ${error.message}`,
      warnings: ['Error occurred while delegating to new document parser']
    };
  }
}

// Export the new module to encourage migration
export const DocumentParser = {
  parseDocument,
  // Reference to new implementation to ease migration
  v2: require('./document-parser')
};
