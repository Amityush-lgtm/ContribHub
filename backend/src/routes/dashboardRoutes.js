import express from 'express';
import {
  getMenteeDashboard,
  getMentorDashboard,
  getAdminDashboard
} from '../controllers/dashboardController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/mentee', requireRole('mentee'), getMenteeDashboard);
router.get('/mentor', requireRole('mentor'), getMentorDashboard);
router.get('/admin', requireRole('admin'), getAdminDashboard);

export default router;
