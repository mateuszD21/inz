import { Router } from 'express';
import {
  sendMessage,
  getConversations,
  getMessages,
  getUnreadCount,
} from '../controllers/messageController';

const router = Router();

// POST /api/messages - Wyślij wiadomość
router.post('/', sendMessage);

// GET /api/messages/conversations - Pobierz wszystkie konwersacje
router.get('/conversations', getConversations);

// GET /api/messages/:otherUserId - Pobierz wiadomości z konkretną osobą
router.get('/:otherUserId', getMessages);

// GET /api/messages/unread/count - Liczba nieprzeczytanych
router.get('/unread/count', getUnreadCount);

export default router;