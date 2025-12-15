import express from 'express';
import { allMessages, sendMessage, markMessagesAsRead } from '../controllers/messageController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/:chatId').get(authMiddleware, allMessages);
router.route('/').post(authMiddleware, sendMessage);
router.route('/:chatId/read').put(authMiddleware, markMessagesAsRead);

export default router;