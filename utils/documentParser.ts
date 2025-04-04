import { createLogger, LogCategory } from './logger';
import * as mammoth from 'mammoth';
import * as iconv from 'iconv-lite';

// We need to import pdfjs in a way that works with Next.js
let pdfjsLib: any;
if (typeof window !== 'undefined') {
  // Client-side only
  pdfjsLib = require('pdfjs-dist/build/pdf');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

const logger = createLogger('DocumentParser');

export interface ParsedDocument {
  title?: string;
  abstract?: string;
  keywords?: string[];
  content?: string;
  error?: string;
}

/**
 * Extracts text content from various document formats
 * Supports: Plain text, PDF, Word documents, and Apple Pages files
 */
export async function parseDocument(file: File): Promise<ParsedDocument> {
  try {
    logger.info(`Parsing document: ${file.name} (${file.type})`, {
      category: LogCategory.DOCUMENT
    });
    
    // Check file type and use appropriate parser
    if (file.type === 'text/plain') {
      return await parseTextFile(file);
    }
    
    // PDF files
    if (file.type === 'application/pdf') {
      return await parsePdfFile(file);
    }
    
    // Word documents
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.type === 'application/msword') {
      return await parseWordFile(file);
    }
    
    // Apple Pages files - typically have .pages extension
    if (file.name.toLowerCase().endsWith('.pages') || 
        file.type === 'application/vnd.apple.pages') {
      return await parsePagesFile(file);
    }
    
    return {
      error: `Unsupported file type: ${file.type}. Please use a supported document format (PDF, Word, Pages, or plain text).`
    };
  } catch (error) {
    logger.error(`Error parsing document: ${error}`, {
      category: LogCategory.DOCUMENT
    });
    return {
      error: `Failed to parse document: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Parse PDF files using PDF.js
 */
async function parsePdfFile(file: File): Promise<ParsedDocument> {
  if (typeof window === 'undefined') {
    return { error: 'PDF parsing is only available in browser environments' };
  }
  
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    
    let fullText = '';
    let title = '';
    let abstract = '';
    
    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      
      // First page typically contains title and abstract
      if (i === 1) {
        const lines = pageText.split(/\r?\n/);
        
        // Extract title (usually first non-empty line)
        for (let j = 0; j < lines.length; j++) {
          if (lines[j].trim()) {
            title = lines[j].trim();
            break;
          }
        }
        
        // Extract abstract (typically follows title and is a paragraph)
        // Look for keywords like "Abstract" or take first substantial paragraph
        const abstractIndex = pageText.toLowerCase().indexOf('abstract');
        if (abstractIndex !== -1) {
          // Extract text after "Abstract" keyword
          abstract = pageText.substring(abstractIndex + 8).trim().split(/\r?\n\r?\n/)[0];
        } else {
          // Take first substantial paragraph (more than 100 chars)
          for (let j = 1; j < lines.length; j++) {
            if (lines[j].length > 100) {
              abstract = lines[j];
              break;
            }
          }
        }
      }
      
      fullText += pageText + '\n\n';
    }
    
    // Extract keywords
    const keywords = extractKeywords(fullText);
    
    return {
      title,
      abstract,
      keywords,
      content: fullText
    };
  } catch (error) {
    logger.error(`Error parsing PDF: ${error}`, {
      category: LogCategory.DOCUMENT
    });
    return {
      error: `Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Parse Word documents using mammoth.js
 */
async function parseWordFile(file: File): Promise<ParsedDocument> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Use mammoth to extract text and basic formatting
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
    
    // Split content by lines
    const lines = text.split(/\r?\n/);
    
    // Extract title (first non-empty line)
    let title = '';
    let abstractStart = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim()) {
        title = lines[i].trim();
        abstractStart = i + 1;
        break;
      }
    }
    
    // Extract abstract
    let abstractLines: string[] = [];
    let contentStart = abstractStart;
    
    // Look for abstract section
    const abstractIndex = lines.findIndex(line => 
      line.toLowerCase().includes('abstract') && line.trim().length < 20);
    
    if (abstractIndex !== -1 && abstractIndex < 20) {
      // Start from the line after "Abstract"
      for (let i = abstractIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Stop at next section header or empty line after collecting some text
        if ((abstractLines.length > 3 && !line) || 
            (line.toLowerCase().includes('introduction') || 
             line.toLowerCase().includes('keywords'))) {
          contentStart = i;
          break;
        }
        
        if (line) {
          abstractLines.push(line);
        }
      }
    } else {
      // No explicit abstract section, take first paragraph
      for (let i = abstractStart; i < Math.min(abstractStart + 15, lines.length); i++) {
        const line = lines[i].trim();
        
        if (i > abstractStart + 3 && 
            (line.toLowerCase().includes('introduction') || 
             line.toLowerCase().includes('methods'))) {
          contentStart = i;
          break;
        }
        
        if (line) {
          abstractLines.push(line);
        }
        
        // If we have 5+ lines and hit an empty line, that might be the end of abstract
        if (abstractLines.length >= 5 && !line) {
          contentStart = i + 1;
          break;
        }
      }
    }
    
    // Extract keywords
    let keywords = extractKeywords(text);
    
    // Look specifically for keywords section
    const keywordsIndex = lines.findIndex(line => 
      line.toLowerCase().includes('keywords') && line.trim().length < 20);
    
    if (keywordsIndex !== -1 && keywordsIndex < 30) {
      // Extract keywords from the line after the "Keywords" header
      const keywordsLine = lines[keywordsIndex + 1].trim();
      if (keywordsLine) {
        keywords = keywordsLine.split(/[,;]/).map(k => k.trim()).filter(Boolean);
      }
    }
    
    // Join the remaining lines as content
    const contentText = lines.slice(contentStart).join('\n');
    
    return {
      title,
      abstract: abstractLines.join(' '),
      keywords,
      content: contentText
    };
  } catch (error) {
    logger.error(`Error parsing Word document: ${error}`, {
      category: LogCategory.DOCUMENT
    });
    return {
      error: `Failed to parse Word document: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Parse Apple Pages files
 * Note: Pages files are actually zip archives containing XML
 * This is a simplified approach that treats Pages files as XML/text
 */
async function parsePagesFile(file: File): Promise<ParsedDocument> {
  try {
    // For Pages files, we'll try to extract text content
    // Pages files are actually zip archives with XML content
    // This is a simplified approach for basic text extraction
    
    // Read the file as binary data
    const arrayBuffer = await file.arrayBuffer();
    
    // Convert to UTF-8 text (this is a simplification and may not work for all Pages files)
    const text = iconv.decode(Buffer.from(new Uint8Array(arrayBuffer)), 'utf-8');
    
    // Look for text content between XML tags
    const textContent = extractTextFromXml(text);
    
    if (!textContent) {
      return {
        error: 'Could not extract text from Pages document. Please export as PDF or Word and try again.'
      };
    }
    
    // Process the extracted text similarly to plain text files
    const lines = textContent.split(/\r?\n/);
    
    // Extract title (first non-empty line)
    let title = '';
    let abstractStart = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim()) {
        title = lines[i].trim();
        abstractStart = i + 1;
        break;
      }
    }
    
    // Extract abstract (next few lines)
    let abstractLines: string[] = [];
    let contentStart = abstractStart;
    
    for (let i = abstractStart; i < Math.min(abstractStart + 15, lines.length); i++) {
      const line = lines[i].trim();
      
      if (i > abstractStart + 3 && 
          (line.toLowerCase().includes('introduction') || 
           line.toLowerCase().includes('methods'))) {
        contentStart = i;
        break;
      }
      
      if (line) {
        abstractLines.push(line);
      }
      
      // If we have 5+ lines and hit an empty line, that might be the end of abstract
      if (abstractLines.length >= 5 && !line) {
        contentStart = i + 1;
        break;
      }
    }
    
    // Extract keywords
    const keywords = extractKeywords(textContent);
    
    // Join the remaining lines as content
    const contentText = lines.slice(contentStart).join('\n');
    
    return {
      title,
      abstract: abstractLines.join(' '),
      keywords,
      content: contentText
    };
  } catch (error) {
    logger.error(`Error parsing Pages document: ${error}`, {
      category: LogCategory.DOCUMENT
    });
    return {
      error: `Failed to parse Pages document: ${error instanceof Error ? error.message : String(error)}. Pages files are best supported when exported as PDF or Word.`
    };
  }
}

/**
 * Helper function to extract text from XML content (for Pages files)
 */
function extractTextFromXml(xmlContent: string): string {
  try {
    // This is a simplified approach to extract text from XML
    // Remove all XML tags and decode entities
    let text = xmlContent.replace(/<[^>]*>/g, ' ');
    
    // Decode common XML entities
    text = text.replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&amp;/g, '&')
               .replace(/&quot;/g, '"')
               .replace(/&apos;/g, "'");
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  } catch (error) {
    logger.error(`Error extracting text from XML: ${error}`, {
      category: LogCategory.DOCUMENT
    });
    return '';
  }
}

/**
 * Parse plain text files
 */
async function parseTextFile(file: File): Promise<ParsedDocument> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) {
          resolve({ error: 'Empty file content' });
          return;
        }
        
        // Split content by lines
        const lines = content.split(/\r?\n/);
        
        // Simple heuristic for title: first non-empty line
        let title = '';
        let abstractStart = 0;
        
        // Find title (first non-empty line)
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim()) {
            title = lines[i].trim();
            abstractStart = i + 1;
            break;
          }
        }
        
        // Extract abstract (next 5-10 lines or until a section break)
        let abstractLines: string[] = [];
        let contentStart = abstractStart;
        
        for (let i = abstractStart; i < Math.min(abstractStart + 15, lines.length); i++) {
          const line = lines[i].trim();
          
          // Look for section breaks like "Introduction", "Methods", etc.
          if (i > abstractStart + 3 && 
              (line.toLowerCase().includes('introduction') || 
               line.toLowerCase().includes('methods') || 
               line.toLowerCase().includes('background'))) {
            contentStart = i;
            break;
          }
          
          if (line) {
            abstractLines.push(line);
          }
          
          // If we have 5+ lines and hit an empty line, that might be the end of abstract
          if (abstractLines.length >= 5 && !line) {
            contentStart = i + 1;
            break;
          }
        }
        
        // Extract keywords
        const keywords = extractKeywords(content);
        
        // Join the remaining lines as content
        const contentText = lines.slice(contentStart).join('\n');
        
        resolve({
          title,
          abstract: abstractLines.join(' '),
          keywords,
          content: contentText
        });
      } catch (error) {
        logger.error(`Error parsing text file: ${error}`, {
          category: LogCategory.DOCUMENT
        });
        resolve({ 
          error: `Failed to parse text file: ${error instanceof Error ? error.message : String(error)}` 
        });
      }
    };
    
    reader.onerror = () => {
      resolve({ error: 'Failed to read file' });
    };
    
    reader.readAsText(file);
  });
}

/**
 * Helper function to extract keywords from text content
 */
function extractKeywords(text: string): string[] {
  // Look for keyword patterns in the text
  const keywordPatterns = [
    /keywords:(.+?)(?:\n|$)/i,
    /key\s*words:(.+?)(?:\n|$)/i,
    /terms:(.+?)(?:\n|$)/i
  ];
  
  for (const pattern of keywordPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].split(/[,;]/).map(k => k.trim()).filter(Boolean);
    }
  }
  
  // If no explicit keywords section, try to extract important terms
  // This is a simplified approach - in a production environment,
  // you might want to use NLP techniques for better keyword extraction
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Count word frequency
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Get top 5 most frequent words as keywords
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}
