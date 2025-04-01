/**
 * DeepSeekAI Utility Module
 * 
 * A TypeScript utility for interacting with the DeepSeek V3-0324 API
 * with proper error handling, fallbacks, and performance monitoring.
 * Uses a server-side API route to securely handle API calls.
 */

import { createLogger } from './logger';
import { LogCategory } from './logger';
import { academicPrompts } from './geminiPrompts';

// Define types for the DeepSeek API
export interface DeepSeekConfig {
  model?: string;
  fallbackModel?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface DeepSeekRequestOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  model?: string;
}

export interface DeepSeekResponse {
  text: string;
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  success?: boolean;
  error?: Error;
  raw?: any;
}

// Create a logger for this module
const logger = createLogger('deepseekAI');

/**
 * DeepSeekAI class for handling interactions with the DeepSeek API
 * through a secure server-side API route
 */
export class DeepSeekAI {
  private model: string;
  private fallbackModel: string;

  /**
   * Initialize the DeepSeekAI client
   * @param config Configuration for the DeepSeek API
   */
  constructor(config: DeepSeekConfig) {
    this.model = config.model || 'deepseek-chat';
    this.fallbackModel = config.fallbackModel || 'deepseek-reasoner';

    logger.info(`DeepSeekAI initialized with model: ${this.model}`, { category: LogCategory.SYSTEM });
  }

