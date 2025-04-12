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
    creator: 'DecentraJournal'
  });
  
  // Set font and margins
  const margin = 20; // mm
  let yPosition = margin;
  
  // Add title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  
  // Split title into multiple lines if needed
  const titleLines = pdf.splitTextToSize(title, 170);
  pdf.text(titleLines, margin, yPosition);
  yPosition += 10 * titleLines.length;
  
  // Add author and date
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Author: ${author}`, margin, yPosition);
  yPosition += 7;
  pdf.text(`Date: ${date}`, margin, yPosition);
  yPosition += 10;
  
  // Add categories if available
  if (categories.length > 0) {
    pdf.text(`Categories: ${categories.join(', ')}`, margin, yPosition);
    yPosition += 10;
  }
  
  // Add abstract if available
  if (abstract) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Abstract', margin, yPosition);
    yPosition += 7;
    pdf.setFont('helvetica', 'normal');
    const abstractLines = pdf.splitTextToSize(abstract, 170);
    pdf.text(abstractLines, margin, yPosition);
    yPosition += 7 * abstractLines.length;
  }
  
  // Add main content
  if (content) {
    yPosition += 5;
    const contentLines = pdf.splitTextToSize(content, 170);
    pdf.text(contentLines, margin, yPosition);
  }
  
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
    const safeFilename = filename || options.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf';
    
    // Download the PDF
    pdf.save(safeFilename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Show error message to user
    alert('Failed to generate PDF. Please try again later.');
  }
}
