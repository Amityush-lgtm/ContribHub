import express from 'express';
import {
  createAssignment,
  getAssignments,
  updateAssignment
} from '../controllers/assignmentController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get assignments visible to current user (mentee sees their mentor, mentor sees their mentees, admin sees all)
router.get('/', requireAuth, getAssignments);

// Admin-only management
router.post('/', requireAuth, requireRole('admin'), createAssignment);
router.patch('/:id', requireAuth, requireRole('admin'), updateAssignment);

export default router;
