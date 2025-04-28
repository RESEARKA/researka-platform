/**
 * Document Parser Compatibility Layer
 * 
 * This file provides compatibility with existing code while using
 * the new refactored document parser implementation.
 * 
 * IMPORTANT: This is a transition file to allow a gradual migration.
 * New code should directly import from utils/document-parser.
 */

import { parseDocument as parseDocumentNew } from './document-parser';
import { StructuredDocument, ParserOptions } from './document-parser/types';
import { createLogger, LogCategory } from './logger';

const logger = createLogger('DocumentParser');

// Export the interface for backward compatibility
export interface ParsedDocument extends StructuredDocument {}

/**
 * Parse a document file
 * 
 * @deprecated Use the new module at utils/document-parser instead
 * @param file Document file to parse
 * @param options Parsing options
 * @returns Parsed document
 */
export async function parseDocument(file: File, options: { enhanceWithAI?: boolean } = {}): Promise<ParsedDocument> {
  logger.warn(
    'Using deprecated documentParser.ts. ' +
    'Please update imports to use the new utils/document-parser module.'
  );
  
  // Map old options to new options format
  const newOptions: ParserOptions = {
    enhanceWithAI: options.enhanceWithAI
  };
  
  // Use the new implementation
  return parseDocumentNew(file, newOptions);
}

// Re-export the plugin interfaces for backward compatibility
export interface IDocumentParserPlugin {
  supports(file: File): boolean;
  parse(file: File, options?: any): Promise<ParsedDocument>;
}

// Export the new module to encourage migration
export const DocumentParser = {
  parseDocument,
  // Add reference to new module
  v2: require('./document-parser')
};
