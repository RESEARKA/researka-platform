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
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const contentWidth = pageWidth - (margin * 2);
  const maxY = pageHeight - margin; // Maximum Y position before new page
  let yPosition = margin;
  
  // Add title - using a heavier font for better bold appearance
  pdf.setFontSize(18);
  pdf.setFont('times', 'bold');
  
  // Split title into multiple lines if needed
  const titleLines = pdf.splitTextToSize(title, contentWidth);
  pdf.text(titleLines, margin, yPosition);
  yPosition += 10 * titleLines.length;
  
  // Add author and date
  pdf.setFontSize(12);
  pdf.setFont('times', 'normal');
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
    // Use times font for better bold appearance
    pdf.setFont('times', 'bold');
    pdf.setFontSize(14);
    pdf.text('Abstract', margin, yPosition);
    yPosition += 8;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(12);
    const abstractLines = pdf.splitTextToSize(abstract, contentWidth);
    
    // Check if we need a new page
    if (yPosition + (7 * abstractLines.length) > maxY) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.text(abstractLines, margin, yPosition);
    yPosition += 7 * abstractLines.length + 5;
  }
  
  // Add main content with section handling
  if (content) {
    // Process content sections (markdown-like)
    const sections = content.split(/\n## /);
    
    // Process the main content or first section if no ## markers
    let mainContent = sections[0];
    
    // If the content starts with ## (common in markdown), adjust the first section
    if (content.startsWith('## ')) {
      mainContent = sections[0].substring(3); // Remove the ## prefix
      sections.shift(); // Remove the first section as we'll handle it separately
    }
    
    // Process main content if it exists
    if (mainContent.trim()) {
      // Check if we need a new page
      if (yPosition + 15 > maxY) {
        pdf.addPage();
        yPosition = margin;
      }
      
      // Always add a bold Introduction title for the first section
      // Use times font for better bold appearance
      pdf.setFont('times', 'bold');
      pdf.setFontSize(14);
      pdf.text('Introduction', margin, yPosition);
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.setFont('times', 'normal');
      
      const contentLines = pdf.splitTextToSize(mainContent, contentWidth);
      
      // Check if we need a new page
      if (yPosition + (5 * contentLines.length) > maxY) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.text(contentLines, margin, yPosition);
      yPosition += 5 * contentLines.length + 5; // Reduced spacing after content
    }
    
    // Process each section
    for (let i = 0; i < sections.length; i++) {
      const sectionParts = sections[i].split('\n');
      const sectionTitle = sectionParts[0];
      const sectionContent = sectionParts.slice(1).join('\n');
      
      // Check if we need a new page for section title
      if (yPosition + 15 > maxY) {
        pdf.addPage();
        yPosition = margin;
      }
      
      // Add section title with bold formatting and larger font
      // Use times font for better bold appearance
      pdf.setFont('times', 'bold');
      pdf.setFontSize(14);
      pdf.text(sectionTitle, margin, yPosition);
      yPosition += 8;
      
      // Reset to normal text for content
      pdf.setFontSize(12);
      pdf.setFont('times', 'normal');
      
      if (sectionContent.trim()) {
        const sectionLines = pdf.splitTextToSize(sectionContent, contentWidth);
        
        // Calculate if content fits on current page
        const contentHeight = 5 * sectionLines.length;
        
        // Check if we need a new page for section content
        if (yPosition + contentHeight > maxY) {
          pdf.addPage();
          yPosition = margin;
        }
        
        // Add content with pagination
        let remainingLines = [...sectionLines];
        
        while (remainingLines.length > 0) {
          // Calculate how many lines fit on the current page
          const availableHeight = maxY - yPosition;
          const linesPerPage = Math.floor(availableHeight / 5);
          const linesToRender = remainingLines.slice(0, Math.max(1, linesPerPage));
          
          pdf.text(linesToRender, margin, yPosition);
          
          // Update position and remaining lines
          yPosition += 5 * linesToRender.length;
          remainingLines = remainingLines.slice(linesToRender.length);
          
          // If we have more lines, add a new page
          if (remainingLines.length > 0) {
            pdf.addPage();
            yPosition = margin;
          }
        }
        
        yPosition += 5; // Reduced spacing after section
      }
    }
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
    throw error; // Rethrow to allow caller to handle the error
  }
}
