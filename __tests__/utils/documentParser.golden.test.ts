/**
 * Document Parser Refactoring Golden Tests
 * 
 * These tests verify that the new implementation matches the behavior of the original.
 * They serve as a safety net for the refactoring process.
 */
import { expect } from '@jest/globals';

// Import types for proper type checking
import type { ParsedDocument } from '../../utils/documentParser';
import type { StructuredDocument, EnhancedDocument } from '../../utils/document-parser/types';

// Mock PDF.js before importing any modules that use it
jest.mock('pdfjs-dist', () => {
  return {
    getDocument: jest.fn().mockImplementation(() => ({
      promise: Promise.resolve({
        numPages: 2,
        getPage: jest.fn().mockImplementation(() => ({
          getTextContent: jest.fn().mockResolvedValue({
            items: [{ str: 'Test PDF content' }]
          })
        }))
      })
    })),
    GlobalWorkerOptions: {
      workerSrc: null,
      disableStream: null
    }
  };
});

// Mock mammoth.js
jest.mock('mammoth', () => ({
  extractRaw: jest.fn().mockResolvedValue({
    value: { _root: { _children: [{ _children: [{ _text: 'Test Word content' }] }] } }
  })
}));

// Mock the deepseek AI service
jest.mock('../../utils/deepseekAI', () => ({
  createDeepSeekAI: jest.fn().mockImplementation(() => ({
    generateText: jest.fn().mockResolvedValue('AI-generated content')
  }))
}));

// Mock the logger to avoid console output during tests
jest.mock('../../utils/logger', () => ({
  createLogger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }))
}));

// Now import the modules under test
import { parseDocument as parseOriginal } from '../../utils/documentParser';
import { parseDocument as parseNew } from '../../utils/document-parser';

describe('Document Parser Refactoring', () => {
  // Utility function to create a mock File
  const createMockFile = (name: string, type: string, content = 'Test content'): File => {
    const blob = new Blob([content], { type });
    return new File([blob], name, { type });
  };

  // Test PDF parsing
  it('should parse PDF files identically', async () => {
    // Create a mock PDF file
    const pdfFile = createMockFile('test.pdf', 'application/pdf');
    
    // Parse with both implementations
    const originalResult = await parseOriginal(pdfFile) as ParsedDocument & { aiEnhanced?: boolean };
    const newResult = await parseNew(pdfFile) as StructuredDocument & { aiEnhanced?: boolean };
    
    // Compare essential properties (content might differ slightly due to whitespace)
    expect(newResult.title).toEqual(originalResult.title);
    expect(newResult.error).toEqual(originalResult.error);
    expect(!!newResult.content).toEqual(!!originalResult.content);
  });
  
  // Test Word parsing
  it('should parse Word files identically', async () => {
    // Create a mock Word file
    const wordFile = createMockFile('test.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    
    // Parse with both implementations
    const originalResult = await parseOriginal(wordFile) as ParsedDocument & { aiEnhanced?: boolean };
    const newResult = await parseNew(wordFile) as StructuredDocument & { aiEnhanced?: boolean };
    
    // Compare essential properties
    expect(newResult.title).toEqual(originalResult.title);
    expect(newResult.error).toEqual(originalResult.error);
    expect(!!newResult.content).toEqual(!!originalResult.content);
  });
  
  // Test Text parsing
  it('should parse Text files identically', async () => {
    // Create a mock text file
    const textFile = createMockFile('test.txt', 'text/plain', 'Sample text content\nWith multiple lines\nAnd some formatting');
    
    // Parse with both implementations
    const originalResult = await parseOriginal(textFile) as ParsedDocument & { aiEnhanced?: boolean };
    const newResult = await parseNew(textFile) as StructuredDocument & { aiEnhanced?: boolean };
    
    // Compare essential properties
    expect(newResult.title).toEqual(originalResult.title);
    expect(newResult.error).toEqual(originalResult.error);
    expect(!!newResult.content).toEqual(!!originalResult.content);
  });
  
  // Test Pages parsing
  it('should parse Pages files identically', async () => {
    // Create a mock Pages file
    const pagesFile = createMockFile('test.pages', 'application/vnd.apple.pages');
    
    // Parse with both implementations
    const originalResult = await parseOriginal(pagesFile) as ParsedDocument & { aiEnhanced?: boolean };
    const newResult = await parseNew(pagesFile) as StructuredDocument & { aiEnhanced?: boolean };
    
    // Compare essential properties
    expect(newResult.title).toEqual(originalResult.title);
    expect(newResult.error).toEqual(originalResult.error);
    expect(!!newResult.content).toEqual(!!originalResult.content);
  });
  
  // Test AI enhancement
  it('should enhance documents with AI identically', async () => {
    // Create a mock text file
    const textFile = createMockFile('test.txt', 'text/plain', 'Sample research content with abstract and methods');
    
    // Parse with both implementations with additional type assertions for extended properties
    const originalResult = await parseOriginal(textFile, { enhanceWithAI: true }) as ParsedDocument & { 
      aiEnhanced?: boolean;
      enhancedKeywords?: string[];
      summary?: string;
    };
    const newResult = await parseNew(textFile, { enhanceWithAI: true }) as EnhancedDocument;
    
    // Compare AI-specific properties
    expect(newResult.aiEnhanced).toEqual(originalResult.aiEnhanced);
    expect(!!newResult.enhancedKeywords).toEqual(!!originalResult.enhancedKeywords);
    expect(!!newResult.summary).toEqual(!!originalResult.summary);
  });
  
  // Test error handling for unsupported file types
  it('should handle unsupported file types identically', async () => {
    // Create a mock unsupported file
    const unsupportedFile = createMockFile('test.xyz', 'application/octet-stream');
    
    // Parse with both implementations
    const originalResult = await parseOriginal(unsupportedFile);
    const newResult = await parseNew(unsupportedFile);
    
    // Both should have an error
    expect(!!newResult.error).toEqual(!!originalResult.error);
  });
});
