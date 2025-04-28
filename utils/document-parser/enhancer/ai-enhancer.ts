/**
 * AI Document Enhancer
 * Uses AI to enhance document structure and content
 */
import { StructuredDocument, EnhancedDocument } from '../types/document';
import { createDeepSeekAI } from '../../deepseekAI';
import { createLogger, LogCategory } from '../../logger';

const logger = createLogger('AIEnhancer');

/**
 * Enhances documents using AI
 */
export class AIDocumentEnhancer {
  /**
   * Enhance a document using AI
   * @param document Document to enhance
   * @returns Enhanced document
   */
  public async enhanceDocument(document: StructuredDocument): Promise<EnhancedDocument> {
    try {
      logger.info('Enhancing document with AI');
      
      // Start with a copy of the original document
      const enhancedDocument: EnhancedDocument = {
        ...document,
        aiEnhanced: true,
        warnings: [...(document.warnings || [])]
      };
      
      // Create AI client
      const deepseek = createDeepSeekAI();
      
      // Prepare document content for enhancement
      const contentToProcess = this.prepareContentForAI(document);
      
      if (!contentToProcess) {
        enhancedDocument.warnings.push('Not enough content to enhance with AI');
        return enhancedDocument;
      }
      
      // Process tasks in parallel for efficiency
      const [enhancedKeywords, summary, researchQuestions] = await Promise.all([
        this.enhanceKeywords(deepseek, document),
        this.generateSummary(deepseek, contentToProcess),
        this.extractResearchQuestions(deepseek, contentToProcess)
      ]);
      
      // Update the document with enhanced content
      enhancedDocument.enhancedKeywords = enhancedKeywords;
      enhancedDocument.summary = summary;
      enhancedDocument.researchQuestions = researchQuestions;
      
      return enhancedDocument;
    } catch (error) {
      logger.error('Failed to enhance document with AI', error);
      
      // Return original document with error warning
      return {
        ...document,
        aiEnhanced: false,
        warnings: [
          ...(document.warnings || []),
          `AI enhancement failed: ${error.message}`
        ]
      };
    }
  }
  
  /**
   * Prepare document content for AI processing
   * @param document Document to prepare
   * @returns Processed content or null if insufficient content
   */
  private prepareContentForAI(document: StructuredDocument): string | null {
    // Use specific sections if available, otherwise fall back to full content
    let contentToProcess = '';
    
    if (document.abstract) {
      contentToProcess += `Abstract:\n${document.abstract}\n\n`;
    }
    
    if (document.introduction) {
      contentToProcess += `Introduction:\n${document.introduction}\n\n`;
    }
    
    if (document.methods) {
      contentToProcess += `Methods:\n${document.methods}\n\n`;
    }
    
    if (document.results) {
      contentToProcess += `Results:\n${document.results}\n\n`;
    }
    
    if (document.conclusion) {
      contentToProcess += `Conclusion:\n${document.conclusion}\n\n`;
    }
    
    // If we don't have enough specific sections, use the full content
    if (contentToProcess.length < 200 && document.content) {
      contentToProcess = document.content;
    }
    
    // Return null if we still don't have enough content
    if (contentToProcess.length < 100) {
      return null;
    }
    
    return contentToProcess;
  }
  
  /**
   * Enhance document keywords using AI
   * @param ai AI client
   * @param document Document with original keywords
   * @returns Enhanced keywords
   */
  private async enhanceKeywords(ai: any, document: StructuredDocument): Promise<string[]> {
    try {
      // If we already have keywords, use them as a starting point
      const existingKeywords = document.keywords || [];
      const existingKeywordText = existingKeywords.length > 0 
        ? `Existing keywords: ${existingKeywords.join(', ')}`
        : 'No existing keywords.';
      
      // Prepare content for keyword extraction
      let contentForKeywords = '';
      if (document.title) contentForKeywords += `Title: ${document.title}\n`;
      if (document.abstract) contentForKeywords += `Abstract: ${document.abstract}\n`;
      
      // If we don't have title or abstract, use a sample of the full content
      if (!contentForKeywords && document.content) {
        contentForKeywords = document.content.slice(0, 1500);
      }
      
      // Generate the prompt
      const prompt = `
        Extract 5-10 relevant academic keywords from this document.
        ${existingKeywordText}
        
        Document content:
        ${contentForKeywords}
        
        Return only the keywords as a comma-separated list.
      `;
      
      // Get AI response
      const response = await ai.generateText(prompt.trim());
      
      // Parse the keywords from the response
      const keywordText = response || '';
      
      // Process into array and clean up
      return keywordText
        .split(/,|\n/)
        .map(k => k.trim())
        .filter(k => k.length > 0)
        // Remove any bullet points or numbering
        .map(k => k.replace(/^[•\-\d.)\]]+\s*/, ''))
        // Filter out any keywords that are too long to be realistic
        .filter(k => k.length < 50);
    } catch (error) {
      logger.error('Failed to enhance keywords', error);
      return document.keywords || [];
    }
  }
  
  /**
   * Generate a document summary
   * @param ai AI client
   * @param content Document content
   * @returns Generated summary
   */
  private async generateSummary(ai: any, content: string): Promise<string> {
    try {
      // Prepare content - limit to avoid token limits
      const truncatedContent = content.length > 6000 
        ? content.slice(0, 6000) + '...'
        : content;
      
      // Generate the prompt
      const prompt = `
        Provide a concise summary (2-3 paragraphs) of the following research document:
        
        ${truncatedContent}
        
        Focus on the key research questions, methods, findings, and implications.
      `;
      
      // Get AI response
      const response = await ai.generateText(prompt.trim());
      
      return response || '';
    } catch (error) {
      logger.error('Failed to generate summary', error);
      return '';
    }
  }
  
  /**
   * Extract research questions from document
   * @param ai AI client
   * @param content Document content
   * @returns Extracted research questions
   */
  private async extractResearchQuestions(ai: any, content: string): Promise<string[]> {
    try {
      // Prepare content - limit to avoid token limits
      const truncatedContent = content.length > 6000 
        ? content.slice(0, 6000) + '...'
        : content;
      
      // Generate the prompt
      const prompt = `
        Extract the main research questions addressed in this document:
        
        ${truncatedContent}
        
        List the research questions in bullet point format. If no explicit research questions are present, 
        formulate them based on the document's content.
      `;
      
      // Get AI response
      const response = await ai.generateText(prompt.trim());
      
      // Process into array and clean up
      return (response || '')
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0)
        // Remove any bullet points or numbering
        .map(q => q.replace(/^[•\-\d.)\]]+\s*/, ''));
    } catch (error) {
      logger.error('Failed to extract research questions', error);
      return [];
    }
  }
}
