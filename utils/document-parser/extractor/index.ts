/**
 * Document Section Extractor
 * Exports functionality for extracting structured document sections
 */
import { SectionExtractor } from './section-extractor';
import { StructuredDocument } from '../types/document';

// Export the main extractor class
export { SectionExtractor };

// Create a singleton instance for convenience
const sectionExtractor = new SectionExtractor();

/**
 * Extract document sections from text content
 * @param content Document text content
 * @returns Structured document with extracted sections
 */
export function extractDocumentSections(content: string): StructuredDocument {
  return sectionExtractor.extractSections(content);
}
