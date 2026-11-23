import { Router } from 'express';
import {
  getConversationsController,
  getOrCreateConversationController,
  getMessagesController,
  sendMessageController,
  markRead,
} from '../controllers/chat.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', verifyToken, getConversationsController);
router.post('/', verifyToken, getOrCreateConversationController);
router.get('/:conversationId/messages', verifyToken, getMessagesController);
router.post('/:conversationId/messages', verifyToken, sendMessageController);
router.patch('/:conversationId/read', verifyToken, markRead);

export default router;
