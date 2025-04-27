/**
 * Core parser interface that all document parsers must implement
 */
import { RawDocument, StructuredDocument, ParserOptions } from '../types/document';

/**
 * Interface for document parsers
 */
export interface IDocumentParser {
  /**
   * List of supported MIME types for this parser
   */
  readonly supportedMimeTypes: string[];
  
  /**
   * List of supported file extensions for this parser
   */
  readonly supportedExtensions: string[];
  
  /**
   * Check if this parser supports the given file
   * @param file The file to check
   */
  supports(file: File): boolean;
  
  /**
   * Parse the raw document into a structured document
   * @param file The file to parse
   * @param options Optional parsing options
   */
  parseFile(file: File, options?: ParserOptions): Promise<StructuredDocument>;
}

/**
 * Base class implementing common parser functionality
 */
export abstract class BaseDocumentParser implements IDocumentParser {
  abstract readonly supportedMimeTypes: string[];
  abstract readonly supportedExtensions: string[];
  
  /**
   * Check if this parser supports the given file
   */
  supports(file: File): boolean {
    const fileExt = this.getFileExtension(file.name).toLowerCase();
    return (
      this.supportedMimeTypes.includes(file.type) || 
      this.supportedExtensions.includes(fileExt)
    );
  }
  
  abstract parseFile(file: File, options?: ParserOptions): Promise<StructuredDocument>;
  
  /**
   * Create an empty document with default values
   */
  protected createEmptyDocument(): StructuredDocument {
    return {
      warnings: []
    };
  }
  
  /**
   * Extract the file extension from a filename
   */
  protected getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }
}
