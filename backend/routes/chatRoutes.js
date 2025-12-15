import express from 'express';
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from '../controllers/chatController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').post(authMiddleware, accessChat).get(authMiddleware, fetchChats);
router.route('/group').post(authMiddleware, createGroupChat);
router.route('/group/rename').put(authMiddleware, renameGroup);
router.route('/group/add').put(authMiddleware, addToGroup);
router.route('/group/remove').put(authMiddleware, removeFromGroup);

export default router;