import { Conversation } from '../models/conversation.model.js';
import { Message } from '../models/message.model.js';
import mongoose from 'mongoose';

/**
 * List conversations with optional ?q= search filter
 */
export const listConversations = async (req, res, next) => {
  try {
    const { q } = req.query;
    const filter = {};

    if (q && typeof q === 'string' && q.trim()) {
      filter.title = { $regex: q.trim(), $options: 'i' };
    }

    const conversations = await Conversation.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    return res.json(conversations);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new conversation
 */
export const createConversation = async (req, res, next) => {
  try {
    const { title, tone } = req.body;
    const conversation = await Conversation.create({
      title: title && title.trim() ? title.trim() : 'New Conversation',
      tone: ['Professional', 'Casual', 'Concise'].includes(tone) ? tone : 'Professional'
    });

    return res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single conversation with all its messages
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

    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .lean();

    return res.json({
      ...conversation,
      messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Inline rename a conversation
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

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: { message: 'Title cannot be empty', code: 'VALIDATION_ERROR' }
      });
    }

    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { title: title.trim() },
      { new: true }
    );

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
 * Delete a conversation and its messages
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

    await Message.deleteMany({ conversationId: id });

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
};
