import express from 'express';
import {
  listUsers,
  createUser,
  updateUser,
  getMyMentees
} from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Mentor can fetch their assigned mentees
router.get('/my-mentees', requireAuth, requireRole('mentor'), getMyMentees);

// Admin-only user management
router.get('/', requireAuth, requireRole('admin'), listUsers);
router.post('/', requireAuth, requireRole('admin'), createUser);
router.patch('/:id', requireAuth, requireRole('admin'), updateUser);

export default router;
