// Script to list available Gemini models
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Access the API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log('Fetching available Gemini models...');
    
    // List available models
    const models = await genAI.getModels();
    
    console.log('\nAvailable Models:');
    console.log('=================');
    models.forEach(model => {
      console.log(`- ${model.name}`);
    });
    
    return true;
  } catch (error) {
    console.error('\nError fetching models:');
    console.error(error);
    return false;
  }
}

// Run the function
listModels()
  .then(success => {
    if (!success) {
      console.log('\nPlease check your API key and try again.');
    }
  });
