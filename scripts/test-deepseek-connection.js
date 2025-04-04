// Simple script to test DeepSeek API connection
require('dotenv').config();
const { OpenAI } = require('openai');

// Check for API key
const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

if (!apiKey) {
  console.error('ERROR: DeepSeek API key not found in environment variables');
  process.exit(1);
}

console.log('DeepSeek API key found in environment variables');

// Initialize OpenAI client with DeepSeek base URL
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey,
  timeout: 30000,
  maxRetries: 3,
});

async function testDeepSeekConnection() {
  try {
    console.log('Testing DeepSeek API connection...');
    
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, can you confirm this connection is working?' }
      ],
      max_tokens: 50
    });

    console.log('DeepSeek API connection successful!');
    console.log('Response:', completion.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('DeepSeek API connection failed:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    return false;
  }
}

// Run the test
testDeepSeekConnection()
  .then(success => {
    console.log(`Test completed. Success: ${success}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
