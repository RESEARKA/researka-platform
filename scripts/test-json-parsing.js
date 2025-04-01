/**
 * Test Script for JSON Parsing
 * 
 * This script tests the JSON extraction functionality to ensure it can handle
 * responses from both Gemini and DeepSeek that might contain markdown formatting.
 */

require('dotenv').config();

// Helper function to extract and parse JSON from AI responses
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
        const errorMessage = innerError instanceof Error ? innerError.message : String(innerError);
        throw new Error(`Failed to parse JSON from code block: ${errorMessage}`);
      }
    }
    
    // If no code block, try to find anything that looks like JSON
    const possibleJsonRegex = /(\{[\s\S]*\})/;
    const jsonMatch = text.match(possibleJsonRegex);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (jsonError) {
        const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
        throw new Error(`Failed to parse JSON from text: ${errorMessage}`);
      }
    }
    
    throw new Error('No valid JSON found in the response');
  }
}

// Test cases
const testCases = [
  {
    name: "Plain JSON",
    input: '{"isTestContent": true}',
    expected: { isTestContent: true }
  },
  {
    name: "JSON in markdown code block",
    input: '```json\n{"isTestContent": true}\n```',
    expected: { isTestContent: true }
  },
  {
    name: "JSON in markdown code block without language specifier",
    input: '```\n{"isTestContent": true}\n```',
    expected: { isTestContent: true }
  },
  {
    name: "JSON with surrounding text",
    input: 'Here is the JSON response:\n\n{"isTestContent": true}\n\nAs you can see...',
    expected: { isTestContent: true }
  },
  {
    name: "Complex JSON in markdown",
    input: '```json\n{\n  "isTestContent": false,\n  "scores": {\n    "originality": {\n      "score": 4.2,\n      "justification": "The paper presents a novel approach",\n      "improvement": "Could be strengthened by comparing"\n    }\n  }\n}\n```',
    expected: {
      isTestContent: false,
      scores: {
        originality: {
          score: 4.2,
          justification: "The paper presents a novel approach",
          improvement: "Could be strengthened by comparing"
        }
      }
    }
  }
];

// Run the tests
console.log('Testing JSON extraction functionality...\n');

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`Input: ${testCase.input.substring(0, 40)}${testCase.input.length > 40 ? '...' : ''}`);
  
  try {
    const result = extractJsonFromResponse(testCase.input);
    console.log('Result:', JSON.stringify(result));
    
    // Simple deep equality check
    const isEqual = JSON.stringify(result) === JSON.stringify(testCase.expected);
    
    if (isEqual) {
      console.log('✅ PASSED');
      passedTests++;
    } else {
      console.log('❌ FAILED - Parsed correctly but result does not match expected');
      console.log('Expected:', JSON.stringify(testCase.expected));
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ FAILED - Error: ${error.message}`);
    failedTests++;
  }
  
  console.log('-----------------------------------');
});

console.log(`\nTest Summary: ${passedTests} passed, ${failedTests} failed`);

if (failedTests === 0) {
  console.log('✅ All tests passed! The JSON extraction function is working correctly.');
} else {
  console.log('❌ Some tests failed. The JSON extraction function needs improvement.');
}
