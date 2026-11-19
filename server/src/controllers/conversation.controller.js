import mongoose from 'mongoose';
import { Conversation } from '../models/conversation.model.js';
import { streamAICompletion } from '../services/ai.service.js';
import logger from '../utils/logger.js';

const VALID_TONES = ['professional', 'casual', 'concise'];

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * GET /api/conversations?q=
 */
export const listConversations = async (req, res, next) => {
  try {
    const { q } = req.query;
    const filter = {};

    if (q && typeof q === 'string' && q.trim()) {
      filter.title = { $regex: escapeRegex(q.trim()), $options: 'i' };
    }

    const conversations = await Conversation.find(filter)
      .sort({ updatedAt: -1 })
      .select('_id title updatedAt createdAt')
      .lean();

    return res.json(conversations);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/conversations
 */
export const createConversation = async (req, res, next) => {
  try {
    const title =
      req.body?.title && typeof req.body.title === 'string' && req.body.title.trim()
        ? req.body.title.trim()
        : 'New Conversation';

    const conversation = await Conversation.create({
      title,
      messages: []
    });

    return res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/conversations/:id
 */
export const getConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: { message: 'Invalid conversation ID', code: 'INVALID_ID' }
      });
    }

    const conversation = await Conversation.findById(id).lean();
    if (!conversation) {
      return res.status(404).json({
        error: { message: 'Conversation not found', code: 'NOT_FOUND' }
      });
    }

    return res.json(conversation);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/conversations/:id
 */
export const renameConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: { message: 'Invalid conversation ID', code: 'INVALID_ID' }
      });
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        error: { message: 'Title cannot be empty', code: 'VALIDATION_ERROR' }
      });
    }

    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { title: title.trim() },
      { new: true }
    ).lean();

    if (!conversation) {
      return res.status(404).json({
        error: { message: 'Conversation not found', code: 'NOT_FOUND' }
      });
    }

    return res.json(conversation);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/conversations/:id
 */
export const deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: { message: 'Invalid conversation ID', code: 'INVALID_ID' }
      });
    }

    const conversation = await Conversation.findByIdAndDelete(id);
    if (!conversation) {
      return res.status(404).json({
        error: { message: 'Conversation not found', code: 'NOT_FOUND' }
      });
    }

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/conversations/:id/messages
 * SSE streaming endpoint
 */
export const postMessage = async (req, res, next) => {
  const { id } = req.params;
  const { content, tone } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: { message: 'Invalid conversation ID', code: 'INVALID_ID' }
    });
  }

  // Validate content: 1-4000 characters
  if (!content || typeof content !== 'string' || content.trim().length < 1 || content.trim().length > 4000) {
    return res.status(400).json({
      error: { message: 'Content must be between 1 and 4000 characters', code: 'VALIDATION_ERROR' }
    });
  }

  // Validate tone: professional, casual, concise (case-insensitive)
  const normTone = typeof tone === 'string' ? tone.toLowerCase().trim() : '';
  if (!VALID_TONES.includes(normTone)) {
    return res.status(400).json({
      error: { message: 'Invalid tone. Must be professional, casual, or concise', code: 'INVALID_TONE' }
    });
  }

  try {
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({
        error: { message: 'Conversation not found', code: 'NOT_FOUND' }
      });
    }

    // Save the user message first atomically
    const userMessage = {
      role: 'user',
      content: content.trim(),
      tone: normTone,
      status: 'complete',
      createdAt: new Date()
    };

    const updateQuery = { $push: { messages: userMessage } };
    if (conversation.title === 'New Conversation' || !conversation.title) {
      const autoTitle = content.trim().replace(/\s+/g, ' ').slice(0, 40);
      updateQuery.title = autoTitle || 'New Conversation';
    }

    await Conversation.findByIdAndUpdate(id, updateQuery);

    // Setup SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    res.flushHeaders?.();

    const abortController = new AbortController();
    let clientDisconnected = false;

    res.on('close', () => {
      clientDisconnected = true;
      abortController.abort();
    });

    let fullText = '';
    const conversationHistory = [...conversation.messages, userMessage];

    try {
      fullText = await streamAICompletion({
        messages: conversationHistory,
        tone: normTone,
        signal: abortController.signal,
        onChunk: (delta) => {
          if (!clientDisconnected) {
            res.write(`event: delta\ndata: ${JSON.stringify({ text: delta })}\n\n`);
          }
        }
      });

      if (!clientDisconnected) {
        // Save assistant reply on completion
        const assistantMessage = {
          role: 'assistant',
          content: fullText,
          tone: normTone,
          status: 'complete',
          createdAt: new Date()
        };

        const updated = await Conversation.findByIdAndUpdate(
          id,
          { $push: { messages: assistantMessage }, updatedAt: new Date() },
          { new: true }
        );

        const savedMsg = updated.messages[updated.messages.length - 1];

        res.write(
          `event: done\ndata: ${JSON.stringify({
            messageId: savedMsg?._id,
            content: fullText,
            tone: normTone
          })}\n\n`
        );
        res.end();
      } else if (fullText.trim()) {
        // Save partial text on abort
        const abortedMessage = {
          role: 'assistant',
          content: fullText,
          tone: normTone,
          status: 'aborted',
          createdAt: new Date()
        };
        await Conversation.findByIdAndUpdate(id, {
          $push: { messages: abortedMessage },
          updatedAt: new Date()
        });
      }
    } catch (streamError) {
      logger.error('Error during AI streaming:', streamError);
      // On OpenAI error send an SSE error event and save nothing
      if (!clientDisconnected) {
        const mappedMessage = streamError.message || 'Error occurred during AI generation';
        res.write(
          `event: error\ndata: ${JSON.stringify({
            error: { message: mappedMessage, code: 'OPENAI_ERROR' }
          })}\n\n`
        );
        res.end();
      }
    }
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/conversations/:id/regenerate
 */
