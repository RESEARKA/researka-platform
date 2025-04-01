import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

// Check for API key - use the public env variable since it's already exposed in the .env file
// In a production environment, you should use a server-side only variable
const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

if (!apiKey) {
  console.error('CRITICAL ERROR: DeepSeek API key not found in environment variables');
}

// Initialize OpenAI client with DeepSeek base URL
const openai = apiKey ? new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey,
  timeout: 30000,
  maxRetries: 3,
}) : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if OpenAI client is initialized
  if (!openai) {
    console.error('DeepSeek API client not initialized - missing API key');
    return res.status(500).json({ 
      error: 'DeepSeek API client not initialized - missing API key',
      success: false 
    });
  }

  try {
    const { prompt, options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('DeepSeek API request:', { 
      modelRequested: options.model || 'deepseek-chat',
      promptLength: prompt.length,
      temperature: options.temperature || 0.7
    });

    // Call DeepSeek API through OpenAI-compatible interface
    const completion = await openai.chat.completions.create({
      model: options.model || 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful academic assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      top_p: options.top_p || 1,
      presence_penalty: options.presence_penalty || 0,
      frequency_penalty: options.frequency_penalty || 0,
    });

    console.log('DeepSeek API response successful:', {
      modelUsed: completion.model,
      responseLength: completion.choices[0]?.message?.content?.length || 0,
      tokens: completion.usage
    });

    // Return the response
    return res.status(200).json({
      text: completion.choices[0]?.message?.content || '',
      model: completion.model,
      promptTokens: completion.usage?.prompt_tokens,
      completionTokens: completion.usage?.completion_tokens,
      totalTokens: completion.usage?.total_tokens,
      success: true,
    });
  } catch (error: any) {
    console.error('DeepSeek API error:', error);
    
    // Provide more detailed error information
    const errorDetails = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      status: error.status,
      response: error.response?.data || error.response,
    };
    
    console.error('Error details:', errorDetails);
    
    return res.status(500).json({
      error: error.message || 'An error occurred while calling the DeepSeek API',
      details: errorDetails,
      success: false,
    });
  }
}