  /**
   * Helper function to extract and parse JSON from AI responses
   * Handles cases where the JSON is wrapped in markdown code blocks
   */
  private extractJsonFromResponse(text: string): any {
    try {
      // First try direct parsing
      return JSON.parse(text);
    } catch (e) {
      // Check if the response contains a JSON code block
      const jsonBlockRegex = /```(?:json)?\s*\n([\s\S]*?)\n```/;
      const match = text.match(jsonBlockRegex);
      
      if (match && match[1]) {
        try {
          // Try parsing the content inside the code block
          return JSON.parse(match[1]);
        } catch (innerError: unknown) {
          const errorMessage = innerError instanceof Error ? innerError.message : String(innerError);
          throw new Error(`Failed to parse JSON from code block: ${errorMessage}`);
        }
      }
      
      // If no code block, try to find anything that looks like JSON
      const jsonRegex = /\{[\s\S]*\}/;
      const jsonMatch = text.match(jsonRegex);
      
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (jsonError: unknown) {
          const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
          throw new Error(`Failed to parse JSON from response: ${errorMessage}`);
        }
      }
      
      throw new Error('No valid JSON found in response');
    }
  }

  /**
   * Generate content using the DeepSeek API via server-side API route
   * @param prompt The prompt to generate content from
   * @param options Options for the generation
   * @returns A promise that resolves to the generated content
   */
  async generateContent(
    prompt: string,
    options: DeepSeekRequestOptions = {}
  ): Promise<DeepSeekResponse> {
    try {
      logger.debug('Generating content with DeepSeek', { 
        context: { promptLength: prompt.length, options },
        category: LogCategory.SYSTEM
      });

      // Set default options
      const requestOptions = {
        model: options.model || this.model,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
        top_p: options.top_p || 1,
        presence_penalty: options.presence_penalty || 0,
        frequency_penalty: options.frequency_penalty || 0,
      };

      // Call the server-side API route
      const response = await fetch(`${window.location.origin}/api/ai/deepseek`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          options: requestOptions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();

      logger.debug('DeepSeek content generated successfully', { 
        context: { responseLength: data.text.length, model: data.model },
        category: LogCategory.SYSTEM
      });

      return {
        text: data.text,
        model: data.model,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens,
        totalTokens: data.totalTokens,
        success: true,
        raw: data
      };
    } catch (error: any) {
      logger.error('Error generating content with DeepSeek', { 
        context: { error: error.message, promptLength: prompt.length },
        category: LogCategory.ERROR
      });

      // Try with fallback model if available
      if (options.model !== this.fallbackModel && this.fallbackModel) {
        logger.info(`Retrying with fallback model: ${this.fallbackModel}`, {
          category: LogCategory.SYSTEM
        });
        
        return this.generateContent(prompt, {
          ...options,
          model: this.fallbackModel
        });
      }

      return {
        text: '',
        model: options.model || this.model,
        success: false,
        error
      };
    }
  }

  /**
   * Analyze academic content using the DeepSeek API
   * @param content The content to analyze
   * @param contentType The type of content (abstract, introduction, etc.)
   * @param field The academic field
   * @returns A promise that resolves to the analysis
   */
  async analyzeAcademicContent(
    content: string,
    contentType: 'abstract' | 'introduction' | 'methodology' | 'results' | 'discussion' | 'conclusion' | 'full',
    field: string = 'general'
  ): Promise<DeepSeekResponse> {
    try {
      // Get the appropriate prompt template
      const promptTemplate = academicPrompts.reviewArticle.template;
      
      // Format the prompt with the content
      const prompt = promptTemplate
        .replace('{{content}}', content)
        .replace('{{contentType}}', contentType)
        .replace('{{field}}', field);
      
      // Generate the analysis
      return await this.generateContent(prompt, {
        temperature: 0.2,
        max_tokens: 2000
      });
    } catch (error: any) {
      logger.error(`Error analyzing academic content: ${error.message}`, { category: LogCategory.SYSTEM });
      return {
        text: '',
        model: this.model,
        success: false,
        error: error
      };
    }
  }

  /**
   * Score an academic paper using the DeepSeek API
   * @param title The paper title
   * @param abstract The paper abstract
   * @param content The paper content
   * @param category The paper category/field
   * @returns A promise that resolves to the scores and justifications
   */
  async scoreAcademicPaper(
    title: string,
    abstract: string,
    content: string,
    category: string = 'general academic'
  ): Promise<DeepSeekResponse> {
    try {
      logger.debug('Scoring academic paper', { 
        context: { title, category },
        category: LogCategory.SYSTEM
      });

      // Use the scoreAcademicPaper prompt template from geminiPrompts
      const prompt = `
You are an expert academic reviewer with deep knowledge in ${category} research methodology, logical reasoning, and academic writing standards.

Please analyze and score the following academic article across five specific categories:

TITLE: ${title}
ABSTRACT: ${abstract}
${content}

First, determine if this is a real academic article or just a test/placeholder with minimal content. 
If it appears to be a test article with placeholder text (like "test", "123", "lorem ipsum", etc.), 
respond with "TEST_CONTENT" and do not proceed with scoring.

If it's a real article, carefully evaluate and score it on a scale of 1-5 (where 1 is poor and 5 is excellent) in each of these categories:

1. Originality/Novelty: Evaluate the originality of ideas, concepts, or approaches
2. Methodology/Rigor: Assess the soundness of research methods and analytical rigor
3. Clarity/Presentation: Rate the clarity of writing, organization, and presentation
4. Significance/Impact: Evaluate the potential impact and significance of the work
5. Technical Quality: Assess the quality of technical implementation, code, or algorithms

For each category, provide:
- A numerical score between 1.0 and 5.0 (can include decimal points, e.g., 3.5)
- A brief justification (2-3 sentences) explaining the reasoning behind the score
- A specific suggestion for improvement

Format your response in a structured JSON format as follows:
{
  "isTestContent": false,
  "scores": {
    "originality": {
      "score": 4.2,
      "justification": "The paper presents a novel approach to...",
      "improvement": "Could be strengthened by comparing with recent work in..."
    },
    "methodology": {
      "score": 3.8,
      "justification": "The methodology is generally sound with...",
      "improvement": "Consider adding validation tests for..."
    },
    "clarity": {
      "score": 4.0,
      "justification": "The paper is well-written and organized...",
      "improvement": "The introduction could be more concise by..."
    },
    "significance": {
      "score": 3.5,
      "justification": "The work addresses an important problem in...",
      "improvement": "Explicitly discuss potential applications in..."
    },
    "technicalQuality": {
      "score": 3.9,
      "justification": "The implementation demonstrates good technical understanding...",
      "improvement": "Consider optimizing the algorithm for..."
    }
  },
  "overallAssessment": "Brief 2-3 sentence overall assessment of the paper's strengths and weaknesses."
}

If the content is test content, respond with:
{
  "isTestContent": true
}

IMPORTANT: 
1. Ensure all scores are between 1.0 and 5.0, and avoid extreme scores (0 or 5) unless truly warranted.
2. Provide your response as pure JSON without any markdown formatting or code blocks.
3. Do not include any text before or after the JSON object.
`;

      // Set options for more nuanced scoring
      const options: DeepSeekRequestOptions = {
        temperature: 0.7,
        max_tokens: 2048
      };

      // Generate the content
      const response = await this.generateContent(prompt, options);
      
      // Validate the response format
      if (response.success && response.text) {
        try {
          // Try to parse the response as JSON using the helper function
          const jsonResponse = this.extractJsonFromResponse(response.text);
          
          // Validate the structure of the JSON response
          if (jsonResponse.isTestContent === true) {
            logger.debug('Test content detected', {
              category: LogCategory.SYSTEM
            });
          } else if (jsonResponse.scores) {
            // Validate and normalize scores to ensure they're within 1-5 range
            const categories = ['originality', 'methodology', 'clarity', 'significance', 'technicalQuality'];
            
            for (const category of categories) {
              if (jsonResponse.scores[category] && typeof jsonResponse.scores[category].score === 'number') {
                // Clamp scores to the 1-5 range
                jsonResponse.scores[category].score = Math.min(
                  5, 
                  Math.max(1, jsonResponse.scores[category].score)
                );
              }
            }
            
            // Return the normalized response
            return {
              ...response,
              text: JSON.stringify(jsonResponse)
            };
          }
        } catch (error) {
          logger.error('Failed to parse AI scoring response as JSON', {
            context: { error, response: response.text.substring(0, 200) + '...' },
            category: LogCategory.ERROR
          });
          
          // Return the original response if parsing fails
          return response;
        }
      }
      
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error scoring academic paper', {
        context: { error: errorMessage, title },
        category: LogCategory.ERROR
      });
      
      return {
        text: '',
        model: this.model,
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * Check if content appears to be test/placeholder content
   * @param content The content to check
   * @returns True if the content appears to be test content
   */
  async isTestContent(content: string): Promise<boolean> {
    try {
      const prompt = `
        Analyze the following content and determine if it appears to be test/placeholder content 
        rather than a genuine academic paper. Test content might include lorem ipsum text, 
        repetitive patterns, nonsensical content, or explicitly state it's a test.
        
        Content: ${content.substring(0, 2000)}
        
        Respond with a JSON object with a single boolean property "isTestContent" set to true or false.
      `;
      
      const response = await this.generateContent(prompt, { temperature: 0.1 });
      
      if (!response.success) {
        return false;
      }
      
      try {
        const result = JSON.parse(response.text);
        return result.isTestContent === true;
      } catch (e) {
        logger.error(`Error parsing test content check result: ${e}`, { category: LogCategory.SYSTEM });
        return false;
      }
    } catch (error) {
      logger.error(`Error checking for test content: ${error}`, { category: LogCategory.SYSTEM });
      return false;
    }
  }
}

/**
 * Create a default DeepSeekAI instance using environment variables
 * @returns A new DeepSeekAI instance
 */
export function createDeepSeekAI(): DeepSeekAI {
  return new DeepSeekAI({
    model: 'deepseek-chat'
  });
}

export default createDeepSeekAI;
