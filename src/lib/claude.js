import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  // Note: In production, you should use a backend proxy to avoid exposing API keys
  dangerouslyAllowBrowser: true
});

/**
 * Send a message to Claude and get a response
 * @param {string} message - The message to send to Claude
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {Object} options - Additional options for the request
 * @returns {Promise<string>} - Claude's response
 */
export async function sendMessageToClaude(message, conversationHistory = [], options = {}) {
  try {
    const {
      model = 'claude-3-haiku-20240307',
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt = 'You are a helpful assistant.'
    } = options;

    // Format conversation history
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error(`Claude API Error: ${error.message}`);
  }
}

/**
 * Stream a response from Claude (for real-time responses)
 * @param {string} message - The message to send to Claude
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {Function} onChunk - Callback function for each chunk of the response
 * @param {Object} options - Additional options for the request
 */
export async function streamMessageToClaude(message, conversationHistory = [], onChunk, options = {}) {
  try {
    const {
      model = 'claude-3-haiku-20240307',
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt = 'You are a helpful assistant.'
    } = options;

    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const stream = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages,
      stream: true
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        const text = chunk.delta.text;
        fullResponse += text;
        onChunk(text, fullResponse);
      }
    }

    return fullResponse;
  } catch (error) {
    console.error('Error streaming from Claude API:', error);
    throw new Error(`Claude API Error: ${error.message}`);
  }
}

/**
 * Analyze text with Claude
 * @param {string} text - Text to analyze
 * @param {string} analysisType - Type of analysis to perform
 * @returns {Promise<string>} - Analysis result
 */
export async function analyzeWithClaude(text, analysisType = 'general') {
  const prompts = {
    general: 'Please analyze the following text and provide insights:',
    sentiment: 'Please analyze the sentiment of the following text:',
    summary: 'Please provide a concise summary of the following text:',
    keywords: 'Please extract the key topics and keywords from the following text:',
    leads: 'Analyze this text for potential business leads and opportunities:'
  };

  const systemPrompt = prompts[analysisType] || prompts.general;
  
  return await sendMessageToClaude(text, [], {
    systemPrompt,
    model: 'claude-3-haiku-20240307',
    maxTokens: 1500
  });
}

// Export available Claude models
export const CLAUDE_MODELS = {
  HAIKU: 'claude-3-haiku-20240307',
  SONNET: 'claude-3-sonnet-20240229',
  OPUS: 'claude-3-opus-20240229'
};
