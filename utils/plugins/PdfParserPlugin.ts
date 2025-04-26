import { IDocumentParserPlugin } from './IDocumentParserPlugin';

// We need to import pdfjs in a way that works with Next.js
let pdfjsLib: any;

if (typeof window !== 'undefined') {
  // Only load pdfjs-dist client-side
  pdfjsLib = require('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
}

export const PdfParserPlugin: IDocumentParserPlugin = {
  name: 'PDF Parser',
  supportedFormats: ['.pdf'],
  async parse(file: File): Promise<{ title?: string; abstract?: string; content: string }> {
    if (!pdfjsLib) {
      throw new Error('PDF.js library not loaded. PDF parsing is only supported in browser environments.');
    }
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(' ');
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
