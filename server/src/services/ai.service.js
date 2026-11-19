import OpenAI from 'openai';
import env from '../config/env.js';
import logger from '../utils/logger.js';

let openaiClient = null;

const getOpenAIClient = () => {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY || 'not_configured'
    });
  }
  return openaiClient;
};

const TONE_SYSTEM_PROMPTS = {
  Professional:
    'You are an AI assistant. Provide thoughtful, well-structured, and clear answers. Use precise language, objective explanations, and clean formatting with markdown.',
  Casual:
    'You are a friendly and conversational AI assistant. Respond in a warm, natural, and accessible tone while keeping answers helpful, accurate, and engaging.',
  Concise:
    'You are a direct and concise AI assistant. Deliver answers with maximum clarity and brevity. Avoid unnecessary filler or conversational preamble. Use bullet points where appropriate.'
};

/**
 * Stream chat completion from OpenAI
 */
export const streamChatCompletion = async ({ messages, tone = 'Professional', onChunk, signal }) => {
  const openai = getOpenAIClient();
  const systemPrompt = TONE_SYSTEM_PROMPTS[tone] || TONE_SYSTEM_PROMPTS.Professional;

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.content
    }))
  ];

  try {
    const stream = await openai.chat.completions.create(
      {
        model: env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: formattedMessages,
        stream: true
      },
      { signal }
    );

    let fullText = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        fullText += delta;
        if (onChunk) onChunk(delta);
      }
    }

    return fullText;
  } catch (error) {
    logger.error('Error during OpenAI streaming:', error);
    throw error;
  }
};

export default {
  streamChatCompletion
};
