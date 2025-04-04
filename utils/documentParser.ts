import { createLogger, LogCategory } from './logger';

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
 * Phase 1: Basic text extraction from plain text files
 */
export async function parseDocument(file: File): Promise<ParsedDocument> {
  try {
    logger.info(`Parsing document: ${file.name} (${file.type})`, {
      category: LogCategory.DOCUMENT
    });
    
    // Check if file is a text file
    if (file.type === 'text/plain') {
      return await parseTextFile(file);
    }
    
    // For PDF files, we'll need to add a PDF.js integration in a future phase
    if (file.type === 'application/pdf') {
      return {
        error: 'PDF parsing will be available in a future update. Please use plain text files for now.'
      };
    }
    
    // For Word documents, we'll need to add a docx parser in a future phase
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.type === 'application/msword') {
      return {
        error: 'Word document parsing will be available in a future update. Please use plain text files for now.'
      };
    }
    
    return {
      error: `Unsupported file type: ${file.type}. Please use a plain text (.txt) file.`
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
 * Parse plain text files
 * Attempts to identify title, abstract, and content based on structure
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
        
        // Extract keywords (look for lines with comma-separated terms)
        let keywords: string[] = [];
        const abstractText = abstractLines.join(' ');
        
        // Look for keyword patterns in the abstract
        const keywordPatterns = [
          /keywords:(.+)/i,
          /key\s*words:(.+)/i,
          /terms:(.+)/i
        ];
        
        for (const pattern of keywordPatterns) {
          const match = abstractText.match(pattern);
          if (match && match[1]) {
            keywords = match[1].split(',').map(k => k.trim()).filter(Boolean);
            break;
          }
        }
        
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
