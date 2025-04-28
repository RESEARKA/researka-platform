import { PdfParserPlugin } from '../plugins/PdfParserPlugin';

import { expect } from '@jest/globals';

// Mock File for testing purposes
function createMockFile(content: string, name: string, size: number): File {
  const blob = new Blob([content], { type: 'application/pdf' });
  Object.defineProperty(blob, 'size', { value: size });
  return new File([blob], name, { type: 'application/pdf' });
}

// Mock pdfjs-dist for testing
describe('PdfParserPlugin', () => {
  beforeAll(() => {
    // Mock the pdfjs-dist library
    jest.mock('pdfjs-dist', () => {
      const mockGetDocument = jest.fn(() => ({
        promise: Promise.resolve({
          getPage: jest.fn(() => Promise.resolve({
            getTextContent: jest.fn(() => Promise.resolve({
              items: [{ str: 'This is a PDF content.' }]
            }))
          })))
        })
      }));
      return {
        getDocument: mockGetDocument,
        GlobalWorkerOptions: { workerSrc: '/pdf.worker.js', disableStream: true }
      };
    });
  });

  afterAll(() => {
    jest.unmock('pdfjs-dist');
  });

  test('should parse a small PDF file correctly', async () => {
    const content = 'PDF binary content placeholder';
    const file = createMockFile(content, 'simple.pdf', content.length);
    const result = await PdfParserPlugin.parse(file);
    expect(result.content).toBe('This is a PDF content.');
    expect(result.abstract).toBe('This is a PDF content.');
  });

  test('should throw error for file exceeding size limit', async () => {
    const content = 'A'.repeat(10 * 1024 * 1024 + 1); // Over 10MB
    const file = createMockFile(content, 'large.pdf', content.length);
    await expect(PdfParserPlugin.parse(file)).rejects.toThrow(
      `File size exceeds limit of 10MB for PDF files. Size: ${content.length} bytes`
    );
  });

  test('should throw error for encrypted PDF', async () => {
    // Mock pdfjs-dist to simulate an encrypted PDF error
    jest.mock('pdfjs-dist', () => {
      const mockGetDocument = jest.fn(() => ({
        promise: Promise.reject(new Error('PDF is encrypted'))
      }));
      return {
        getDocument: mockGetDocument,
        GlobalWorkerOptions: { workerSrc: '/pdf.worker.js', disableStream: true }
      };
    });

    const content = 'Encrypted PDF placeholder';
    const file = createMockFile(content, 'encrypted.pdf', content.length);
    await expect(PdfParserPlugin.parse(file)).rejects.toThrow(
      'Failed to parse PDF: Document is encrypted or password-protected.'
    );
  });

  test('should throw error for unexpected response exception', async () => {
    // Mock pdfjs-dist to simulate an UnexpectedResponseException
    jest.mock('pdfjs-dist', () => {
      const mockError = new Error('Unexpected response');
      mockError.name = 'UnexpectedResponseException';
      const mockGetDocument = jest.fn(() => ({
        promise: Promise.reject(mockError)
      }));
      return {
        getDocument: mockGetDocument,
        GlobalWorkerOptions: { workerSrc: '/pdf.worker.js', disableStream: true }
      };
    });

    const content = 'Unexpected response PDF placeholder';
    const file = createMockFile(content, 'error.pdf', content.length);
    await expect(PdfParserPlugin.parse(file)).rejects.toThrow(
      'Failed to parse PDF: Unexpected response or format error.'
    );
  });
});
