import { WordParserPlugin } from '../plugins/WordParserPlugin';

import { expect } from '@jest/globals';

// Mock File for testing purposes
function createMockFile(content: string, name: string, size: number): File {
  const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  Object.defineProperty(blob, 'size', { value: size });
  return new File([blob], name, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

// Mock mammoth for testing
describe('WordParserPlugin', () => {
  beforeAll(() => {
    // Mock the mammoth library
    jest.mock('mammoth', () => ({
      extractRawText: jest.fn(() => Promise.resolve({
        value: 'This is a Word document content.',
        messages: []
      })))
    }));
  });

  afterAll(() => {
    jest.unmock('mammoth');
  });

  test('should parse a small Word document correctly', async () => {
    const content = 'DOCX binary content placeholder';
    const file = createMockFile(content, 'simple.docx', content.length);
    const result = await WordParserPlugin.parse(file);
    expect(result.content).toBe('This is a Word document content.');
    expect(result.abstract).toBe('This is a Word document content.');
  });

  test('should throw error for file exceeding size limit', async () => {
    const content = 'A'.repeat(5 * 1024 * 1024 + 1); // Over 5MB
    const file = createMockFile(content, 'large.docx', content.length);
    await expect(WordParserPlugin.parse(file)).rejects.toThrow(
      `File size exceeds limit of 5MB for Word documents. Size: ${content.length} bytes`
    );
  });

  test('should log warning for tracked changes but still parse', async () => {
    // Mock mammoth to return messages indicating tracked changes
    jest.mock('mammoth', () => ({
      extractRawText: jest.fn(() => Promise.resolve({
        value: 'This is a Word document with tracked changes.',
        messages: [{ type: 'warning', message: 'Tracked changes detected in track revisions.' }]
      })))
    }));

    const consoleWarnSpy = jest.spyOn(console, 'warn');
    const content = 'DOCX with tracked changes placeholder';
    const file = createMockFile(content, 'tracked_changes.docx', content.length);
    const result = await WordParserPlugin.parse(file);
    expect(result.content).toBe('This is a Word document with tracked changes.');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Warning: This Word document contains tracked changes which may result in duplicate content.'
    );
    consoleWarnSpy.mockRestore();
  });

  test('should handle empty document', async () => {
    // Mock mammoth to return empty content
    jest.mock('mammoth', () => ({
      extractRawText: jest.fn(() => Promise.resolve({
        value: '',
        messages: []
      })))
    }));

    const content = 'Empty DOCX placeholder';
    const file = createMockFile(content, 'empty.docx', content.length);
    const result = await WordParserPlugin.parse(file);
    expect(result.content).toBe('');
    expect(result.abstract).toBe('');
  });
});
