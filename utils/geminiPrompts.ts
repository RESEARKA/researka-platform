/**
 * GeminiPrompts Module
 * 
 * A collection of specialized prompt templates for academic content analysis
 * and code review using the Gemini 2.5 Pro API.
 */

// Define types for prompt templates
export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  defaultParams?: Record<string, any>;
}

export interface PromptParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Apply parameters to a prompt template
 */
export function applyTemplate(template: string, params: PromptParams): string {
  let result = template;
  
  // Replace all parameters in the template
  Object.entries(params).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    if (result.includes(placeholder)) {
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
  });
  
  return result;
}

/**
 * Academic content analysis prompts
 */
export const academicPrompts: Record<string, PromptTemplate> = {
  reviewArticle: {
    name: 'Review Article',
    description: 'Analyze an academic article for logical reasoning, methodology, and structure',
    template: `
You are an expert academic reviewer with deep knowledge in {{field}} research methodology, logical reasoning, and academic writing standards.

Please analyze the following academic article:

TITLE: {{title}}
ABSTRACT: {{abstract}}
{{content}}

First, determine if this is a real academic article or just a test/placeholder with minimal content. 
If it appears to be a test article with placeholder text (like "test", "123", "lorem ipsum", etc.), 
clearly state that this is placeholder content and not a real article suitable for review.

If it's a real article, provide a constructive analysis focusing on:
1. Clarity and coherence of the presented ideas
2. Logical flow and reasoning
3. Strength of arguments and evidence
4. Appropriate use of academic language
5. Suggestions for improvement

Format your response with clear sections and specific, actionable recommendations. Be constructive and helpful, focusing on how the content could be strengthened.

IMPORTANT: If the content is minimal, placeholder text, or appears to be a test submission, 
clearly identify this as "TEST CONTENT" and explain that it needs substantial development before a meaningful review can be provided.
`,
    defaultParams: {
      field: 'general academic',
    }
  },
  
  checkMethodology: {
    name: 'Methodology Check',
    description: 'Evaluate the methodology section of an academic paper',
    template: `
You are an expert research methodologist with deep knowledge of research design, data collection, and analysis techniques in {{field}}.

Please analyze the following methodology section from an academic paper:

{{methodology}}

First, determine if this is a real methodology section or just test/placeholder content.
If it appears to be test content, clearly state that this is placeholder content and not suitable for review.

If it's a real methodology section, provide a constructive analysis focusing on:
1. Appropriateness of the research design for the stated research questions
2. Clarity of the described procedures
3. Potential limitations or biases in the methodology
4. Suggestions for strengthening the methodological approach
5. Any missing information that would be important for replication

Format your response with clear sections and specific, actionable recommendations.
`,
    defaultParams: {
      field: 'general academic',
    }
  },
  
  evaluateCitations: {
    name: 'Citation Evaluation',
    description: 'Evaluate the quality and relevance of citations in an academic paper',
    template: `
You are an expert academic librarian with deep knowledge of citation practices and scholarly literature.

Please analyze the following citations from an academic paper in the field of {{field}}:

{{citations}}

First, determine if these are real citations or just test/placeholder content.
If they appear to be test content, clearly state that these are placeholder citations and not suitable for review.

If they're real citations, provide a constructive analysis focusing on:
1. Recency and relevance of the cited sources
2. Diversity of sources (journals, books, conference papers, etc.)
3. Balance of seminal works and current research
4. Any potential gaps in the literature coverage
5. Formatting consistency and adherence to {{citationStyle}} style

Format your response with clear sections and specific, actionable recommendations.
`,
    defaultParams: {
      field: 'general academic',
      citationStyle: 'APA',
    }
  },
};

/**
 * Code review prompts
 */
