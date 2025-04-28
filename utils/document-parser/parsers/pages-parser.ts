/**
 * Pages Document Parser
 * Handles parsing of Apple Pages documents
 */
import { BaseDocumentParser } from './parser';
import { StructuredDocument, ParserOptions } from '../types/document';
import { createLogger, LogCategory } from '../../logger';

const logger = createLogger('PagesParser');

/**
 * Parser for Apple Pages documents
 */
export class PagesParser extends BaseDocumentParser {
  readonly supportedMimeTypes = [
    'application/vnd.apple.pages',
    'application/x-iwork-pages-sffpages'
  ];
  readonly supportedExtensions = ['pages'];

  /**
   * Parse a Pages file into a structured document
   * @param file Pages file to parse
   * @param options Parser options
   */
  async parseFile(file: File, options?: ParserOptions): Promise<StructuredDocument> {
    try {
      const parsedDocument = this.createEmptyDocument();
      
      // Pages files are actually zip archives containing XML
      // We need to handle them differently than simple text files
      if (typeof window === 'undefined') {
        throw new Error('Pages parsing is only supported in browser environments');
      }
      
      // Get the file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Check if this looks like a Pages file (zip archive)
      const isZip = this.looksLikeZipFile(new Uint8Array(arrayBuffer));
      if (!isZip) {
        throw new Error('Not a valid Pages document (missing zip signature)');
      }
      
      // Use JSZip if available
      const JSZip = await this.getJSZip();
      if (!JSZip) {
        throw new Error('JSZip library is not available for Pages parsing');
      }
      
      // Extract the main content.xml file
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      // Look for the main content file in the archive
      // Pages files typically have a structure like:
      // - index.xml
      // - QuickLook/Preview.pdf
      // - document.xml
      // We'll try to find one of these files
      
      let textContent = '';
      
      // Try to extract from document.xml
      if (zip.file('document.xml')) {
        const xmlContent = await zip.file('document.xml').async('string');
        textContent = this.extractTextFromXml(xmlContent);
      } 
      // Try index.xml as a fallback
      else if (zip.file('index.xml')) {
        const xmlContent = await zip.file('index.xml').async('string');
        textContent = this.extractTextFromXml(xmlContent);
      }
      // As a last resort, check for Preview.pdf and extract text from it
      else if (zip.file('QuickLook/Preview.pdf')) {
        parsedDocument.warnings = parsedDocument.warnings || [];
        parsedDocument.warnings.push('Using Preview.pdf from Pages document - text extraction may be limited');
        
        const pdfData = await zip.file('QuickLook/Preview.pdf').async('arraybuffer');
        
        // Create a Blob and File from the PDF data
        const blob = new Blob([pdfData], { type: 'application/pdf' });
        const pdfFile = new File([blob], file.name.replace('.pages', '.pdf'), { type: 'application/pdf' });
        
        // Use the PDF parser to extract text (recycle code)
        // We'll stub this for now and implement better integration later
        parsedDocument.content = 'PDF content extraction from Pages preview not implemented';
        return parsedDocument;
      } else {
        throw new Error('Could not find content in Pages document');
      }
      
      // Store the full content
      parsedDocument.content = textContent;
      
      // Split the content into lines
      const lines = textContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Try to extract a title from the first non-empty line
      if (lines.length > 0) {
        parsedDocument.title = lines[0];
      }
      
      return parsedDocument;
    } catch (error) {
      logger.error('Failed to parse Pages file', error);
      return {
        error: `Failed to parse Pages file: ${error.message}`,
        warnings: []
      };
    }
  }
  
  /**
   * Extract text from XML content
   * @param xmlContent XML string to extract text from
   */
  private extractTextFromXml(xmlContent: string): string {
    try {
      if (typeof DOMParser !== 'undefined') {
        // Browser environment
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
        return xmlDoc.documentElement.textContent || '';
      } else {
        // Server environment - simple regex-based approach
        return xmlContent
          .replace(/<[^>]*>/g, ' ')  // Replace XML tags with spaces
          .replace(/\s+/g, ' ')      // Normalize whitespace
          .trim();
      }
    } catch (error) {
      logger.error('Failed to parse XML content', error);
      return '';
    }
  }
  
  /**
   * Check if a buffer looks like a zip file (has the zip signature)
   * @param buffer File buffer to check
   */
  private looksLikeZipFile(buffer: Uint8Array): boolean {
    // Zip files start with the signature PK\x03\x04
    return buffer.length >= 4 && 
           buffer[0] === 0x50 && 
           buffer[1] === 0x4B && 
           buffer[2] === 0x03 && 
           buffer[3] === 0x04;
  }
  
  /**
   * Dynamically load JSZip if available
   */
  private async getJSZip(): Promise<any> {
    if (typeof window !== 'undefined') {
      try {
        return (await import('jszip')).default;
      } catch (e) {
        logger.warn('JSZip not available. Install with: npm install jszip');
        return null;
      }
    }
    return null;
  }
}
