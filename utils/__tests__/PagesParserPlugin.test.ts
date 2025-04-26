import { PagesParserPlugin } from '../plugins/PagesParserPlugin';

import { expect } from '@jest/globals';

// Mock File for testing purposes
function createMockFile(content: string, name: string, size: number): File {
  const blob = new Blob([content], { type: 'application/vnd.apple.pages' });
  Object.defineProperty(blob, 'size', { value: size });
  return new File([blob], name, { type: 'application/vnd.apple.pages' });
}

describe('PagesParserPlugin', () => {
  test('should throw unsupported format error for Pages file', async () => {
    const content = 'Pages file placeholder';
    const file = createMockFile(content, 'document.pages', content.length);
    await expect(PagesParserPlugin.parse(file)).rejects.toThrow(
      'Apple Pages format is currently unsupported. Please convert to PDF or another supported format.'
    );
  });
});