export const codePrompts: Record<string, PromptTemplate> = {
  codeReview: {
    name: 'Code Review',
    description: 'Review code for quality, correctness, and best practices',
    template: `
You are an expert {{language}} developer with deep knowledge of software engineering best practices, code quality, and security.

Please analyze the following code:

\`\`\`{{language}}
{{code}}
\`\`\`

Context: {{context}}

First, determine if this is real code or just test/placeholder content.
If it appears to be test content or placeholder code (like "test", "123", "function test() { }", etc.), 
clearly state that this is placeholder code and not suitable for a meaningful review.

If it's real code, provide a constructive analysis focusing on:
1. Code correctness and potential bugs
2. Code quality and adherence to best practices
3. Security vulnerabilities
4. Performance considerations
5. Readability and maintainability
6. Suggestions for improvement

Format your response with clear sections and specific, actionable recommendations. Include code examples where appropriate.

IMPORTANT: If the code is minimal, placeholder text, or appears to be a test submission, 
clearly identify this as "TEST CODE" and explain that it needs substantial development before a meaningful review can be provided.
`,
    defaultParams: {
      language: 'javascript',
      context: 'General code review',
    }
  },
  
  securityAudit: {
    name: 'Security Audit',
    description: 'Analyze code specifically for security vulnerabilities',
    template: `
You are an expert security auditor with deep knowledge of {{language}} security best practices, common vulnerabilities, and secure coding patterns.

Please analyze the following code for security vulnerabilities:

\`\`\`{{language}}
{{code}}
\`\`\`

{{context}}

First, determine if this is real code or just test/placeholder content.
If it appears to be test content or placeholder code (like "test", "123", "function test() { }", etc.), 
clearly state that this is placeholder code and not suitable for a meaningful review.

If it's real code, provide a security-focused analysis:
1. Identify any potential security vulnerabilities (XSS, CSRF, injection attacks, etc.)
2. Assess authentication and authorization mechanisms (if present)
3. Evaluate data validation and sanitization
4. Check for secure handling of sensitive data
5. Provide specific recommendations to address each security concern with code examples

Format your response with clear sections and specific, actionable recommendations.
`,
    defaultParams: {
      language: 'typescript',
      context: 'This code is part of a React/Next.js application that handles user authentication and data submission.',
    }
  },
  
  performanceOptimization: {
    name: 'Performance Optimization',
    description: 'Analyze code for performance bottlenecks and optimization opportunities',
    template: `
You are an expert {{language}} performance engineer with deep knowledge of optimization techniques, memory management, and efficient algorithms.

Please analyze the following code for performance optimization opportunities:

\`\`\`{{language}}
{{code}}
\`\`\`

{{context}}

First, determine if this is real code or just test/placeholder content.
If it appears to be test content or placeholder code (like "test", "123", "function test() { }", etc.), 
clearly state that this is placeholder code and not suitable for a meaningful review.

If it's real code, provide a performance-focused analysis:
1. Identify potential performance bottlenecks
2. Assess algorithmic efficiency (time and space complexity)
3. Evaluate resource usage (memory, network, etc.)
4. Check for unnecessary computations or redundant operations
5. Provide specific optimization recommendations with code examples

Format your response with clear sections and specific, actionable recommendations.
`,
    defaultParams: {
      language: 'typescript',
      context: 'This code is part of a React/Next.js application that processes and displays data.',
    }
  },
};

/**
 * Get a prompt by its key from either academic or code prompts
 */
export function getPrompt(key: string): PromptTemplate | undefined {
  return academicPrompts[key] || codePrompts[key];
}

/**
 * Generate a prompt using a template and parameters
 */
export function generatePrompt(
  templateKey: string,
  params: PromptParams
): string {
  const template = getPrompt(templateKey);
  
  if (!template) {
    throw new Error(`Prompt template "${templateKey}" not found`);
  }
  
  // Merge default params with provided params
  const mergedParams = {
    ...(template.defaultParams || {}),
    ...params,
  };
  
  return applyTemplate(template.template, mergedParams);
}

export default {
  academicPrompts,
  codePrompts,
  getPrompt,
  generatePrompt,
  applyTemplate,
};
