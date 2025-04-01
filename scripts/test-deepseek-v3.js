// Test script for DeepSeek V3-0324 API access
const { OpenAI } = require('openai');
require('dotenv').config();

// Get the API key from environment variables
const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

if (!apiKey) {
  console.error('DeepSeek API key not found in environment variables');
  process.exit(1);
}

// Initialize the OpenAI compatible client with DeepSeek base URL
const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: apiKey
});

async function testDeepSeekV3() {
  try {
    console.log('Testing DeepSeek V3-0324 API access...');
    
    // Request model list to check available models
    const models = await deepseek.models.list();
    console.log('Available models:', models.data.map(model => model.id));
    
    // Test completion with the V3 model
    // According to documentation, we should use "deepseek-chat" for the latest V3 model
    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat", // This should use the latest V3-0324 by default
      messages: [
        { role: "system", content: "You are DeepSeek V3-0324, an AI assistant with enhanced reasoning capabilities. Please identify your model version and key capabilities." },
        { role: "user", content: "What version of DeepSeek are you? What are your key capabilities?" }
      ],
    });
    
    console.log('Model response:');
    console.log(completion.choices[0].message.content);
    
    // Check model details
    console.log('Model used:', completion.model);
    console.log('Response ID:', completion.id);
    
    return completion;
  } catch (error) {
    console.error('Error testing DeepSeek API:', error);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
}

// Run the test
testDeepSeekV3()
  .then(() => console.log('Test completed successfully'))
  .catch(err => console.error('Test failed:', err));
