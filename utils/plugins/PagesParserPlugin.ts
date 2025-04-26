import { IDocumentParserPlugin } from './IDocumentParserPlugin';

export const PagesParserPlugin: IDocumentParserPlugin = {
  name: 'Pages Parser',
  supportedFormats: ['.pages'],
  async parse(file: File): Promise<{ title?: string; abstract?: string; content: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // Apple Pages files require complex parsing (ZIP containers with XML metadata)
    // Until a full parser is implemented, return an unsupported format error
    throw new Error('Apple Pages format is currently unsupported. Please convert to PDF or another supported format.');
  },
};
