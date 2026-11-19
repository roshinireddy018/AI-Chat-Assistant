import { Router } from 'express';
import {
  listConversations,
  createConversation,
  getConversation,
  renameConversation,
  deleteConversation
} from '../controllers/conversation.controller.js';

const router = Router();

// GET /api/conversations?q=
router.get('/', listConversations);

// POST /api/conversations
router.post('/', createConversation);

// GET /api/conversations/:id
router.get('/:id', getConversation);

// PATCH /api/conversations/:id
router.patch('/:id', renameConversation);

// DELETE /api/conversations/:id
router.delete('/:id', deleteConversation);

export default router;
