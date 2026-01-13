import { Router } from 'express';
import {
  sendMessage,
  getConversations,
  getMessages,
  getUnreadCount,
} from '../controllers/messageController';

const router = Router();

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/:otherUserId', getMessages);
router.get('/unread/count', getUnreadCount);

export default router;