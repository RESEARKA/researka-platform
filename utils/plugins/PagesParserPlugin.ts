import { IDocumentParserPlugin } from './IDocumentParserPlugin';
import * as iconv from 'iconv-lite';

export const PagesParserPlugin: IDocumentParserPlugin = {
  name: 'Pages Parser',
  supportedFormats: ['.pages'],
  async parse(file: File): Promise<{ title?: string; abstract?: string; content: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        // Apple Pages files are often ZIP containers with XML metadata
        // For simplicity, we're just trying to extract readable text if possible
        // This is a placeholder for actual parsing logic
        const buffer = Buffer.from(arrayBuffer);
        const text = iconv.decode(buffer, 'utf8');
        resolve({
          content: text,
          abstract: text.length > 200 ? text.substring(0, 200) + '...' : text,
        });
      } catch (error) {
        reject(error);
      }
    });
  },
};
