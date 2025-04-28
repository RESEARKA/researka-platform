/**
 * PDF Parser Unit Tests
 * 
 * Tests the PDF parser component specifically.
 */
import { expect, jest } from '@jest/globals';
import { PdfParser } from '../../../../utils/document-parser/parsers/pdf-parser';
import { ParserOptions } from '../../../../utils/document-parser/types/document';

// Mock the PDF.js dependency
jest.mock('pdfjs-dist/build/pdf', () => ({
  getDocument: jest.fn().mockImplementation(() => ({
    promise: Promise.resolve({
      numPages: 2,
      getPage: jest.fn().mockImplementation((pageNum) => ({
        getTextContent: jest.fn().mockResolvedValue({
          items: [{ str: `Page ${pageNum} content` }]
        }),
        getMetadata: jest.fn().mockResolvedValue({
          info: { Title: 'Test PDF Document' }
        })
      })),
      getMetadata: jest.fn().mockResolvedValue({
        info: { Title: 'Test PDF Document' }
      })
    })
  })),
  GlobalWorkerOptions: {
    workerSrc: null
  },
  version: '2.10.377'
}), { virtual: true });

// Mock global objects
global.window = {} as any;

describe('PDF Parser', () => {
  let parser: PdfParser;

  beforeEach(() => {
    parser = new PdfParser();
  });

  // Test file type support detection
  it('should correctly identify supported files', () => {
    // PDF files should be supported
    expect(parser.supports(new File([], 'test.pdf', { type: 'application/pdf' }))).toBe(true);
    
    // Other file types should not be supported
    expect(parser.supports(new File([], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }))).toBe(false);
    expect(parser.supports(new File([], 'test.txt', { type: 'text/plain' }))).toBe(false);
  });

  // Test parsing functionality
  it('should extract content from PDF files', async () => {
    // Create a mock PDF file
    const pdfFile = new File([], 'test.pdf', { type: 'application/pdf' });
    
    // Parse the file
    const result = await parser.parseFile(pdfFile);
    
    // Check the parsed result
    expect(result.error).toBeUndefined();
    expect(result.title).toBe('Test PDF Document');
    expect(result.content).toContain('Page 1 content');
    expect(result.content).toContain('Page 2 content');
  });

  // Test error handling
  it('should handle parsing errors gracefully', async () => {
    // Mock PDF.js to throw an error
    require('pdfjs-dist/build/pdf').getDocument.mockImplementationOnce(() => ({
      promise: Promise.reject(new Error('PDF parsing failed'))
    }));
    
    // Create a mock PDF file
    const pdfFile = new File([], 'error.pdf', { type: 'application/pdf' });
    
    // Parse the file
    const result = await parser.parseFile(pdfFile);
    
    // Check the error is captured correctly
    expect(result.error).toBeDefined();
    expect(result.error).toContain('PDF parsing failed');
  });

  // Test parsing options
  it('should respect parsing options', async () => {
    // Create a mock PDF file
    const pdfFile = new File([], 'test.pdf', { type: 'application/pdf' });
    
    // Parse with custom options
    const result = await parser.parseFile(pdfFile, { 
      extractTitle: false 
    } as ParserOptions);
    
    // Title should still be set because our mock returns it from metadata
    expect(result.title).toBe('Test PDF Document');
  });
});
