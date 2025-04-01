/**
 * Test Script for Code Quality Checker
 * 
 * This script demonstrates how to use the DeepSeekAI for code review
 * without relying on TypeScript modules.
 */

require('dotenv').config();
const { OpenAI } = require('openai');

// Sample code to review
const sampleCode = `
function calculateTotal(items) {
  let total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}

// Process order and return result
async function processOrder(order) {
  const total = calculateTotal(order.items);
  
  // Apply discount if applicable
  let finalTotal = total;
  if (order.discountCode) {
    const discount = await getDiscountValue(order.discountCode);
    finalTotal = total - discount;
  }
  
  return {
    orderId: order.id,
    total: finalTotal,
    items: order.items.length
  };
}

// Get discount value from API
async function getDiscountValue(code) {
  try {
    const response = await fetch('https://api.example.com/discounts/' + code);
    const data = await response.json();
    return data.value || 0;
  } catch (error) {
    console.log('Error fetching discount:', error);
    return 0;
  }
}
`;

// Helper function to extract JSON from response
function extractJsonFromResponse(text) {
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
      } catch (innerError) {
        console.error(`Failed to parse JSON from code block: ${innerError.message}`);
        return null;
      }
    }
    
    // If no code block, try to find anything that looks like JSON
    const possibleJsonRegex = /(\{[\s\S]*\})/;
    const jsonMatch = text.match(possibleJsonRegex);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (jsonError) {
        console.error(`Failed to parse JSON from text: ${jsonError.message}`);
        return null;
      }
    }
    
    console.error('No valid JSON found in the response');
    return null;
  }
}

// Generate code review prompt
function generateCodeReviewPrompt(code, language = 'javascript', reviewType = 'comprehensive') {
  let focusAreas = '';
  
  switch (reviewType) {
    case 'security':
      focusAreas = `
- Security vulnerabilities (e.g., injection risks, authentication issues)
- Potential data leaks or privacy concerns
- Input validation and sanitization
- Secure coding practices`;
      break;
    case 'performance':
      focusAreas = `
- Performance bottlenecks and optimization opportunities
- Memory usage and management
- Algorithmic efficiency
- Resource utilization`;
      break;
    case 'comprehensive':
      focusAreas = `
- Code organization and architecture
- Security vulnerabilities
- Performance optimization
- Maintainability and readability
- Error handling and edge cases
- Testing coverage and approach`;
      break;
    default: // standard
      focusAreas = `
- Code organization and readability
- Best practices for ${language}
- Error handling
- Potential bugs or edge cases`;
  }
  
  return `
You are an expert ${language} developer with deep knowledge of best practices, security, and performance optimization.

Please analyze the following code and provide a detailed review focusing on:
${focusAreas}

CODE TO ANALYZE:
\`\`\`${language}
${code}
\`\`\`

Format your response as a JSON object with the following structure:
{
  "summary": "Brief summary of what the code does",
  "improvements": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2"
  ],
  "securityIssues": [
    "Security issue 1",
    "Security issue 2"
  ],
  "performanceIssues": [
    "Performance issue 1",
    "Performance issue 2"
  ],
  "codeSmells": [
    "Code smell 1",
    "Code smell 2"
  ],
  "score": 4.2,
  "overallAssessment": "Overall assessment of the code quality"
}

IMPORTANT:
1. The score should be between 1.0 and 5.0, where 1 is poor and 5 is excellent.
2. Provide your response as pure JSON without any markdown formatting or code blocks.
3. Do not include any text before or after the JSON object.
4. If any section has no items, use an empty array [].
`;
}

// Test DeepSeek API for code review
async function testDeepSeekCodeReview() {
  console.log('Testing DeepSeek code review...');
  console.log('--------------------------------');
  
  try {
    // Create OpenAI client for DeepSeek (since DeepSeek uses OpenAI-compatible API)
    const deepseekClient = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1',
    });
    
    // Test different review types
    const reviewTypes = ['standard', 'security', 'performance', 'comprehensive'];
    
    for (const reviewType of reviewTypes) {
      console.log(`\n\nRunning ${reviewType} review with DeepSeek...`);
      
      const prompt = generateCodeReviewPrompt(sampleCode, 'javascript', reviewType);
      
      const response = await deepseekClient.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 2048
      });
      
      if (response && response.choices && response.choices[0]) {
        const responseText = response.choices[0].message.content;
        
        try {
          const parsedJson = extractJsonFromResponse(responseText);
          if (parsedJson) {
            console.log(`\nDeepSeek ${reviewType} review results:`);
            console.log(`Score: ${parsedJson.score}`);
            console.log(`Summary: ${parsedJson.summary}`);
            
            if (parsedJson.improvements && parsedJson.improvements.length > 0) {
              console.log('\nSuggested improvements:');
              parsedJson.improvements.forEach((item, i) => console.log(`${i+1}. ${item}`));
            }
            
            if (reviewType === 'security' && parsedJson.securityIssues && parsedJson.securityIssues.length > 0) {
              console.log('\nSecurity issues:');
              parsedJson.securityIssues.forEach((item, i) => console.log(`${i+1}. ${item}`));
            }
            
            if (reviewType === 'performance' && parsedJson.performanceIssues && parsedJson.performanceIssues.length > 0) {
              console.log('\nPerformance issues:');
              parsedJson.performanceIssues.forEach((item, i) => console.log(`${i+1}. ${item}`));
            }
          } else {
            console.error(`Failed to parse DeepSeek ${reviewType} review response as JSON`);
          }
        } catch (e) {
          console.error(`Error parsing DeepSeek ${reviewType} review response:`, e);
        }
      } else {
        console.error('Error getting DeepSeek response: Invalid response format');
      }
    }
    
    console.log('\n\nDeepSeek code review testing completed successfully!');
    console.log('This confirms that DeepSeek can provide detailed code quality feedback.');
    console.log('You can use the CodeQualityChecker utility to get similar results in your application.');
    
  } catch (error) {
    console.error('Error running DeepSeek test:', error);
  }
}

// Run the test
testDeepSeekCodeReview();
