import { IDocumentParserPlugin } from './IDocumentParserPlugin';

export const WordParserPlugin: IDocumentParserPlugin = {
  name: 'Word Parser',
  supportedFormats: ['.docx', '.doc'],
  async parse(file: File): Promise<{ title?: string; abstract?: string; content: string }> {
    // Placeholder: Implementation to be added
    return { content: 'Word document parsing not yet implemented', abstract: '' };
  },
};
