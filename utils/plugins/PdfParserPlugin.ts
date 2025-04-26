import { IDocumentParserPlugin } from './IDocumentParserPlugin';

// We need to import pdfjs in a way that works with Next.js
let pdfjsLib: any;

if (typeof window !== 'undefined') {
  // Only load pdfjs-dist client-side
  pdfjsLib = require('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
  // Disable streaming to avoid Node I/O errors with pdfjs-dist
  pdfjsLib.GlobalWorkerOptions.disableStream = true;
}

export const PdfParserPlugin: IDocumentParserPlugin = {
  name: 'PDF Parser',
  supportedFormats: ['.pdf'],
  async parse(file: File): Promise<{ title?: string; abstract?: string; content: string }> {
    if (!pdfjsLib) {
      throw new Error('PDF.js library not loaded. PDF parsing is only supported in browser environments.');
    }
    // Guard against large files to prevent memory issues
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds limit of 10MB for PDF files. Size: ${file.size} bytes`);
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
        if (error instanceof Error && error.name === 'UnexpectedResponseException') {
          reject(new Error('Failed to parse PDF: Unexpected response or format error.'));
        } else if (error instanceof Error && error.message.includes('encrypted')) {
          reject(new Error('Failed to parse PDF: Document is encrypted or password-protected.'));
        } else {
          reject(new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      }
    });
  },
};
