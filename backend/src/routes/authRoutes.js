import express from 'express';
import { login, logout, getMe, updateProfile } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.patch('/profile', requireAuth, updateProfile);

export default router;