export const regenerateResponse = async (req, res, next) => {
  const { id } = req.params;
  const { tone } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: { message: 'Invalid conversation ID', code: 'INVALID_ID' }
    });
  }

  try {
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({
        error: { message: 'Conversation not found', code: 'NOT_FOUND' }
      });
    }

    // Find the last user message
    let lastUserIndex = -1;
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      if (conversation.messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) {
      return res.status(400).json({
        error: { message: 'No user message found to regenerate', code: 'NO_USER_MESSAGE' }
      });
    }

    const lastUserMessage = conversation.messages[lastUserIndex];
    const normTone = tone ? tone.toLowerCase().trim() : lastUserMessage.tone || 'professional';

    if (!VALID_TONES.includes(normTone)) {
      return res.status(400).json({
        error: { message: 'Invalid tone. Must be professional, casual, or concise', code: 'INVALID_TONE' }
      });
    }

    // Truncate messages after the last user message
    const prunedMessages = conversation.messages.slice(0, lastUserIndex + 1);
    await Conversation.findByIdAndUpdate(id, { messages: prunedMessages });

    // Setup SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    res.flushHeaders?.();

    const abortController = new AbortController();
    let clientDisconnected = false;

    res.on('close', () => {
      clientDisconnected = true;
      abortController.abort();
    });

    let fullText = '';
    try {
      fullText = await streamAICompletion({
        messages: prunedMessages,
        tone: normTone,
        signal: abortController.signal,
        onChunk: (delta) => {
          if (!clientDisconnected) {
            res.write(`event: delta\ndata: ${JSON.stringify({ text: delta })}\n\n`);
          }
        }
      });

      if (!clientDisconnected) {
        const assistantMessage = {
          role: 'assistant',
          content: fullText,
          tone: normTone,
          status: 'complete',
          createdAt: new Date()
        };

        const updated = await Conversation.findByIdAndUpdate(
          id,
          { $push: { messages: assistantMessage }, updatedAt: new Date() },
          { new: true }
        );

        const savedMsg = updated.messages[updated.messages.length - 1];

        res.write(
          `event: done\ndata: ${JSON.stringify({
            messageId: savedMsg?._id,
            content: fullText,
            tone: normTone
          })}\n\n`
        );
        res.end();
      } else if (fullText.trim()) {
        const abortedMessage = {
          role: 'assistant',
          content: fullText,
          tone: normTone,
          status: 'aborted',
          createdAt: new Date()
        };
        await Conversation.findByIdAndUpdate(id, {
          $push: { messages: abortedMessage },
          updatedAt: new Date()
        });
      }
    } catch (streamError) {
      logger.error('Error during AI streaming (regenerate):', streamError);
      if (!clientDisconnected) {
        const mappedMessage = streamError.message || 'Error occurred during AI generation';
        res.write(
          `event: error\ndata: ${JSON.stringify({
            error: { message: mappedMessage, code: 'OPENAI_ERROR' }
          })}\n\n`
        );
        res.end();
      }
    }
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/conversations/:id/export
 * Download Markdown format
 */
export const exportConversationMarkdown = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: { message: 'Invalid conversation ID', code: 'INVALID_ID' }
    });
  }

  try {
    const conversation = await Conversation.findById(id).lean();
    if (!conversation) {
      return res.status(404).json({
        error: { message: 'Conversation not found', code: 'NOT_FOUND' }
      });
    }

    let md = `# ${conversation.title}\n\n`;
    for (const msg of conversation.messages || []) {
      if (msg.role === 'user') {
        md += `**User**: ${msg.content}\n\n`;
      } else {
        const toneTag = msg.tone ? ` (${msg.tone})` : '';
        md += `**Assistant**${toneTag}: ${msg.content}\n\n`;
      }
    }

    const cleanName = (conversation.title || 'conversation')
      .replace(/[^a-z0-9_-]/gi, '_')
      .toLowerCase();

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanName}.md"`);
    return res.send(md);
  } catch (err) {
    next(err);
  }
};
