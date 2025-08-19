// Simple proxy endpoint for OpenAI API calls
// This should be deployed as a serverless function (Vercel, Netlify, etc.)
// or run as a separate Express server

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model = 'gpt-3.5-turbo', temperature = 0.3, max_tokens = 150 } = req.body;

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      response_format: { type: "json_object" }
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
}