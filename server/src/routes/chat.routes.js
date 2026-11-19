import { Router } from 'express';
import { streamChat } from '../controllers/chat.controller.js';

const router = Router();

// POST /api/chat/stream
router.post('/stream', streamChat);

export default router;
