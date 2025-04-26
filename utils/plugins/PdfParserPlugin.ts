import { IDocumentParserPlugin } from './IDocumentParserPlugin';

export const PdfParserPlugin: IDocumentParserPlugin = {
  name: 'PDF Parser',
  supportedFormats: ['.pdf'],
  async parse(file: File): Promise<{ title?: string; abstract?: string; content: string }> {
    // Placeholder: Implementation to be added
    return { content: 'PDF parsing not yet implemented', abstract: '' };
  },
};
