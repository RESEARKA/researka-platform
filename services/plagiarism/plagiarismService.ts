import { execFile } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import { JSDOM } from 'jsdom';

const execFileAsync = promisify(execFile);

// Configuration from environment variables
const config = {
  jplagVersion: process.env.JPLAG_VERSION || '3.0.0',
  dockerContainer: process.env.JPLAG_CONTAINER || 'jplag_container',
  timeoutMs: parseInt(process.env.PLAGIARISM_CHECK_TIMEOUT_MS || '60000'),
  resultsDir: process.env.RESULTS_DIR || path.join(process.cwd(), 'results')
};

export interface PlagiarismResult {
  overallSimilarity: number;
  matches: Array<{
    sourceId: string;
    sourceTitle: string;
    similarity: number;
    matchedSections: Array<{
      startIndex: number;
      endIndex: number;
      text: string;
    }>;
  }>;
}

export class PlagiarismService {
  /**
   * Checks a document for plagiarism using JPlag
   * @param filePath Path to the file containing the text to check
   * @param sessionId Unique identifier for this check session
   * @returns Plagiarism check results
   */
  async checkPlagiarism(filePath: string, sessionId: string): Promise<PlagiarismResult> {
    // Create results directory if it doesn't exist
    const sessionResultsDir = path.join(config.resultsDir, sessionId);
    await fs.mkdir(sessionResultsDir, { recursive: true });
    
    try {
      // Run JPlag with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);
      
      try {
        await execFileAsync('docker', [
          'exec',
          config.dockerContainer,
          'java',
          '-jar',
          `/app/jplag-${config.jplagVersion}.jar`,
          '--language',
          'text',
          '-r',
          `/results/${sessionId}`,
          `/data/${sessionId}.txt`,
          '/data/corpus'
        ], { signal: controller.signal });
      } finally {
        clearTimeout(timeoutId);
      }
      
      // Parse results
      const resultsPath = path.join(config.resultsDir, sessionId, 'index.html');
      const resultsExist = await fs.access(resultsPath).then(() => true).catch(() => false);
      
      if (!resultsExist) {
        throw new Error('No results found');
      }
      
      return this.parseJPlagResults(resultsPath);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Plagiarism check timed out');
      }
      throw error;
    }
  }
  
  /**
   * Parses JPlag HTML results into a structured format
   * @param resultsPath Path to the JPlag results HTML file
   * @returns Structured plagiarism results
   */
  private async parseJPlagResults(resultsPath: string): Promise<PlagiarismResult> {
    const html = await fs.readFile(resultsPath, 'utf-8');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Extract overall similarity
    const overallSimilarity = this.extractOverallSimilarity(document);
    
    // Extract matches
    const matches = this.extractMatches(document);
    
    return {
      overallSimilarity,
      matches
    };
  }
  
  /**
   * Extracts the overall similarity percentage from JPlag results
   * @param document The parsed HTML document
   * @returns The overall similarity percentage (0-100)
   */
  private extractOverallSimilarity(document: Document): number {
    try {
      // JPlag typically includes an overall similarity score in its output
      // This implementation will need to be adjusted based on JPlag's actual HTML structure
      const similarityElement = document.querySelector('.similarity-score');
      if (similarityElement && similarityElement.textContent) {
        const match = similarityElement.textContent.match(/(\d+(\.\d+)?)%/);
        if (match && match[1]) {
          return parseFloat(match[1]);
        }
      }
      
      // If we can't find an explicit overall score, calculate an average from individual matches
      const matchElements = document.querySelectorAll('.match-item');
      if (matchElements.length > 0) {
        let totalSimilarity = 0;
        matchElements.forEach(element => {
          const similarityText = element.querySelector('.match-similarity')?.textContent;
          if (similarityText) {
            const match = similarityText.match(/(\d+(\.\d+)?)%/);
            if (match && match[1]) {
              totalSimilarity += parseFloat(match[1]);
            }
          }
        });
        return totalSimilarity / matchElements.length;
      }
      
      return 0; // Default to 0 if no similarity information found
    } catch (error) {
      console.error('Error extracting overall similarity:', error);
      return 0;
    }
  }
  
  /**
   * Extracts detailed match information from JPlag results
   * @param document The parsed HTML document
   * @returns Array of match objects with source and section details
   */
  private extractMatches(document: Document): PlagiarismResult['matches'] {
    try {
      const matches: PlagiarismResult['matches'] = [];
      const matchElements = document.querySelectorAll('.match-item');
      
      matchElements.forEach(element => {
        // Extract source information
        const sourceElement = element.querySelector('.match-source');
        const sourceId = sourceElement?.getAttribute('data-source-id') || 'unknown';
        const sourceTitle = sourceElement?.textContent?.trim() || 'Unknown Source';
        
        // Extract similarity percentage
        const similarityText = element.querySelector('.match-similarity')?.textContent;
        let similarity = 0;
        if (similarityText) {
          const match = similarityText.match(/(\d+(\.\d+)?)%/);
          if (match && match[1]) {
            similarity = parseFloat(match[1]);
          }
        }
        
        // Extract matched sections
        const matchedSections: PlagiarismResult['matches'][0]['matchedSections'] = [];
        const sectionElements = element.querySelectorAll('.match-section');
        
        sectionElements.forEach(sectionElement => {
          const startIndex = parseInt(sectionElement.getAttribute('data-start-index') || '0');
          const endIndex = parseInt(sectionElement.getAttribute('data-end-index') || '0');
          const text = sectionElement.textContent?.trim() || '';
          
          if (text) {
            matchedSections.push({
              startIndex,
              endIndex,
              text
            });
          }
        });
        
        matches.push({
          sourceId,
          sourceTitle,
          similarity,
          matchedSections
        });
      });
      
      return matches;
    } catch (error) {
      console.error('Error extracting matches:', error);
      return [];
    }
  }
}
