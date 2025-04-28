/**
 * Word Parser Unit Tests
 * 
 * Tests the Word document parser component specifically.
 */
import { expect, jest } from '@jest/globals';
import { WordParser } from '../../../../utils/document-parser/parsers/word-parser';
import { ParserOptions } from '../../../../utils/document-parser/types/document';

// Mock the mammoth dependency
jest.mock('mammoth', () => ({
  extractRaw: jest.fn().mockResolvedValue({
    value: { 
      _root: { 
        _children: [
          { _children: [{ _text: 'Test Word document heading' }] }, 
          { _children: [{ _text: 'Test Word document content' }] }
        ] 
      } 
    }
  })
}));

describe('Word Parser', () => {
  let parser: WordParser;

  beforeEach(() => {
    parser = new WordParser();
  });

  // Test file type support detection
  it('should correctly identify supported files', () => {
    // Word files should be supported
    expect(parser.supports(new File([], 'test.docx', { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    }))).toBe(true);
    
    // Other file types should not be supported
    expect(parser.supports(new File([], 'test.pdf', { type: 'application/pdf' }))).toBe(false);
    expect(parser.supports(new File([], 'test.txt', { type: 'text/plain' }))).toBe(false);
  });

  // Test parsing functionality
  it('should extract content from Word files', async () => {
    // Create a mock Word file
    const wordFile = new File([], 'test.docx', { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    // Parse the file
    const result = await parser.parseFile(wordFile);
    
    // Check the parsed result
    expect(result.error).toBeUndefined();
    expect(result.title).toBe('test.docx');
    expect(result.content).toContain('Test Word document heading');
    expect(result.content).toContain('Test Word document content');
  });

  // Test error handling
  it('should handle parsing errors gracefully', async () => {
    // Mock mammoth to throw an error
    require('mammoth').extractRaw.mockImplementationOnce(() => 
      Promise.reject(new Error('Word document parsing failed'))
    );
    
    // Create a mock Word file
    const wordFile = new File([], 'error.docx', { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    // Parse the file
    const result = await parser.parseFile(wordFile);
    
    // Check the error is captured correctly
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Word document parsing failed');
  });

  // Test handling of document with structure
  it('should extract title from document content when available', async () => {
    // Mock mammoth to return content with a clear title
    require('mammoth').extractRaw.mockImplementationOnce(() => 
      Promise.resolve({
        value: { 
          _root: { 
            _children: [
              { 
                _children: [{ _text: 'Research Paper Title' }],
                _tag: 'h1'
              }, 
              { _children: [{ _text: 'This is the content' }] }
            ] 
          } 
        }
      })
    );
    
    // Create a mock Word file
    const wordFile = new File([], 'titled.docx', { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    // Parse the file
    const result = await parser.parseFile(wordFile);
    
    // Title should be extracted from content
    expect(result.title).toBe('Research Paper Title');
    expect(result.content).toContain('This is the content');
  });

  // Test handling of Word documents with tables
  it('should handle documents with tables', async () => {
    // Mock mammoth to return content with table structure
    require('mammoth').extractRaw.mockImplementationOnce(() => 
      Promise.resolve({
        value: { 
          _root: { 
            _children: [
              { 
                _children: [{ _text: 'Document with Table' }],
                _tag: 'h1'
              },
              {
                _tag: 'table',
                _children: [
                  {
                    _tag: 'tr',
                    _children: [
                      { _tag: 'td', _children: [{ _text: 'Cell 1' }] },
                      { _tag: 'td', _children: [{ _text: 'Cell 2' }] }
                    ]
                  }
                ]
              }
            ] 
          } 
        }
      })
    );
    
    // Create a mock Word file
    const wordFile = new File([], 'table.docx', { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    // Parse the file
    const result = await parser.parseFile(wordFile);
    
    // Content should contain table data
    expect(result.content).toContain('Cell 1');
    expect(result.content).toContain('Cell 2');
  });
});
