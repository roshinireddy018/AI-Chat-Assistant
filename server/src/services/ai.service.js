import OpenAI from 'openai';
import env from '../config/env.js';
import logger from '../utils/logger.js';

let openaiClient = null;

const getOpenAIClient = () => {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_BASE_URL || undefined
    });
  }
  return openaiClient;
};

export const TONE_SYSTEM_PROMPTS = {
  professional:
    'You are a professional assistant. Provide clear, well-structured, and objective responses.',
  casual:
    'You are a friendly and conversational assistant. Respond in a warm, relaxed, approachable tone.',
  concise:
    'You are a concise assistant. Provide direct and brief responses. You must use a maximum of 3 sentences.'
};

export const MOCK_RESPONSES = {
  professional:
    '[Mock AI - Professional] Thank you for your inquiry. This is a verified professional response demonstrating structured analysis and clear delivery.',
  casual:
    '[Mock AI - Casual] Hey there! Great to chat with you. Here is a friendly and relaxed response to help you out.',
  concise:
    '[Mock AI - Concise] Direct answer provided. Maximum three sentences applied.'
};

/**
 * Map provider error to clean, safe user message
 * 401 -> "Invalid or missing API key"
 * 404 -> "Model or endpoint not found"
 * 429 -> "Quota or rate limit reached"
 * other -> "AI service error"
 */
export const mapAIError = (error) => {
  const status = error?.status || error?.statusCode || error?.response?.status;
  if (status === 401) {
    return 'Invalid or missing API key';
  }
  if (status === 404) {
    return 'Model or endpoint not found';
  }
  if (status === 429) {
    return 'Quota or rate limit reached';
  }
  return 'AI service error';
};

/**
 * Stream completion via OpenAI or Mock
 */
export const streamAICompletion = async ({ messages, tone, onChunk, signal }) => {
  // If AI_MOCK is true, simulate streaming response
  if (env.AI_MOCK) {
    const mockText = MOCK_RESPONSES[tone] || MOCK_RESPONSES.professional;
    const words = mockText.split(' ');
    let fullText = '';

    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) break;
      const word = (i === 0 ? '' : ' ') + words[i];
      fullText += word;
      if (onChunk) onChunk(word);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }

    return fullText;
  }

  // Real OpenAI Streaming
  const openai = getOpenAIClient();
  const systemInstruction = TONE_SYSTEM_PROMPTS[tone];

  // System message + last 20 messages
  const recentMessages = messages.slice(-20).map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content
  }));

  const payloadMessages = [
    { role: 'system', content: systemInstruction },
    ...recentMessages
  ];

  try {
    const stream = await openai.chat.completions.create(
      {
        model: env.OPENAI_MODEL,
        messages: payloadMessages,
        stream: true
      },
      { signal }
    );

    let accumulatedText = '';
    for await (const chunk of stream) {
      if (signal?.aborted) break;
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        accumulatedText += delta;
        if (onChunk) onChunk(delta);
      }
    }

    return accumulatedText;
  } catch (error) {
    logger.error('OpenAI stream completion error status:', error?.status || error?.statusCode);
    throw error;
  }
};

export default {
  streamAICompletion,
  mapAIError,
  TONE_SYSTEM_PROMPTS
};
