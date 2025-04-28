export interface IDocumentParserPlugin {
  name: string;
  supportedFormats: string[];
  parse(file: File): Promise<{ title?: string; abstract?: string; content: string }>;
}
