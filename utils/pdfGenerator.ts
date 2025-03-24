import jsPDF from 'jspdf';

interface GeneratePdfOptions {
  title: string;
  author?: string;
  abstract?: string;
  content?: string;
  date?: string;
  categories?: string[];
}

/**
 * Generates a PDF document from article data
 * @param options PDF generation options containing article data
 * @returns The generated PDF document
 */
function generateArticlePdf(options: GeneratePdfOptions): jsPDF {
  const { title, author = 'Unknown Author', abstract = '', content = '', date = new Date().toLocaleDateString(), categories = [] } = options;
  
  // Create a new PDF document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add metadata
  pdf.setProperties({
    title,
    author,
    subject: abstract.substring(0, 100),
    keywords: categories.join(', '),
    creator: 'Researka Platform'
  });
  
  // Add title
  pdf.setFontSize(22);
  pdf.text(title, 20, 30);
  
  // Add date
  pdf.setFontSize(10);
  pdf.text(`Date: ${date}`, 20, 40);
  
  // Add author
  pdf.text(`Author: ${author}`, 20, 45);
  
  // Add categories if available
  if (categories.length > 0) {
    pdf.text(`Categories: ${categories.join(', ')}`, 20, 50);
  }
  
  // Add abstract
  if (abstract) {
    pdf.setFontSize(12);
    pdf.text('Abstract', 20, 60);
    pdf.setFontSize(10);
    
    const abstractLines = pdf.splitTextToSize(abstract, 170);
    pdf.text(abstractLines, 20, 65);
  }
  
  // Add content
  const contentStartY = abstract ? 75 + (pdf.splitTextToSize(abstract, 170).length * 5) : 65;
  pdf.setFontSize(12);
  pdf.text('Full Text', 20, contentStartY);
  pdf.setFontSize(10);
  
  const contentLines = pdf.splitTextToSize(content || 'No content available', 170);
  pdf.text(contentLines, 20, contentStartY + 5);
  
  return pdf;
}

/**
 * Generates and downloads a PDF for an article
 * @param options PDF generation options containing article data
 * @param filename Custom filename (optional, defaults to sanitized article title)
 */
export function downloadArticlePdf(options: GeneratePdfOptions, filename?: string): void {
  try {
    const pdf = generateArticlePdf(options);
    
    // Create a sanitized filename if not provided
    const safeFilename = filename || options.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Download the PDF
    pdf.save(`${safeFilename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}
