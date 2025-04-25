import {
  parseDocument,
  parseTextFile,
} from './documentParser';

describe('Document Parser Utility', () => {
  it('should have parseDocument function defined', () => {
    expect(parseDocument).toBeDefined();
  });

  describe('parseTextFile', () => {
    it('should parse a simple text file', async () => {
      const fileContent = 'Test Title\n\nThis is the first paragraph.\nThis is the second paragraph.';
      const mockBlob = new Blob([fileContent], { type: 'text/plain' });
      const mockFile = Object.assign(mockBlob, {
        name: 'test.txt',
        lastModified: Date.now(),
      }) as File;

      const result = await parseTextFile(mockFile);

      expect(result).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.title).toBe('Test Title');
      expect(result.content).toContain('This is the first paragraph.');
      expect(result.content).toContain('This is the second paragraph.');
      // Update: parseTextFile attempts to extract an abstract from lines after title
      expect(result.abstract).toContain('This is the first paragraph.');
      expect(result.abstract).toContain('This is the second paragraph.');
    });

    it('should handle empty text files', async () => {
      const fileContent = '';
      const mockBlob = new Blob([fileContent], { type: 'text/plain' });
      const mockFile = Object.assign(mockBlob, {
        name: 'empty.txt',
        lastModified: Date.now(),
      }) as File;

      const result = await parseTextFile(mockFile);

      expect(result).toBeDefined();
      expect(result.error).toBe('Empty file content');
      expect(result.content).toBeUndefined();
      // Update: parseTextFile does not set title for empty files
      expect(result.title).toBeUndefined();
    });

    // TODO: Add test cases for edge cases:
    // - File with only whitespace
    // - File with very long lines
    // - File with unusual line breaks
    // - File triggering abstract extraction logic (if applicable)
  });

  // TODO: Add tests for other critical helper functions within documentParser.ts if any
});
