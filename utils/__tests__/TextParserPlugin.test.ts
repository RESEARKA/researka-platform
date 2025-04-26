import { TextParserPlugin } from '../plugins/TextParserPlugin';

import { expect } from '@jest/globals';

// Mock File for testing purposes
function createMockFile(content: string, name: string, size: number): File {
  const blob = new Blob([content], { type: 'text/plain' });
  Object.defineProperty(blob, 'size', { value: size });
  return new File([blob], name, { type: 'text/plain' });
}

describe('TextParserPlugin', () => {
  test('should parse a small text file correctly', async () => {
    const content = 'This is a simple text file.\nWith multiple lines.';
    const file = createMockFile(content, 'simple.txt', content.length);
    const result = await TextParserPlugin.parse(file);
    expect(result.content).toBe(content);
    expect(result.abstract).toBe(content);
    expect(result.title).toBe('This is a simple text file.');
  });

  test('should handle empty or whitespace-only file', async () => {
    const content = '  \n  \n  ';
    const file = createMockFile(content, 'empty.txt', content.length);
    const result = await TextParserPlugin.parse(file);
    expect(result.content).toBe('');
    expect(result.abstract).toBe('');
    expect(result.title).toBeUndefined();
  });

  test('should throw error for file exceeding size limit', async () => {
    const content = 'A'.repeat(1024 * 1024 + 1); // Over 1MB
    const file = createMockFile(content, 'large.txt', content.length);
    await expect(TextParserPlugin.parse(file)).rejects.toThrow(
      `File size exceeds limit of 1MB for text files. Size: ${content.length} bytes`
    );
  });

  test('should throw error for non-UTF-8 content', async () => {
    // Simulate non-UTF-8 content by overriding the readAsText result
    const file = createMockFile('', 'invalid.txt', 100);
    jest.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function (this: FileReader, blob: Blob) {
      const event = new ProgressEvent('load', { loaded: 100, total: 100 });
      Object.defineProperty(event, 'target', { value: { result: '\xFF\xFEInvalid encoding' } });
      if (this.onload) {
        this.onload(event as any);
      }
    });
    await expect(TextParserPlugin.parse(file)).rejects.toThrow('File content is not valid UTF-8 encoded text.');
  });
});
