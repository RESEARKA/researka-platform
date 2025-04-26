import { IDocumentParserPlugin } from './IDocumentParserPlugin';

export const PagesParserPlugin: IDocumentParserPlugin = {
  name: 'Pages Parser',
  supportedFormats: ['.pages'],
  async parse(file: File): Promise<{ title?: string; abstract?: string; content: string }> {
    // Placeholder: Implementation to be added
    return { content: 'Pages document parsing not yet implemented', abstract: '' };
  },
};
