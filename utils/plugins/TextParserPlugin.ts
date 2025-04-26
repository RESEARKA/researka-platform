import { IDocumentParserPlugin } from './IDocumentParserPlugin';

export const TextParserPlugin: IDocumentParserPlugin = {
  name: 'Text Parser',
  supportedFormats: ['.txt'],
  async parse(file: File): Promise<{ title?: string; abstract?: string; content: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          if (!text.trim()) {
            resolve({ content: '', abstract: '' });
            return;
          }
          const lines = text.split('\n');
          const firstNonEmptyLine = lines.find((line) => line.trim()) || '';
          resolve({
            title: firstNonEmptyLine.trim(),
            abstract: text,
            content: text,
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  },
};
