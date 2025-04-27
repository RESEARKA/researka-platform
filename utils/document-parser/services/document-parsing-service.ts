/**
 * Document Parsing Service
 * Main facade for document parsing functionality
 */
import { StructuredDocument, ParserOptions, EnhancedDocument } from '../types/document';
import { parseDocument } from '../parsers';
import { extractDocumentSections } from '../extractor';
import { enhanceDocumentWithAI } from '../enhancer';
import { createLogger, LogCategory } from '../../logger';

const logger = createLogger('DocumentParsingService');

/**
 * Service for parsing and processing documents
 */
export class DocumentParsingService {
  /**
   * Parse a document file
   * @param file Document file to parse
   * @param options Parsing options
   * @returns Parsed document structure
   */
  public async parseDocument(file: File, options: ParserOptions = {}): Promise<StructuredDocument> {
    try {
      logger.info(`Parsing document: ${file.name} (${file.type})`);
      
      // Step 1: Parse the file using the appropriate parser
      const parsedDocument = await parseDocument(file, options);
      
      // Check for errors in parsing
      if (parsedDocument.error) {
        logger.warn(`Error parsing document: ${parsedDocument.error}`);
        return parsedDocument;
      }
      
      // Step 2: Extract sections if we have content
      let documentWithSections = parsedDocument;
      
      if (parsedDocument.content) {
        try {
          // Extract sections from the content
          const extractedSections = extractDocumentSections(parsedDocument.content);
          
          // Merge the extracted sections with the parsed document
          // Keep any specific fields that the parser might have set
          documentWithSections = {
            ...extractedSections,
            // Preserve original fields that aren't in the extracted sections
            title: parsedDocument.title || extractedSections.title,
            // Merge warnings
            warnings: [
              ...(parsedDocument.warnings || []),
              ...(extractedSections.warnings || [])
            ]
          };
          
          logger.info('Successfully extracted document sections');
        } catch (extractionError) {
          // If section extraction fails, continue with the parsed document
          logger.error('Failed to extract document sections', extractionError);
          documentWithSections.warnings = documentWithSections.warnings || [];
          documentWithSections.warnings.push(
            `Section extraction failed: ${extractionError.message}`
          );
        }
      }
      
      // Step 3: Apply AI enhancement if requested
      if (options.enhanceWithAI) {
        try {
          logger.info('Applying AI enhancement');
          const enhancedDocument = await enhanceDocumentWithAI(documentWithSections);
          return enhancedDocument;
        } catch (enhancementError) {
          // If enhancement fails, continue with the document we have
          logger.error('AI enhancement failed', enhancementError);
          documentWithSections.warnings = documentWithSections.warnings || [];
          documentWithSections.warnings.push(
            `AI enhancement failed: ${enhancementError.message}`
          );
        }
      }
      
      return documentWithSections;
    } catch (error) {
      logger.error('Unexpected error in document parsing service', error);
      return {
        error: `Failed to parse document: ${error.message}`,
        warnings: []
      };
    }
  }
}

// Create a singleton instance for convenience
export const documentParsingService = new DocumentParsingService();

/**
 * Convenience function for parsing documents
 * @param file Document file to parse
 * @param options Parsing options
 * @returns Parsed document structure
 */
export async function parseDocument(file: File, options: ParserOptions = {}): Promise<StructuredDocument> {
  return documentParsingService.parseDocument(file, options);
}
