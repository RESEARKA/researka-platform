/**
 * Document Enhancer
 * Exports functionality for enhancing documents with AI
 */
import { AIDocumentEnhancer } from './ai-enhancer';
import { StructuredDocument, EnhancedDocument } from '../types/document';

// Export the enhancer class
export { AIDocumentEnhancer };

// Create a singleton instance for convenience
const aiEnhancer = new AIDocumentEnhancer();

/**
 * Enhance a document with AI processing
 * @param document Document to enhance
 * @returns Enhanced document
 */
export async function enhanceDocumentWithAI(document: StructuredDocument): Promise<EnhancedDocument> {
  return aiEnhancer.enhanceDocument(document);
}
