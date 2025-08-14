import { useState, useCallback } from 'react';
import { sendMessageToClaude, streamMessageToClaude, analyzeWithClaude } from './claude.js';

/**
 * Custom React hook for Claude AI integration
 * @param {Object} options - Configuration options
 * @returns {Object} - Hook functions and state
 */
export function useClaude(options = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState([]);

  const sendMessage = useCallback(async (message, customOptions = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessageToClaude(
        message, 
        conversation, 
        { ...options, ...customOptions }
      );

      // Update conversation history
      const newConversation = [
        ...conversation,
        { role: 'user', content: message },
        { role: 'assistant', content: response }
      ];
      setConversation(newConversation);

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [conversation, options]);

  const streamMessage = useCallback(async (message, onChunk, customOptions = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await streamMessageToClaude(
        message,
        conversation,
        onChunk,
        { ...options, ...customOptions }
      );

      // Update conversation history
      const newConversation = [
        ...conversation,
        { role: 'user', content: message },
        { role: 'assistant', content: response }
      ];
      setConversation(newConversation);

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [conversation, options]);

  const analyze = useCallback(async (text, analysisType = 'general') => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeWithClaude(text, analysisType);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearConversation = useCallback(() => {
    setConversation([]);
    setError(null);
  }, []);

  return {
    sendMessage,
    streamMessage,
    analyze,
    clearConversation,
    conversation,
    isLoading,
    error
  };
}
