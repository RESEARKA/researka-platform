/**
 * Section Extractor Unit Tests
 * 
 * Tests the document section extraction functionality.
 */
import { expect } from '@jest/globals';
import { SectionExtractor } from '../../../../utils/document-parser/extractor/section-extractor';

describe('Section Extractor', () => {
  let extractor: SectionExtractor;

  beforeEach(() => {
    extractor = new SectionExtractor();
  });

  // Test basic section extraction
  it('should extract basic document sections', () => {
    const content = `
      Title: Research Paper Title
      
      Abstract
      
      This is the abstract of the research paper.
      
      Introduction
      
      This is the introduction section.
      
      Methods
      
      This describes the methodology used.
      
      Results
      
      These are the results of the research.
      
      Discussion
      
      This discusses the implications of the results.
      
      Conclusion
      
      This concludes the research paper.
      
      References
      
      1. Reference 1
      2. Reference 2
    `;
    
    const result = extractor.extractSections(content);
    
    expect(result.title).toContain('Research Paper Title');
    expect(result.abstract).toBeDefined();
    expect(result.introduction).toBeDefined();
    expect(result.methods).toBeDefined();
    expect(result.results).toBeDefined();
    expect(result.conclusion).toBeDefined();
    expect(result.references).toBeDefined();
  });

  // Test extraction with missing sections
  it('should handle documents with missing sections', () => {
    const content = `
      Some research content without clear sections.
      This content doesn't have standard academic paper structure.
    `;
    
    const result = extractor.extractSections(content);
    
    // Should have content but might not have specific sections
    expect(result.content).toBeDefined();
    expect(result.content).toContain('research content');
    // No error should be thrown
    expect(result.error).toBeUndefined();
  });

  // Test extraction with alternative section headings
  it('should recognize alternative section headings', () => {
    const content = `
      METHODOLOGY
      
      This describes the methodology.
      
      FINDINGS
      
      These are the findings.
      
      MATERIALS AND METHODS
      
      These are the materials used.
    `;
    
    const result = extractor.extractSections(content);
    
    // Should recognize "METHODOLOGY" as a methods section
    expect(result.methods).toBeDefined();
    expect(result.methods).toContain('methodology');
    
    // Should recognize "FINDINGS" as results
    expect(result.results).toBeDefined();
    expect(result.results).toContain('findings');
  });

  // Test extraction with complex content
  it('should handle complex document structures', () => {
    const content = `
      1. Introduction
      
      1.1 Background
      This is the background.
      
      1.2 Research Questions
      These are the research questions.
      
      2. Literature Review
      
      This is the literature review.
      
      3. Methodology
      
      3.1 Participants
      3.2 Procedures
    `;
    
    const result = extractor.extractSections(content);
    
    // Should extract numbered sections correctly
    expect(result.introduction).toBeDefined();
    expect(result.introduction).toContain('Background');
    expect(result.introduction).toContain('Research Questions');
    
    // Should extract literature review
    expect(result.literatureReview).toBeDefined();
    
    // Should extract methodology
    expect(result.methods).toBeDefined();
    expect(result.methods).toContain('Participants');
    expect(result.methods).toContain('Procedures');
  });
});
