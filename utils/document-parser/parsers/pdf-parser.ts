/**
 * PDF Document Parser
 * Extracts text and structure from PDF documents using PDF.js
 */
import { BaseDocumentParser } from './parser';
import { StructuredDocument, ParserOptions } from '../types/document';
import { createLogger, LogCategory } from '../../logger';

const logger = createLogger('PdfParser');

// We need to import pdfjs in a way that works with Next.js
let pdfjsLib: any;
if (typeof window !== 'undefined') {
  // Client-side only
  pdfjsLib = require('pdfjs-dist/build/pdf');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

/**
 * Parser for PDF documents using PDF.js
 */
export class PdfParser extends BaseDocumentParser {
  readonly supportedMimeTypes = ['application/pdf'];
  readonly supportedExtensions = ['pdf'];

  /**
   * Parse a PDF file into a structured document
   * @param file PDF file to parse
   * @param options Parser options
   */
  async parseFile(file: File, options?: ParserOptions): Promise<StructuredDocument> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('PDF parsing is only supported in browser environments');
      }

      const parsedDocument = this.createEmptyDocument();
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF using PDF.js
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      logger.info(`PDF loaded with ${pdf.numPages} pages`);
      
      // Extract text from all pages
      const textContent: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
          .filter((item: any) => 'str' in item)
          .map((item: any) => item.str)
          .join(' ');
        
        textContent.push(text);
      }
      
      // Combine all page text
      const fullText = textContent.join('\n\n');
      
      // Extract document structure or use full content if extraction fails
      try {
        // Extract document metadata when available
        const metadata = await pdf.getMetadata();
        if (metadata?.info) {
          if (metadata.info.Title) parsedDocument.title = metadata.info.Title;
        }
        
        // Split the text into lines for section extraction
        const lines = fullText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        // We'll delegate the section extraction to a specialized extractor
        // For now, just set the full content
        parsedDocument.content = fullText;
        
        // Extract any keywords we can find
        const potentialKeywords = this.extractKeywordsFromText(fullText);
        if (potentialKeywords.length > 0) {
          parsedDocument.keywords = potentialKeywords;
        }
        
        return parsedDocument;
      } catch (extractionError) {
        logger.error('Failed to extract document structure', extractionError);
        
        // Fallback to full content if structure extraction fails
        parsedDocument.content = fullText;
        parsedDocument.warnings = parsedDocument.warnings || [];
        parsedDocument.warnings.push(`Failed to extract document structure: ${extractionError.message}`);
        
        return parsedDocument;
      }
    } catch (error) {
      logger.error('Failed to parse PDF file', error);
      return {
        error: `Failed to parse PDF file: ${error.message}`,
        warnings: []
      };
    }
  }
  
  /**
   * Extract potential keywords from text content
   * @param text Document text content
   */
  private extractKeywordsFromText(text: string): string[] {
    // Simple keyword extraction logic - look for "Keywords:" sections
    const keywordMatch = text.match(/keywords:?\s*(.*?)(?:\n\n|\r\n\r\n|$)/i);
    if (keywordMatch && keywordMatch[1]) {
      return keywordMatch[1]
        .split(/[,;]/)
        .map(kw => kw.trim())
        .filter(kw => kw.length > 0);
    }
    return [];
  }
}
