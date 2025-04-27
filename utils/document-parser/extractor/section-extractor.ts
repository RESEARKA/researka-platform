/**
 * Document Section Extractor
 * Extracts structured sections from document text content
 */
import { StructuredDocument } from '../types/document';
import { createLogger, LogCategory } from '../../logger';

const logger = createLogger('SectionExtractor');

/**
 * Extracts structured sections from document text
 */
export class SectionExtractor {
  // Common section heading patterns
  private readonly sectionPatterns = {
    abstract: /^(?:abstract|summary)(?:\s*:|$)/i,
    introduction: /^(?:introduction|overview)(?:\s*:|$)/i,
    literatureReview: /^(?:literature\s*review|related\s*work|background)(?:\s*:|$)/i,
    methods: /^(?:methods|methodology|materials\s*and\s*methods|experimental\s*methods)(?:\s*:|$)/i,
    results: /^(?:results|findings|observations)(?:\s*:|$)/i,
    discussion: /^(?:discussion|interpretation|analysis)(?:\s*:|$)/i,
    conclusion: /^(?:conclusion|conclusions|summary|final\s*remarks)(?:\s*:|$)/i,
    acknowledgments: /^(?:acknowledgments|acknowledgements)(?:\s*:|$)/i,
    references: /^(?:references|bibliography|works\s*cited|sources)(?:\s*:|$)/i,
    appendices: /^(?:appendix|appendices|supplementary\s*material)(?:\s*:|$)/i
  };

  /**
   * Extract sections from document content
   * @param content Full document text content
   * @returns Structured document with extracted sections
   */
  public extractSections(content: string): StructuredDocument {
    try {
      // Split content into lines
      const lines = content
        .split('\n')
        .map(line => line.trim());
      
      // Start with an empty document
      const document: StructuredDocument = {
        warnings: []
      };
      
      // Try to extract a title from the first non-empty line
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        if (lines[i].length > 0) {
          document.title = lines[i];
          break;
        }
      }
      
      // Find section boundaries
      const sectionBoundaries = this.findSectionBoundaries(lines);
      
      // Extract each section
      for (let i = 0; i < sectionBoundaries.length; i++) {
        const currentSection = sectionBoundaries[i];
        const nextSection = sectionBoundaries[i + 1];
        
        const sectionEndLine = nextSection ? nextSection.lineIndex : lines.length;
        const sectionLines = lines.slice(currentSection.lineIndex + 1, sectionEndLine);
        const sectionText = sectionLines.join('\n').trim();
        
        // Skip empty sections
        if (!sectionText) continue;
        
        // Add the section to the document
        switch (currentSection.type) {
          case 'abstract':
            document.abstract = sectionText;
            break;
          case 'introduction':
            document.introduction = sectionText;
            break;
          case 'literatureReview':
            document.literatureReview = sectionText;
            break;
          case 'methods':
            document.methods = sectionText;
            break;
          case 'results':
            document.results = sectionText;
            break;
          case 'discussion':
            document.discussion = sectionText;
            break;
          case 'conclusion':
            document.conclusion = sectionText;
            break;
          case 'acknowledgments':
            document.acknowledgments = sectionText;
            break;
          case 'references':
            document.references = this.processReferences(sectionLines);
            break;
          case 'appendices':
            document.appendices = sectionText;
            break;
          default:
            // Handle unknown sections - they might contain declarations or other content
            if (currentSection.heading.toLowerCase().includes('declaration')) {
              document.declarations = document.declarations || {};
              
              if (currentSection.heading.toLowerCase().includes('ethics')) {
                document.declarations.ethics = sectionText;
              } else if (currentSection.heading.toLowerCase().includes('conflict')) {
                document.declarations.conflictOfInterest = sectionText;
              } else if (currentSection.heading.toLowerCase().includes('fund')) {
                document.declarations.funding = sectionText;
              }
            }
            break;
        }
      }
      
      // Store the complete content
      document.content = content;
      
      return document;
    } catch (error) {
      logger.error('Failed to extract document sections', error);
      return {
        content: content,
        error: `Failed to extract document sections: ${error.message}`,
        warnings: [`Section extraction error: ${error.message}`]
      };
    }
  }
  
  /**
   * Find section boundaries in document lines
   * @param lines Document content split into lines
   * @returns Array of section boundary positions
   */
  private findSectionBoundaries(lines: string[]): Array<{ type: string; heading: string; lineIndex: number }> {
    const boundaries: Array<{ type: string; heading: string; lineIndex: number }> = [];
    
    // Look for section headings in the document
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Check against each section pattern
      for (const [sectionType, pattern] of Object.entries(this.sectionPatterns)) {
        if (pattern.test(line)) {
          boundaries.push({
            type: sectionType,
            heading: line,
            lineIndex: i
          });
          break;
        }
      }
      
      // Also check for numeric section headers like "1. Introduction"
      const numericHeadingMatch = line.match(/^(\d+(?:\.\d+)*)\s+(.+)/);
      if (numericHeadingMatch) {
        const headingText = numericHeadingMatch[2].trim().toLowerCase();
        
        // Check if this numeric heading matches any known section
        for (const [sectionType, pattern] of Object.entries(this.sectionPatterns)) {
          if (pattern.test(headingText)) {
            boundaries.push({
              type: sectionType,
              heading: line,
              lineIndex: i
            });
            break;
          }
        }
      }
    }
    
    // Sort boundaries by line index to ensure correct order
    return boundaries.sort((a, b) => a.lineIndex - b.lineIndex);
  }
  
  /**
   * Process reference lines into individual reference entries
   * @param lines Lines of text in the references section
   * @returns Array of formatted reference strings
   */
  private processReferences(lines: string[]): string[] {
    const references: string[] = [];
    let currentRef = '';
    
    // Look for common reference patterns
    // 1. Numbered references: [1] Author, et al.
    // 2. Numbered references: 1. Author, et al.
    // 3. APA style: Author, A. (Year). Title.
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Check if this line starts a new reference
      const isNewNumberedRef = line.match(/^(?:\[\d+\]|\d+\.)\s/);
      const isNewApaRef = i > 0 && line.match(/^[A-Z][a-z]+,\s[A-Z]\./);
      
      if (isNewNumberedRef || isNewApaRef) {
        // Save the previous reference if we have one
        if (currentRef) {
          references.push(currentRef.trim());
        }
        
        // Start a new reference
        currentRef = line;
      } else {
        // Continue the current reference
        currentRef += ' ' + line;
      }
    }
    
    // Add the last reference if we have one
    if (currentRef) {
      references.push(currentRef.trim());
    }
    
    return references;
  }
}
