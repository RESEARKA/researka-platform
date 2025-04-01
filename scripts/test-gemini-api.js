// Test script for Gemini API access
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Access the API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(apiKey);

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini 2.5 Pro Experimental API connection...');
    console.log('Using model: gemini-2.5-pro-exp-03-25');
    
    // Get the model - using Gemini 2.5 Pro Experimental
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro-exp-03-25' });
    
    // Generate content
    const prompt = 'Write a short paragraph about how blockchain technology could improve academic publishing and peer review processes.';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\nAPI Response:');
    console.log('=============');
    console.log(text);
    console.log('\nAPI connection successful!');
    
    return true;
  } catch (error) {
    console.error('\nAPI connection failed:');
    console.error(error);
    
    // If the model isn't available, try the 1.5 Pro model as a fallback
    try {
      console.log('\nFalling back to Gemini 1.5 Pro...');
      const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = 'Write a short paragraph about how blockchain technology could improve academic publishing and peer review processes.';
      const result = await fallbackModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('\nFallback API Response:');
      console.log('======================');
      console.log(text);
      console.log('\nFallback API connection successful!');
      
      return true;
    } catch (fallbackError) {
      console.error('\nFallback API connection also failed:');
      console.error(fallbackError);
      return false;
    }
  }
}

// Run the test
testGeminiAPI()
  .then(success => {
    if (success) {
      console.log('\nYou can now use the Gemini API in your application!');
    } else {
      console.log('\nPlease check your API key and try again.');
    }
  });
