/**
 * Plain Text Document Parser
 * Handles parsing of plain text files (.txt, etc.)
 */
import { BaseDocumentParser } from './parser';
import { StructuredDocument, ParserOptions } from '../types/document';
import { createLogger, LogCategory } from '../../logger';

const logger = createLogger('TextParser');

/**
 * Parser for plain text documents
 */
export class TextParser extends BaseDocumentParser {
  readonly supportedMimeTypes = ['text/plain'];
  readonly supportedExtensions = ['txt', 'text', 'md', 'markdown'];

  /**
   * Parse a text file into a structured document
   * @param file Text file to parse
   * @param options Parser options
   */
  async parseFile(file: File, options?: ParserOptions): Promise<StructuredDocument> {
    try {
      const parsedDocument = this.createEmptyDocument();
      
      // Read the file as text
      const text = await file.text();
      
      // Simple check for UTF-8 BOM and remove if present
      const cleanedText = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
      
      // Split the text into lines for processing
      const lines = cleanedText
        .split('\n')
        .map(line => line.trim());
      
      // Try to extract a title from the first non-empty line
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].length > 0) {
          parsedDocument.title = lines[i];
          break;
        }
      }
      
      // Store the full content
      parsedDocument.content = cleanedText;
      
      // Try to extract keywords if there's a "Keywords:" line
      const keywordIndex = lines.findIndex(
        line => line.toLowerCase().includes('keywords:')
      );
      
      if (keywordIndex >= 0) {
        const keywordLine = lines[keywordIndex];
        const keywordText = keywordLine.substring(keywordLine.toLowerCase().indexOf('keywords:') + 9);
        
        parsedDocument.keywords = keywordText
          .split(/[,;]/)
          .map(kw => kw.trim())
          .filter(kw => kw.length > 0);
      } else {
        // If no explicit keywords section, try to extract potential keywords from filename
        const filenameKeywords = this.extractKeywordsFromFileName(file.name);
        if (filenameKeywords.length > 0) {
          parsedDocument.keywords = filenameKeywords;
        }
      }
      
      // Look for specific sections by scanning for common headings
      const abstractIndex = lines.findIndex(
        line => line.toLowerCase().match(/^(abstract|summary)[\s:.]*$/)
      );
      
      if (abstractIndex >= 0) {
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
      logger.error('Failed to parse text file', error);
      return {
        error: `Failed to parse text file: ${error.message}`,
        warnings: []
      };
    }
  }
  
  /**
   * Extract potential keywords from the filename
   * @param filename Name of the file
   */
  private extractKeywordsFromFileName(filename: string): string[] {
    // Remove extension
    const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
    
    // Split by common separators and filter out short terms
    return nameWithoutExt
      .split(/[-_\s]/)
      .map(term => term.trim())
      .filter(term => term.length > 3)  // Ignore short terms
      .filter(term => !this.isCommonWord(term));
  }
  
  /**
   * Check if a line appears to be a section heading
   * @param line Text line to check
   */
  private isSectionHeading(line: string): boolean {
    if (line.length === 0) return false;
    
    // Common section headings in academic papers
    const sectionHeadings = [
      'abstract', 'introduction', 'background', 'literature review',
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
  
  /**
   * Check if a word is a common word that shouldn't be a keyword
   * @param word Word to check
   */
  private isCommonWord(word: string): boolean {
    const commonWords = [
      'the', 'and', 'that', 'this', 'with', 'for', 'from', 
      'file', 'document', 'paper', 'research', 'study', 'draft'
    ];
    
    return commonWords.includes(word.toLowerCase());
  }
}
