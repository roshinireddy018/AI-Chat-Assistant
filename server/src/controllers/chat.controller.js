import mongoose from 'mongoose';
import { Conversation } from '../models/conversation.model.js';
import { Message } from '../models/message.model.js';
import { streamChatCompletion } from '../services/ai.service.js';
import logger from '../utils/logger.js';

/**
 * Handle streaming chat completions with SSE
 */
export const streamChat = async (req, res, next) => {
  const { conversationId, message, tone = 'Professional' } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      error: { message: 'Message cannot be empty', code: 'VALIDATION_ERROR' }
    });
  }

  const validTone = ['Professional', 'Casual', 'Concise'].includes(tone) ? tone : 'Professional';

  let conversation;
  try {
    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      // Derive a clean title from the user's first prompt (up to 40 characters)
      const cleanTitle = message.trim().replace(/\s+/g, ' ');
      const autoTitle = cleanTitle.length > 40 ? `${cleanTitle.slice(0, 38)}...` : cleanTitle;

      conversation = await Conversation.create({
        title: autoTitle || 'New Conversation',
        tone: validTone
      });
    }

    // Save the user's message
    const userMsg = await Message.create({
      conversationId: conversation._id,
      sender: 'user',
      content: message.trim(),
      tone: validTone
    });

    // Fetch conversation context history for the model
    const history = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(30)
      .lean();

    // Setup Server-Sent Events headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    res.flushHeaders?.();

    // Emit initial metadata event
    res.write(
      `event: session\ndata: ${JSON.stringify({
        conversationId: conversation._id,
        title: conversation.title,
        userMessageId: userMsg._id
      })}\n\n`
    );

    let isAborted = false;
    let accumulatedText = '';

    req.on('close', () => {
      isAborted = true;
    });

    try {
      accumulatedText = await streamChatCompletion({
        messages: history,
        tone: validTone,
        onChunk: (delta) => {
          if (!isAborted) {
            res.write(`data: ${JSON.stringify({ text: delta })}\n\n`);
          }
        }
      });
    } catch (streamError) {
      logger.error('Error during chat stream:', streamError);
      if (!isAborted) {
        res.write(
          `event: error\ndata: ${JSON.stringify({
            message: streamError.message || 'Error generating AI response',
            code: 'AI_STREAM_ERROR'
          })}\n\n`
        );
      }
    }

    // Persist the assistant message
    if (accumulatedText.trim()) {
      const assistantMsg = await Message.create({
        conversationId: conversation._id,
        sender: 'assistant',
        content: accumulatedText,
        tone: validTone
      });

      conversation.updatedAt = new Date();
      await conversation.save();

      if (!isAborted) {
        res.write(
          `event: done\ndata: ${JSON.stringify({
            messageId: assistantMsg._id,
            timestamp: assistantMsg.createdAt
          })}\n\n`
        );
      }
    }

    if (!isAborted) {
      res.end();
    }
  } catch (err) {
    logger.error('Fatal error in streamChat handler:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: { message: err.message || 'Internal server error', code: 'CHAT_ERROR' }
      });
    }
    res.end();
  }
};

export default {
  streamChat
};
