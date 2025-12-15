import express from 'express';
import {
  allUsers,
  getUserProfile,
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, allUsers);
router.get('/profile', authMiddleware, getUserProfile);

export default router;