/**
 * GeminiAI Utility Module
 * 
 * A TypeScript utility for interacting with the Gemini 2.5 Pro API
 * with proper error handling, fallbacks, and performance monitoring.
 */

import { createLogger, LogCategory } from './logger';

// Define types for the Gemini API
interface GeminiConfig {
  apiKey: string;
  model: string;
  fallbackModel?: string;
  maxRetries?: number;
  timeout?: number;
}

interface GeminiRequestOptions {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

interface GeminiResponse {
  text: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  success: boolean;
  error?: Error;
}

// Create a logger for this module
const logger = createLogger('geminiAI');

/**
 * GeminiAI class for handling interactions with the Gemini API
 */
export class GeminiAI {
  private apiKey: string;
  private model: string;
  private fallbackModel: string;
  private maxRetries: number;
  private timeout: number;
  private genAI: any; // Type will be GoogleGenerativeAI

  /**
   * Initialize the GeminiAI client
   */
  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-2.5-pro-exp-03-25';
    this.fallbackModel = config.fallbackModel || 'gemini-1.5-pro';
    this.maxRetries = config.maxRetries || 2;
    this.timeout = config.timeout || 30000;
    
    // Initialize the client lazily when needed
    this.genAI = null;
  }

  /**
   * Initialize the Gemini client if not already initialized
   */
  private async initClient(): Promise<void> {
    if (this.genAI) return;

    try {
      // Dynamic import to avoid SSR issues
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      logger.debug('Gemini client initialized', { category: LogCategory.SYSTEM });
    } catch (error) {
      logger.error('Failed to initialize Gemini client', { 
        context: { error }, 
        category: LogCategory.SYSTEM 
      });
      throw error;
    }
  }

  /**
   * Generate content using the Gemini API
   */
  async generateContent(
    prompt: string,
    options: GeminiRequestOptions = {}
  ): Promise<GeminiResponse> {
    await this.initClient();
    
    const startTime = Date.now();
    let currentModel = this.model;
    let retries = 0;
    
    while (retries <= this.maxRetries) {
      try {
        logger.debug('Generating content with Gemini', { 
          context: { model: currentModel, promptLength: prompt.length },
          category: LogCategory.SYSTEM
        });
        
        const model = this.genAI.getGenerativeModel({ 
          model: currentModel,
          ...options
        });
        
        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Gemini API request timed out')), this.timeout)
          )
        ]);
        
        const response = await result.response;
        const text = response.text();
        
        const duration = Date.now() - startTime;
        logger.debug('Gemini content generated successfully', { 
          context: { model: currentModel, duration },
          category: LogCategory.SYSTEM
        });
        
        return {
          text,
          model: currentModel,
          success: true
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error('Error generating content with Gemini', { 
          context: { error, model: currentModel, duration, retries },
          category: LogCategory.SYSTEM
        });
        
        // If we're using the primary model and have a fallback, try that next
        if (currentModel === this.model && this.fallbackModel && retries === 0) {
          logger.debug('Falling back to alternative model', { 
            context: { fallbackModel: this.fallbackModel },
            category: LogCategory.SYSTEM
          });
          currentModel = this.fallbackModel;
        } else {
          retries++;
        }
        
        // If we've exhausted all retries, return the error
        if (retries > this.maxRetries) {
          return {
            text: '',
            model: currentModel,
            success: false,
            error: error instanceof Error ? error : new Error('Unknown error generating content')
          };
        }
      }
    }
    
    // This should never be reached due to the return in the catch block
    return {
      text: '',
      model: currentModel,
      success: false,
      error: new Error('Failed to generate content after maximum retries')
    };
  }
  
  /**
   * Analyze code quality and suggest improvements
   */
  async analyzeCode(
    code: string,
    language: string = 'typescript',
    context: string = ''
  ): Promise<GeminiResponse> {
    const prompt = `
You are an expert ${language} developer with deep knowledge of best practices, security, and performance optimization.

Please analyze the following code and provide:
1. A brief summary of what the code does
2. Potential improvements for readability, maintainability, and performance
3. Any security concerns or bugs you identify
4. Specific suggestions for refactoring (if needed)

${context ? `Additional context about this code:\n${context}\n\n` : ''}

CODE TO ANALYZE:
\`\`\`${language}
${code}
\`\`\`

Format your response with clear sections and specific, actionable recommendations.
`;

    return this.generateContent(prompt);
  }
  
  /**
   * Analyze academic content for logical reasoning and structure
   */
  async analyzeAcademicContent(
    content: string,
    contentType: 'abstract' | 'introduction' | 'methodology' | 'results' | 'discussion' | 'conclusion' | 'full',
    field: string = 'general'
  ): Promise<GeminiResponse> {
    const prompt = `
You are an expert academic reviewer with deep knowledge of research methodology, logical reasoning, and academic writing standards.

Please analyze the following ${contentType} from a research paper in the field of ${field}:

${content}

Provide a constructive analysis focusing on:
1. Clarity and coherence of the presented ideas
2. Logical flow and reasoning
3. Strength of arguments and evidence
4. Appropriate use of academic language
5. Suggestions for improvement

Format your response with clear sections and specific, actionable recommendations. Be constructive and helpful, focusing on how the content could be strengthened.
`;

    return this.generateContent(prompt);
  }
}

/**
 * Create a default GeminiAI instance using environment variables
 */
export function createGeminiAI(): GeminiAI {
  // Ensure we're on the client side
  if (typeof window === 'undefined') {
    throw new Error('GeminiAI can only be initialized on the client side');
  }
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not found in environment variables');
  }
  
  return new GeminiAI({
    apiKey,
    model: 'gemini-2.5-pro-exp-03-25',
    fallbackModel: 'gemini-1.5-pro'
  });
}

export default createGeminiAI;
