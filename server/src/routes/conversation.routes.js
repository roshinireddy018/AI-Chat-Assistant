import { Router } from 'express';
import {
  listConversations,
  createConversation,
  getConversation,
  renameConversation,
  deleteConversation,
  postMessage,
  regenerateResponse,
  exportConversationMarkdown
} from '../controllers/conversation.controller.js';

const router = Router();

// Conversation CRUD
router.get('/', listConversations);
router.post('/', createConversation);
router.get('/:id', getConversation);
router.patch('/:id', renameConversation);
router.delete('/:id', deleteConversation);

// Messages & AI Stream
router.post('/:id/messages', postMessage);
router.post('/:id/regenerate', regenerateResponse);
router.get('/:id/export', exportConversationMarkdown);

export default router;
