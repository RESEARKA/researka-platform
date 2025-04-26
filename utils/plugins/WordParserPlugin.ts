import { IDocumentParserPlugin } from './IDocumentParserPlugin';
import * as mammoth from 'mammoth';

export const WordParserPlugin: IDocumentParserPlugin = {
  name: 'Word Parser',
  supportedFormats: ['.docx', '.doc'],
  async parse(file: File): Promise<{ title?: string; abstract?: string; content: string }> {
    // Guard against large files to prevent memory issues
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds limit of 5MB for Word documents. Size: ${file.size} bytes`);
    }

    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        // Check for tracked changes warning (mammoth may include them in messages)
        if (result.messages.some((msg: any) => msg.type === 'warning' && msg.message.includes('track'))) {
          console.warn('Warning: This Word document contains tracked changes which may result in duplicate content.');
        }
        resolve({
          content: text,
          abstract: text.length > 200 ? text.substring(0, 200) + '...' : text,
        });
      } catch (error) {
        reject(new Error(`Failed to parse Word document: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  },
};
