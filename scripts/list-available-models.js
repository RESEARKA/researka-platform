/**
 * Script to list available Gemini models
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAvailableModels() {
  console.log('Attempting to list available Gemini models...');
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }
    
    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to use a working model to ask about available models
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    console.log('Asking Gemini about available models...');
    const result = await model.generateContent(
      "What Gemini models are currently available through the API? Please list all available model names that can be used with the Google Generative AI SDK, especially the most powerful ones like Gemini 2.5 Pro if available."
    );
    
    console.log('\nResponse:');
    console.log(result.response.text());
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
listAvailableModels();
