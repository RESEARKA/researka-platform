// Test script for Gemini 2.5 Pro with Vertex AI
require('dotenv').config();
const { VertexAI } = require('@google-cloud/vertexai');

// Set up environment variables
process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account-key.json';

async function testGemini25Pro() {
  try {
    console.log('Testing Gemini 2.5 Pro with Vertex AI...');
    console.log('Environment variables:');
    console.log('- GEMINI_API_KEY:', process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'Set' : 'Not set');
    console.log('- GOOGLE_CLOUD_PROJECT:', process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT ? 'Set' : 'Not set');
    console.log('- GOOGLE_CLOUD_LOCATION:', process.env.NEXT_PUBLIC_GOOGLE_CLOUD_LOCATION ? 'Set' : 'Not set');
    console.log('- GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    
    // Initialize Vertex AI
    const vertexAI = new VertexAI({
      project: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT,
      location: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_LOCATION || 'us-central1',
    });
    
    // Get the generative model
    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: 'gemini-2.5-pro-exp-03-25',
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.2,
        topP: 0.95,
        topK: 40,
      },
    });
    
    // Test prompt for code checking
    const prompt = `
    Review this code snippet and provide feedback:
    
    \`\`\`javascript
    function calculateSum(a, b) {
      return a + b;
    }
    
    // Test the function
    const result = calculateSum(5, "10");
    console.log(result);
    \`\`\`
    `;
    
    console.log('\nSending test prompt to Gemini 2.5 Pro...');
    
    // Generate content
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const response = result.response;
    
    console.log('\nResponse received:');
    console.log('\nResponse content:');
    console.log(response.candidates[0].content.parts[0].text);
    
  } catch (error) {
    console.error('Error testing Gemini 2.5 Pro:', error);
  }
}

testGemini25Pro();
