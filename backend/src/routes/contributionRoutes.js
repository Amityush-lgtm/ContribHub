import express from 'express';
import {
  createContribution,
  getMyContributions,
  getContributions,
  getContributionById,
  updateContribution,
  submitContribution,
  deleteContribution,
  reviewContribution
} from '../controllers/contributionController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Require auth for all contribution endpoints
router.use(requireAuth);

router.post('/', requireRole('mentee', 'admin'), createContribution);
router.get('/mine', requireRole('mentee'), getMyContributions);
router.get('/', getContributions);
router.get('/:id', getContributionById);
router.patch('/:id', updateContribution);
router.post('/:id/submit', submitContribution);
router.post('/:id/review', requireRole('mentor', 'admin'), reviewContribution);
router.delete('/:id', deleteContribution);

export default router;
