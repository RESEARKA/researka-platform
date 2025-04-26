import { IDocumentParserPlugin } from './IDocumentParserPlugin';
import * as mammoth from 'mammoth';

export const WordParserPlugin: IDocumentParserPlugin = {
  name: 'Word Parser',
  supportedFormats: ['.docx', '.doc'],
  async parse(file: File): Promise<{ title?: string; abstract?: string; content: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
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
