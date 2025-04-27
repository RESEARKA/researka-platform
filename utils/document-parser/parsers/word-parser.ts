/**
 * Word Document Parser
 * Handles parsing of Microsoft Word documents using Mammoth.js
 */
import { BaseDocumentParser } from './parser';
import { StructuredDocument, ParserOptions } from '../types/document';
import { createLogger, LogCategory } from '../../logger';
import * as mammoth from 'mammoth';
import * as iconv from 'iconv-lite';

const logger = createLogger('WordParser');

/**
 * Parser for Microsoft Word documents
 */
export class WordParser extends BaseDocumentParser {
  readonly supportedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  readonly supportedExtensions = ['docx', 'doc'];

  /**
   * Parse a Word file into a structured document
   * @param file Word file to parse
   * @param options Parser options
   */
  async parseFile(file: File, options?: ParserOptions): Promise<StructuredDocument> {
    try {
      const parsedDocument = this.createEmptyDocument();
      
      const arrayBuffer = await file.arrayBuffer();
      
      // Use mammoth.js to convert Word to HTML
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const htmlContent = result.value;
      
      // Extract warnings from mammoth
      parsedDocument.warnings = result.messages
        .filter(msg => msg.type === 'warning')
        .map(msg => msg.message);
      
      // Convert HTML to plain text for processing
      const textContent = this.htmlToText(htmlContent);
      
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
      
      // Try to extract keywords if there's a "Keywords:" line
      const keywordIndex = lines.findIndex(
        line => line.toLowerCase().startsWith('keywords:')
      );
      
      if (keywordIndex >= 0) {
        const keywordLine = lines[keywordIndex];
        const keywordText = keywordLine.substring(keywordLine.toLowerCase().indexOf('keywords:') + 9);
        
        parsedDocument.keywords = keywordText
          .split(/[,;]/)
          .map(kw => kw.trim())
          .filter(kw => kw.length > 0);
      }
      
      // Look for abstract section
      const abstractIndex = lines.findIndex(
        line => line.toLowerCase() === 'abstract' || line.toLowerCase() === 'abstract:'
      );
      
      if (abstractIndex >= 0 && abstractIndex + 1 < lines.length) {
        let abstractText = '';
        let i = abstractIndex + 1;
        
        // Collect lines until we hit what appears to be another section heading
        while (i < lines.length && !this.isSectionHeading(lines[i])) {
          abstractText += lines[i] + '\n';
          i++;
        }
        
        parsedDocument.abstract = abstractText.trim();
      }
      
      return parsedDocument;
    } catch (error) {
      logger.error('Failed to parse Word file', error);
      return {
        error: `Failed to parse Word file: ${error.message}`,
        warnings: []
      };
    }
  }
  
  /**
   * Convert HTML to plain text
   * @param html HTML content to convert
   */
  private htmlToText(html: string): string {
    if (typeof DOMParser !== 'undefined') {
      // Browser environment
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    } else {
      // Server environment - simple regex-based approach
      return html
        .replace(/<[^>]*>/g, ' ')  // Replace HTML tags with spaces
        .replace(/&nbsp;/g, ' ')   // Replace non-breaking spaces
        .replace(/\s+/g, ' ')      // Normalize whitespace
        .trim();
    }
  }
  
  /**
   * Check if a line appears to be a section heading
   * @param line Text line to check
   */
  private isSectionHeading(line: string): boolean {
    if (line.length === 0) return false;
    
    // Common section headings in academic papers
    const sectionHeadings = [
      'introduction', 'background', 'literature review',
      'method', 'methodology', 'results', 'discussion', 
      'conclusion', 'references', 'appendix'
    ];
    
    const normalized = line.toLowerCase().trim();
    
    // Check if the line matches any of the common headings
    return sectionHeadings.some(heading => 
      normalized === heading || 
      normalized === heading + ':' ||
      normalized.startsWith(heading + ' ')
    );
  }
}
