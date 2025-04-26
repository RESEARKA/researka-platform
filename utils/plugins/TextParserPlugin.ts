import { IDocumentParserPlugin } from './IDocumentParserPlugin';

export const TextParserPlugin: IDocumentParserPlugin = {
  name: 'Text Parser',
  supportedFormats: ['.txt', '.md'],
  async parse(file: File): Promise<{ title?: string; abstract?: string; content: string }> {
    // Guard against large files to prevent memory issues
    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds limit of 1MB for text files. Size: ${file.size} bytes`);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        // Basic check for UTF-8 compatibility (simplified)
        try {
          // Attempt to decode as UTF-8; if it fails, it might not be a valid text file
          decodeURIComponent(escape(text));
          if (!text.trim()) {
            resolve({ content: '', abstract: '' });
            return;
          }
          const lines = text.split('\n');
          const firstNonEmptyLine = lines.find((line) => line.trim()) || '';
          resolve({
            title: firstNonEmptyLine.trim(),
            abstract: text.length > 200 ? text.substring(0, 200) + '...' : text,
            content: text,
          });
        } catch (error) {
          reject(new Error('File content is not valid UTF-8 encoded text.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read text file.'));
      reader.readAsText(file);
    });
  },
};
