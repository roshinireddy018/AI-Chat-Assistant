import { Router } from 'express';
import healthRoutes from './health.routes.js';
import conversationRoutes from './conversation.routes.js';
import chatRoutes from './chat.routes.js';

const router = Router();

// Sub-routers
router.use('/health', healthRoutes);
router.use('/conversations', conversationRoutes);
router.use('/chat', chatRoutes);

export default router;
