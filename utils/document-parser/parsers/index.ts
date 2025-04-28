/**
 * Parser registry
 * Manages and provides access to all document parsers
 */
import { IDocumentParser } from './parser';
import { PdfParser } from './pdf-parser';
import { TextParser } from './text-parser';
import { WordParser } from './word-parser';
import { PagesParser } from './pages-parser';
import { StructuredDocument, ParserOptions } from '../types/document';
import { createLogger, LogCategory } from '../../logger';

const logger = createLogger('ParserRegistry');

/**
 * Registry of all available document parsers
 */
export class ParserRegistry {
  private static instance: ParserRegistry;
  private parsers: IDocumentParser[] = [];

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Register all available parsers
    this.registerParser(new PdfParser());
    this.registerParser(new TextParser());
    this.registerParser(new WordParser());
    this.registerParser(new PagesParser());
    
    logger.info(`Initialized parser registry with ${this.parsers.length} parsers`);
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ParserRegistry {
    if (!ParserRegistry.instance) {
      ParserRegistry.instance = new ParserRegistry();
    }
    return ParserRegistry.instance;
  }

  /**
   * Register a new parser
   * @param parser Parser to register
   */
  public registerParser(parser: IDocumentParser): void {
    this.parsers.push(parser);
  }

  /**
   * Find a parser that supports the given file
   * @param file File to find parser for
   * @returns Matching parser or undefined if none found
   */
  public findParserForFile(file: File): IDocumentParser | undefined {
    return this.parsers.find(parser => parser.supports(file));
  }

  /**
   * Parse a document using an appropriate parser
   * @param file File to parse
   * @param options Parser options
   * @returns Parsed document
   */
  public async parseDocument(file: File, options?: ParserOptions): Promise<StructuredDocument> {
    const parser = this.findParserForFile(file);
    
    if (!parser) {
      logger.warn(`No parser found for file: ${file.name} (${file.type})`);
      return {
        error: `Unsupported file type: ${file.type || file.name.split('.').pop()}`,
        warnings: []
      };
    }
    
    logger.info(`Using ${parser.constructor.name} to parse: ${file.name}`);
    return parser.parseFile(file, options);
  }
}

// Export a singleton instance for convenience
export const parserRegistry = ParserRegistry.getInstance();

// Export a convenience function for parsing documents
export async function parseDocument(file: File, options?: ParserOptions): Promise<StructuredDocument> {
  return parserRegistry.parseDocument(file, options);
}
